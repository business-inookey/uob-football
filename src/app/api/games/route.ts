import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers'
import { GamePayload, TeamQuery, MonthQuery } from '@/lib/zod'

async function getGames(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')
  const month = searchParams.get('month') // YYYY-MM

  const supabase = await createClient()

  let query = supabase
    .from('games')
    .select('id, kickoff_at, location, notes, home_team:home_team(name,code), away_team:away_team(name,code)')
    .order('kickoff_at', { ascending: true })

  if (teamCode && teamCode !== 'all') {
    // Join constraints handled by RLS; filter by team membership using team code
    // Need team id
    const { data: t } = await supabase.from('teams').select('id').eq('code', teamCode).maybeSingle()
    if (t) {
      query = query.or(`home_team.eq.${t.id},away_team.eq.${t.id}`)
    }
  }

  if (month) {
    const start = `${month}-01`
    const endDate = new Date(`${month}-01T00:00:00Z`)
    endDate.setMonth(endDate.getMonth() + 1)
    const end = endDate.toISOString().slice(0, 10)
    query = query.gte('kickoff_at', start).lt('kickoff_at', end)
  }

  const { data, error } = await query
  if (error) {
    handleSupabaseError(error, 'fetching games')
  }
  return createSuccessResponse(data ?? [])
}

async function postGame(request: Request) {
  const supabase = await createClient()
  const body = await request.json().catch(() => null)
  const parsed = GamePayload.parse(body)

  // Resolve team codes to ids
  const { data: teams } = await supabase.from('teams').select('id, code')
  const codeToId = new Map<string,string>((teams ?? []).map(t => [t.code, t.id]))
  const homeId = codeToId.get(parsed.home_team)
  const awayId = codeToId.get(parsed.away_team)
  if (!homeId || !awayId) {
    handleSupabaseError(new Error('Invalid team codes'), 'validating team codes')
  }

  if (parsed.id) {
    // Update
    const { error } = await supabase
      .from('games')
      .update({
        home_team: homeId,
        away_team: awayId,
        kickoff_at: parsed.kickoff_at,
        location: parsed.location,
        notes: parsed.notes,
      })
      .eq('id', parsed.id)
    if (error) {
      handleSupabaseError(error, 'updating game')
    }
    return createSuccessResponse({ ok: true, id: parsed.id })
  } else {
    // Insert
    const { data, error } = await supabase
      .from('games')
      .insert({
        home_team: homeId,
        away_team: awayId,
        kickoff_at: parsed.kickoff_at,
        location: parsed.location,
        notes: parsed.notes,
      })
      .select('id')
      .single()
    if (error) {
      handleSupabaseError(error, 'creating game')
    }
    return createSuccessResponse({ ok: true, id: data!.id })
  }
}

async function deleteGame(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    handleSupabaseError(new Error('id required'), 'validating delete request')
  }
  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) {
    handleSupabaseError(error, 'deleting game')
  }
  return createSuccessResponse({ ok: true })
}

export const GET = withErrorHandling(getGames)
export const POST = withErrorHandling(postGame)
export const DELETE = withErrorHandling(deleteGame)


