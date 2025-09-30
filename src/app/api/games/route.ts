import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const GamePayload = z.object({
  id: z.string().uuid().optional(),
  home_team: z.string().min(1), // team code
  away_team: z.string().min(1), // team code
  kickoff_at: z.string(), // ISO datetime
  location: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')
  const month = searchParams.get('month') // YYYY-MM

  const supabase = await createClient()

  let query = supabase
    .from('games')
    .select('id, kickoff_at, location, notes, home_team:home_team(name,code), away_team:away_team(name,code)')
    .order('kickoff_at', { ascending: true }) as any

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
  if (error) return new Response(error.message, { status: 400 })
  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json().catch(() => null)
  const parsed = GamePayload.safeParse(body)
  if (!parsed.success) return new Response('Invalid payload', { status: 400 })

  // Resolve team codes to ids
  const { data: teams } = await supabase.from('teams').select('id, code')
  const codeToId = new Map<string,string>((teams ?? []).map(t => [t.code, t.id]))
  const homeId = codeToId.get(parsed.data.home_team)
  const awayId = codeToId.get(parsed.data.away_team)
  if (!homeId || !awayId) return new Response('Invalid team codes', { status: 400 })

  if (parsed.data.id) {
    // Update
    const { error } = await supabase
      .from('games')
      .update({
        home_team: homeId,
        away_team: awayId,
        kickoff_at: parsed.data.kickoff_at,
        location: parsed.data.location,
        notes: parsed.data.notes,
      })
      .eq('id', parsed.data.id)
    if (error) return new Response(error.message, { status: 400 })
    return Response.json({ ok: true, id: parsed.data.id })
  } else {
    // Insert
    const { data, error } = await supabase
      .from('games')
      .insert({
        home_team: homeId,
        away_team: awayId,
        kickoff_at: parsed.data.kickoff_at,
        location: parsed.data.location,
        notes: parsed.data.notes,
      })
      .select('id')
      .single()
    if (error) return new Response(error.message, { status: 400 })
    return Response.json({ ok: true, id: data!.id })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new Response('id required', { status: 400 })
  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) return new Response(error.message, { status: 400 })
  return Response.json({ ok: true })
}


