import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CompareClient from "./CompareClient";


export default async function ComparePage({ searchParams }: { searchParams?: Promise<{ team?: string; ids?: string }> }) {
  await requireCoach();
  const params = await searchParams;
  const teamCode = (params as Team[])?.team || 'all';
  const rawIds = (params as Player[])?.ids;
  let selectedIds: string[] = [];
  if (Array.isArray(rawIds)) {
    selectedIds = rawIds as string[];
  } else if (typeof rawIds === 'string') {
    selectedIds = rawIds.includes(',') ? rawIds.split(',') : [rawIds];
  }
  selectedIds = selectedIds.filter(Boolean).slice(0, 5);

  // Load teams for filter
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');

  return (
    <CompareClient 
      teams={teams || []} 
      initialTeam={teamCode} 
      initialSelectedIds={selectedIds}
    />
  );
}
