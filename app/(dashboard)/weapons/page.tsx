import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeapons, getWeaponTypes } from '@/lib/db';
import { WeaponsTable } from './weapons-table';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const offset = searchParams.offset ?? 0;
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
          offset={newOffset ?? 0}
          totalWeapons={totalWeapons}
        />
      </TabsContent>
    </Tabs>
  );
}
