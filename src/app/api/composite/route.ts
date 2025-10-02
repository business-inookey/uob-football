import { createClient } from "@/lib/supabase/server";
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers';
import { TeamQuery } from '@/lib/zod';

function parseIds(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function getComposite(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get("team") ?? "all";
  const ids = parseIds(searchParams.get("ids"));

  if (ids.length === 0) {
    handleSupabaseError(new Error("ids query param required (comma-separated player ids)"), 'validating composite request');
  }

  const supabase = await createClient();

  // Load players for metadata
  const { data: players, error: playersErr } = await supabase
    .from("players")
    .select("id, full_name, primary_position, current_team")
    .in("id", ids);
  if (playersErr) {
    handleSupabaseError(playersErr, 'fetching players for composite');
  }

  // Load stat definitions
  const { data: statDefs, error: defsErr } = await supabase
    .from("stat_definitions")
    .select("key, label, higher_is_better");
  if (defsErr) {
    handleSupabaseError(defsErr, 'fetching stat definitions for composite');
  }

  // Load player stats for selected players, scoped by team if provided
  let statsQuery = supabase
    .from("player_stats")
    .select("player_id, stat_key, value, team_id")
    .in("player_id", ids);

  if (teamCode !== "all") {
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .select("id")
      .eq("code", teamCode)
      .single();
    if (teamErr || !team) {
      handleSupabaseError(teamErr, 'fetching team for composite');
    }
    statsQuery = statsQuery.eq("team_id", team.id);
  }

  const { data: statsRows, error: statsErr } = await statsQuery;
  if (statsErr) {
    handleSupabaseError(statsErr, 'fetching player stats for composite');
  }

  // Build raw matrix { playerId: { statKey: value } }
  const raw: Record<string, Record<string, number>> = {};
  for (const pid of ids) raw[pid] = {};
  for (const row of statsRows ?? []) {
    raw[row.player_id] ||= {};
    raw[row.player_id][row.stat_key] = row.value;
  }

  // Determine the common stat keys across selected players (union)
  const statKeys = Array.from(
    new Set((statsRows ?? []).map((r) => r.stat_key))
  );

  // Normalize per stat across selected players
  const normalized: Record<string, Record<string, number>> = {};
  for (const pid of ids) normalized[pid] = {};

  for (const key of statKeys) {
    let min = Infinity;
    let max = -Infinity;
    for (const pid of ids) {
      const v = raw[pid]?.[key];
      if (typeof v === "number") {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const denom = max - min;
    for (const pid of ids) {
      const v = raw[pid]?.[key];
      let n = 0.5; // default neutral if missing or no variance
      if (typeof v === "number") {
        n = denom === 0 ? 0.5 : (v - min) / (denom || 1);
      }
      normalized[pid][key] = n;
    }
  }

  return createSuccessResponse({
    players,
    statKeys,
    statDefinitions: statDefs,
    raw,
    normalized,
  });
}

export const GET = withErrorHandling(getComposite);


