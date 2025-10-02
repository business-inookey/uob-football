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
  let testTeamId: string | null = null
  let leadCoachId: string | null = null
  let assistantCoachId: string | null = null

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

    // Create lead coach
    const { data: leadCoach, error: leadCoachError } = await serviceClient
      .from('profiles')
      .insert({
        id: '22222222-2222-2222-2222-222222222222',
        full_name: 'Lead Coach',
        role: 'lead_coach'
      })
      .select('id')
      .single()

    if (leadCoachError || !leadCoach) {
      console.warn('Failed to create lead coach:', leadCoachError)
      return
    }

    // Create assistant coach
    const { data: assistantCoach, error: assistantCoachError } = await serviceClient
      .from('profiles')
      .insert({
        id: '33333333-3333-3333-3333-333333333333',
        full_name: 'Assistant Coach',
        role: 'coach'
      })
      .select('id')
      .single()

    if (assistantCoachError || !assistantCoach) {
      console.warn('Failed to create assistant coach:', assistantCoachError)
      return
    }

    testTeamId = team.id
    leadCoachId = leadCoach.id
    assistantCoachId = assistantCoach.id

    // Create coach records
    const { data: leadCoachRecord, error: leadCoachRecordError } = await serviceClient
      .from('coaches')
      .insert({
        profile_id: leadCoachId
      })
      .select('id')
      .single()

    if (leadCoachRecordError || !leadCoachRecord) {
      console.warn('Failed to create lead coach record:', leadCoachRecordError)
      return
    }

    const { data: assistantCoachRecord, error: assistantCoachRecordError } = await serviceClient
      .from('coaches')
      .insert({
        profile_id: assistantCoachId
      })
      .select('id')
      .single()

    if (assistantCoachRecordError || !assistantCoachRecord) {
      console.warn('Failed to create assistant coach record:', assistantCoachRecordError)
      return
    }

    // Create coach-team relationships
    await serviceClient
      .from('coach_team')
      .insert([
        {
          coach_id: leadCoachRecord.id,
          team_id: testTeamId,
          role: 'lead_coach'
        },
        {
          coach_id: assistantCoachRecord.id,
          team_id: testTeamId,
          role: 'coach'
        }
      ])
  })

  afterEach(async () => {
    // Clean up test data (but not the existing team)
    if (testTeamId) {
      await serviceClient.from('team_weights').delete().eq('team_id', testTeamId)
      
      // Clean up coach-team relationships and coach records
      if (leadCoachId) {
        const { data: leadCoachRecord } = await serviceClient
          .from('coaches')
          .select('id')
          .eq('profile_id', leadCoachId)
          .single()
        
        if (leadCoachRecord) {
          await serviceClient.from('coach_team').delete().eq('team_id', testTeamId).eq('coach_id', leadCoachRecord.id)
          await serviceClient.from('coaches').delete().eq('id', leadCoachRecord.id)
        }
      }
      
      if (assistantCoachId) {
        const { data: assistantCoachRecord } = await serviceClient
          .from('coaches')
          .select('id')
          .eq('profile_id', assistantCoachId)
          .single()
        
        if (assistantCoachRecord) {
          await serviceClient.from('coach_team').delete().eq('team_id', testTeamId).eq('coach_id', assistantCoachRecord.id)
          await serviceClient.from('coaches').delete().eq('id', assistantCoachRecord.id)
        }
      }
    }
    if (leadCoachId) {
      await serviceClient.from('profiles').delete().eq('id', leadCoachId)
    }
    if (assistantCoachId) {
      await serviceClient.from('profiles').delete().eq('id', assistantCoachId)
    }
  })

  it('should allow lead coach to insert team weights', async () => {
    if (!testTeamId || !leadCoachId) {
      console.warn('Skipping test - setup failed')
      return
    }

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
    expect(error!.message).toContain('row-level security policy')
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
    expect(error!.message).toContain('row-level security policy')
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
    expect(error!.message).toContain('row-level security policy')
    expect(data).toBeNull()
  })
})
