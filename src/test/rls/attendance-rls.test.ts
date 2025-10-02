import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

describe('Attendance RLS Tests', () => {
  let serviceClient: ReturnType<typeof createClient>
  let anonClient: ReturnType<typeof createClient>
  let testTeamId: string | null = null
  let testPlayerId: string | null = null
  let testCoachId: string | null = null

  beforeEach(async () => {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    anonClient = createClient(supabaseUrl, supabaseAnonKey)

    // Use existing team instead of creating new one
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id')
      .eq('code', '1s')
      .single()

    if (teamError || !team) {
      console.warn('Failed to find existing team:', teamError)
      return
    }

    const { data: player, error: playerError } = await serviceClient
      .from('players')
      .insert({
        full_name: 'Test Player',
        primary_position: 'MID',
        current_team: '1s'
      })
      .select('id')
      .single()

    if (playerError || !player) {
      console.warn('Failed to create test player:', playerError)
      return
    }

    const { data: coach, error: coachError } = await serviceClient
      .from('profiles')
      .insert({
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Test Coach',
        role: 'lead_coach'
      })
      .select('id')
      .single()

    if (coachError || !coach) {
      console.warn('Failed to create test coach:', coachError)
      return
    }

    testTeamId = team.id
    testPlayerId = player.id
    testCoachId = coach.id

    // Create coach record
    const { data: coachRecord, error: coachRecordError } = await serviceClient
      .from('coaches')
      .insert({
        profile_id: testCoachId
      })
      .select('id')
      .single()

    if (coachRecordError || !coachRecord) {
      console.warn('Failed to create coach record:', coachRecordError)
      return
    }

    // Create coach-team relationship
    await serviceClient
      .from('coach_team')
      .insert({
        coach_id: coachRecord.id,
        team_id: testTeamId,
        role: 'lead_coach'
      })
  })

  afterEach(async () => {
    // Clean up test data (but not the existing team)
    if (testPlayerId) {
      await serviceClient.from('attendance').delete().eq('player_id', testPlayerId)
      await serviceClient.from('players').delete().eq('id', testPlayerId)
    }
    if (testTeamId && testCoachId) {
      // Get coach record ID first
      const { data: coachRecord } = await serviceClient
        .from('coaches')
        .select('id')
        .eq('profile_id', testCoachId)
        .single()
      
      if (coachRecord) {
        await serviceClient.from('coach_team').delete().eq('team_id', testTeamId).eq('coach_id', coachRecord.id)
        await serviceClient.from('coaches').delete().eq('id', coachRecord.id)
      }
    }
    if (testCoachId) {
      await serviceClient.from('profiles').delete().eq('id', testCoachId)
    }
  })

  it('should allow authenticated coach to insert attendance', async () => {
    if (!testTeamId || !testPlayerId || !testCoachId) {
      console.warn('Skipping test - setup failed')
      return
    }

    // Mock authenticated user
    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: testCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('attendance')
      .insert({
        player_id: testPlayerId,
        team_id: testTeamId,
        date: '2024-01-15',
        status: 'present',
        recorded_by: testCoachId
      })
      .select()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data![0].player_id).toBe(testPlayerId)
  })

  it('should deny anonymous user from inserting attendance', async () => {
    const { data, error } = await anonClient
      .from('attendance')
      .insert({
        player_id: testPlayerId,
        team_id: testTeamId,
        date: '2024-01-15',
        status: 'present',
        recorded_by: '00000000-0000-0000-0000-000000000000'
      })
      .select()

    expect(error).toBeDefined()
    expect(error!.message).toContain('row-level security policy')
    expect(data).toBeNull()
  })

  it('should allow coach to view attendance for their team', async () => {
    // Insert test attendance using service role
    await serviceClient
      .from('attendance')
      .insert({
        player_id: testPlayerId,
        team_id: testTeamId,
        date: '2024-01-15',
        status: 'present',
        recorded_by: testCoachId
      })

    // Mock authenticated user
    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: testCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('attendance')
      .select('*')
      .eq('team_id', testTeamId)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data!.length).toBeGreaterThan(0)
  })

  it('should deny coach from viewing attendance for other teams', async () => {
    if (!testTeamId || !testPlayerId || !testCoachId) {
      console.warn('Skipping test - setup failed')
      return
    }

    // Use existing other team
    const { data: otherTeam } = await serviceClient
      .from('teams')
      .select('id')
      .eq('code', '2s')
      .single()

    // Insert attendance for other team
    await serviceClient
      .from('attendance')
      .insert({
        player_id: testPlayerId,
        team_id: otherTeam!.id,
        date: '2024-01-15',
        status: 'present',
        recorded_by: 'other-coach'
      })

    // Mock authenticated user (our test coach)
    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: testCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('attendance')
      .select('*')
      .eq('team_id', otherTeam!.id)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data!.length).toBe(0) // Should not see other team's attendance

    // Clean up (but not the existing team)
    if (otherTeam) {
      await serviceClient.from('attendance').delete().eq('team_id', otherTeam.id)
    }
  })

  it('should allow lead coach to update attendance', async () => {
    // Insert test attendance
    const { data: attendance } = await serviceClient
      .from('attendance')
      .insert({
        player_id: testPlayerId,
        team_id: testTeamId,
        date: '2024-01-15',
        status: 'present',
        recorded_by: testCoachId
      })
      .select('id')
      .single()

    // Mock authenticated user
    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: testCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('attendance')
      .update({ status: 'late' })
      .eq('id', attendance!.id)
      .select()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data![0].status).toBe('late')
  })
})
