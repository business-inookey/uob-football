import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Radar from "@/components/charts/Radar";
import Bars from "@/components/charts/Bars";
import CompareSelector from "@/components/compare/Selector";

async function getPlayers(teamCode: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/players?team=${teamCode}`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function ComparePage({ searchParams }: { searchParams?: Promise<{ team?: string; ids?: string }> }) {
  await requireCoach();
  const params = await searchParams;
  const teamCode = (params as any)?.team || 'all';
  const rawIds = (params as any)?.ids;
  let selectedIds: string[] = [];
  if (Array.isArray(rawIds)) {
    selectedIds = rawIds as string[];
  } else if (typeof rawIds === 'string') {
    selectedIds = rawIds.includes(',') ? rawIds.split(',') : [rawIds];
  }
  selectedIds = selectedIds.filter(Boolean).slice(0, 4);

  const players = await getPlayers(teamCode);

  // Load teams for filter
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');

  // Build selection map
  const selected = players.filter((p: any) => selectedIds.includes(p.id)).slice(0, 4);

  // Fetch composite only for selected
  let composite: any = null;
  if (selected.length > 0) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/composite?team=${teamCode}&ids=${selected.map((p:any)=>p.id).join(',')}`, { cache: 'no-store' });
    if (res.ok) composite = await res.json();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Compare Players</h1>
        <div className="ml-auto" />
      </div>

      <CompareSelector players={players} initialSelected={selectedIds} teamCode={teamCode} teams={teams || []} />

      {composite ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Radar</h2>
            <Radar
              labels={composite.statKeys}
              series={composite.players.map((p: any, idx: number) => ({
                name: p.full_name,
                values: composite.statKeys.map((k: string) => composite.normalized[p.id]?.[k] ?? 0),
                color: undefined,
              }))}
            />
          </div>
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Bars</h2>
            <Bars
              labels={composite.statKeys}
              series={composite.players.map((p: any) => ({
                name: p.full_name,
                values: composite.statKeys.map((k: string) => composite.normalized[p.id]?.[k] ?? 0),
              }))}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Pick players to compare.</div>
      )}
    </div>
  );
}
