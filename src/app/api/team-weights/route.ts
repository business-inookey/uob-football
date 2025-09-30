import { createClient } from '@/lib/supabase/server'
import { requireLeadCoach } from '@/lib/auth'
import { z } from 'zod'

const WeightItem = z.object({
  stat_key: z.string().min(1),
  weight: z.number().min(0.5).max(1.5),
})

const PostBody = z.object({
  team_code: z.string().min(1),
  weights: z.array(WeightItem).min(1),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')
  if (!teamCode) return new Response('team query param required', { status: 400 })

  const supabase = await createClient()

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id, code, name')
    .eq('code', teamCode)
    .maybeSingle()

  if (teamErr || !team) return new Response('Team not found', { status: 404 })

  const { data, error } = await supabase
    .from('team_weights')
    .select('stat_key, weight')
    .eq('team_id', team.id)

  if (error) return new Response(error.message, { status: 400 })
  return Response.json({ team: { code: team.code, name: team.name }, weights: data ?? [] })
}

export async function POST(request: Request) {
  // Lead-coach-only; also enforced by RLS
  const { teams } = await requireLeadCoach()

  const json = await request.json().catch(() => null)
  const parsed = PostBody.safeParse(json)
  if (!parsed.success) return new Response('Invalid payload', { status: 400 })

  const { team_code, weights } = parsed.data

  // Ensure caller is lead for this team
  const hasLeadForTeam = teams.some((t: any) => t.teams?.code === team_code || t.team_id)
  if (!hasLeadForTeam) return new Response('Forbidden', { status: 403 })

  const supabase = await createClient()

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .eq('code', team_code)
    .maybeSingle()

  if (teamErr || !team) return new Response('Team not found', { status: 404 })

  const rows = weights.map(w => ({ team_id: team.id, stat_key: w.stat_key, weight: w.weight }))

  const { error } = await supabase
    .from('team_weights')
    .upsert(rows, { onConflict: 'team_id,stat_key' })

  if (error) return new Response(error.message, { status: 400 })
  return Response.json({ ok: true })
}


