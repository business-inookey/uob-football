import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { bestXI, type Formation, type PlayerRow } from '@/lib/selection'

const FormationObj = z.object({ gk: z.number().int().min(1).max(1), def: z.number().int().min(0).max(10), mid: z.number().int().min(0).max(10), wng: z.number().int().min(0).max(10), st: z.number().int().min(0).max(10) })
const Body = z.object({
  team: z.string().min(1),
  formation: z.union([
    z.string().regex(/^1-\d-\d-\d$|^\d-\d-\d$/),
    FormationObj
  ])
})

function parseFormationInput(input: string | Formation): Formation {
  if (typeof input !== 'string') {
    return input
  }
  const parts = input.split('-').map(n => parseInt(n, 10))
  let gk = 1, def = 4, mid = 3, wng = 0, st = 3
  if (parts.length === 3) {
    ;[def, mid, st] = parts
  } else if (parts.length === 4) {
    ;[gk, def, mid, st] = parts
  }
  // split wide vs mid: assume mid includes wingers; use 0 wingers default
  // For standard 4-3-3, treat the third band as 3 strikers; set wingers 2, st 1 if def-mid-st typical? Keep simple: use WNG=0.
  return { gk, def, mid, wng, st }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = Body.safeParse(json ?? {
    team: new URL(request.url).searchParams.get('team') || '1s',
    formation: new URL(request.url).searchParams.get('formation') || '4-3-3'
  })
  if (!parsed.success) return new Response('Invalid payload', { status: 400 })

  const teamCode = parsed.data.team
  const formation = parseFormationInput(parsed.data.formation as any)

  const supabase = await createClient()

  // Resolve team id
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .eq('code', teamCode)
    .maybeSingle()
  if (teamErr || !team) return new Response('Team not found', { status: 404 })

  // Get composite scores (from view) and players joined
  const { data: rows, error: compErr } = await supabase
    .from('v_player_composite')
    .select('player_id, team_id, composite_score, players:players!inner(id, full_name, primary_position)')
    .eq('team_id', team.id)
  if (compErr) return new Response(compErr.message, { status: 400 })

  // Fetch speed for tie-breaker, if defined
  const { data: speedRows } = await supabase
    .from('player_stats')
    .select('player_id, value')
    .eq('team_id', team.id)
    .eq('stat_key', 'speed')

  const speedMap = new Map<string, number>((speedRows ?? []).map(r => [r.player_id, r.value as unknown as number]))

  let players: PlayerRow[] = (rows ?? []).map((r: any) => ({
    id: r.players.id,
    full_name: r.players.full_name,
    primary_position: r.players.primary_position,
    composite: Number(r.composite_score) || 0,
    speed: speedMap.get(r.players.id) || 0,
  }))

  // Fallback: if no composites present, pick players by current_team with zero composites
  if (!players.length) {
    const { data: teamPlayers } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .eq('current_team', teamCode)

    players = (teamPlayers ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      primary_position: p.primary_position,
      composite: 0,
      speed: 0,
    }))
  }

  console.log(`Best XI API: Found ${players.length} players for team ${teamCode}`)
  console.log('Formation:', formation)
  console.log('Expected total:', formation.gk + formation.def + formation.mid + formation.wng + formation.st)

  const xi = bestXI(players, formation)
  const counts = {
    gk: xi.gk.length,
    def: xi.def.length,
    mid: xi.mid.length,
    wng: xi.wng.length,
    st: xi.st.length,
    total: xi.orderedXI.length,
    expected: formation.gk + formation.def + formation.mid + formation.wng + formation.st,
    pool: players.length,
  }
  return Response.json({ team: teamCode, formation, xi, counts })
}


