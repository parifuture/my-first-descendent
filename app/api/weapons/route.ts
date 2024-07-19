import { NextResponse, type NextRequest } from 'next/server';
import { getWeaponsByTypes, getWeapons } from '@/lib/db';

export async function GET(request: NextRequest, response: NextResponse) {
  const offset = request.nextUrl.searchParams.get('offset');
  const weaponTypes = request.nextUrl.searchParams.get('weaponTypes');

  if (!offset || isNaN(parseInt(offset.toString()))) {
    return NextResponse.json({ message: 'Invalid offset' }, { status: 400 });
  }

  if (!weaponTypes) {
    const weapons = await getWeapons(parseInt(offset.toString()));
    return NextResponse.json({ weapons }, { status: 200 });
  }
  const weaponTypesArray = weaponTypes.split(',');
  const weapons = await getWeaponsByTypes(
    parseInt(offset.toString()),
    weaponTypesArray
  );
  return NextResponse.json({ weapons }, { status: 200 });
}
