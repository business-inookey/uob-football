"use client";
import { useState, useCallback, useEffect } from "react";

export default function VideoClient({ teams, team, videoAssets }: { teams: Array<{ code: string; name: string }>; team: string; videoAssets: any[] }) {
  const [filters, setFilters] = useState({ team: team === 'all' ? teams[0]?.code || '' : team })
  
  console.log('VideoClient - Received props:', { teams: teams.length, team, videoAssetsCount: videoAssets.length, videoAssets });
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end gap-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Team</label>
          <select value={filters.team} onChange={e => setFilters(f => ({ ...f, team: e.target.value }))} className="h-10 border rounded px-3">
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

// Thumbnail helpers
function getVideoThumbnail(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl)
    console.log('Checking thumbnail for URL:', videoUrl)
    // YouTube
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const id = extractYouTubeId(videoUrl)
      if (id) {
        const thumbUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
        console.log('YouTube thumbnail URL:', thumbUrl)
        return thumbUrl
      }
    }
    // Vimeo
    if (url.hostname.includes('vimeo.com')) {
      const id = extractVimeoId(videoUrl)
      if (id) {
        const thumbUrl = `https://vumbnail.com/${id}.jpg`
        console.log('Vimeo thumbnail URL:', thumbUrl)
        return thumbUrl
      }
    }
    // Veo or other video files - return special marker for client-side generation
    if (url.hostname.includes('veo') || url.pathname.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      console.log('Veo/Video file detected, will generate thumbnail client-side')
      return 'GENERATE_THUMBNAIL'
    }
    console.log('No thumbnail available for URL:', videoUrl)
    return null
  } catch {
    console.log('Error parsing URL:', videoUrl)
    return null
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
    /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// Video thumbnail generator for Veo and other video files
function VideoThumbnailGenerator({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const generateThumbnail = useCallback(async () => {
    setLoading(true)
    setError(false)
    
    try {
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.src = videoUrl
      video.currentTime = 1 // Capture frame at 1 second
      
      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', resolve)
        video.addEventListener('error', reject)
        video.load()
      })
      
      await new Promise((resolve, reject) => {
        video.addEventListener('seeked', resolve)
        video.addEventListener('error', reject)
      })
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setThumbnailUrl(dataUrl)
        console.log('Generated thumbnail for Veo video:', title)
      }
    } catch (err) {
      console.log('Failed to generate thumbnail for:', title, err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [videoUrl, title])

  useEffect(() => {
    generateThumbnail()
  }, [generateThumbnail])

  if (loading) {
    return (
      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
        <div className="text-gray-500 text-sm">Generating thumbnail...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
        <div className="text-gray-500 text-sm">Veo video - thumbnail unavailable</div>
      </div>
    )
  }

  if (thumbnailUrl) {
    return (
      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return null
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
  const thumb = getVideoThumbnail(asset.url)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  console.log('VideoCard for:', asset.title, 'Thumbnail:', thumb)
  
  return (
    <div className="border rounded p-4 space-y-2">
      {thumb === 'GENERATE_THUMBNAIL' ? (
        <VideoThumbnailGenerator videoUrl={asset.url} title={asset.title} />
      ) : thumb && !imageError ? (
        <div className="aspect-video bg-gray-100 rounded overflow-hidden">
          <img
            src={thumb}
            alt={asset.title}
            className="w-full h-full object-cover"
            onLoad={() => {
              setImageLoaded(true)
              console.log('Thumbnail loaded successfully for:', asset.title)
            }}
            onError={(e) => {
              setImageError(true)
              console.log('Thumbnail failed to load for:', asset.title, 'URL:', thumb)
            }}
          />
        </div>
      ) : thumb && imageError ? (
        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
          <div className="text-gray-500 text-sm">Thumbnail failed to load</div>
        </div>
      ) : (
        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
          <div className="text-gray-500 text-sm">No thumbnail available</div>
        </div>
      )}
      <div className="text-sm text-muted-foreground">{new Date(asset.created_at).toLocaleDateString('en-US')}</div>
      <div className="font-semibold">{asset.title}</div>
      <div className="text-sm text-blue-600 hover:text-blue-800">
        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="truncate block">
          {asset.url}
        </a>
      </div>
      <div className="text-xs text-muted-foreground">Provider: {asset.provider}</div>
      {asset.team && <div className="text-xs text-muted-foreground">Team: {asset.team.code}</div>}
      {thumb && (
        <div className="text-xs text-green-600">
          {imageLoaded ? '✓ Thumbnail loaded' : imageError ? '✗ Thumbnail failed' : '⏳ Loading...'}
        </div>
      )}
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
    team2: '' as string,
    title: initial?.title ?? '',
    url: initial?.url ?? '',
    provider: initial?.provider ?? 'veo3',
    meta: initial?.meta ?? {}
  })
  const [saving, setSaving] = useState(false)
  const [showTeam2, setShowTeam2] = useState(false)
  const isEdit = !!form.id

  async function save() {
    setSaving(true)
    // sanitize
    const title = (form.title || '').trim()
    let url = (form.url || '').trim()
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }
    const payload: any = { ...form, title, url }
    if (!payload.team2) {
      delete payload.team2
    }
    const res = await fetch('/api/video-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    setSaving(false)
    if (res.ok) {
      onClose()
      // Redirect to ensure the correct team filter shows the newly created asset
      window.location.href = `/video?team=${encodeURIComponent(form.team)}`
    } else {
      const msg = await res.text().catch(() => 'Bad Request')
      console.error('Failed to save video asset:', msg)
      alert(`Failed to save video: ${msg}`)
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-black">Add second team (between teams)</label>
              <button
                type="button"
                onClick={() => setShowTeam2(v => !v)}
                className={`text-xs px-2 py-1 rounded ${showTeam2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
              >
                {showTeam2 ? 'On' : 'Off'}
              </button>
            </div>
            {showTeam2 && (
              <select value={form.team2} onChange={e => setForm(f => ({ ...f, team2: e.target.value }))} className="h-10 border rounded px-3 w-full text-black bg-white">
                <option value="">Select team…</option>
                {teams
                  .filter(t => t.code !== form.team)
                  .map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
              </select>
            )}
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
