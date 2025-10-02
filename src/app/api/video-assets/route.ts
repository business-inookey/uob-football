import { createClient, createServiceClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse, requireAuth } from '@/lib/api-helpers'
import { VideoAsset, TeamQuery } from '@/lib/zod'

async function getVideoAssets(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')

  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  // Use service client to bypass RLS (lead coaches should see all videos)
  let query = serviceSupabase
    .from('video_assets')
    .select('id, title, url, provider, meta, created_at, team:team_id(code,name)')
    .order('created_at', { ascending: false }) as VideoAsset[]

  if (teamCode && teamCode !== 'all') {
    // Get team id from code
    const { data: team } = await serviceSupabase.from('teams').select('id').eq('code', teamCode).maybeSingle()
    if (team) {
      query = query.eq('team_id', team.id)
    }
  }

  const { data, error } = await query
  if (error) {
    handleSupabaseError(error, 'fetching video assets')
  }
  
  return createSuccessResponse(data ?? [])
}

async function postVideoAsset(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()
  const body = await request.json().catch(() => null)
  const parsed = VideoAsset.parse(body)

  // Get current user profile
  const user = await requireAuth(supabase)

  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) {
    handleSupabaseError(new Error('Profile not found'), 'fetching user profile')
  }

  // Resolve team code to id using service client
  const { data: team } = await serviceSupabase.from('teams').select('id').eq('code', parsed.team_id).single()
  if (!team) {
    handleSupabaseError(new Error('Invalid team code'), 'validating team code')
  }

  // Validate URL format
  try {
    new URL(parsed.url)
  } catch {
    handleSupabaseError(new Error('Invalid URL format'), 'validating video URL')
  }

  if (parsed.id) {
    // Update
    const { error } = await supabase
      .from('video_assets')
      .update({
        title: parsed.title,
        url: parsed.url,
        provider: parsed.provider || 'veo3',
        meta: parsed.meta || {},
      })
      .eq('id', parsed.id)
    if (error) {
      handleSupabaseError(error, 'updating video asset')
    }
    return createSuccessResponse({ ok: true, id: parsed.id })
  } else {
    // Insert
    const rows: VideoAsset[] = [
      {
        team_id: team.id,
        title: parsed.title,
        url: parsed.url,
        provider: parsed.provider || 'veo3',
        meta: parsed.meta || {},
        created_by: profile.id,
      },
    ]
    const { data, error } = await serviceSupabase
      .from('video_assets')
      .insert(rows)
      .select('id')
    if (error) {
      handleSupabaseError(error, 'creating video asset')
    }
    const ids = Array.isArray(data) ? data.map((r: VideoAsset) => r.id) : (data?.id ? [data.id] : [])
    return createSuccessResponse({ ok: true, ids })
  }
}

async function deleteVideoAsset(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    handleSupabaseError(new Error('id required'), 'validating delete request')
  }
  
  const { error } = await supabase.from('video_assets').delete().eq('id', id)
  if (error) {
    handleSupabaseError(error, 'deleting video asset')
  }
  return createSuccessResponse({ ok: true })
}

export const GET = withErrorHandling(getVideoAssets)
export const POST = withErrorHandling(postVideoAsset)
export const DELETE = withErrorHandling(deleteVideoAsset)
