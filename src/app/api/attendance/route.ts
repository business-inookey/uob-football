import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const AttendanceEntry = z.object({
  player_id: z.string().uuid(),
  team_code: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional()
})

const Body = z.object({
  entries: z.array(AttendanceEntry).min(1)
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = Body.safeParse(json)
  
  if (!parsed.success) {
    return new Response('Invalid payload', { status: 400 })
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results: Array<{ player_id: string; date: string; status: 'inserted'|'updated'|'skipped'; reason?: string }> = []

  for (const entry of parsed.data.entries) {
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
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'skipped', 
          reason: 'Player not found' 
        })
        continue
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('code', player.current_team)
        .single()

      if (teamError || !team) {
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'skipped', 
          reason: 'Player team not found' 
        })
        continue
      }
      
      teamId = team.id;
    } else {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('code', entry.team_code)
        .single()

      if (teamError || !team) {
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'skipped', 
          reason: 'Team not found' 
        })
        continue
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
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'skipped', 
          reason: error.message 
        })
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
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'skipped', 
          reason: error.message 
        })
      } else {
        results.push({ 
          player_id: entry.player_id, 
          date: entry.date, 
          status: 'inserted' 
        })
      }
    }
  }

  return Response.json({ ok: true, results })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')
  const date = searchParams.get('date')
  const playerId = searchParams.get('player_id')
  
  if (!teamCode || !date) {
    return new Response('team and date query params required', { status: 400 })
  }

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
      return new Response('Team not found', { status: 404 })
    }

    query = query.eq('team_id', team.id)
  }

  query = query.eq('date', date)

  if (playerId) {
    query = query.eq('player_id', playerId)
  }

  const { data, error } = await query

  if (error) {
    return new Response(error.message, { status: 400 })
  }

  return Response.json(data || [])
}
