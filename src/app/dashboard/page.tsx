import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
}

async function getGamesForWeek(team: string) {
  const supabase = await createClient();
  
  // Calculate current week (Sunday to Saturday)
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay); // Go back to Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to Saturday
  endOfWeek.setHours(23, 59, 59, 999);
  
  let query = supabase
    .from('games')
    .select(`
      id,
      kickoff_at,
      location,
      notes,
      home_team_id,
      away_team_id,
      home_teams:home_team_id(code, name),
      away_teams:away_team_id(code, name)
    `)
    .gte('kickoff_at', startOfWeek.toISOString())
    .lte('kickoff_at', endOfWeek.toISOString())
    .order('kickoff_at', { ascending: true });

  // Filter by team if specified
  if (team && team !== 'all') {
    const { data: teamData } = await supabase
      .from('teams')
      .select('id')
      .eq('code', team)
      .single();
    
    if (teamData) {
      query = query.or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`);
    }
  }

  const { data: games } = await query;
  return games || [];
}

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  const { profile, teams } = await requireCoach();
  const params = await searchParams;
  const allTeams = await getTeams();
  const team = params?.team || 'all';
  const games = await getGamesForWeek(team);

  return (
    <DashboardClient 
      profile={profile} 
      teams={teams} 
      allTeams={allTeams}
      selectedTeam={team}
      games={games}
    />
  );
}