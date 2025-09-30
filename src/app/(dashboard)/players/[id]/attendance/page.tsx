import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AttendanceCalendar from "@/components/AttendanceCalendar";

async function getPlayer(playerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('players')
    .select('id, full_name, primary_position, current_team')
    .eq('id', playerId)
    .single();
  return data;
}

async function getPlayerAttendance(playerId: string, year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
  
  const { data } = await supabase
    .from('attendance')
    .select('date, status, notes')
    .eq('player_id', playerId)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date');
  
  return data || [];
}

export default async function PlayerAttendancePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ year?: string; month?: string }>;
}) {
  await requireCoach();
  
  const { id: playerId } = await params;
  const search = await searchParams;
  const year = parseInt(search?.year || new Date().getFullYear().toString());
  const month = parseInt(search?.month || (new Date().getMonth() + 1).toString());
  
  const player = await getPlayer(playerId);
  const attendance = await getPlayerAttendance(playerId, year, month);

  if (!player) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Player not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <a 
          href="/players" 
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Players
        </a>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">
          {player.full_name} - Attendance History
        </h1>
        <span className="text-sm text-muted-foreground">
          {player.primary_position} • {player.current_team}
        </span>
      </div>

      <AttendanceCalendar 
        player={player}
        attendance={attendance}
        year={year}
        month={month}
      />
    </div>
  );
}
