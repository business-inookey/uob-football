"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  full_name: string;
  primary_position: string;
  current_team: string;
}

interface AttendanceEntry {
  player_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recorded_by?: string;
  players?: {
    full_name: string;
    primary_position: string;
    current_team: string;
  };
}

interface AttendanceGridProps {
  players: Player[];
  teamCode: string;
  date: string;
}

const statusOptions = [
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'excused', label: 'Excused', color: 'bg-blue-100 text-blue-800 border-blue-200' }
];

export default function AttendanceGrid({ players, teamCode, date }: AttendanceGridProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing attendance
  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch(`/api/attendance?team=${teamCode}&date=${date}`);
        if (res.ok) {
          const data = await res.json();
          const attendanceMap: Record<string, AttendanceEntry> = {};
          data.forEach((entry: AttendanceEntry) => {
            attendanceMap[entry.player_id] = entry;
          });
          setAttendance(attendanceMap);
        }
      } catch (error) {
        console.error('Error loading attendance:', error);
      }
    }
    loadAttendance();
  }, [teamCode, date]);

  // Auto-save function with debouncing
  const saveAttendance = useCallback(
    debounce(async (playerId: string, status: string, notes?: string) => {
      setSaving(true);
      try {
        const entry = {
          player_id: playerId,
          team_code: teamCode,
          date: date,
          status: status as 'present' | 'absent' | 'late' | 'excused',
          notes: notes
        };

        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: [entry] })
        });

        if (res.ok) {
          setLastSaved(new Date());
        } else {
          console.error('Error saving attendance:', await res.text());
        }
      } catch (error) {
        console.error('Error saving attendance:', error);
      } finally {
        setSaving(false);
      }
    }, 1000),
    [teamCode, date]
  );

  const handleStatusChange = (playerId: string, status: string) => {
    const currentEntry = attendance[playerId];
    setAttendance(prev => ({
      ...prev,
      [playerId]: {
        ...currentEntry,
        player_id: playerId,
        status: status as 'present' | 'absent' | 'late' | 'excused'
      }
    }));
    saveAttendance(playerId, status, currentEntry?.notes);
  };

  const handleNotesChange = (playerId: string, notes: string) => {
    const currentEntry = attendance[playerId];
    setAttendance(prev => ({
      ...prev,
      [playerId]: {
        ...currentEntry,
        player_id: playerId,
        status: currentEntry?.status || 'present',
        notes: notes
      }
    }));
    saveAttendance(playerId, currentEntry?.status || 'present', notes);
  };

  const markAllPresent = () => {
    players.forEach(player => {
      handleStatusChange(player.id, 'present');
    });
  };

  const _getStatusColor = (status: string) => {
    return statusOptions.find(opt => opt.value === status)?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {saving && <span className="text-sm text-blue-600">Saving...</span>}
          {lastSaved && !saving && (
            <span className="text-sm text-green-600">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          onClick={markAllPresent}
          variant="outline"
          className="w-full sm:w-auto bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          dataTitle="Mark All Present"
          dataText="Marking..."
          dataStart="All Marked Present!"
        >
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate">Mark All Present</span>
        </Button>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const currentStatus = attendance[player.id]?.status || 'present';
          const currentNotes = attendance[player.id]?.notes || '';

          return (
            <div key={player.id} className="card p-4 space-y-4">
              {/* Player Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{player.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {player.primary_position} • {player.current_team}
                  </p>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status:</label>
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleStatusChange(player.id, option.value)}
                      variant="outline"
                      size="sm"
                      className={`w-full sm:w-auto text-xs ${
                        currentStatus === option.value
                          ? option.color
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      dataTitle={option.label}
                      dataText="Updating..."
                      dataStart="Updated!"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes:</label>
                <input
                  type="text"
                  value={currentNotes}
                  onChange={(e) => handleNotesChange(player.id, e.target.value)}
                  placeholder="Optional notes..."
                  className="input w-full"
                />
              </div>
            </div>
          );
        })}
      </div>
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
