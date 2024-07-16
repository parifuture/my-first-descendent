import fs from 'fs';
import {
  db,
  weapons,
  weaponBaseStats,
  weaponFirearmAtk,
  weaponPerks
} from 'lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = JSON.parse(fs.readFileSync('weapons.json', 'utf8'));

  try {
    for (const weapon of data) {
      // Insert weapon data
      await db
        .insert(weapons)
        .values({
          weaponId: weapon.weapon_id,
          weaponName: weapon.weapon_name,
          imageUrl: weapon.image_url,
          weaponType: weapon.weapon_type,
          weaponTier: weapon.weapon_tier,
          weaponRoundsType: weapon.weapon_rounds_type
        })
        .onConflictDoNothing();

      // Insert base stats
      for (const stat of weapon.base_stat) {
        await db
          .insert(weaponBaseStats)
          .values({
            statId: stat.stat_id,
            weaponId: weapon.weapon_id,
            statValue: stat.stat_value
          })
          .onConflictDoNothing();
      }

      // Insert firearm attack values
      for (const levelData of weapon.firearm_atk) {
        for (const firearm of levelData.firearm) {
          await db
            .insert(weaponFirearmAtk)
            .values({
              weaponId: weapon.weapon_id,
              level: levelData.level,
              firearmAtkType: firearm.firearm_atk_type,
              firearmAtkValue: firearm.firearm_atk_value
            })
            .onConflictDoNothing();
        }
      }

      // Insert weapon perks if they exist
      if (
        weapon.weapon_perk_ability_name &&
        weapon.weapon_perk_ability_description
      ) {
        await db
          .insert(weaponPerks)
          .values({
            weaponId: weapon.weapon_id,
            weaponPerkAbilityName: weapon.weapon_perk_ability_name,
            weaponPerkAbilityDescription: weapon.weapon_perk_ability_description
          })
          .onConflictDoNothing();
      }
    }

    return new Response('Data seeding completed successfully', { status: 200 });
  } catch (err) {
    console.error('Error seeding data:', err);
    return new Response('Error seeding data', { status: 500 });
  }
}
