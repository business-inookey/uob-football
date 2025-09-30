"use client";
import { useMemo, useState, useTransition } from "react";

type StatDef = { key: string; label: string; higher_is_better: boolean };
type WeightRow = { stat_key: string; weight: number };

export function WeightsReadOnly({ defs, weights }: { defs: StatDef[]; weights: WeightRow[] }) {
  const m = new Map(weights.map(w => [w.stat_key, w.weight]));
  return (
    <div className="space-y-3">
      {defs.map(d => {
        const w = m.get(d.key) ?? 1;
        const delta = (w - 1);
        const deltaPct = Math.round(delta * 100);
        return (
          <div key={d.key} className="flex items-center gap-3">
            <div className="w-48 text-sm">{d.label}</div>
            <div className="flex-1 h-2 bg-gray-100 rounded" />
            <div className="w-24 text-right text-sm">
              {w.toFixed(2)} {delta !== 0 ? (
                <span className={delta > 0 ? "text-green-600" : "text-red-600"}>
                  ({deltaPct > 0 ? "+" : ""}{deltaPct}%)
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function WeightsEditor({ teamCode, defs, initialWeights }: { teamCode: string; defs: StatDef[]; initialWeights: WeightRow[] }) {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    for (const d of defs) base[d.key] = 1;
    for (const w of initialWeights) base[w.stat_key] = w.weight;
    return base;
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const rows = useMemo(() => defs.map(d => ({
    key: d.key,
    label: d.label,
    weight: weights[d.key] ?? 1,
  })), [defs, weights]);

  async function save() {
    setMessage("");
    const body = {
      team_code: teamCode,
      weights: Object.entries(weights).map(([stat_key, weight]) => ({ stat_key, weight }))
    };
    const res = await fetch('/api/team-weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const t = await res.text().catch(() => 'Error');
      setMessage(t || 'Save failed');
    } else {
      setMessage('Saved');
    }
  }

  return (
    <div className="space-y-4">
      {rows.map(r => {
        const delta = r.weight - 1;
        const deltaPct = Math.round(delta * 100);
        return (
          <div key={r.key} className="flex items-center gap-3">
            <div className="w-48 text-sm">{r.label}</div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.01}
              value={r.weight}
              onChange={(e) => setWeights(prev => ({ ...prev, [r.key]: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <div className="w-28 text-right text-sm">
              {r.weight.toFixed(2)} {delta !== 0 ? (
                <span className={delta > 0 ? "text-green-600" : "text-red-600"}>
                  ({deltaPct > 0 ? "+" : ""}{deltaPct}%)
                </span>
              ) : null}
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() => startTransition(save)}
          className="h-10 px-3 border rounded bg-primary text-primary-foreground"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
        {message && <span className="text-sm">{message}</span>}
      </div>
    </div>
  )
}


