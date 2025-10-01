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
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Goalkeeper */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Goalkeeper</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => set('gk', Math.max(1, value.gk - 1))}
              disabled={value.gk <= 1}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              -
            </button>
            <div className="w-8 text-center font-semibold text-foreground text-sm">
              {value.gk}
            </div>
            <button
              onClick={() => set('gk', Math.min(1, value.gk + 1))}
              disabled={value.gk >= 1}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              +
            </button>
          </div>
        </div>

        {/* Defenders */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Defenders</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => set('def', Math.max(0, value.def - 1))}
              disabled={value.def <= 0}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              -
            </button>
            <div className="w-8 text-center font-semibold text-foreground text-sm">
              {value.def}
            </div>
            <button
              onClick={() => set('def', Math.min(10, value.def + 1))}
              disabled={value.def >= 10}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              +
            </button>
          </div>
        </div>

        {/* Midfielders */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Midfielders</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => set('mid', Math.max(0, value.mid - 1))}
              disabled={value.mid <= 0}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              -
            </button>
            <div className="w-8 text-center font-semibold text-foreground text-sm">
              {value.mid}
            </div>
            <button
              onClick={() => set('mid', Math.min(10, value.mid + 1))}
              disabled={value.mid >= 10}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              +
            </button>
          </div>
        </div>

        {/* Wingers */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Wingers</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => set('wng', Math.max(0, value.wng - 1))}
              disabled={value.wng <= 0}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              -
            </button>
            <div className="w-8 text-center font-semibold text-foreground text-sm">
              {value.wng}
            </div>
            <button
              onClick={() => set('wng', Math.min(10, value.wng + 1))}
              disabled={value.wng >= 10}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              +
            </button>
          </div>
        </div>

        {/* Strikers */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Strikers</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => set('st', Math.max(0, value.st - 1))}
              disabled={value.st <= 0}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              -
            </button>
            <div className="w-8 text-center font-semibold text-foreground text-sm">
              {value.st}
            </div>
            <button
              onClick={() => set('st', Math.min(10, value.st + 1))}
              disabled={value.st >= 10}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Outfield total:</span>
          <span className={`font-semibold ${validation.ok ? 'text-green-600' : 'text-red-600'}`}>
            {value.def + value.mid + value.wng + value.st} / 10
          </span>
        </div>
      </div>

      {!validation.ok && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {validation.reason}
          </div>
        </div>
      )}
    </div>
  );
}


