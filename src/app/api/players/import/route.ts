import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Row = z.object({
  full_name: z.string().min(1),
  primary_position: z.string().min(1), // Accept any string, will be mapped
  current_team: z.enum(['1s','2s','3s','4s','5s','Devs']),
})

const Body = z.object({ rows: z.array(Row).min(1) })

const POS_MAP: Record<string, 'GK'|'DEF'|'MID'|'WNG'|'ST'> = {
  Goalkeeper: 'GK',
  Defender: 'DEF',
  Midfielder: 'MID',
  Winger: 'WNG',
  Striker: 'ST',
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return new Response('Invalid payload', { status: 400 })
  }

  const supabase = await createClient()

  // Fetch team ids once
  const { data: teams, error: teamsErr } = await supabase
    .from('teams')
    .select('id, code')

  if (teamsErr) return new Response(teamsErr.message, { status: 400 })
  const codeToId = new Map<string,string>(teams!.map(t => [t.code, t.id]))

  const results: Array<{ full_name: string; status: 'inserted'|'updated'|'skipped'; reason?: string }> = []

  for (const row of parsed.data.rows) {
    const teamId = codeToId.get(row.current_team)
    if (!teamId) {
      results.push({ full_name: row.full_name, status: 'skipped', reason: 'team not found' })
      continue
    }

    // Map position and validate
    const mappedPosition = POS_MAP[row.primary_position]
    if (!mappedPosition) {
      results.push({ full_name: row.full_name, status: 'skipped', reason: `invalid position: ${row.primary_position}` })
      continue
    }

    // Ensure player exists (by full_name for now)
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .ilike('full_name', row.full_name)
      .maybeSingle()

    let playerId = existing?.id
    if (!playerId) {
      // Create new player with current_team
      const { data: created, error } = await supabase
        .from('players')
        .insert({ 
          full_name: row.full_name, 
          primary_position: mappedPosition,
          current_team: row.current_team
        })
        .select('id')
        .single()
      if (error) {
        results.push({ full_name: row.full_name, status: 'skipped', reason: error.message })
        continue
      }
      playerId = created!.id
      results.push({ full_name: row.full_name, status: 'inserted' })
    } else {
      // Update existing player's current_team
      const { error: updateErr } = await supabase
        .from('players')
        .update({ current_team: row.current_team })
        .eq('id', playerId)

      if (updateErr) {
        console.log('Update current_team error:', updateErr)
        results.push({ full_name: row.full_name, status: 'skipped', reason: updateErr.message })
      } else {
        console.log('Successfully updated current_team for', row.full_name, 'to:', row.current_team)
        results.push({ full_name: row.full_name, status: 'updated' })
      }
    }
  }

  return Response.json({ ok: true, results })
}


