import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')
  
  if (!teamCode) {
    return new Response('team query param required', { status: 400 })
  }

  // Create Supabase client with cookies for authentication
  const supabase = await createClient()

  // Temporarily bypass authentication to test data access
  // TODO: Re-enable authentication once data is working
  const isLeadCoach = true // Assume lead coach for now

  console.log('API: teamCode =', teamCode, 'isLeadCoach =', isLeadCoach)

  let players: any[] = []

  // Query players based on team selection
  if (teamCode === 'all') {
    // Show all players from all teams
    const { data, error } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .order('current_team, full_name')

    if (error) {
      console.log('Error fetching all players:', error)
      return new Response(error.message, { status: 400 })
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
      console.log('Error fetching team players:', error)
      return new Response(error.message, { status: 400 })
    }
    players = data || []
  }

  console.log('API: Returning', players.length, 'players for team', teamCode)
  return Response.json(players)
}