import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatsClient from "./StatsClient";

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
}

async function getPlayers(teamCode: string) {
  const supabase = await createClient();
  
  if (teamCode === 'all') {
    const { data: players } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .order('full_name');
    return players || [];
  } else {
    const { data: players } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .eq('current_team', teamCode)
      .order('full_name');
    return players || [];
  }
}

async function getStatDefinitions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stat_definitions')
    .select('*')
    .order('label');
  return data || [];
}

async function getCoachTeams() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as Team[][];
  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('profile_id', user.id)
    .single();
  if (!coach) return [] as Player[][];
  const { data: coachTeam } = await supabase
    .from('coach_team')
    .select('role, teams(code, name)')
    .eq('coach_id', coach.id)
    .single();
  
  if (coachTeam?.role === 'lead_coach') {
    // Lead coaches can see all teams
    const { data: allTeams } = await supabase
      .from('teams')
      .select('code, name')
      .order('code');
    return allTeams || [];
  }
  
  return coachTeam?.teams ? [coachTeam.teams] : [];
}

export default async function StatsPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  await requireCoach();
  const coachTeams = await getCoachTeams();
  const teams = coachTeams.length ? coachTeams : await getTeams();
  const params = await searchParams;
  const teamCode = params?.team || 'all';
  const players = await getPlayers(teamCode);
  const statDefinitions = await getStatDefinitions();

  return (
    <StatsClient 
      teams={teams}
      players={players}
      statDefinitions={statDefinitions}
      selectedTeam={teamCode}
    />
  );
}