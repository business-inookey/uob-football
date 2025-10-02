import { requireCoach, requireLeadCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import WeightsClient from "./WeightsClient";

type StatDef = { key: string; label: string; higher_is_better: boolean };
type WeightRow = { stat_key: string; weight: number };

async function getStatDefinitions(): Promise<StatDef[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stat_definitions")
    .select("key, label, higher_is_better")
    .order("key");
  return data ?? [];
}

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
}

async function getTeamWeights(teamCode: string): Promise<WeightRow[]> {
  const supabase = await createClient();
  const { data: weights } = await supabase
    .from('team_weights')
    .select('stat_key, weight')
    .eq('team_code', teamCode);
  return weights || [];
}

export default async function WeightsPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  // Determine role and available teams for the coach
  // const coach = await requireCoach();

  // If lead, also compute lead-only flag
  let isLead = false;
  try {
    const lead = await requireLeadCoach();
    isLead = (lead?.teams?.length ?? 0) > 0;
  } catch {
    isLead = false;
  }

  const params = await searchParams;
  const teams = await getTeams();
  const teamCode = params?.team || (teams[0]?.code ?? "1s");

  const [defs, existing] = await Promise.all([
    getStatDefinitions(),
    getTeamWeights(teamCode),
  ]);

  return (
    <WeightsClient 
      teamCode={teamCode}
      teams={teams}
      defs={defs}
      initialWeights={existing}
      isLead={isLead}
    />
  );
}