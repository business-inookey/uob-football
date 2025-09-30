"use client";
import { useState } from "react";

export default function VideoClient({ teams, team, videoAssets }: { teams: Array<{ code: string; name: string }>; team: string; videoAssets: any[] }) {
  const [filters, setFilters] = useState({ team })
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end gap-2">
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
          if (filters.team) q.set('team', filters.team)
          window.location.href = `/video?${q.toString()}`
        }} className="h-10 px-3 border rounded bg-white">Load</button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Video Assets</h1>
        <CreateVideoButton teams={teams} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-blue-800 font-medium">Analysis coming soon</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">Video analysis features will be available in a future update.</p>
      </div>

      {videoAssets.length === 0 ? (
        <div className="text-sm text-muted-foreground">No video assets found for this team.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoAssets.map((asset: any) => (
            <VideoCard key={asset.id} asset={asset} teams={teams} />
          ))}
        </div>
      )}
    </div>
  )
}

function CreateVideoButton({ teams }: { teams: Array<{ code: string; name: string }> }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="h-10 px-3 border rounded bg-primary text-primary-foreground">Add Video</button>
      {open && <VideoDialog teams={teams} onClose={() => setOpen(false)} />}
    </>
  )
}

function VideoCard({ asset, teams }: { asset: any; teams: Array<{ code: string; name: string }> }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="border rounded p-4 space-y-2">
      <div className="text-sm text-muted-foreground">{new Date(asset.created_at).toLocaleDateString('en-US')}</div>
      <div className="font-semibold">{asset.title}</div>
      <div className="text-sm text-blue-600 hover:text-blue-800">
        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="truncate block">
          {asset.url}
        </a>
      </div>
      <div className="text-xs text-muted-foreground">Provider: {asset.provider}</div>
      {asset.team && <div className="text-xs text-muted-foreground">Team: {asset.team.code}</div>}
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="h-9 px-3 border rounded">Edit</button>
        <DeleteVideoButton id={asset.id} />
      </div>
      {editing && <VideoDialog initial={asset} teams={teams} onClose={() => setEditing(false)} />}
    </div>
  )
}

function DeleteVideoButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      onClick={async () => {
        setLoading(true)
        await fetch(`/api/video-assets?id=${id}`, { method: 'DELETE' })
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

function VideoDialog({ initial, teams, onClose }: { initial?: any; teams: Array<{ code: string; name: string }>; onClose: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id as string | undefined,
    team: initial?.team?.code ?? teams[0]?.code ?? '1s',
    title: initial?.title ?? '',
    url: initial?.url ?? '',
    provider: initial?.provider ?? 'veo3',
    meta: initial?.meta ?? {}
  })
  const [saving, setSaving] = useState(false)
  const isEdit = !!form.id

  async function save() {
    setSaving(true)
    const res = await fetch('/api/video-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    if (res.ok) {
      onClose()
      // Redirect to ensure the correct team filter shows the newly created asset
      window.location.href = `/video?team=${encodeURIComponent(form.team)}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded p-4 w-full max-w-md space-y-3">
        <h3 className="font-semibold text-black">{isEdit ? 'Edit Video' : 'Add Video'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-black">Team</label>
            <select value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
              {teams.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs mb-1 text-black">Title</label>
            <input 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
              placeholder="Video title" 
              className="h-10 border rounded px-3 w-full text-black bg-white" 
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-black">URL</label>
            <input 
              value={form.url} 
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
              placeholder="https://..." 
              className="h-10 border rounded px-3 w-full text-black bg-white" 
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-black">Provider</label>
            <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
              <option value="veo3">Veo 3</option>
              <option value="veo2">Veo 2</option>
              <option value="other">Other</option>
            </select>
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
