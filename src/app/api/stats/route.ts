import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const StatEntry = z.object({
  player_id: z.string().uuid(),
  stat_key: z.string(),
  value: z.number().min(0),
  team_code: z.string()
})

const Body = z.object({
  entries: z.array(StatEntry).min(1)
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = Body.safeParse(json)
  
  if (!parsed.success) {
    return new Response('Invalid payload', { status: 400 })
  }

  const supabase = await createClient()

  // Handle team code - if 'all', we need to get the player's actual team
  let teamId: string;
  
  if (parsed.data.entries[0].team_code === 'all') {
    // Get the player's current team
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('current_team')
      .eq('id', parsed.data.entries[0].player_id)
      .single()

    if (playerError || !player) {
      return new Response('Player not found', { status: 404 })
    }

    // Get team ID for the player's current team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('code', player.current_team)
      .single()

    if (teamError || !team) {
      return new Response('Player team not found', { status: 404 })
    }
    
    teamId = team.id;
  } else {
    // Get team ID for the specific team code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('code', parsed.data.entries[0].team_code)
      .single()

    if (teamError || !team) {
      return new Response('Team not found', { status: 404 })
    }
    
    teamId = team.id;
  }

  const results: Array<{ player_id: string; stat_key: string; status: 'inserted'|'updated'|'skipped'; reason?: string }> = []

  for (const entry of parsed.data.entries) {
    // Check if stat already exists
    const { data: existing } = await supabase
      .from('player_stats')
      .select('id')
      .eq('player_id', entry.player_id)
      .eq('stat_key', entry.stat_key)
      .eq('team_id', teamId)
      .maybeSingle()

    if (existing) {
      // Update existing stat
      const { error } = await supabase
        .from('player_stats')
        .update({ 
          value: entry.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        results.push({ 
          player_id: entry.player_id, 
          stat_key: entry.stat_key, 
          status: 'skipped', 
          reason: error.message 
        })
      } else {
        results.push({ 
          player_id: entry.player_id, 
          stat_key: entry.stat_key, 
          status: 'updated' 
        })
      }
    } else {
      // Insert new stat
      const { error } = await supabase
        .from('player_stats')
        .insert({
          player_id: entry.player_id,
          stat_key: entry.stat_key,
          value: entry.value,
          team_id: teamId
        })

      if (error) {
        results.push({ 
          player_id: entry.player_id, 
          stat_key: entry.stat_key, 
          status: 'skipped', 
          reason: error.message 
        })
      } else {
        results.push({ 
          player_id: entry.player_id, 
          stat_key: entry.stat_key, 
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
  const playerId = searchParams.get('player_id')
  
  if (!teamCode) {
    return new Response('team query param required', { status: 400 })
  }

  const supabase = await createClient()

  let query = supabase
    .from('player_stats')
    .select('player_id, stat_key, value, team_id')

  // If teamCode is 'all', get stats from all teams
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

  if (playerId) {
    query = query.eq('player_id', playerId)
  }

  const { data, error } = await query

  if (error) {
    return new Response(error.message, { status: 400 })
  }

  return Response.json(data || [])
}
