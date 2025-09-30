import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

export default async function PlayersPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  await requireCoach();
  const coachTeams = await getCoachTeams();
  const teams = coachTeams.length ? coachTeams : await getTeams();
  const params = await searchParams;
  const teamCode = params?.team || 'all' // Default to 'all' instead of specific team
  const players = await getPlayers(teamCode)
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Players</h1>
        <div className="ml-auto flex items-center gap-2">
          <a href="/players/import" className="h-10 px-3 border rounded">Import CSV</a>
          <a href="/stats" className="h-10 px-3 border rounded bg-primary text-primary-foreground hover:bg-primary/90">Enter Stats</a>
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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Position</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.full_name}</td>
              <td className="py-2">{p.primary_position}</td>
              <td className="py-2">
                <a 
                  href={`/players/${p.id}/attendance`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  📊 Attendance
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


