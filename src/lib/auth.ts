import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export async function ensureProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const isAnon = (user as unknown).is_anonymous === true || user.app_metadata?.provider === 'anonymous'
  if (isAnon) return user

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existing) {
    // Attempt insert of own profile (requires RLS insert policy)
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Coach',
    })
  }

  return user
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  await ensureProfile()
  
  return user
}

export async function requireCoach() {
  const user = await requireAuth()
  const supabase = await createClient()

  // 1) Profile
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (pErr || !profile) redirect('/unauthorized')

  // 2) Coach row
  const { data: coach, error: cErr } = await supabase
    .from('coaches')
    .select('id')
    .eq('profile_id', user.id)
    .single()
  if (cErr || !coach) redirect('/unauthorized')

  // 3) Team memberships
  const { data: memberships, error: mErr } = await supabase
    .from('coach_team')
    .select('team_id, role, teams(code, name)')
    .eq('coach_id', coach.id)
  if (mErr) redirect('/unauthorized')

  return { user, profile, teams: memberships ?? [] }
}

export async function requireLeadCoach(teamId?: string) {
  const { user, profile, teams } = await requireCoach()
  
  const leadTeams = teams.filter((t: unknown) => t.role === 'lead_coach')
  
  if (leadTeams.length === 0) {
    redirect('/unauthorized')
  }
  
  if (teamId) {
    const hasAccess = leadTeams.some((t: unknown) => t.team_id === teamId)
    if (!hasAccess) {
      redirect('/unauthorized')
    }
  }
  
  return {
    user,
    profile,
    teams: leadTeams
  }
}
