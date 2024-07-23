import { NextRequest, NextResponse } from 'next/server';
import { getWeaponsByTypes, getWeapons } from '@/lib/db';

export async function GET(req: NextRequest) {
  // Extract query parameters from the URL
  const { searchParams } = new URL(req.url);
  const offset = searchParams.get('offset');
  const weaponTypes = searchParams.get('weaponTypes');

  // Validate the offset parameter
  if (!offset || isNaN(parseInt(offset))) {
    return NextResponse.json({ message: 'Invalid offset' }, { status: 400 });
  }

  // Fetch weapons based on the presence of weaponTypes
  if (!weaponTypes || weaponTypes === 'all') {
    const weapons = await getWeapons(parseInt(offset));
    return NextResponse.json({ weapons }, { status: 200 });
  }

  // Split weaponTypes into an array and fetch weapons by types
  const weaponTypesArray = weaponTypes.split(',');
  const weapons = await getWeaponsByTypes(parseInt(offset), weaponTypesArray);
  return NextResponse.json({ weapons }, { status: 200 });
}
