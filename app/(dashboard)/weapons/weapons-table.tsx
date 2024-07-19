'use client';
import { useEffect, useState } from 'react';
import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Weapon } from './weapon';
import { GetWeaponDetail } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function WeaponsTable({
  weapons: weapons,
  offset,
  totalWeapons
}: {
  weapons: GetWeaponDetail[];
  offset: number;
  totalWeapons: number;
}) {
  let router = useRouter();
  let productsPerPage = 5;
  const [filteredWeapons, setFilteredWeapons] = useState(weapons);

  // useEffect(() => {
  //   if (weaponType === 'all') {
  //     setFilteredWeapons(weapons);
  //   } else {
  //     setFilteredWeapons(
  //       weapons.filter((weapon) => weapon.weaponType === weaponType)
  //     );
  //   }
  //   setFilteredWeapons(weapons);
  // }, [weapons]);

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weapons</CardTitle>
        <CardDescription>
          List of weapons available in the game The First Descendent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Weapon Name</TableHead>
              <TableHead>Weapon Type</TableHead>
              <TableHead className="hidden md:table-cell">
                Weapon Round Type
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Weapon Tier
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weapons.map((filteredProduct: GetWeaponDetail) => (
              <Weapon key={filteredProduct.weaponId} weapon={filteredProduct} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.min(offset - productsPerPage, totalWeapons) + 1}-{offset}
            </strong>{' '}
            of <strong>{totalWeapons}</strong> products
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === productsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + productsPerPage > totalWeapons}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
