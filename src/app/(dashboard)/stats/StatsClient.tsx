"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerStatCard from "@/components/StatsEntry";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Player {
  id: string;
  full_name: string;
  primary_position: string;
  current_team: string;
}

interface StatDefinition {
  key: string;
  label: string;
  min_value: number;
  max_value: number;
  higher_is_better: boolean;
}

interface Team {
  code: string;
  name: string;
}

interface StatsClientProps {
  teams: Team[];
  players: Player[];
  statDefinitions: StatDefinition[];
  selectedTeam: string;
}

export default function StatsClient({ teams, players, statDefinitions, selectedTeam }: StatsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [teamFilter, setTeamFilter] = useState(selectedTeam);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (newTeam: string) => {
    setTeamFilter(newTeam);
    setIsLoading(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newTeam && newTeam !== 'all') {
      params.set('team', newTeam);
    } else {
      params.delete('team');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/stats?${params.toString()}`, { scroll: false });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Player Statistics
        </h1>
        <p className="text-lg text-muted-foreground">
          Track and manage player performance metrics
        </p>
      </div>

      {/* Filters and Info */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground">
                {players.length} {players.length === 1 ? 'player' : 'players'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground">
                {statDefinitions.length} {statDefinitions.length === 1 ? 'metric' : 'metrics'}
              </span>
            </div>
          </div>

          {teams.length > 0 && (
            <div className="flex items-center gap-2">
              <select 
                value={teamFilter} 
                onChange={e => handleFilterChange(e.target.value)} 
                disabled={isLoading}
                className={`input min-w-[180px] transition-opacity duration-200 ${
                  isLoading ? 'opacity-50' : ''
                }`}
              >
                <option value="all">All Teams</option>
                {teams.map(t => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
              {isLoading && (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <h3 className="font-medium text-blue-900">How to use</h3>
            <p className="text-sm text-blue-800">
              Click on any player card below to expand and enter their statistics. 
              All changes are automatically saved as you type. Use the team filter to focus on specific teams.
            </p>
          </div>
        </div>
      </div>

      {/* Players Stats */}
      {players.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {teamFilter === 'all' 
                ? 'No players have been added to the system yet.'
                : `No players found for the selected team.`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {players.map((player: any) => (
            <PlayerStatCard 
              key={player.id} 
              player={player} 
              statDefinitions={statDefinitions}
              teamCode={teamFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}
