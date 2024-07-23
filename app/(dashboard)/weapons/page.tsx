import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getWeapons, getWeaponTypes } from '@/lib/db';
import { WeaponsTable } from './weapons-table';

export default async function WeaponsPage({
  searchParams
}: {
  searchParams: { weaponTypes: string; offset: string };
}) {
  const offset = searchParams.offset ?? 0;
  const qWeaponTypes = searchParams.weaponTypes;

  const { weapons, newOffset, totalWeapons } = await getWeapons(Number(offset));
  const weaponTypes = await getWeaponTypes();

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">List of Weapons</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">
        <WeaponsTable
          weapons={weapons}
          weaponTypes={weaponTypes}
          offset={parseInt(offset)}
          totalWeapons={totalWeapons}
          selectedWeaponType={qWeaponTypes ?? 'all'}
        />
      </TabsContent>
    </Tabs>
  );
}
