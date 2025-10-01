"use client";

import { useState, useEffect, useCallback } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Player Notes
        </h1>
        <p className="text-lg text-muted-foreground">
          Add and manage notes for players by team
        </p>
      </div>

      {/* Team and Player Selection */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">Select Player</h2>
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
            <label className="text-sm font-medium text-foreground mb-2 block">Player</label>
            <select 
              value={selectedPlayer} 
              onChange={(e) => handlePlayerChange(e.target.value)}
              disabled={!selectedTeam}
              className="input w-full"
            >
              <option value="">Select player</option>
              {teamPlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPlayerData && (
          <div className="card p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {selectedPlayerData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedPlayerData.full_name}</p>
                <p className="text-sm text-muted-foreground">Team {selectedPlayerData.current_team}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Note */}
      {selectedPlayer && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="text-xl font-semibold text-foreground">Add Note</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Note</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note about this player..."
                rows={4}
                maxLength={1000}
                className="input w-full resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {newNote.length}/1000 characters
                </p>
                {newNote.length > 800 && (
                  <p className="text-xs text-amber-600">
                    {1000 - newNote.length} characters remaining
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || saving}
              className="w-full"
              dataTitle="Add Note"
              dataText="Adding..."
              dataStart="Note Added!"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {selectedPlayer && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-foreground">Notes</h2>
            {notes.length > 0 && (
              <span className="badge badge-primary">{notes.length}</span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 mx-auto mb-3 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
              <p className="text-muted-foreground">Start by adding a note for this player.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="group card p-6 space-y-4 hover:shadow-lg transition-all duration-300">
                  {editingNoteId === note.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        className="input w-full resize-none"
                      />
                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <Button 
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="w-full sm:w-auto"
                          dataTitle="Cancel Edit"
                          dataText="Cancelling..."
                          dataStart="Edit Cancelled!"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUpdateNote}
                          disabled={saving || !editingNoteText.trim()}
                          className="w-full sm:w-auto"
                          dataTitle="Save Changes"
                          dataText="Saving..."
                          dataStart="Changes Saved!"
                        >
                          {saving ? (
                            <>
                              <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">{note.note}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {note.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{note.profiles.full_name}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(note.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            disabled={saving}
                            className="w-full sm:w-auto"
                            dataTitle="Edit Note"
                            dataText="Opening..."
                            dataStart="Edit Mode!"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={saving}
                            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
                            dataTitle="Delete Note"
                            dataText="Deleting..."
                            dataStart="Note Deleted!"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <h3 className="font-medium text-blue-900">How to use notes</h3>
            <p className="text-sm text-blue-800">
              Select a team and player to view their notes. You can add new notes, edit existing ones, 
              or delete notes as needed. Notes are shared among all coaches and help track player 
              development and observations over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}