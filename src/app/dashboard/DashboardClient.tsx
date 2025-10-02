"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardClient({ 
  profile, 
  teams, 
  allTeams, 
  selectedTeam, 
  games 
}: { 
  profile: any; 
  teams: any[]; 
  allTeams: Array<{ code: string; name: string }>; 
  selectedTeam: string; 
  games: any[] 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [teamFilter, setTeamFilter] = useState(selectedTeam);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (newTeam: string) => {
    setTeamFilter(newTeam);
    setIsLoading(true);
    
    // Use client-side navigation instead of full page reload
    const params = new URLSearchParams(searchParams.toString());
    if (newTeam && newTeam !== 'all') {
      params.set('team', newTeam);
    } else {
      params.delete('team');
    }
    
    // Smooth transition with loading state
    await new Promise(resolve => setTimeout(resolve, 150)); // Brief loading state
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
    setIsLoading(false);
  };

  // Get current week range for display
  const now = new Date();
  const currentDay = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekRange = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        {/* UOB Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
            <img 
              src="/UOB LOGO new.png" 
              alt="University of Birmingham Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome, {profile.full_name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your team data and view this week's games
          </p>
        </div>
      </div>

      {/* This Week's Games */}
      <div className="card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">This Week's Games</h2>
            <p className="text-muted-foreground">{weekRange}</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={teamFilter} 
              onChange={e => handleFilterChange(e.target.value)} 
              disabled={isLoading}
              className={`input min-w-[200px] transition-opacity duration-200 ${
                isLoading ? 'opacity-50' : ''
              }`}
            >
              <option value="all">All Teams</option>
              {allTeams.map(t => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
            {isLoading && (
              <LoadingSpinner size="sm" useCustom={true} />
            )}
          </div>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No games scheduled</h3>
            <p className="text-muted-foreground">No games are scheduled for this week.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game: any) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game }: { game: any }) {
  const kickoffDate = new Date(game.kickoff_at);
  const now = new Date();
  const isToday = kickoffDate.toDateString() === now.toDateString();
  const isTomorrow = kickoffDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  
  let dateLabel = kickoffDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  
  if (isToday) dateLabel = 'Today';
  if (isTomorrow) dateLabel = 'Tomorrow';

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isToday 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateLabel}
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {kickoffDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            
            {game.location && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                game.location === 'Home' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {game.location}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">
              {game.home_teams?.code || 'Home'} vs {game.away_teams?.code || 'Away'}
            </h3>
            {game.notes && (
              <p className="text-muted-foreground">{game.notes}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/games" 
            className="btn btn-outline group/btn"
          >
            <span>View Details</span>
            <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}