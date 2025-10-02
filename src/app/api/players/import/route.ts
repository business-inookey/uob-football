import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers'
import { PlayerImportBody } from '@/lib/zod'

const POS_MAP: Record<string, 'GK'|'DEF'|'MID'|'WNG'|'ST'> = {
  Goalkeeper: 'GK',
  Defender: 'DEF',
  Midfielder: 'MID',
  Winger: 'WNG',
  Striker: 'ST',
}

async function importPlayers(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = PlayerImportBody.parse(json)

  const supabase = await createClient()

  // Fetch team ids once
  const { data: teams, error: teamsErr } = await supabase
    .from('teams')
    .select('id, code')

  if (teamsErr) {
    handleSupabaseError(teamsErr, 'fetching teams for import')
  }
  const codeToId = new Map<string,string>(teams!.map(t => [t.code, t.id]))

  const results: Array<{ full_name: string; status: 'inserted'|'updated'|'skipped'; reason?: string }> = []

  for (const row of parsed.rows) {
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
        handleSupabaseError(error, 'creating player during import')
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
        handleSupabaseError(updateErr, 'updating player team during import')
      } else {
        console.log('Successfully updated current_team for', row.full_name, 'to:', row.current_team)
        results.push({ full_name: row.full_name, status: 'updated' })
      }
    }
  }

  return createSuccessResponse({ ok: true, results })
}

export const POST = withErrorHandling(importPlayers)


