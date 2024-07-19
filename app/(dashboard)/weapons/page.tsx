import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeapons } from '@/lib/db';
import { WeaponsTable } from './weapons-table';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const offset = searchParams.offset ?? 0;
  const { weapons, newOffset, totalWeapons } = await getWeapons(Number(offset));

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {/* <TabsTrigger value="handgun">Handgun</TabsTrigger>
          <TabsTrigger value="hand cannon">Hand Cannon</TabsTrigger>
          <TabsTrigger value="tactical rifle">Tactical Rifle</TabsTrigger>
          <TabsTrigger value="beam rifle">Beam Rifle</TabsTrigger>
          <TabsTrigger value="submachine gun">Submachine Gun</TabsTrigger>
          <TabsTrigger value="assault rifle">Assault Rifle</TabsTrigger>
          <TabsTrigger value="scout rifle">Scout Rifle</TabsTrigger>
          <TabsTrigger value="machine gun">Machine Gun</TabsTrigger>
          <TabsTrigger value="shotgun">Shotgun</TabsTrigger>
          <TabsTrigger value="launcher">Launcher</TabsTrigger> */}
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <WeaponsTable
          weapons={weapons}
          offset={newOffset ?? 0}
          totalWeapons={totalWeapons}
        />
      </TabsContent>
    </Tabs>
  );
}
