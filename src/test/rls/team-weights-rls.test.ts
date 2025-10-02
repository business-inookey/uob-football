import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

describe('Team Weights RLS Tests', () => {
  let serviceClient: ReturnType<typeof createClient>
  let anonClient: ReturnType<typeof createClient>
  let testTeamId: string
  let leadCoachId: string
  let assistantCoachId: string

  beforeEach(async () => {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    anonClient = createClient(supabaseUrl, supabaseAnonKey)

    // Create test team
    const { data: team } = await serviceClient
      .from('teams')
      .insert({ code: 'TEST', name: 'Test Team' })
      .select('id')
      .single()

    // Create lead coach
    const { data: leadCoach } = await serviceClient
      .from('profiles')
      .insert({
        id: 'lead-coach-id',
        full_name: 'Lead Coach',
        email: 'lead@example.com'
      })
      .select('id')
      .single()

    // Create assistant coach
    const { data: assistantCoach } = await serviceClient
      .from('profiles')
      .insert({
        id: 'assistant-coach-id',
        full_name: 'Assistant Coach',
        email: 'assistant@example.com'
      })
      .select('id')
      .single()

    testTeamId = team!.id
    leadCoachId = leadCoach!.id
    assistantCoachId = assistantCoach!.id

    // Create coach-team relationships
    await serviceClient
      .from('coach_team')
      .insert([
        {
          coach_id: leadCoachId,
          team_id: testTeamId,
          role: 'lead'
        },
        {
          coach_id: assistantCoachId,
          team_id: testTeamId,
          role: 'assistant'
        }
      ])
  })

  afterEach(async () => {
    // Clean up test data
    await serviceClient.from('team_weights').delete().eq('team_id', testTeamId)
    await serviceClient.from('coach_team').delete().eq('team_id', testTeamId)
    await serviceClient.from('teams').delete().eq('id', testTeamId)
    await serviceClient.from('profiles').delete().eq('id', leadCoachId)
    await serviceClient.from('profiles').delete().eq('id', assistantCoachId)
  })

  it('should allow lead coach to insert team weights', async () => {
    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: leadCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('team_weights')
      .insert({
        team_id: testTeamId,
        stat_key: 'pace',
        weight: 1.2
      })
      .select()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data![0].stat_key).toBe('pace')
    expect(data![0].weight).toBe(1.2)
  })

  it('should deny assistant coach from inserting team weights', async () => {
    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: assistantCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('team_weights')
      .insert({
        team_id: testTeamId,
        stat_key: 'pace',
        weight: 1.2
      })
      .select()

    expect(error).toBeDefined()
    expect(error!.message).toContain('permission denied')
    expect(data).toBeNull()
  })

  it('should allow lead coach to update team weights', async () => {
    // Insert test weight using service role
    await serviceClient
      .from('team_weights')
      .insert({
        team_id: testTeamId,
        stat_key: 'pace',
        weight: 1.0
      })

    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: leadCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('team_weights')
      .update({ weight: 1.5 })
      .eq('team_id', testTeamId)
      .eq('stat_key', 'pace')
      .select()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data![0].weight).toBe(1.5)
  })

  it('should deny assistant coach from updating team weights', async () => {
    // Insert test weight using service role
    await serviceClient
      .from('team_weights')
      .insert({
        team_id: testTeamId,
        stat_key: 'pace',
        weight: 1.0
      })

    const mockAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: assistantCoachId } }, error: null })
    }
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: mockAuth
    })

    const { data, error } = await authenticatedClient
      .from('team_weights')
      .update({ weight: 1.5 })
      .eq('team_id', testTeamId)
      .eq('stat_key', 'pace')
      .select()

    expect(error).toBeDefined()
    expect(error!.message).toContain('permission denied')
    expect(data).toBeNull()
  })

  it('should allow both lead and assistant coaches to view team weights', async () => {
    // Insert test weights using service role
    await serviceClient
      .from('team_weights')
      .insert([
        { team_id: testTeamId, stat_key: 'pace', weight: 1.2 },
        { team_id: testTeamId, stat_key: 'stamina', weight: 0.8 }
      ])

    // Test lead coach access
    const leadAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: leadCoachId } }, error: null })
    }
    
    const leadClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: leadAuth
    })

    const { data: leadData, error: leadError } = await leadClient
      .from('team_weights')
      .select('*')
      .eq('team_id', testTeamId)

    expect(leadError).toBeNull()
    expect(leadData).toBeDefined()
    expect(leadData!.length).toBe(2)

    // Test assistant coach access
    const assistantAuth = {
      getUser: () => Promise.resolve({ data: { user: { id: assistantCoachId } }, error: null })
    }
    
    const assistantClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: assistantAuth
    })

    const { data: assistantData, error: assistantError } = await assistantClient
      .from('team_weights')
      .select('*')
      .eq('team_id', testTeamId)

    expect(assistantError).toBeNull()
    expect(assistantData).toBeDefined()
    expect(assistantData!.length).toBe(2)
  })

  it('should deny anonymous user from accessing team weights', async () => {
    const { data, error } = await anonClient
      .from('team_weights')
      .select('*')
      .eq('team_id', testTeamId)

    expect(error).toBeDefined()
    expect(error!.message).toContain('permission denied')
    expect(data).toBeNull()
  })
})
