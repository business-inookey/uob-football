"use client";

import { useState, useEffect } from 'react';
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
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Update URL when selections change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTeam) params.set('team', selectedTeam);
    if (selectedDate) params.set('date', selectedDate);
    
    const newUrl = `/attendance?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedTeam, selectedDate]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Daily Attendance</h1>
        <div className="ml-auto flex items-center gap-2">
          {teams.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 border rounded px-3"
              />
              <select 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="h-10 border rounded px-3"
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

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading players...
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players found for the selected team.
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
