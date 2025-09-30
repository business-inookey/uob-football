import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AttendanceGrid from "@/components/AttendanceGrid";

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

export default async function AttendancePage({ searchParams }: { searchParams?: Promise<{ team?: string; date?: string }> }) {
  await requireCoach();
  const coachTeams = await getCoachTeams();
  const teams = coachTeams.length ? coachTeams : await getTeams();
  const params = await searchParams;
  const teamCode = params?.team || 'all';
  const date = params?.date || new Date().toISOString().split('T')[0]; // Today's date
  const players = await getPlayers(teamCode);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Daily Attendance</h1>
        <div className="ml-auto flex items-center gap-2">
          {teams.length > 0 && (
            <form className="flex items-center gap-2">
              <input
                type="date"
                name="date"
                defaultValue={date}
                className="h-10 border rounded px-3"
              />
              <select name="team" defaultValue={teamCode} className="h-10 border rounded px-3">
                <option value="all">All Teams</option>
                {teams.map((t: any) => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
              <button className="h-10 px-3 border rounded bg-white text-gray-900 hover:bg-gray-50" type="submit">
                Load
              </button>
            </form>
          )}
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players found for the selected team.
        </div>
      ) : (
        <AttendanceGrid 
          players={players}
          teamCode={teamCode}
          date={date}
        />
      )}
    </div>
  );
}
