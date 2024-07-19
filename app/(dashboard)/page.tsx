import { Button } from '@/components/ui/button';
import { getWeapons } from '@/lib/db';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const offset = searchParams.offset ?? 0;
  const { weapons, newOffset, totalWeapons } = await getWeapons(Number(offset));

  return <Button>Welcome to the jungle!</Button>;
}
