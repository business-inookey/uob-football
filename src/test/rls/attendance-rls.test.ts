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
  let testTeamId: string
  let testPlayerId: string
  let testCoachId: string

  beforeEach(async () => {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    anonClient = createClient(supabaseUrl, supabaseAnonKey)

    // Create test data using service role
    const { data: team } = await serviceClient
      .from('teams')
      .insert({ code: 'TEST', name: 'Test Team' })
      .select('id')
      .single()

    const { data: player } = await serviceClient
      .from('players')
      .insert({
        full_name: 'Test Player',
        primary_position: 'MID',
        current_team: 'TEST'
      })
      .select('id')
      .single()

    const { data: coach } = await serviceClient
      .from('profiles')
      .insert({
        id: 'test-coach-id',
        full_name: 'Test Coach',
        email: 'test@example.com'
      })
      .select('id')
      .single()

    testTeamId = team!.id
    testPlayerId = player!.id
    testCoachId = coach!.id

    // Create coach-team relationship
    await serviceClient
      .from('coach_team')
      .insert({
        coach_id: testCoachId,
        team_id: testTeamId,
        role: 'lead'
      })
  })

  afterEach(async () => {
    // Clean up test data
    await serviceClient.from('attendance').delete().eq('player_id', testPlayerId)
    await serviceClient.from('coach_team').delete().eq('team_id', testTeamId)
    await serviceClient.from('players').delete().eq('id', testPlayerId)
    await serviceClient.from('teams').delete().eq('id', testTeamId)
    await serviceClient.from('profiles').delete().eq('id', testCoachId)
  })

  it('should allow authenticated coach to insert attendance', async () => {
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
        recorded_by: 'anonymous'
      })
      .select()

    expect(error).toBeDefined()
    expect(error!.message).toContain('permission denied')
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
    // Create another team
    const { data: otherTeam } = await serviceClient
      .from('teams')
      .insert({ code: 'OTHER', name: 'Other Team' })
      .select('id')
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

    // Clean up
    await serviceClient.from('attendance').delete().eq('team_id', otherTeam!.id)
    await serviceClient.from('teams').delete().eq('id', otherTeam!.id)
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
