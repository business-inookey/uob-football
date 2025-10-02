"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  full_name: string;
  primary_position: string;
  current_team: string;
}

interface Team {
  code: string;
  name: string;
}

interface PlayersClientProps {
  teams: Team[];
  players: Player[];
  selectedTeam: string;
}

export default function PlayersClient({ teams, players, selectedTeam }: PlayersClientProps) {
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
    router.push(`/players?${params.toString()}`, { scroll: false });
    setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Players
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your team roster and player information
        </p>
      </div>

      {/* Actions and Filters */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Player Count */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">
              {players.length} {players.length === 1 ? 'player' : 'players'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto" 
              dataTitle="Import CSV" 
              dataText="Importing..." 
              dataStart="CSV Imported!"
              onClick={() => router.push('/players/import')}
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="truncate">Import CSV</span>
            </Button>
            
            <Button 
              className="w-full sm:w-auto" 
              dataTitle="Enter Stats" 
              dataText="Loading..." 
              dataStart="Stats Ready!"
              onClick={() => router.push('/stats')}
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="truncate">Enter Stats</span>
            </Button>

            {/* Team Filter */}
            {teams.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={teamFilter} 
                  onChange={e => handleFilterChange(e.target.value)} 
                  disabled={isLoading}
                  className={`input w-full sm:min-w-[180px] transition-opacity duration-200 ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
                  <option value="all">All Teams</option>
                  {teams.map(t => (
                    <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                  ))}
                </select>
                {isLoading && (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary flex-shrink-0" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {players.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No players found</h3>
            <p className="text-muted-foreground mb-4">
              {teamFilter === 'all' 
                ? 'No players have been added to the system yet.'
                : `No players found for the selected team.`
              }
            </p>
            <Button 
              dataTitle="Import Players" 
              dataText="Importing..." 
              dataStart="Players Imported!"
              onClick={() => router.push('/players/import')}
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="truncate">Import Players</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} getPositionColor={getPositionColor} getTeamColor={getTeamColor} router={router} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  player,
  getPositionColor,
  getTeamColor,
  router
}: {
  player: Player;
  getPositionColor: (pos: string) => string;
  getTeamColor: (team: string) => string;
  router: Player[];
}) {
  return (
    <div className="group card p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Player Avatar and Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-primary">
            {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{player.full_name}</h3>
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

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="flex-1 min-w-0" 
          dataTitle="View Attendance" 
          dataText="Loading..." 
          dataStart="Attendance Loaded!"
          onClick={() => router.push(`/players/${player.id}/attendance`)}
        >
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="truncate">Attendance</span>
          <svg className="w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
