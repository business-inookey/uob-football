import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireCoach } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers';
import { UUID } from '@/lib/zod';

const CreateSessionSchema = z.object({
  team: z.string().min(1),
  drillName: z.string().min(1),
  notes: z.string().optional(),
});

const RecordLapSchema = z.object({
  sessionId: UUID,
  playerId: UUID,
  lapIndex: z.number().int().min(1),
  lapMs: z.number().int().min(1),
});

async function postDrill(request: NextRequest) {
  const { user, profile, teams: memberships } = await requireCoach();
  const supabase = await createClient();
  
  const body = await request.json();
  const { action } = body;

    if (action === 'create_session') {
      const { team, drillName, notes } = CreateSessionSchema.parse(body);
      
      // Verify coach has access to this team via memberships
      const hasAccess = Array.isArray(memberships) && memberships.some((m: DrillSession) => m.team_id === team);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied to team' }, { status: 403 });
      }

      // Create session
      const { data: session, error } = await supabase
        .from('drill_sessions')
        .insert({
          team_id: team,
          created_by: profile.id,
          drill_name: drillName,
          notes: notes || null,
        })
        .select('id')
        .single();

      if (error) {
        handleSupabaseError(error, 'creating drill session');
      }

      return createSuccessResponse({ ok: true, sessionId: session.id });

    } else if (action === 'record_lap') {
      const { sessionId, playerId, lapIndex, lapMs } = RecordLapSchema.parse(body);
      
      // Verify coach has access to this session's team
      const { data: sessionRow, error: sessionErr } = await supabase
        .from('drill_sessions')
        .select('team_id')
        .eq('id', sessionId)
        .single();

      if (sessionErr || !sessionRow) {
        handleSupabaseError(sessionErr, 'fetching drill session');
      }

      const sessionAccess = Array.isArray(memberships) && memberships.some((m: DrillSession) => m.team_id === sessionRow.team_id);
      if (!sessionAccess) {
        return NextResponse.json({ error: 'Access denied to session' }, { status: 403 });
      }

      // Record lap
      const { data: lap, error } = await supabase
        .from('drill_laps')
        .insert({
          session_id: sessionId,
          player_id: playerId,
          lap_index: lapIndex,
          lap_ms: lapMs,
        })
        .select('id')
        .single();

      if (error) {
        handleSupabaseError(error, 'recording drill lap');
      }

      // Calculate and update player stats
      await updatePlayerStats(supabase, playerId, lapMs, sessionRow.team_id, profile.id);

      return createSuccessResponse({ ok: true, lapId: lap.id });

    } else {
      handleSupabaseError(new Error('Invalid action'), 'validating drill action');
    }
}

export const POST = withErrorHandling(postDrill);

async function updatePlayerStats(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  playerId: string, 
  lapMs: number,
  teamId: string,
  notedBy: string
) {
  try {
    // Validate lap time (between 5 seconds and 5 minutes)
    if (lapMs < 5000 || lapMs > 300000) {
      console.warn(`Invalid lap time: ${lapMs}ms for player ${playerId}`);
      return;
    }

    // Calculate pace score (0-100 scale)
    // Assuming 100m drill: World record ~9.5s, average ~15s, slow ~25s
    const lapSeconds = lapMs / 1000;
    const paceScore = Math.max(0, Math.min(100, Math.round(100 - ((lapSeconds - 9.5) / (25 - 9.5)) * 100)));
    
    // Calculate stamina score based on consistency and speed
    // Faster times with good form = higher stamina
    const staminaScore = Math.max(0, Math.min(100, Math.round(paceScore * 0.8 + 20))); // Base stamina on pace
    
    console.log(`Updating stats for player ${playerId}: pace=${paceScore}, stamina=${staminaScore} (lap: ${lapSeconds}s)`);
    
    // Get current stats for this player and team
    const { data: currentStats } = await supabase
      .from('player_stats')
      .select('stat_key, value')
      .eq('player_id', playerId)
      .eq('team_id', teamId)
      .in('stat_key', ['pace', 'stamina']);

    const currentPace = currentStats?.find(s => s.stat_key === 'pace')?.value || 0;
    const currentStamina = currentStats?.find(s => s.stat_key === 'stamina')?.value || 0;

    // Calculate new values (weighted average: 70% new, 30% old)
    const newPace = currentPace > 0 ? Math.round(paceScore * 0.7 + currentPace * 0.3) : paceScore;
    const newStamina = currentStamina > 0 ? Math.round(staminaScore * 0.7 + currentStamina * 0.3) : staminaScore;

    // Upsert pace stat
    const { error: paceError } = await supabase
      .from('player_stats')
      .upsert({
        player_id: playerId,
        team_id: teamId,
        stat_key: 'pace',
        value: newPace,
        noted_by: notedBy,
        noted_at: new Date().toISOString(),
      }, {
        onConflict: 'player_id,team_id,stat_key'
      });

    if (paceError) {
      console.error('Error upserting pace stat:', paceError);
    }

    // Upsert stamina stat
    const { error: staminaError } = await supabase
      .from('player_stats')
      .upsert({
        player_id: playerId,
        team_id: teamId,
        stat_key: 'stamina',
        value: newStamina,
        noted_by: notedBy,
        noted_at: new Date().toISOString(),
      }, {
        onConflict: 'player_id,team_id,stat_key'
      });

    if (staminaError) {
      console.error('Error upserting stamina stat:', staminaError);
    }

    console.log(`Successfully updated stats: pace=${newPace}, stamina=${newStamina}`);

  } catch (error) {
    console.error('Error updating player stats:', error);
    // Don't throw - stats update failure shouldn't break lap recording
  }
}
