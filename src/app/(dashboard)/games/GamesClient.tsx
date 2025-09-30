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
      <div className="text-sm text-muted-foreground">{new Date(game.kickoff_at).toLocaleString()}</div>
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
  const isEdit = !!form.id
  async function save() {
    setSaving(true)
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1 text-black">Home</label>
            <select value={form.home_team} onChange={e => setForm(f => ({ ...f, home_team: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
              {teams.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1 text-black">Away</label>
            <select value={form.away_team} onChange={e => setForm(f => ({ ...f, away_team: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
              {teams.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1 text-black">Kickoff</label>
            <input type="datetime-local" value={form.kickoff_at} onChange={e => setForm(f => ({ ...f, kickoff_at: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1 text-black">Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white" />
          </div>
          <div className="col-span-2">
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


