"use client";
import { useState, useEffect, useCallback } from "react";

interface StatDefinition {
  key: string;
  label: string;
  min_value: number;
  max_value: number;
  higher_is_better: boolean;
}

interface Player {
  id: string;
  full_name: string;
  primary_position: string;
  current_team: string;
}

interface StatEntry {
  player_id: string;
  stat_key: string;
  value: number;
  team_code: string;
}

interface PlayerStatCardProps {
  player: Player;
  statDefinitions: StatDefinition[];
  teamCode: string;
}

export default function PlayerStatCard({ player, statDefinitions, teamCode }: PlayerStatCardProps) {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing stats for this player only when expanded first time
  useEffect(() => {
    if (!expanded || loaded) return;
    let ignore = false;
    async function loadStats() {
      try {
        const res = await fetch(`/api/stats?team=${teamCode}&player_id=${player.id}`);
        if (res.ok) {
          const data = await res.json();
          const statsMap: Record<string, number> = {};
          data.forEach((stat: any) => {
            statsMap[stat.stat_key] = stat.value;
          });
          if (!ignore) {
            setStats(statsMap);
            setLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    loadStats();
    return () => { ignore = true; };
  }, [expanded, loaded, player.id, teamCode]);

  // Auto-save function with debouncing
  const saveStats = useCallback(
    debounce(async (statKey: string, value: number) => {
      if (value < 0) return; // Don't save negative values
      
      setSaving(true);
      try {
        const entry: StatEntry = {
          player_id: player.id,
          stat_key: statKey,
          value: value,
          team_code: teamCode
        };

        const res = await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: [entry] })
        });

        if (res.ok) {
          setLastSaved(new Date());
        } else {
          console.error('Error saving stat:', await res.text());
        }
      } catch (error) {
        console.error('Error saving stat:', error);
      } finally {
        setSaving(false);
      }
    }, 1000),
    [player.id, teamCode]
  );

  const handleStatChange = (statKey: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStats(prev => ({ ...prev, [statKey]: numValue }));
    saveStats(statKey, numValue);
  };

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3 text-left">
          <h3 className="font-medium">{player.full_name}</h3>
          <span className="text-sm text-muted-foreground">{player.primary_position}</span>
          <span className="text-sm text-muted-foreground">({player.current_team})</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-blue-600">Saving...</span>}
          {lastSaved && !saving && (
            <span className="text-xs text-green-600">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
          <span className="text-sm text-muted-foreground">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statDefinitions.map((stat) => (
              <StatInput
                key={stat.key}
                stat={stat}
                value={stats[stat.key] || 0}
                onChange={(value) => handleStatChange(stat.key, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatInput({ 
  stat, 
  value, 
  onChange 
}: { 
  stat: StatDefinition; 
  value: number; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">
        {stat.label}
        {stat.higher_is_better ? (
          <span className="text-green-600 ml-1">↑</span>
        ) : (
          <span className="text-red-600 ml-1">↓</span>
        )}
      </label>
      <input
        type="number"
        step="0.1"
        min={stat.min_value}
        max={stat.max_value}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder={`${stat.min_value}-${stat.max_value}`}
      />
      <p className="text-xs text-muted-foreground">
        Range: {stat.min_value} - {stat.max_value}
      </p>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
