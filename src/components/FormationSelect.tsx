"use client";
import { useMemo } from "react";

export type Formation = {
  gk: number;
  def: number;
  mid: number;
  wng: number;
  st: number;
};

export function validateFormation(f: Formation): { ok: boolean; reason?: string } {
  if (f.gk !== 1) return { ok: false, reason: 'Exactly 1 goalkeeper is required' };
  const outfield = f.def + f.mid + f.wng + f.st;
  if (outfield !== 10) return { ok: false, reason: 'Outfield players must sum to 10' };
  const anyNegative = [f.def, f.mid, f.wng, f.st].some(v => v < 0);
  if (anyNegative) return { ok: false, reason: 'Counts cannot be negative' };
  return { ok: true };
}

export default function FormationSelect({ value, onChange }: { value: Formation; onChange: (f: Formation) => void }) {
  const validation = useMemo(() => validateFormation(value), [value]);

  function set<K extends keyof Formation>(key: K, v: number) {
    const n = Math.max(0, Math.min(10, Math.floor(v)));
    onChange({ ...value, [key]: n });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-3 items-center">
        <label className="text-sm">GK</label>
        <input type="number" min={1} max={1} value={value.gk} onChange={(e) => set('gk', parseInt(e.target.value || '0', 10))} className="h-9 border rounded px-2 col-span-4" />
        <label className="text-sm">DEF</label>
        <input type="number" min={0} max={10} value={value.def} onChange={(e) => set('def', parseInt(e.target.value || '0', 10))} className="h-9 border rounded px-2 col-span-4" />
        <label className="text-sm">MID</label>
        <input type="number" min={0} max={10} value={value.mid} onChange={(e) => set('mid', parseInt(e.target.value || '0', 10))} className="h-9 border rounded px-2 col-span-4" />
        <label className="text-sm">WNG</label>
        <input type="number" min={0} max={10} value={value.wng} onChange={(e) => set('wng', parseInt(e.target.value || '0', 10))} className="h-9 border rounded px-2 col-span-4" />
        <label className="text-sm">ST</label>
        <input type="number" min={0} max={10} value={value.st} onChange={(e) => set('st', parseInt(e.target.value || '0', 10))} className="h-9 border rounded px-2 col-span-4" />
      </div>

      <div className="text-sm text-muted-foreground">
        Outfield total: {value.def + value.mid + value.wng + value.st} / 10
      </div>

      {!validation.ok && (
        <div className="text-sm text-red-600">{validation.reason}</div>
      )}
    </div>
  );
}


