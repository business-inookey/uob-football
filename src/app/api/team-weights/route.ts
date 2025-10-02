import { createClient } from '@/lib/supabase/server'
import { requireLeadCoach } from '@/lib/auth'
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers'
import { WeightsBody, TeamQuery } from '@/lib/zod'

async function getWeights(request: Request) {
  const { searchParams } = new URL(request.url)
  const { team: teamCode } = TeamQuery.parse({ team: searchParams.get('team') })

  const supabase = await createClient()

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id, code, name')
    .eq('code', teamCode)
    .maybeSingle()

  if (teamErr || !team) {
    handleSupabaseError(teamErr, 'fetching team for weights')
  }

  const { data, error } = await supabase
    .from('team_weights')
    .select('stat_key, weight')
    .eq('team_id', team.id)

  if (error) {
    handleSupabaseError(error, 'fetching team weights')
  }
  return createSuccessResponse({ team: { code: team.code, name: team.name }, weights: data ?? [] })
}

async function postWeights(request: Request) {
  // Lead-coach-only; also enforced by RLS
  const { teams } = await requireLeadCoach()

  const json = await request.json().catch(() => null)
  const parsed = WeightsBody.parse(json)

  const { team_code, weights } = parsed

  // Ensure caller is lead for this team
  const hasLeadForTeam = teams.some((t: TeamWeights) => t.teams?.code === team_code || t.team_id)
  if (!hasLeadForTeam) return new Response('Forbidden', { status: 403 })

  const supabase = await createClient()

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .eq('code', team_code)
    .maybeSingle()

  if (teamErr || !team) {
    handleSupabaseError(teamErr, 'fetching team for weights update')
  }

  const rows = weights.map(w => ({ team_id: team.id, stat_key: w.stat_key, weight: w.weight }))

  const { error } = await supabase
    .from('team_weights')
    .upsert(rows, { onConflict: 'team_id,stat_key' })

  if (error) {
    handleSupabaseError(error, 'updating team weights')
  }
  return createSuccessResponse({ ok: true })
}

export const GET = withErrorHandling(getWeights)
export const POST = withErrorHandling(postWeights)


