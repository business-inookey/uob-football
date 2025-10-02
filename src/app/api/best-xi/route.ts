import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers'
import { bestXI, type Formation, type PlayerRow } from '@/lib/selection'
import { BestXIQuery } from '@/lib/zod'

const FormationObj = z.object({ 
  gk: z.number().int().min(1).max(1), 
  def: z.number().int().min(0).max(10), 
  mid: z.number().int().min(0).max(10), 
  wng: z.number().int().min(0).max(10), 
  st: z.number().int().min(0).max(10) 
})

const BestXIBody = z.object({
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
  let gk = 1, def = 4, mid = 3, st = 3
  const wng = 0
  if (parts.length === 3) {
    ;[def, mid, st] = parts
  } else if (parts.length === 4) {
    ;[gk, def, mid, st] = parts
  }
  // split wide vs mid: assume mid includes wingers; use 0 wingers default
  // For standard 4-3-3, treat the third band as 3 strikers; set wingers 2, st 1 if def-mid-st typical? Keep simple: use WNG=0.
  return { gk, def, mid, wng, st }
}

async function postBestXI(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = BestXIBody.parse(json ?? {
    team: new URL(request.url).searchParams.get('team') || '1s',
    formation: new URL(request.url).searchParams.get('formation') || '4-3-3'
  })

  const teamCode = parsed.team
  const formation = parseFormationInput(parsed.formation)

  const supabase = await createClient()

  // Resolve team id
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .eq('code', teamCode)
    .maybeSingle()
  if (teamErr || !team) {
    handleSupabaseError(teamErr, 'fetching team for best XI')
  }

  // Get composite scores (from view) and players joined
  const { data: rows, error: compErr } = await supabase
    .from('v_player_composite')
    .select('player_id, team_id, composite_score, players:players!inner(id, full_name, primary_position)')
    .eq('team_id', team.id)
  if (compErr) {
    handleSupabaseError(compErr, 'fetching composite scores for best XI')
  }

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

  // Fallback: if not enough players with composites, supplement with players by current_team
  const expectedTotal = formation.gk + formation.def + formation.mid + formation.wng + formation.st;
  if (players.length < expectedTotal) {
    const { data: teamPlayers } = await supabase
      .from('players')
      .select('id, full_name, primary_position, current_team')
      .eq('current_team', teamCode)

    const existingIds = new Set(players.map(p => p.id));
    const additionalPlayers = (teamPlayers ?? [])
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({
        id: p.id,
        full_name: p.full_name,
        primary_position: p.primary_position,
        composite: 0,
        speed: 0,
      }));

    players = [...players, ...additionalPlayers];
    console.log(`Added ${additionalPlayers.length} players without composite scores to reach ${players.length} total players`);
  }

  console.log(`Best XI API: Found ${players.length} players for team ${teamCode}`)
  console.log('Formation:', formation)
  console.log('Expected total:', formation.gk + formation.def + formation.mid + formation.wng + formation.st)
  console.log('Available players:', players.map(p => ({ name: p.full_name, position: p.primary_position, composite: p.composite })))

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
  return createSuccessResponse({ team: teamCode, formation, xi, counts })
}

export const POST = withErrorHandling(postBestXI)


