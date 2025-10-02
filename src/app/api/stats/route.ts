import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers'
import { StatsBody, TeamQuery, PlayerQuery } from '@/lib/zod'

async function postStats(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = StatsBody.parse(json)

  const supabase = await createClient()

  // Handle team code - if 'all', we need to get the player's actual team
  let teamId: string;
  
  if (parsed.entries[0].team_code === 'all') {
    // Get the player's current team
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('current_team')
      .eq('id', parsed.entries[0].player_id)
      .single()

    if (playerError || !player) {
      handleSupabaseError(playerError, 'fetching player for stats')
    }

    // Get team ID for the player's current team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('code', player.current_team)
      .single()

    if (teamError || !team) {
      handleSupabaseError(teamError, 'fetching player team for stats')
    }
    
    teamId = team.id;
  } else {
    // Get team ID for the specific team code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('code', parsed.entries[0].team_code)
      .single()

    if (teamError || !team) {
      handleSupabaseError(teamError, 'fetching team for stats')
    }
    
    teamId = team.id;
  }

  const results: Array<{ player_id: string; stat_key: string; status: 'inserted'|'updated'|'skipped'; reason?: string }> = []

  for (const entry of parsed.entries) {
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
        handleSupabaseError(error, 'updating player stat')
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
        handleSupabaseError(error, 'inserting player stat')
      } else {
        results.push({ 
          player_id: entry.player_id, 
          stat_key: entry.stat_key, 
          status: 'inserted' 
        })
      }
    }
  }

  return createSuccessResponse({ ok: true, results })
}

async function getStats(request: Request) {
  const { searchParams } = new URL(request.url)
  const { team: teamCode } = TeamQuery.parse({ team: searchParams.get('team') })
  const playerId = searchParams.get('player_id')

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
      handleSupabaseError(teamError, 'fetching team for stats query')
    }

    query = query.eq('team_id', team.id)
  }

  if (playerId) {
    query = query.eq('player_id', playerId)
  }

  const { data, error } = await query

  if (error) {
    handleSupabaseError(error, 'fetching player stats')
  }

  return createSuccessResponse(data || [])
}

export const POST = withErrorHandling(postStats)
export const GET = withErrorHandling(getStats)
