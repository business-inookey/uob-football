"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type StatDef = { key: string; label: string; higher_is_better: boolean };
type WeightRow = { stat_key: string; weight: number };

interface WeightsClientProps {
  teamCode: string;
  teams: Array<{ code: string; name: string }>;
  defs: StatDef[];
  initialWeights: WeightRow[];
  isLead: boolean;
}

export default function WeightsClient({ teamCode, teams, defs, initialWeights, isLead }: WeightsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTeam, setSelectedTeam] = useState(teamCode);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTeamChange = async (newTeam: string) => {
    setSelectedTeam(newTeam);
    setIsUpdating(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newTeam) {
      params.set('team', newTeam);
    } else {
      params.delete('team');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/weights?${params.toString()}`, { scroll: false });
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Team Weights
        </h1>
        <p className="text-lg text-muted-foreground">
          Configure performance metric weights for composite scoring
        </p>
      </div>

      {/* Team Selection */}
      <div className="card p-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Team Configuration</h2>
            <p className="text-muted-foreground">
              {isLead ? 'Adjust weights for different teams' : 'View current team weights'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">Team:</label>
            <select 
              value={selectedTeam} 
              onChange={e => handleTeamChange(e.target.value)}
              disabled={isUpdating}
              className={`input w-full sm:min-w-[180px] transition-opacity duration-200 ${
                isUpdating ? 'opacity-50' : ''
              }`}
            >
              {teams.map((t) => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
            {isUpdating && (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Weights Configuration */}
      {isLead ? (
        <WeightsEditor
          teamCode={selectedTeam}
          defs={defs}
          initialWeights={initialWeights}
        />
      ) : (
        <WeightsReadOnly defs={defs} weights={initialWeights} />
      )}

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <h3 className="font-medium text-blue-900">How weights work</h3>
            <p className="text-sm text-blue-800">
              Weights adjust how much each statistic contributes to a player&apos;s composite score. 
              Range: 0.5 (downweight) to 1.5 (upweight). Baseline is 1.0. 
              {!isLead && ' Only lead coaches can modify weights.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightsReadOnly({ defs, weights }: { defs: StatDef[]; weights: WeightRow[] }) {
  const m = new Map(weights.map(w => [w.stat_key, w.weight]));
  
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground">Current Weights (Read Only)</h2>
      </div>
      
      <div className="space-y-4">
        {defs.map(d => {
          const w = m.get(d.key) ?? 1;
          const delta = (w - 1);
          const deltaPct = Math.round(delta * 100);
          const isPositive = delta > 0;
          const isNegative = delta < 0;
          
          return (
            <div key={d.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{d.label}</span>
                  {d.higher_is_better ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{w.toFixed(2)}</span>
                  {delta !== 0 && (
                    <span className={`badge ${
                      isPositive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {deltaPct > 0 ? "+" : ""}{deltaPct}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isPositive 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : isNegative 
                        ? 'bg-gradient-to-r from-red-400 to-red-600'
                        : 'bg-gradient-to-r from-primary to-primary/80'
                    }`}
                    style={{ 
                      width: `${Math.max(0, Math.min(100, ((w - 0.5) / 1) * 100))}%` 
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-background rounded-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeightsEditor({ teamCode, defs, initialWeights }: { teamCode: string; defs: StatDef[]; initialWeights: WeightRow[] }) {
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
    higher_is_better: d.higher_is_better,
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
      setMessage('Saved successfully');
    }
  }

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground">Edit Weights</h2>
      </div>

      <div className="space-y-6">
        {rows.map(r => {
          const delta = r.weight - 1;
          const deltaPct = Math.round(delta * 100);
          const isPositive = delta > 0;
          const _isNegative = delta < 0;
          
          return (
            <div key={r.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{r.label}</span>
                  {r.higher_is_better ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{r.weight.toFixed(2)}</span>
                  {delta !== 0 && (
                    <span className={`badge ${
                      isPositive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {deltaPct > 0 ? "+" : ""}{deltaPct}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  value={r.weight}
                  onChange={(e) => setWeights(prev => ({ ...prev, [r.key]: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5 (Downweight)</span>
                  <span>1.0 (Baseline)</span>
                  <span>1.5 (Upweight)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {message && (
            <div className={`flex items-center gap-2 text-sm ${
              message.includes('successfully') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {message.includes('successfully') ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message}
            </div>
          )}
        </div>
        
        <Button
          disabled={pending}
          onClick={() => startTransition(save)}
          className="w-full sm:w-auto"
          dataTitle="Save Weights"
          dataText="Save Weights"
          dataStart="true"
          isActive={pending}
        >
          {pending ? (
            <>
              <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Weights
            </>
          )}
        </Button>
      </div>
    </div>
  );
}