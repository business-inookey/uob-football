import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PlayerStatCard from "@/components/StatsEntry";

async function getTeams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/teams`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

async function getPlayers(teamCode: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/players?team=${teamCode}`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
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
  if (!user) return [] as any[];
  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('profile_id', user.id)
    .single();
  if (!coach) return [] as any[];
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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Player Statistics</h1>
        <div className="ml-auto flex items-center gap-2">
          {teams.length > 0 && (
            <form>
              <select name="team" defaultValue={teamCode} className="h-10 border rounded px-3">
                <option value="all">All Teams</option>
                {teams.map((t: any) => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
              <button className="ml-2 h-10 px-3 border rounded" type="submit">Load</button>
            </form>
          )}
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players found for the selected team.
        </div>
      ) : (
        <div className="space-y-4">
          {players.map((player: any) => (
            <PlayerStatCard 
              key={player.id} 
              player={player} 
              statDefinitions={statDefinitions}
              teamCode={teamCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}