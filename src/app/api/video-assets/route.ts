import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const VideoAssetPayload = z.object({
  id: z.string().uuid().optional(),
  team: z.string().min(1), // team code
  team2: z.string().min(1).optional(), // optional second team code
  title: z.string().min(1),
  url: z.string().url(),
  provider: z.string().default('veo3'),
  meta: z.record(z.any()).default({}),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamCode = searchParams.get('team')

  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  // Use service client to bypass RLS (lead coaches should see all videos)
  let query = serviceSupabase
    .from('video_assets')
    .select('id, title, url, provider, meta, created_at, team:team_id(code,name)')
    .order('created_at', { ascending: false }) as any

  if (teamCode && teamCode !== 'all') {
    // Get team id from code
    const { data: team } = await serviceSupabase.from('teams').select('id').eq('code', teamCode).maybeSingle()
    if (team) {
      query = query.eq('team_id', team.id)
    }
  }

  const { data, error } = await query
  if (error) {
    console.error('Video assets query error:', error)
    return new Response(error.message, { status: 400 })
  }
  
  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()
  const body = await request.json().catch(() => null)
  const parsed = VideoAssetPayload.safeParse(body)
  if (!parsed.success) return new Response('Invalid payload', { status: 400 })

  // Get current user profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) return new Response('Profile not found', { status: 404 })

  // Resolve team code to id using service client
  const { data: team } = await serviceSupabase.from('teams').select('id').eq('code', parsed.data.team).single()
  if (!team) return new Response('Invalid team code', { status: 400 })

  // Validate URL format
  try {
    new URL(parsed.data.url)
  } catch {
    return new Response('Invalid URL format', { status: 400 })
  }

  if (parsed.data.id) {
    // Update
    const { error } = await supabase
      .from('video_assets')
      .update({
        title: parsed.data.title,
        url: parsed.data.url,
        provider: parsed.data.provider,
        meta: parsed.data.meta,
      })
      .eq('id', parsed.data.id)
    if (error) return new Response(error.message, { status: 400 })
    // If team2 provided on update, insert a second record for team2 (best-effort)
    if (parsed.data.team2 && parsed.data.team2 !== parsed.data.team) {
      const { data: t2 } = await serviceSupabase.from('teams').select('id').eq('code', parsed.data.team2).maybeSingle()
      if (t2) {
        await serviceSupabase
          .from('video_assets')
          .insert({
            team_id: t2.id,
            title: parsed.data.title,
            url: parsed.data.url,
            provider: parsed.data.provider,
            meta: parsed.data.meta,
            created_by: profile.id,
          })
      }
    }
    return Response.json({ ok: true, id: parsed.data.id })
  } else {
    // Insert
    const rows: any[] = [
      {
        team_id: team.id,
        title: parsed.data.title,
        url: parsed.data.url,
        provider: parsed.data.provider,
        meta: parsed.data.meta,
        created_by: profile.id,
      },
    ]
    if (parsed.data.team2 && parsed.data.team2 !== parsed.data.team) {
      const { data: t2 } = await serviceSupabase.from('teams').select('id').eq('code', parsed.data.team2).maybeSingle()
      if (t2) {
        rows.push({
          team_id: t2.id,
          title: parsed.data.title,
          url: parsed.data.url,
          provider: parsed.data.provider,
          meta: parsed.data.meta,
          created_by: profile.id,
        })
      }
    }
    const { data, error } = await serviceSupabase
      .from('video_assets')
      .insert(rows)
      .select('id')
    if (error) return new Response(error.message, { status: 400 })
    const ids = Array.isArray(data) ? data.map((r: any) => r.id) : (data?.id ? [data.id] : [])
    return Response.json({ ok: true, ids })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new Response('id required', { status: 400 })
  
  const { error } = await supabase.from('video_assets').delete().eq('id', id)
  if (error) return new Response(error.message, { status: 400 })
  return Response.json({ ok: true })
}
