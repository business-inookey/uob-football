import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse, ValidationError } from '@/lib/api-helpers'
import { TeamQuery } from '@/lib/zod'

async function getPlayers(request: Request) {
  const { searchParams } = new URL(request.url)
  const { team: teamCode } = TeamQuery.parse({ team: searchParams.get('team') })

  const supabase = await createClient()

  // Temporarily bypass authentication to test data access
  // TODO: Re-enable authentication once data is working
  const isLeadCoach = true // Assume lead coach for now

  console.log('API: teamCode =', teamCode, 'isLeadCoach =', isLeadCoach)

  let players: Player[][] = []

  // Query players based on team selection
  if (teamCode === 'all') {
    // Show all players from all teams
    const { data, error } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .order('current_team, full_name')

    if (error) {
      handleSupabaseError(error, 'fetching all players')
    }
    players = data || []
  } else {
    // Filter by specific team
    const { data, error } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .eq('current_team', teamCode)
      .order('full_name')

    if (error) {
      handleSupabaseError(error, 'fetching team players')
    }
    players = data || []
  }

  console.log('API: Returning', players.length, 'players for team', teamCode)
  return createSuccessResponse(players)
}

export const GET = withErrorHandling(getPlayers)