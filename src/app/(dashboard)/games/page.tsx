import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import GamesClient from "./GamesClient";

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
}

async function getGames(team: string, month: string) {
  const supabase = await createClient();
  
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

  // Filter by month if specified
  if (month) {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
    
    query = query
      .gte('kickoff_at', startDate.toISOString())
      .lte('kickoff_at', endDate.toISOString());
  }

  const { data: games } = await query;
  return games || [];
}

export default async function GamesPage({ searchParams }: { searchParams?: Promise<{ team?: string; month?: string }> }) {
  await requireCoach();
  const params = await searchParams
  const teams = await getTeams();
  const team = params?.team || 'all'
  const month = params?.month || new Date().toISOString().slice(0,7)
  const games = await getGames(team, month)

  return (
    <GamesClient teams={teams} team={team} month={month} games={games as any} />
  );
}


