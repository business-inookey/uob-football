"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AttendanceGrid from '@/components/AttendanceGrid';

interface Team {
  code: string;
  name: string;
}

interface AttendanceClientProps {
  teams: Team[];
  initialTeam: string;
  initialDate: string;
}

export default function AttendanceClient({ teams, initialTeam, initialDate }: AttendanceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch players when team or date changes
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedTeam) params.set('team', selectedTeam);
        if (selectedDate) params.set('date', selectedDate);
        
        const response = await fetch(`/api/players?${params.toString()}`);
        const data = await response.json();
        setPlayers(data || []);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedTeam, selectedDate]);

  const handleTeamChange = async (newTeam: string) => {
    setSelectedTeam(newTeam);
    setIsUpdating(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newTeam && newTeam !== 'all') {
      params.set('team', newTeam);
    } else {
      params.delete('team');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/attendance?${params.toString()}`, { scroll: false });
    setIsUpdating(false);
  };

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setIsUpdating(true);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/attendance?${params.toString()}`, { scroll: false });
    setIsUpdating(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Daily Attendance
        </h1>
        <p className="text-lg text-muted-foreground">
          Track player attendance for training sessions and matches
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Date and Player Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {formatDate(selectedDate)}
              </h2>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-muted-foreground">
                  {players.length} {players.length === 1 ? 'player' : 'players'}
                </span>
              </div>
            </div>

            {(loading || isUpdating) && (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary flex-shrink-0" />
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => handleDateChange(e.target.value)}
                disabled={isUpdating}
                className={`input w-full sm:w-auto transition-opacity duration-200 ${
                  isUpdating ? 'opacity-50' : ''
                }`}
              />
            </div>
            
            {teams.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">Team:</label>
                <select 
                  value={selectedTeam} 
                  onChange={e => handleTeamChange(e.target.value)}
                  disabled={isUpdating}
                  className={`input w-full sm:min-w-[180px] transition-opacity duration-200 ${
                    isUpdating ? 'opacity-50' : ''
                  }`}
                >
                  <option value="all">All Teams</option>
                  {teams.map((t) => (
                    <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
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
              Click on the status buttons to mark each player&apos;s attendance. You can also add notes for each player. 
              All changes are automatically saved. Use &quot;Mark All Present&quot; to quickly mark everyone as present.
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      {loading ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading players...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the player list.</p>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {selectedTeam === 'all' 
                ? 'No players have been added to the system yet.'
                : `No players found for the selected team.`
              }
            </p>
          </div>
        </div>
      ) : (
        <AttendanceGrid 
          players={players} 
          teamCode={selectedTeam} 
          date={selectedDate}
        />
      )}
    </div>
  );
}