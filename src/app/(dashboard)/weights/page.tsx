import { requireCoach, requireLeadCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WeightsEditor, WeightsReadOnly } from "./WeightsClient";

type StatDef = { key: string; label: string; higher_is_better: boolean };
type WeightRow = { stat_key: string; weight: number };

async function getStatDefinitions(): Promise<StatDef[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stat_definitions")
    .select("key, label, higher_is_better")
    .order("key");
  return data ?? [];
}

async function getTeams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/teams`, { cache: 'no-store' })
  if (!res.ok) return [] as Array<{ code: string; name: string }>
  return res.json()
}

async function getTeamWeights(teamCode: string): Promise<WeightRow[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/team-weights?team=${teamCode}`, { cache: 'no-store' })
  if (!res.ok) return []
  const json = await res.json()
  return json.weights ?? []
}

export default async function WeightsPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  // Determine role and available teams for the coach
  const coach = await requireCoach();

  // If lead, also compute lead-only flag
  let isLead = false;
  try {
    const lead = await requireLeadCoach();
    isLead = (lead?.teams?.length ?? 0) > 0;
  } catch {
    isLead = false;
  }

  const params = await searchParams;
  const teams = await getTeams();
  const teamCode = params?.team || (teams[0]?.code ?? "1s");

  const [defs, existing] = await Promise.all([
    getStatDefinitions(),
    getTeamWeights(teamCode),
  ]);

  const weightsMap = new Map(existing.map(w => [w.stat_key, w.weight]));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Team Weights</h1>
        <div className="ml-auto">
          <form>
            <select name="team" defaultValue={teamCode} className="h-10 border rounded px-3">
              {teams.map((t: any) => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
            <button className="ml-2 h-10 px-3 border rounded" type="submit">Load</button>
          </form>
        </div>
      </div>

      {isLead ? (
        <WeightsEditor
          teamCode={teamCode}
          defs={defs}
          initialWeights={existing}
        />
      ) : (
        <WeightsReadOnly defs={defs} weights={existing} />
      )}

      <div className="text-sm text-muted-foreground">
        Sliders range: 0.5 (downweight) to 1.5 (upweight). Baseline 1.0.
      </div>
    </div>
  );
}

