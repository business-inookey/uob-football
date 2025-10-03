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
    <div className="card p-6 space-y-4">
      {/* Player Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg text-foreground">{player.full_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${getPositionColor(player.primary_position)}`}>
                {player.primary_position}
              </span>
              <span className={`badge ${getTeamColor(player.current_team)}`}>
                {player.current_team}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !saving && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <div className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Stats Input */}
      {expanded && (
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        {stat.label}
        {stat.higher_is_better ? (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        )}
      </label>
      <input
        type="number"
        step="0.1"
        min={stat.min_value}
        max={stat.max_value}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full"
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