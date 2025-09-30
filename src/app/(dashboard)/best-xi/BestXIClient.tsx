"use client";
import { useState } from "react";
import FormationSelect, { validateFormation, type Formation } from "@/components/FormationSelect";

type Team = { code: string; name: string };

interface BestXIClientProps {
  teams: Team[];
  defaultTeam: string;
}

type PlayerRow = {
  id: string;
  full_name: string;
  primary_position: string;
  composite: number;
  speed?: number;
};

type BestXIResult = {
  team: string;
  formation: Formation;
  xi: {
    gk: PlayerRow[];
    def: PlayerRow[];
    mid: PlayerRow[];
    wng: PlayerRow[];
    st: PlayerRow[];
    orderedXI: PlayerRow[];
  };
  counts?: { gk: number; def: number; mid: number; wng: number; st: number; total: number; expected: number; pool: number };
};

export default function BestXIClient({ teams, defaultTeam }: BestXIClientProps) {
  const [team, setTeam] = useState(defaultTeam);
  const [formation, setFormation] = useState<Formation>({ gk: 1, def: 4, mid: 3, wng: 0, st: 3 });
  const [result, setResult] = useState<BestXIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const generateXI = async () => {
    const validation = validateFormation(formation);
    if (!validation.ok) {
      setError(validation.reason || "Invalid formation");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/best-xi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team, formation })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate Best XI');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!result) return;

    try {
      const payload = {
        team: result.team,
        formation: result.formation,
        xi: result.xi.orderedXI.map(p => ({ full_name: p.full_name, primary_position: p.primary_position }))
      };
      console.log('Exporting PDF with payload:', payload);
      
      const response = await fetch('/best-xi/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `best-xi-${result.team}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Team</label>
          <select 
            value={team} 
            onChange={(e) => setTeam(e.target.value)}
            className="h-10 border rounded px-3"
          >
            {teams.map(t => (
              <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Formation</label>
          <div className="border rounded p-3">
            <FormationSelect value={formation} onChange={setFormation} />
          </div>
        </div>
        <button 
          onClick={generateXI}
          disabled={loading}
          className="h-10 px-3 border rounded bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Best XI — Team {result.team} ({result.formation.def}-{result.formation.mid}-{result.formation.st})
            </h2>
            <button 
              onClick={exportPDF}
              className="h-10 px-3 border rounded bg-green-600 text-white hover:bg-green-700"
            >
              Export PDF
            </button>
          </div>

          {result.counts && (
            <div className="text-xs text-muted-foreground">
              Selected: GK {result.counts.gk}, DEF {result.counts.def}, MID {result.counts.mid}, WNG {result.counts.wng}, ST {result.counts.st} — Total {result.counts.total} / Expected {result.counts.expected} — Pool {result.counts.pool}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.xi.orderedXI.map((player, index) => (
              <div key={player.id} className="border rounded p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {player.primary_position}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{player.full_name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  Composite: {player.composite.toFixed(3)}
                  {player.speed !== undefined && (
                    <span className="ml-2">Speed: {player.speed}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Select team and formation, then generate to see the Best XI. Export as PDF when ready.
      </div>
    </div>
  );
}
