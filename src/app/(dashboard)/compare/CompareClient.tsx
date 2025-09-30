"use client";

import { useState, useEffect } from 'react';
import Radar from "@/components/charts/Radar";
import Bars from "@/components/charts/Bars";

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
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds.slice(0, 5));
  const [composite, setComposite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [compositeLoading, setCompositeLoading] = useState(false);

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

  // Update URL when selections change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTeam) params.set('team', selectedTeam);
    if (selectedIds.length >= 2) params.set('ids', selectedIds.join(','));
    
    const newUrl = `/compare?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedTeam, selectedIds]);

  const onTogglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 5) {
        return prev; // cap at 5
      }
      return [...prev, id];
    });
  };

  const selectedPlayers = players.filter(p => selectedIds.includes(p.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Compare Players</h1>
        <div className="ml-auto" />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="h-10 border rounded px-3 w-full"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-[2]">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Players (min 2, max 5)</label>
            {loading ? (
              <div className="h-72 border rounded flex items-center justify-center text-muted-foreground">
                Loading players...
              </div>
            ) : (
              <div className="max-h-72 overflow-auto border rounded divide-y">
                {players.map((p) => {
                  const checked = selectedIds.includes(p.id);
                  const disableNew = !checked && selectedIds.length >= 5;
                  return (
                    <label key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        disabled={disableNew}
                        onChange={() => onTogglePlayer(p.id)}
                      />
                      <span className={disableNew ? "opacity-50" : ""}>{p.full_name}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">Selected {selectedIds.length} / 5</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Select between 2 and 5 players. Selection is shareable via URL.</div>
      </div>

      {compositeLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading comparison data...
        </div>
      ) : composite ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Radar</h2>
            <Radar
              labels={composite.statKeys}
              series={composite.players.map((p: any, idx: number) => ({
                name: p.full_name,
                values: composite.statKeys.map((k: string) => composite.normalized[p.id]?.[k] ?? 0),
                color: undefined,
              }))}
            />
          </div>
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Bars</h2>
            <Bars
              labels={composite.statKeys}
              series={composite.players.map((p: any) => ({
                name: p.full_name,
                values: composite.statKeys.map((k: string) => composite.normalized[p.id]?.[k] ?? 0),
              }))}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Pick players to compare.</div>
      )}
    </div>
  );
}
