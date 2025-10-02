import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse, requireAuth } from '@/lib/api-helpers'
import { AttendanceBody, AttendanceEntry, TeamQuery, DateQuery, PlayerQuery } from '@/lib/zod'

async function postAttendance(request: Request) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  
  const body = await request.json().catch(() => null)
  const parsed = AttendanceBody.parse(body)

  const results: Array<{ player_id: string; date: string; status: 'inserted'|'updated'|'skipped'; reason?: string }> = []

  for (const entry of parsed.entries) {
    // Get team ID
    let teamId: string;
    
    if (entry.team_code === 'all') {
      // Get the player's current team
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('current_team')
        .eq('id', entry.player_id)
        .single()

      if (playerError || !player) {
        handleSupabaseError(playerError, 'fetching player for attendance')
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('code', player.current_team)
        .single()

      if (teamError || !team) {
        handleSupabaseError(teamError, 'fetching player team for attendance')
      }
      
      teamId = team.id;
    } else {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('code', entry.team_code)
        .single()

      if (teamError || !team) {
        handleSupabaseError(teamError, 'fetching team for attendance')
      }
      
      teamId = team.id;
    }

    // Check if attendance already exists
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('player_id', entry.player_id)
      .eq('date', entry.date)
      .maybeSingle()

    if (existing) {
      // Update existing attendance
      const { error } = await supabase
        .from('attendance')
        .update({ 
          status: entry.status,
          notes: entry.notes,
          recorded_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        handleSupabaseError(error, 'updating attendance')
      } else {
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'updated' 
        })
      }
    } else {
      // Insert new attendance
      const { error } = await supabase
        .from('attendance')
        .insert({
          player_id: entry.player_id,
          team_id: teamId,
          date: entry.date,
          status: entry.status,
          notes: entry.notes,
          recorded_by: user.id
        })

      if (error) {
        handleSupabaseError(error, 'inserting attendance')
      } else {
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'inserted' 
        })
      }
    }
  }

  return createSuccessResponse({ ok: true, results })
}

async function getAttendance(request: Request) {
  const { searchParams } = new URL(request.url)
  const { team: teamCode } = TeamQuery.parse({ team: searchParams.get('team') })
  const { date } = DateQuery.parse({ date: searchParams.get('date') })
  const playerId = searchParams.get('player_id')

  const supabase = await createClient()

  let query = supabase
    .from('attendance')
    .select(`
      player_id,
      status,
      notes,
      recorded_by,
      players!inner(full_name, primary_position, current_team)
    `)

  // If teamCode is 'all', get attendance from all teams
  if (teamCode !== 'all') {
    // Get team ID for specific team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('code', teamCode)
      .single()

    if (teamError || !team) {
      handleSupabaseError(teamError, 'fetching team for attendance query')
    }

    query = query.eq('team_id', team.id)
  }

  query = query.eq('date', date)

  if (playerId) {
    query = query.eq('player_id', playerId)
  }

  const { data, error } = await query

  if (error) {
    handleSupabaseError(error, 'fetching attendance records')
  }

  return createSuccessResponse(data || [])
}

export const POST = withErrorHandling(postAttendance)
export const GET = withErrorHandling(getAttendance)
