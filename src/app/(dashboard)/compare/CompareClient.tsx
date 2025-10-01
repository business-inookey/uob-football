"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Radar from "@/components/charts/Radar";
import Bars from "@/components/charts/Bars";
import NeonCheckbox from "@/components/ui/NeonCheckbox";

interface Team {
  code: string;
  name: string;
}

interface Player {
  id: string;
  full_name: string;
  primary_position: string;
  current_team: string;
}

interface CompareClientProps {
  teams: Team[];
  initialTeam: string;
  initialSelectedIds: string[];
}

export default function CompareClient({ teams, initialTeam, initialSelectedIds }: CompareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds.slice(0, 5));
  const [composite, setComposite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [compositeLoading, setCompositeLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch players when team changes
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedTeam) params.set('team', selectedTeam);
        
        const response = await fetch(`/api/players?${params.toString()}`);
        const data = await response.json();
        setPlayers(data || []);
        
        // Clear selected players when team changes
        setSelectedIds([]);
        setComposite(null);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedTeam]);

  // Fetch composite data when selected players change
  useEffect(() => {
    const fetchComposite = async () => {
      if (selectedIds.length < 2) {
        setComposite(null);
        return;
      }

      setCompositeLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('team', selectedTeam);
        params.set('ids', selectedIds.join(','));
        
        const response = await fetch(`/api/composite?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setComposite(data);
        } else {
          setComposite(null);
        }
      } catch (error) {
        console.error('Error fetching composite data:', error);
        setComposite(null);
      } finally {
        setCompositeLoading(false);
      }
    };

    fetchComposite();
  }, [selectedIds, selectedTeam]);

  const handleTeamChange = async (newTeam: string) => {
    setSelectedTeam(newTeam);
    setIsUpdating(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newTeam && newTeam !== 'all') {
      params.set('team', newTeam);
    } else {
      params.delete('team');
    }
    params.delete('ids'); // Clear selected players when team changes
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/compare?${params.toString()}`, { scroll: false });
    setIsUpdating(false);
  };

  const onTogglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const newIds = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 5
        ? prev // cap at 5
        : [...prev, id];
      
      // Update URL with new selection
      const params = new URLSearchParams(searchParams.toString());
      if (selectedTeam && selectedTeam !== 'all') {
        params.set('team', selectedTeam);
      }
      if (newIds.length >= 2) {
        params.set('ids', newIds.join(','));
      } else {
        params.delete('ids');
      }
      
      const newUrl = `/compare?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
      
      return newIds;
    });
  };

  const selectedPlayers = players.filter(p => selectedIds.includes(p.id));

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'GK': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'DEF': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'MID': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'FWD': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[position] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTeamColor = (team: string) => {
    const colors: Record<string, string> = {
      '1s': 'bg-primary/10 text-primary',
      '2s': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      '3s': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      '4s': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[team] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Compare Players
        </h1>
        <p className="text-lg text-muted-foreground">
          Analyze and compare player performance metrics side by side
        </p>
      </div>

      {/* Filters and Selection */}
      <div className="card p-6 space-y-6">
        <div className="space-y-6">
          {/* Team Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Team</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedTeam}
                onChange={e => handleTeamChange(e.target.value)}
                disabled={isUpdating}
                className={`input w-full transition-opacity duration-200 ${
                  isUpdating ? 'opacity-50' : ''
                }`}
              >
                <option value="all">All Teams</option>
                {teams.map((t) => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
              {isUpdating && (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Player Selection */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-medium text-foreground">Players</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} / 5 selected
                </span>
                {selectedIds.length >= 2 && (
                  <span className="badge badge-success">Ready to compare</span>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="card p-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  <p className="text-muted-foreground">Loading players...</p>
                </div>
              </div>
            ) : (
              <div className="max-h-80 overflow-auto space-y-2">
                {players.map((p) => {
                  const checked = selectedIds.includes(p.id);
                  const disableNew = !checked && selectedIds.length >= 5;
                  return (
                    <div 
                      key={p.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        checked 
                          ? 'border-primary bg-primary/5' 
                          : disableNew 
                          ? 'border-border bg-muted/50 opacity-50' 
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <NeonCheckbox
                        checked={checked}
                        onChange={() => onTogglePlayer(p.id)}
                        disabled={disableNew}
                        className="flex-shrink-0"
                      />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {p.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{p.full_name}</div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <span className={`badge ${getPositionColor(p.primary_position)}`}>
                              {p.primary_position}
                            </span>
                            <span className={`badge ${getTeamColor(p.current_team)}`}>
                              {p.current_team}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-1">
              <h3 className="font-medium text-blue-900">How to compare</h3>
              <p className="text-sm text-blue-800">
                Select between 2 and 5 players to compare their performance metrics. 
                The comparison will show radar charts and bar graphs. Your selection is shareable via URL.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {compositeLoading ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading comparison data...</h3>
            <p className="text-muted-foreground">Please wait while we analyze the selected players.</p>
          </div>
        </div>
      ) : composite ? (
        <div className="space-y-6">
          {/* Selected Players Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Selected Players</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selectedPlayers.map((player) => (
                <div key={player.id} className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary">
                      {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm truncate">{player.full_name}</div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-1 mt-1">
                      <span className={`badge ${getPositionColor(player.primary_position)}`}>
                        {player.primary_position}
                      </span>
                      <span className={`badge ${getTeamColor(player.current_team)}`}>
                        {player.current_team}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-lg font-semibold text-foreground">Radar Chart</h2>
              </div>
              <div className="w-full h-64 sm:h-80">
                <Radar
                  labels={composite.statKeys}
                  series={composite.players.map((p: any, idx: number) => ({
                    name: p.full_name,
                    values: composite.statKeys.map((k: string) => composite.normalized[p.id]?.[k] ?? 0),
                    color: undefined,
                  }))}
                />
              </div>
            </div>
            
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-lg font-semibold text-foreground">Bar Chart</h2>
              </div>
              <div className="w-full h-64 sm:h-80">
                <Bars
                  labels={composite.statKeys}
                  series={composite.players.map((p: any) => ({
                    name: p.full_name,
                    values: composite.statKeys.map((k: string) => composite.normalized[p.id]?.[k] ?? 0),
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select players to compare</h3>
            <p className="text-muted-foreground">
              Choose between 2 and 5 players from the list above to see their performance comparison.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}