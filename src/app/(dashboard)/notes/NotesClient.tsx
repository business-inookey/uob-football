"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Note {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
  profiles: {
    full_name: string;
  };
}

interface NotesClientProps {
  teams: Team[];
  players: Player[];
}

export default function NotesClient({ teams, players }: NotesClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter players by selected team
  const teamPlayers = players.filter(p => {
    const selectedTeamData = teams.find(t => t.id === selectedTeam);
    return selectedTeamData && p.current_team === selectedTeamData.code;
  });

  // Fetch notes when player is selected
  const fetchNotes = useCallback(async (playerId: string, teamId: string) => {
    if (!playerId || !teamId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/player-notes?player_id=${playerId}&team_id=${teamId}`);
      const data = await response.json();
      
      if (response.ok) {
        setNotes(data.notes || []);
      } else {
        console.error('Error fetching notes:', data.error);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setSelectedPlayer('');
    setNotes([]);
    setNewNote('');
    setEditingNoteId(null);
  };

  // Handle player selection
  const handlePlayerChange = (playerId: string) => {
    setSelectedPlayer(playerId);
    setNewNote('');
    setEditingNoteId(null);
    
    if (playerId && selectedTeam) {
      fetchNotes(playerId, selectedTeam);
    }
  };

  // Add new note
  const handleAddNote = async () => {
    if (!selectedPlayer || !selectedTeam || !newNote.trim()) {
      alert('Please select a player and enter a note');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/player-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer,
          teamId: selectedTeam,
          note: newNote.trim(),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
        console.log('Note added successfully');
      } else {
        console.error('Error adding note:', data.error);
        alert('Failed to add note: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  // Start editing note
  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note);
  };

  // Update note
  const handleUpdateNote = async () => {
    if (!editingNoteId || !editingNoteText.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/player-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: editingNoteId,
          note: editingNoteText.trim(),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note.id === editingNoteId ? data.note : note
        ));
        setEditingNoteId(null);
        setEditingNoteText('');
        console.log('Note updated successfully');
      } else {
        console.error('Error updating note:', data.error);
        alert('Failed to update note: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/player-notes?id=${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        console.log('Note deleted successfully');
      } else {
        const data = await response.json();
        console.error('Error deleting note:', data.error);
        alert('Failed to delete note: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const selectedPlayerData = players.find(p => p.id === selectedPlayer);

  return (
    <div className="space-y-6">
      {/* Team and Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Player</CardTitle>
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
              <Label htmlFor="player">Player</Label>
              <Select 
                value={selectedPlayer} 
                onValueChange={handlePlayerChange}
                disabled={!selectedTeam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {teamPlayers.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPlayerData && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">
                Selected: {selectedPlayerData.full_name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Note */}
      {selectedPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Add Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note about this player..."
                rows={3}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newNote.length}/1000 characters
              </p>
            </div>
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || saving}
              className="w-full"
            >
              {saving ? 'Adding...' : 'Add Note'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {selectedPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-4">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No notes yet</p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 space-y-2">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          rows={3}
                          maxLength={1000}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleUpdateNote}
                            disabled={saving || !editingNoteText.trim()}
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-muted-foreground">
                            By {note.profiles.full_name} • {new Date(note.created_at).toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditNote(note)}
                              disabled={saving}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={saving}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
