"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GamesClient({ teams, team, month, games }: { teams: Array<{ code: string; name: string }>; team: string; month: string; games: Game[][] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({ team, month });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFilterChange = async (newFilters: { team?: string; month?: string }) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setIsUpdating(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (updatedFilters.month) {
      params.set('month', updatedFilters.month);
    } else {
      params.delete('month');
    }
    if (updatedFilters.team && updatedFilters.team !== 'all') {
      params.set('team', updatedFilters.team);
    } else {
      params.delete('team');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/games?${params.toString()}`, { scroll: false });
    setIsUpdating(false);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Games
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage match schedules and game information
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Month and Game Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {formatMonth(month)}
              </h2>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-muted-foreground">
                  {games.length} {games.length === 1 ? 'game' : 'games'}
                </span>
              </div>
            </div>

            {(isUpdating) && (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary flex-shrink-0" />
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Month:</label>
              <input 
                type="month" 
                value={filters.month} 
                onChange={e => handleFilterChange({ month: e.target.value })} 
                disabled={isUpdating}
                className={`input w-full sm:w-auto transition-opacity duration-200 ${
                  isUpdating ? 'opacity-50' : ''
                }`}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Team:</label>
              <select 
                value={filters.team} 
                onChange={e => handleFilterChange({ team: e.target.value })}
                disabled={isUpdating}
                className={`input w-full sm:min-w-[180px] transition-opacity duration-200 ${
                  isUpdating ? 'opacity-50' : ''
                }`}
              >
                <option value="all">All Teams</option>
                {teams.map(t => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
        </div>
        <CreateGameButton teams={teams} />
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No games scheduled</h3>
            <p className="text-muted-foreground mb-4">
              No games are scheduled for {formatMonth(month)}.
            </p>
            <CreateGameButton teams={teams} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g: Game) => (
            <GameCard key={g.id} game={g} teams={teams} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateGameButton({ teams }: { teams: Array<{ code: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="w-full sm:w-auto"
        dataTitle="Create Game" 
        dataText="Creating..." 
        dataStart="Game Created!"
      >
        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="truncate">Create Game</span>
      </Button>
      {open && <GameDialog teams={teams} onClose={() => setOpen(false)} />}
    </>
  );
}

function GameCard({ game, teams }: { game: Game; teams: Array<{ code: string; name: string }> }) {
  const [editing, setEditing] = useState(false);
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
    <div className="group card p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Game Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
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
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            {game.home_teams?.code || 'Home'} vs {game.away_teams?.code || 'Away'}
          </h3>
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
        
        {game.notes && (
          <p className="text-sm text-muted-foreground">{game.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-border">
        <Button onClick={() => setEditing(true)} variant="outline" className="flex-1 min-w-0" dataTitle="Edit Game" dataText="Editing..." dataStart="Game Updated!">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="truncate">Edit</span>
        </Button>
        <DeleteGameButton id={game.id} />
      </div>
      
      {editing && <GameDialog initial={game} teams={teams} onClose={() => setEditing(false)} />}
    </div>
  );
}

function DeleteGameButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        if (!confirm('Are you sure you want to delete this game?')) return;
        setLoading(true);
        await fetch(`/api/games?id=${id}`, { method: 'DELETE' });
        setLoading(false);
        router.refresh();
      }}
      disabled={loading}
      variant="destructive"
      className="w-full sm:w-auto min-w-0"
      dataTitle="Delete Game"
      dataText="Deleting..."
      dataStart="Game Deleted!"
    >
      {loading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </Button>
  );
}

function GameDialog({ initial, teams, onClose }: { initial?: Game; teams: Array<{ code: string; name: string }>; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    id: initial?.id as string | undefined,
    home_team: initial?.home_teams?.code ?? teams[0]?.code ?? '1s',
    away_team: initial?.away_teams?.code ?? teams[1]?.code ?? '2s',
    kickoff_at: initial?.kickoff_at?.slice(0,16) ?? new Date().toISOString().slice(0,16),
    location: initial?.location ?? '',
    notes: initial?.notes ?? ''
  });
  const [saving, setSaving] = useState(false);
  const [locationType, setLocationType] = useState<'home' | 'away'>('home');
  const [opponentType, setOpponentType] = useState<'team' | 'external'>('team');
  const [customOpponent, setCustomOpponent] = useState('');
  
  function formatLocalForInput(value: string): string {
    if (!value) return '';
    const hasZ = /z$/i.test(value);
    const date = hasZ ? new Date(value) : new Date(value.replace(' ', 'T'));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  const [kickoffLocal, setKickoffLocal] = useState(
    initial?.kickoff_at ? formatLocalForInput(initial.kickoff_at) : formatLocalForInput(new Date().toISOString())
  );
  
  const isEdit = !!form.id;
  
  async function save() {
    setSaving(true);
    const [d, t] = kickoffLocal.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const [hh, mm] = t.split(':').map(Number);
    const utcIso = new Date(y, (m as number) - 1, day as number, hh as number, mm as number).toISOString();
    const appendedNotes = opponentType === 'external' && customOpponent.trim().length > 0
      ? `${form.notes ? form.notes + ' ' : ''}(Opponent: ${customOpponent.trim()})`
      : form.notes;
    const finalForm = {
      ...form,
      kickoff_at: utcIso,
      location: locationType === 'home' ? 'Home' : 'Away',
      away_team: form.away_team,
      notes: appendedNotes,
    };
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalForm)
    });
    setSaving(false);
    if (res.ok) {
      onClose();
      router.refresh();
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            {isEdit ? 'Edit Game' : 'Create Game'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Home Team</label>
            <select 
              value={form.home_team} 
              onChange={e => setForm(f => ({ ...f, home_team: e.target.value }))} 
              className="input w-full"
            >
              {teams.map(t => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Opponent</label>
            <div className="flex gap-2 mb-3">
              <Button 
                type="button"
                onClick={() => setOpponentType('team')} 
                variant={opponentType === 'team' ? 'default' : 'outline'}
                size="sm"
                dataTitle="Team Opponent"
                dataText="Selecting..."
                dataStart="Selected!"
              >
                Team
              </Button>
              <Button 
                type="button"
                onClick={() => setOpponentType('external')} 
                variant={opponentType === 'external' ? 'default' : 'outline'}
                size="sm"
                dataTitle="External Opponent"
                dataText="Selecting..."
                dataStart="Selected!"
              >
                External
              </Button>
            </div>
            {opponentType === 'team' ? (
              <select 
                value={form.away_team} 
                onChange={e => setForm(f => ({ ...f, away_team: e.target.value }))} 
                className="input w-full"
              >
                {teams.map(t => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
              </select>
            ) : (
              <input 
                value={customOpponent} 
                onChange={e => setCustomOpponent(e.target.value)} 
                placeholder="Opponent team name" 
                className="input w-full" 
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Kickoff Time</label>
            <input
              type="datetime-local"
              value={kickoffLocal}
              onChange={e => setKickoffLocal(e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={() => setLocationType('home')} 
                variant={locationType === 'home' ? 'default' : 'outline'}
                size="sm"
                dataTitle="Home Location"
                dataText="Selecting..."
                dataStart="Selected!"
              >
                Home
              </Button>
              <Button 
                type="button"
                onClick={() => setLocationType('away')} 
                variant={locationType === 'away' ? 'default' : 'outline'}
                size="sm"
                dataTitle="Away Location"
                dataText="Selecting..."
                dataStart="Selected!"
              >
                Away
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Notes</label>
            <textarea 
              value={form.notes} 
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
              className="input w-full h-20 resize-none" 
              placeholder="Additional notes about the game..."
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto" dataTitle="Cancel" dataText="Cancelling..." dataStart="Cancelled!">Cancel</Button>
          <Button onClick={save} disabled={saving} className="w-full sm:w-auto" dataTitle="Save Game" dataText="Saving..." dataStart="Game Saved!">
            {saving ? (
              <>
                <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
                Saving...
              </>
            ) : (
              'Save Game'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}