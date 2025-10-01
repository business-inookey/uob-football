"use client";
import { useState } from "react";
import FormationSelect, { validateFormation, type Formation } from "@/components/FormationSelect";
import { Button } from "@/components/ui/button";

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

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'GK': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'DEF': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'MID': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'FWD': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[position] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTeamColor = (teamCode: string) => {
    const colors: Record<string, string> = {
      '1s': 'bg-primary/10 text-primary',
      '2s': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      '3s': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      '4s': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[teamCode] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Best XI
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate optimal team lineups based on player performance data
        </p>
      </div>

      {/* Configuration */}
      <div className="card p-6 space-y-6">
        <div className="space-y-6">
          {/* Team Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Team</label>
            <select 
              value={team} 
              onChange={(e) => setTeam(e.target.value)}
              className="input w-full"
            >
              {teams.map(t => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
          </div>

          {/* Formation Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Formation</label>
            <div className="card p-4 bg-muted/50">
              <FormationSelect value={formation} onChange={setFormation} />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-center">
          <Button 
            onClick={generateXI}
            disabled={loading}
            className="w-full sm:w-auto px-8"
            dataTitle="Generate Best XI"
            dataText="Generating..."
            dataStart="Best XI Generated!"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
                Generating Best XI...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Best XI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Header with Export */}
          <div className="card p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Best XI — Team {result.team}
                </h2>
                <p className="text-muted-foreground">
                  Formation: {result.formation.def}-{result.formation.mid}-{result.formation.st}
                </p>
              </div>
              <Button 
                onClick={exportPDF}
                className="w-full sm:w-auto"
                dataTitle="Export PDF"
                dataText="Exporting..."
                dataStart="PDF Exported!"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </Button>
            </div>

            {/* Statistics */}
            {result.counts && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.counts.gk}</div>
                    <div className="text-muted-foreground">Goalkeepers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.counts.def}</div>
                    <div className="text-muted-foreground">Defenders</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.counts.mid}</div>
                    <div className="text-muted-foreground">Midfielders</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.counts.st}</div>
                    <div className="text-muted-foreground">Strikers</div>
                  </div>
                </div>
                <div className="mt-3 text-center text-sm text-muted-foreground">
                  Total: {result.counts.total} / Expected: {result.counts.expected} | Pool: {result.counts.pool} players
                </div>
              </div>
            )}
          </div>

          {/* Player Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {result.xi.orderedXI.map((player, index) => (
              <div key={player.id} className="group card p-4 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Player Number and Position */}
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <span className={`badge text-xs sm:text-sm ${getPositionColor(player.primary_position)}`}>
                    {player.primary_position}
                  </span>
                </div>

                {/* Player Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg sm:text-xl text-foreground truncate">{player.full_name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Composite Score:</span>
                      <span className="font-semibold text-foreground">
                        {player.composite.toFixed(3)}
                      </span>
                    </div>
                    {player.speed !== undefined && (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="font-semibold text-foreground">{player.speed}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Performance</span>
                    <span>{Math.round(player.composite * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(player.composite * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <h3 className="font-medium text-blue-900">How it works</h3>
            <p className="text-sm text-blue-800">
              Select your team and desired formation, then generate the Best XI. The system analyzes player performance data 
              and composite scores to create the optimal lineup. You can export the results as a PDF for sharing or printing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}