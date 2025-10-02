"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VideoClient({ teams, team, videoAssets }: { teams: Array<{ code: string; name: string }>; team: string; videoAssets: VideoAsset[][] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTeam, setSelectedTeam] = useState(team === 'all' ? teams[0]?.code || '' : team);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTeamChange = async (newTeam: string) => {
    setSelectedTeam(newTeam);
    setIsUpdating(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newTeam) {
      params.set('team', newTeam);
    } else {
      params.delete('team');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    router.push(`/video?${params.toString()}`, { scroll: false });
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Video Assets
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage and organize team video content and analysis
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="card p-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Video Library</h2>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground">
                {videoAssets.length} {videoAssets.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Team:</label>
              <select 
                value={selectedTeam} 
                onChange={e => handleTeamChange(e.target.value)}
                disabled={isUpdating}
                className={`input w-full sm:min-w-[180px] transition-opacity duration-200 ${
                  isUpdating ? 'opacity-50' : ''
                }`}
              >
                {teams.map(t => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
              {isUpdating && (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted border-t-primary flex-shrink-0" />
              )}
            </div>
            
            <CreateVideoButton teams={teams} />
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">Advanced Video Analysis Coming Soon</h3>
            <p className="text-blue-800">
              We&apos;re working on powerful video analysis features including automated player tracking, 
              performance insights, and tactical analysis. Stay tuned for updates!
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Development in progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      {videoAssets.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              No video assets have been added for this team yet.
            </p>
            <CreateVideoButton teams={teams} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoAssets.map((asset: VideoAsset) => (
            <VideoCard key={asset.id} asset={asset} teams={teams} />
          ))}
        </div>
      )}
    </div>
  );
}

// Thumbnail helpers
function getVideoThumbnail(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    // YouTube
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const id = extractYouTubeId(videoUrl);
      if (id) {
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
    }
    // Vimeo
    if (url.hostname.includes('vimeo.com')) {
      const id = extractVimeoId(videoUrl);
      if (id) {
        return `https://vumbnail.com/${id}.jpg`;
      }
    }
    // Veo or other video files - return special marker for client-side generation
    if (url.hostname.includes('veo') || url.pathname.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      return 'GENERATE_THUMBNAIL';
    }
    return null;
  } catch {
    return null;
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
    /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Video thumbnail generator for Veo and other video files
function VideoThumbnailGenerator({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateThumbnail = useCallback(async () => {
    setLoading(true);
    setError(false);
    
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.currentTime = 1; // Capture frame at 1 second
      
      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', resolve);
        video.addEventListener('error', reject);
        video.load();
      });
      
      await new Promise((resolve, reject) => {
        video.addEventListener('seeked', resolve);
        video.addEventListener('error', reject);
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnailUrl(dataUrl);
      }
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [videoUrl]);

  useEffect(() => {
    generateThumbnail();
  }, [generateThumbnail]);

  if (loading) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-muted border-t-primary mx-auto mb-2" />
          <div className="text-muted-foreground text-sm">Generating thumbnail...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <div className="text-muted-foreground text-sm">Thumbnail unavailable</div>
        </div>
      </div>
    );
  }

  if (thumbnailUrl) {
    return (
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return null;
}

function CreateVideoButton({ teams }: { teams: Array<{ code: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="w-full sm:w-auto"
        dataTitle="Add Video" 
        dataText="Adding..." 
        dataStart="Video Added!"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Video
      </Button>
      {open && <VideoDialog teams={teams} onClose={() => setOpen(false)} />}
    </>
  );
}

function VideoCard({ asset, teams }: { asset: VideoAsset; teams: Array<{ code: string; name: string }> }) {
  const [editing, setEditing] = useState(false);
  const thumb = getVideoThumbnail(asset.url);
  const [imageError, setImageError] = useState(false);
  const [_imageLoaded, setImageLoaded] = useState(false);
  
  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      'veo3': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'veo2': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[provider] || colors['other'];
  };

  return (
    <div className="group card p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail */}
      {thumb === 'GENERATE_THUMBNAIL' ? (
        <VideoThumbnailGenerator videoUrl={asset.url} title={asset.title} />
      ) : thumb && !imageError ? (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={thumb}
            alt={asset.title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-muted-foreground text-sm">No thumbnail</div>
          </div>
        </div>
      )}

      {/* Video Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2">{asset.title}</h3>
          <span className={`badge ${getProviderColor(asset.provider)}`}>
            {asset.provider.toUpperCase()}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(asset.created_at).toLocaleDateString('en-US')}
          </div>
          
          {asset.teams && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Team {asset.teams.code}
            </div>
          )}
        </div>

        {/* URL Link */}
        <a 
          href={asset.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">View Video</span>
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-border">
        <Button onClick={() => setEditing(true)} variant="outline" className="flex-1 min-w-0" dataTitle="Edit Video" dataText="Editing..." dataStart="Video Updated!">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="truncate">Edit</span>
        </Button>
        <DeleteVideoButton id={asset.id} />
      </div>
      
      {editing && <VideoDialog initial={asset} teams={teams} onClose={() => setEditing(false)} />}
    </div>
  );
}

function DeleteVideoButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        setLoading(true);
        await fetch(`/api/video-assets?id=${id}`, { method: 'DELETE' });
        setLoading(false);
        router.refresh();
      }}
      disabled={loading}
      variant="destructive"
      className="w-full sm:w-auto min-w-0"
      dataTitle="Delete Video"
      dataText="Deleting..."
      dataStart="Video Deleted!"
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

function VideoDialog({ initial, teams, onClose }: { initial?: VideoAsset; teams: Array<{ code: string; name: string }>; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    id: initial?.id as string | undefined,
    team: initial?.teams?.code ?? teams[0]?.code ?? '1s',
    team2: '' as string,
    title: initial?.title ?? '',
    url: initial?.url ?? '',
    provider: initial?.provider ?? 'veo3',
    meta: initial?.meta ?? {}
  });
  const [saving, setSaving] = useState(false);
  const [showTeam2, setShowTeam2] = useState(false);
  const isEdit = !!form.id;

  async function save() {
    setSaving(true);
    const title = (form.title || '').trim();
    let url = (form.url || '').trim();
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const payload: VideoAsset = { ...form, title, url };
    if (!payload.team2) {
      delete payload.team2;
    }
    const res = await fetch('/api/video-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.ok) {
      onClose();
      router.push(`/video?team=${encodeURIComponent(form.team)}`);
    } else {
      const msg = await res.text().catch(() => 'Bad Request');
      console.error('Failed to save video asset:', msg);
      alert(`Failed to save video: ${msg}`);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            {isEdit ? 'Edit Video' : 'Add Video'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Team</label>
            <select 
              value={form.team} 
              onChange={e => setForm(f => ({ ...f, team: e.target.value }))} 
              className="input w-full"
            >
              {teams.map(t => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Add second team (between teams)</label>
              <Button
                type="button"
                onClick={() => setShowTeam2(v => !v)}
                variant={showTeam2 ? "default" : "outline"}
                size="sm"
                dataTitle={showTeam2 ? "Disable Second Team" : "Enable Second Team"}
                dataText="Updating..."
                dataStart="Updated!"
              >
                {showTeam2 ? 'On' : 'Off'}
              </Button>
            </div>
            {showTeam2 && (
              <select 
                value={form.team2} 
                onChange={e => setForm(f => ({ ...f, team2: e.target.value }))} 
                className="input w-full"
              >
                <option value="">Select team…</option>
                {teams
                  .filter(t => t.code !== form.team)
                  .map(t => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
              </select>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
            <input 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
              placeholder="Video title" 
              className="input w-full" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">URL</label>
            <input 
              value={form.url} 
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
              placeholder="https://..." 
              className="input w-full" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Provider</label>
            <select 
              value={form.provider} 
              onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} 
              className="input w-full"
            >
              <option value="veo3">Veo 3</option>
              <option value="veo2">Veo 2</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto" dataTitle="Cancel" dataText="Cancelling..." dataStart="Cancelled!">Cancel</Button>
          <Button onClick={save} disabled={saving} className="w-full sm:w-auto" dataTitle="Save Video" dataText="Saving..." dataStart="Video Saved!">
            {saving ? (
              <>
                <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
                Saving...
              </>
            ) : (
              'Save Video'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}