"use client";
import { useState } from "react";

export default function GamesClient({ teams, team, month, games }: { teams: Array<{ code: string; name: string }>; team: string; month: string; games: any[] }) {
  const [filters, setFilters] = useState({ team, month })
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end gap-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Month</label>
          <input type="month" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))} className="h-10 border rounded px-3" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Team</label>
          <select value={filters.team} onChange={e => setFilters(f => ({ ...f, team: e.target.value }))} className="h-10 border rounded px-3">
            <option value="all">All</option>
            {teams.map(t => (
              <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
            ))}
          </select>
        </div>
        <button onClick={() => {
          const q = new URLSearchParams()
          if (filters.month) q.set('month', filters.month)
          if (filters.team) q.set('team', filters.team)
          window.location.href = `/games?${q.toString()}`
        }} className="h-10 px-3 border rounded bg-white">Load</button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Games</h1>
        <CreateGameButton teams={teams} />
      </div>

      {games.length === 0 ? (
        <div className="text-sm text-muted-foreground">No games scheduled for this selection.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g: any) => (
            <GameCard key={g.id} game={g} teams={teams} />
          ))}
        </div>
      )}
    </div>
  )
}

function CreateGameButton({ teams }: { teams: Array<{ code: string; name: string }> }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="h-10 px-3 border rounded bg-primary text-primary-foreground">Create Game</button>
      {open && <GameDialog teams={teams} onClose={() => setOpen(false)} />}
    </>
  )
}

function GameCard({ game, teams }: { game: any; teams: Array<{ code: string; name: string }> }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="border rounded p-4 space-y-2">
      <div className="text-sm text-muted-foreground">{new Date(game.kickoff_at).toLocaleDateString('en-US')} {new Date(game.kickoff_at).toLocaleTimeString('en-US')}</div>
      <div className="font-semibold">{game.home_team?.code} vs {game.away_team?.code}</div>
      {game.location && <div className="text-sm">{game.location}</div>}
      {game.notes && <div className="text-xs text-muted-foreground">{game.notes}</div>}
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="h-9 px-3 border rounded">Edit</button>
        <DeleteGameButton id={game.id} />
      </div>
      {editing && <GameDialog initial={game} teams={teams} onClose={() => setEditing(false)} />}
    </div>
  )
}

function DeleteGameButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      onClick={async () => {
        setLoading(true)
        await fetch(`/api/games?id=${id}`, { method: 'DELETE' })
        setLoading(false)
        window.location.reload()
      }}
      disabled={loading}
      className="h-9 px-3 border rounded"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}

function GameDialog({ initial, teams, onClose }: { initial?: any; teams: Array<{ code: string; name: string }>; onClose: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id as string | undefined,
    home_team: initial?.home_team?.code ?? teams[0]?.code ?? '1s',
    away_team: initial?.away_team?.code ?? teams[1]?.code ?? '2s',
    kickoff_at: initial?.kickoff_at?.slice(0,16) ?? new Date().toISOString().slice(0,16),
    location: initial?.location ?? '',
    notes: initial?.notes ?? ''
  })
  const [saving, setSaving] = useState(false)
  const [locationType, setLocationType] = useState<'home' | 'away'>('home')
  const [opponentType, setOpponentType] = useState<'team' | 'external'>('team')
  const [customOpponent, setCustomOpponent] = useState('')
  function formatLocalForInput(value: string): string {
    // Accepts ISO (with Z) or local 'YYYY-MM-DDTHH:mm', returns local 'YYYY-MM-DDTHH:mm'
    if (!value) return ''
    // If value has 'Z' treat as UTC and convert to local components
    const hasZ = /z$/i.test(value)
    const date = hasZ ? new Date(value) : new Date(value.replace(' ', 'T'))
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  const [kickoffLocal, setKickoffLocal] = useState(
    initial?.kickoff_at ? formatLocalForInput(initial.kickoff_at) : formatLocalForInput(new Date().toISOString())
  )
  const isEdit = !!form.id
  async function save() {
    setSaving(true)
    // Convert local 'YYYY-MM-DDTHH:mm' to ISO UTC to preserve intended wall time
    const [d, t] = kickoffLocal.split('T')
    const [y, m, day] = d.split('-').map(Number)
    const [hh, mm] = t.split(':').map(Number)
    const utcIso = new Date(y, (m as number) - 1, day as number, hh as number, mm as number).toISOString()
    const appendedNotes = opponentType === 'external' && customOpponent.trim().length > 0
      ? `${form.notes ? form.notes + ' ' : ''}(Opponent: ${customOpponent.trim()})`
      : form.notes
    const finalForm = {
      ...form,
      kickoff_at: utcIso,
      location: locationType === 'home' ? 'Home' : 'Away',
      // Keep away_team as internal code to satisfy API; store external opponent in notes
      away_team: form.away_team,
      notes: appendedNotes,
    }
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalForm)
    })
    setSaving(false)
    if (res.ok) {
      onClose()
      window.location.reload()
    }
  }
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded p-4 w-full max-w-md space-y-3">
        <h3 className="font-semibold text-black">{isEdit ? 'Edit Game' : 'Create Game'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-black">Home Team</label>
            <select value={form.home_team} onChange={e => setForm(f => ({ ...f, home_team: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
              {teams.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs mb-1 text-black">Opponent</label>
            <div className="flex gap-2 mb-2">
              <button 
                type="button"
                onClick={() => setOpponentType('team')} 
                className={`px-3 py-1 text-xs rounded ${opponentType === 'team' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
              >
                Team
              </button>
              <button 
                type="button"
                onClick={() => setOpponentType('external')} 
                className={`px-3 py-1 text-xs rounded ${opponentType === 'external' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
              >
                External
              </button>
            </div>
            {opponentType === 'team' ? (
              <select value={form.away_team} onChange={e => setForm(f => ({ ...f, away_team: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
                {teams.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
              </select>
            ) : (
              <input 
                value={customOpponent} 
                onChange={e => setCustomOpponent(e.target.value)} 
                placeholder="Opponent team name" 
                className="h-10 border rounded px-3 w-full text-black bg-white" 
              />
            )}
          </div>

          <div>
            <label className="block text-xs mb-1 text-black">Kickoff (local)</label>
            <input
              type="datetime-local"
              value={kickoffLocal}
              onChange={e => setKickoffLocal(e.target.value)}
              className="h-10 border rounded px-3 w-full text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-black">Location</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setLocationType('home')} 
                className={`px-3 py-1 text-xs rounded ${locationType === 'home' ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
              >
                Home
              </button>
              <button 
                type="button"
                onClick={() => setLocationType('away')} 
                className={`px-3 py-1 text-xs rounded ${locationType === 'away' ? 'bg-red-500 text-white' : 'bg-gray-200 text-black'}`}
              >
                Away
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs mb-1 text-black">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="border rounded px-3 w-full h-20 text-black bg-white" />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="h-9 px-3 border rounded text-black bg-white">Cancel</button>
          <button onClick={save} disabled={saving} className="h-9 px-3 border rounded bg-primary text-primary-foreground">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}


