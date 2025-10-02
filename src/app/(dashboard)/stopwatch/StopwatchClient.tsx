"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface Team {
  id: string;
  code: string;
  name: string;
}

interface Player {
  id: string;
  full_name: string;
  current_team: string;
}

interface LapRecord {
  playerId: string;
  playerName: string;
  lapIndex: number;
  lapMs: number;
  lapTime: string;
}

interface StopwatchClientProps {
  teams: Team[];
}

export default function StopwatchClient({ teams }: StopwatchClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [drillName, setDrillName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Players state - fetched dynamically
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fetch players for selected team
  const fetchPlayersForTeam = useCallback(async (teamId: string) => {
    if (!teamId) {
      setTeamPlayers([]);
      return;
    }

    setLoadingPlayers(true);
    try {
      const supabase = createClient();
      
      // Find the team code for the selected team ID
      const selectedTeamData = teams.find(t => t.id === teamId);
      if (!selectedTeamData) {
        console.error('Team not found:', teamId);
        setTeamPlayers([]);
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .select('id, full_name, current_team')
        .eq('current_team', selectedTeamData.code)
        .order('full_name');

      if (error) {
        console.error('Error fetching players:', error);
        setTeamPlayers([]);
      } else {
        setTeamPlayers(data || []);
        console.log(`Fetched ${data?.length || 0} players for team ${selectedTeamData.code}`);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setTeamPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  }, [teams]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Format time display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setSelectedPlayers([]); // Clear selected players when team changes
    fetchPlayersForTeam(teamId);
  };

  // Handle player selection
  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Start drill session
  const startSession = async () => {
    if (!selectedTeam || selectedPlayers.length === 0 || !drillName.trim()) {
      alert('Please select team, players, and enter drill name');
      return;
    }

    try {
      const response = await fetch('/api/drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
          team: selectedTeam,
          drillName: drillName.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSessionId(data.sessionId);
      setCurrentPlayerIndex(0);
      setLaps([]);
      setStartTime(Date.now());
      setCurrentTime(0);
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start drill session');
    }
  };

  // Record lap for current player
  const recordLap = async () => {
    if (!sessionId || currentPlayerIndex >= selectedPlayers.length) return;

    const currentPlayerId = selectedPlayers[currentPlayerIndex];
    const currentPlayer = teamPlayers.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return;

    const lapMs = currentTime;
    const lapIndex = laps.filter(l => l.playerId === currentPlayerId).length + 1;

    try {
      const response = await fetch('/api/drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_lap',
          sessionId,
          playerId: currentPlayerId,
          lapIndex,
          lapMs,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Add lap to local state
      const newLap: LapRecord = {
        playerId: currentPlayerId,
        playerName: currentPlayer.full_name,
        lapIndex,
        lapMs,
        lapTime: formatTime(lapMs),
      };

      setLaps(prev => [...prev, newLap]);

      // Move to next player or finish
      if (currentPlayerIndex + 1 < selectedPlayers.length) {
        setCurrentPlayerIndex(prev => prev + 1);
        setStartTime(Date.now());
        setCurrentTime(0);
      } else {
        // All players completed
        setIsRunning(false);
        alert('All players have completed their laps!');
      }
    } catch (error) {
      console.error('Failed to record lap:', error);
      alert('Failed to record lap');
    }
  };

  // Reset stopwatch
  const resetStopwatch = () => {
    setIsRunning(false);
    setStartTime(0);
    setCurrentTime(0);
    setCurrentPlayerIndex(0);
    setLaps([]);
    setSessionId(null);
  };

  const currentPlayer = teamPlayers.find(p => p.id === selectedPlayers[currentPlayerIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Stopwatch Drills
        </h1>
        <p className="text-lg text-muted-foreground">
          Time player laps and automatically update pace & stamina stats
        </p>
      </div>

      {/* Setup Section */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">Drill Setup</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Team</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => handleTeamChange(e.target.value)}
              className="input w-full"
            >
              <option value="">Select team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.code} - {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Drill Name</label>
            <input
              value={drillName}
              onChange={(e) => setDrillName(e.target.value)}
              placeholder="e.g., 100m Sprint"
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about the drill..."
            className="input w-full h-20 resize-none"
          />
        </div>

        {selectedTeam && (
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Select Players</label>
            {loadingPlayers ? (
              <div className="card p-6 bg-muted/50">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  <p className="text-muted-foreground">Loading players...</p>
                </div>
              </div>
            ) : teamPlayers.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {teamPlayers.map(player => (
                    <label 
                      key={player.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedPlayers.includes(player.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        onChange={() => handlePlayerToggle(player.id)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{player.full_name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedPlayers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-foreground">
                      {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-6 bg-muted/50">
                <div className="text-center">
                  <svg className="w-8 h-8 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-muted-foreground">
                    No players found for this team.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add players through the Players section or run the sample_players.sql script in Supabase.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={startSession} 
          disabled={!selectedTeam || selectedPlayers.length === 0 || !drillName.trim() || isRunning}
          className="w-full"
          dataTitle="Start Drill Session"
          dataText="Starting..."
          dataStart="Session Started!"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Drill Session
        </Button>
      </div>

      {/* Stopwatch Section */}
      {sessionId && (
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-foreground">Stopwatch</h2>
          </div>

          <div className="text-center space-y-6">
            {/* Timer Display */}
            <div className="space-y-2">
              <div className="text-6xl font-mono font-bold text-primary">
                {formatTime(currentTime)}
              </div>
              {isRunning && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Running</span>
                </div>
              )}
            </div>
            
            {/* Current Player */}
            {currentPlayer && (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {currentPlayer.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">{currentPlayer.full_name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Player {currentPlayerIndex + 1} of {selectedPlayers.length}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={recordLap}
                disabled={!isRunning || currentPlayerIndex >= selectedPlayers.length}
                className="w-full sm:w-auto"
                dataTitle="Record Lap"
                dataText="Recording..."
                dataStart="Lap Recorded!"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Record Lap
              </Button>
              <Button
                onClick={resetStopwatch}
                variant="outline"
                className="w-full sm:w-auto"
                dataTitle="Reset Stopwatch"
                dataText="Resetting..."
                dataStart="Reset Complete!"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {laps.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-semibold text-foreground">Lap Times</h2>
          </div>
          
          <div className="space-y-3">
            {laps.map((lap, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {lap.playerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{lap.playerName}</div>
                    <div className="text-sm text-muted-foreground">Lap {lap.lapIndex}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-lg text-primary">{lap.lapTime}</div>
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
            <h3 className="font-medium text-blue-900">How to use the stopwatch</h3>
            <p className="text-sm text-blue-800">
              1. Select a team and drill name, then choose the players to time.<br/>
              2. Click &quot;Start Drill Session&quot; to begin timing.<br/>
              3. Click &quot;Record Lap&quot; when each player completes their lap.<br/>
              4. The system will automatically move to the next player and update their stats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}