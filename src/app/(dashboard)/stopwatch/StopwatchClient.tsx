"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

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
    <div className="space-y-6">
      {/* Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Drill Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team">Team</Label>
              <Select value={selectedTeam} onValueChange={handleTeamChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.code} - {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="drill">Drill Name</Label>
              <Input
                id="drill"
                value={drillName}
                onChange={(e) => setDrillName(e.target.value)}
                placeholder="e.g., 100m Sprint"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the drill..."
            />
          </div>

          {selectedTeam && (
            <div>
              <Label>Select Players</Label>
              {loadingPlayers ? (
                <div className="mt-2 p-4 border rounded bg-muted/50">
                  <p className="text-sm text-muted-foreground">Loading players...</p>
                </div>
              ) : teamPlayers.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                    {teamPlayers.map(player => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => handlePlayerToggle(player.id)}
                          className="h-4 w-4 rounded border border-primary"
                        />
                        <Label htmlFor={player.id} className="text-sm">
                          {player.full_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedPlayers.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPlayers.length} player(s) selected
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-2 p-4 border rounded bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    No players found for this team. 
                    <br />
                    <span className="text-xs">
                      Add players through the Players section or run the sample_players.sql script in Supabase.
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={startSession} 
            disabled={!selectedTeam || selectedPlayers.length === 0 || !drillName.trim() || isRunning}
            className="w-full"
          >
            Start Drill Session
          </Button>
        </CardContent>
      </Card>

      {/* Stopwatch Section */}
      {sessionId && (
        <Card>
          <CardHeader>
            <CardTitle>Stopwatch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold mb-2">
                {formatTime(currentTime)}
              </div>
              
              {currentPlayer && (
                <div className="mb-4">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {currentPlayer.full_name}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Player {currentPlayerIndex + 1} of {selectedPlayers.length}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={recordLap}
                  disabled={!isRunning || currentPlayerIndex >= selectedPlayers.length}
                  variant="default"
                >
                  Record Lap
                </Button>
                <Button
                  onClick={resetStopwatch}
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {laps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lap Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {laps.map((lap, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{lap.playerName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Lap {lap.lapIndex}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {lap.lapTime}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
