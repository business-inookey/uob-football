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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Player not found</h3>
            <p className="text-muted-foreground">The requested player could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <a 
            href="/players" 
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Players
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary">
              {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {player.full_name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-muted-foreground">
              <span className="badge badge-primary">{player.primary_position}</span>
              <span className="hidden sm:inline">•</span>
              <span>Team {player.current_team}</span>
            </div>
          </div>
        </div>
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