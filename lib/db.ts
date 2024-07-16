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
import { count, eq, ilike } from 'drizzle-orm';
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

export type GetWeapons = typeof getWeapons;
export type SelectWeapon = typeof weapons.$inferSelect;
export type GetWeaponDetailById = typeof getWeaponDetailById;

export const insertWeapon = createInsertSchema(weapons);
export const insertWeaponPerk = createInsertSchema(weaponPerks);
export const insertWeaponFirearmAtk = createInsertSchema(weaponFirearmAtk);

// export const products = pgTable('products', {
//   id: serial('id').primaryKey(),
//   imageUrl: text('image_url').notNull(),
//   name: text('name').notNull(),
//   status: statusEnum('status').notNull(),
//   price: numeric('price', { precision: 10, scale: 2 }).notNull(),
//   stock: integer('stock').notNull(),
//   availableAt: timestamp('available_at').notNull()
// });
// export type SelectProduct = typeof products.$inferSelect;
// export const insertProductSchema = createInsertSchema(products);

// export async function getProducts(
//   search: string,
//   offset: number
// ): Promise<{
//   products: SelectProduct[];
//   newOffset: number | null;
//   totalProducts: number;
// }> {
//   // Always search the full table, not per page
//   if (search) {
//     return {
//       products: await db
//         .select()
//         .from(products)
//         .where(ilike(products.name, `%${search}%`))
//         .limit(1000),
//       newOffset: null,
//       totalProducts: 0
//     };
//   }

//   if (offset === null) {
//     return { products: [], newOffset: null, totalProducts: 0 };
//   }

//   let totalProducts = await db.select({ count: count() }).from(products);
//   let moreProducts = await db.select().from(products).limit(5).offset(offset);
//   let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

//   return {
//     products: moreProducts,
//     newOffset,
//     totalProducts: totalProducts[0].count
//   };
// }

// export async function deleteProductById(id: number) {
//   await db.delete(products).where(eq(products.id, id));
// }
