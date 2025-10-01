import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import BestXIClient from "./BestXIClient";

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
}

export default async function BestXIPage() {
  await requireCoach();
  const teams = await getTeams();
  const defaultTeam = teams[0]?.code ?? '1s';

  return (
    <BestXIClient teams={teams} defaultTeam={defaultTeam} />
  );
}