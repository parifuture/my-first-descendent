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
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function WeaponsTable({
  weapons,
  weaponTypes,
  offset,
  totalWeapons,
  selectedWeaponType
}: {
  weapons: any[];
  weaponTypes: any[];
  offset: number;
  totalWeapons: number;
  selectedWeaponType: string;
}) {
  const router = useRouter();
  const productsPerPage = 5;
  const [weaponTypeFilter, setWeaponTypeFilter] = useState(['all']);
  const [weaponData, setWeaponData] = useState(weapons);

  useEffect(() => {
    if (selectedWeaponType === 'all') {
      setWeaponTypeFilter(['all']);
    } else {
      setWeaponTypeFilter([selectedWeaponType]);
    }
  }, [selectedWeaponType]);
  useEffect(() => {
    async function filterWeapons() {
      const response = await fetch(
        `/api/weapons?offset=${offset}&weaponTypes=${weaponTypeFilter.join(',')}`
      );
      const filteredWeapons = await response.json();
      setWeaponData(filteredWeapons.weapons.weapons);
    }
    filterWeapons();
  }, [weaponTypeFilter, offset]);

  function arrayDifference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => !arr2.includes(item));
  }

  function removeAllOccurrences<T>(arr: T[], value: T): T[] {
    return arr.filter((item) => item !== value);
  }

  const weaponTypeFilterComponent = (
    <ToggleGroup
      type="multiple"
      value={weaponTypeFilter}
      onValueChange={(newValue) => {
        const difference = arrayDifference(newValue, weaponTypeFilter);
        if (difference && difference[0] === 'all') {
          setWeaponTypeFilter(['all']);
        } else {
          const filterWithoutAll = removeAllOccurrences(newValue, 'all');
          setWeaponTypeFilter(filterWithoutAll);
        }
      }}
    >
      <ToggleGroupItem value="all">All</ToggleGroupItem>
      {weaponTypes.map((weaponType) => (
        <ToggleGroupItem key={weaponType.value} value={weaponType.value}>
          {weaponType.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset + productsPerPage}`, { scroll: false });
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
        {weaponTypeFilterComponent}

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
            {weaponData.length &&
              weaponData.map((weapon: any) => (
                <Weapon key={weapon.weaponId} weapon={weapon} />
              ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.min(offset, totalWeapons) + 1}-
              {Math.min(offset + productsPerPage - 1, totalWeapons)}
            </strong>{' '}
            of <strong>{totalWeapons}</strong> products
          </div>
          <div className="flex">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              disabled={offset === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              disabled={offset + productsPerPage >= totalWeapons}
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
