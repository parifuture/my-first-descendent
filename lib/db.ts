import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  primaryKey
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, inArray } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { table } from 'console';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const weapons = pgTable('weapons', {
  weaponId: text('weapon_id').primaryKey(),
  weaponName: text('weapon_name').notNull(),
  imageUrl: text('image_url').notNull(),
  weaponType: text('weapon_type').notNull(),
  weaponTier: text('weapon_tier').notNull(),
  weaponRoundsType: text('weapon_rounds_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const weaponBaseStats = pgTable(
  'base_stats',
  {
    statId: text('stat_id').notNull(),
    weaponId: text('weapon_id')
      .notNull()
      .references(() => weapons.weaponId),
    statValue: numeric('stat_value', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.statId, table.weaponId] })
    };
  }
);

export const weaponFirearmAtk = pgTable(
  'firearm_atk',
  {
    weaponId: text('weapon_id')
      .notNull()
      .references(() => weapons.weaponId),
    level: integer('level').notNull(),
    firearmAtkType: text('firearm_atk_type').notNull(),
    firearmAtkValue: numeric('firearm_atk_value', {
      precision: 10,
      scale: 2
    }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.weaponId, table.level, table.firearmAtkType]
      })
    };
  }
);

export const weaponPerks = pgTable('weapon_perks', {
  weaponId: text('weapon_id')
    .primaryKey()
    .references(() => weapons.weaponId),
  weaponPerkAbilityName: text('weapon_perk_ability_name').notNull(),
  weaponPerkAbilityDescription: text(
    'weapon_perk_ability_description'
  ).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export async function getWeapons(offset: number): Promise<{
  weapons: {
    weaponId: string;
    weaponName: string;
    imageUrl: string;
    weaponType: string;
    weaponTier: string;
    weaponRoundsType: string;
    weaponPerkAbilityName: string | null;
    weaponPerkAbilityDescription: string | null;
  }[];
  newOffset: number | null;
  totalWeapons: number;
}> {
  if (offset === null) {
    return { weapons: [], newOffset: null, totalWeapons: 0 };
  }
  let totalWeapons = await db.select({ count: count() }).from(weapons);
  let moreWeapons = await db
    .select({
      weaponId: weapons.weaponId,
      weaponName: weapons.weaponName,
      imageUrl: weapons.imageUrl,
      weaponType: weapons.weaponType,
      weaponTier: weapons.weaponTier,
      weaponRoundsType: weapons.weaponRoundsType,
      weaponPerkAbilityName: weaponPerks.weaponPerkAbilityName,
      weaponPerkAbilityDescription: weaponPerks.weaponPerkAbilityDescription
    })
    .from(weapons)
    .leftJoin(weaponPerks, eq(weapons.weaponId, weaponPerks.weaponId))
    .limit(5)
    .offset(offset);

  let newOffset = moreWeapons.length >= 5 ? offset + 5 : null;

  return {
    weapons: moreWeapons,
    newOffset,
    totalWeapons: totalWeapons[0].count
  };
}

export async function getWeaponDetailById(weaponId: string): Promise<{
  weaponDetail: {
    weaponId: string;
    weaponName: string;
    imageUrl: string;
    weaponType: string;
    weaponTier: string;
    weaponRoundsType: string;
    weaponPerkAbilityName: string | null;
    weaponPerkAbilityDescription: string | null;
    baseStats: {
      statId: string;
      statValue: number;
    }[];
  } | null;
}> {
  let weaponDetail = await db
    .select({
      weaponId: weapons.weaponId,
      weaponName: weapons.weaponName,
      imageUrl: weapons.imageUrl,
      weaponType: weapons.weaponType,
      weaponTier: weapons.weaponTier,
      weaponRoundsType: weapons.weaponRoundsType,
      weaponPerkAbilityName: weaponPerks.weaponPerkAbilityName,
      weaponPerkAbilityDescription: weaponPerks.weaponPerkAbilityDescription
    })
    .from(weapons)
    .leftJoin(weaponPerks, eq(weapons.weaponId, weaponPerks.weaponId))
    .where(eq(weapons.weaponId, weaponId))
    .limit(1);

  if (!weaponDetail.length) {
    return { weaponDetail: null };
  }
  let baseStats = await db
    .select({
      statId: weaponBaseStats.statId,
      statValue: weaponBaseStats.statValue
    })
    .from(weaponBaseStats)
    .where(eq(weaponBaseStats.weaponId, weaponId));

  return {
    weaponDetail: {
      weaponId: weaponDetail[0].weaponId,
      weaponName: weaponDetail[0].weaponName,
      imageUrl: weaponDetail[0].imageUrl,
      weaponType: weaponDetail[0].weaponType,
      weaponTier: weaponDetail[0].weaponTier,
      weaponRoundsType: weaponDetail[0].weaponRoundsType,
      weaponPerkAbilityName: weaponDetail[0].weaponPerkAbilityName,
      weaponPerkAbilityDescription:
        weaponDetail[0].weaponPerkAbilityDescription,
      baseStats: baseStats.map((stat) => ({
        statId: stat.statId,
        statValue: parseFloat(stat.statValue)
      }))
    }
  };
}

export async function getWeaponTypes(): Promise<
  { label: string; value: string }[]
> {
  const weaponTypes = await db
    .selectDistinct({ weaponType: weapons.weaponType })
    .from(weapons)
    .orderBy(weapons.weaponType);
  return weaponTypes.map((row) => {
    const label = row.weaponType;
    const value = label.replace(/_\w/g, (m) => m[1].toUpperCase());
    return { label, value };
  });
}

export async function getWeaponsByTypes(offset: number, weaponTypes: string[]) {
  if (offset === null) {
    return { weapons: [], newOffset: null, totalWeapons: 0 };
  }
  let totalWeapons = await db.select({ count: count() }).from(weapons);
  let moreWeapons = await db
    .select({
      weaponId: weapons.weaponId,
      weaponName: weapons.weaponName,
      imageUrl: weapons.imageUrl,
      weaponType: weapons.weaponType,
      weaponTier: weapons.weaponTier,
      weaponRoundsType: weapons.weaponRoundsType,
      weaponPerkAbilityName: weaponPerks.weaponPerkAbilityName,
      weaponPerkAbilityDescription: weaponPerks.weaponPerkAbilityDescription
    })
    .from(weapons)
    .leftJoin(weaponPerks, eq(weapons.weaponId, weaponPerks.weaponId))
    .where(inArray(weapons.weaponType, weaponTypes))
    .limit(5)
    .offset(offset);

  let newOffset = moreWeapons.length >= 5 ? offset + 5 : null;

  return {
    weapons: moreWeapons,
    newOffset,
    totalWeapons: totalWeapons[0].count
  };
}

export type GetWeapons = Awaited<ReturnType<typeof getWeapons>>;
export type GetWeaponDetail = Awaited<GetWeapons>['weapons'][number];
export type SelectWeapon = typeof weapons.$inferSelect;
export type GetWeaponDetailById = Awaited<
  ReturnType<typeof getWeaponDetailById>
>;
export type GetWeaponTypes = Awaited<ReturnType<typeof getWeaponTypes>>;
export type GetWeaponsByTypes = Awaited<ReturnType<typeof getWeapons>>;

export const insertWeapon = createInsertSchema(weapons);
export const insertWeaponPerk = createInsertSchema(weaponPerks);
export const insertWeaponFirearmAtk = createInsertSchema(weaponFirearmAtk);
