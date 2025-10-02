import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AttendanceClient from "./AttendanceClient";

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
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
  if (!coach) return [] as string[];
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

export default async function AttendancePage({ searchParams }: { searchParams?: Promise<{ team?: string; date?: string }> }) {
  await requireCoach();
  const coachTeams = await getCoachTeams();
  const teams = coachTeams.length ? coachTeams : await getTeams();
  const params = await searchParams;
  const teamCode = params?.team || 'all';
  const date = params?.date || new Date().toISOString().split('T')[0]; // Today's date

  return (
    <AttendanceClient 
      teams={teams} 
      initialTeam={teamCode} 
      initialDate={date}
    />
  );
}
