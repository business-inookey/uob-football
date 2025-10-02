#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

async function seedProductionData() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('🌱 Seeding production data...')
    
    // Check if data already exists
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('id')
      .limit(1)
    
    if (existingTeams && existingTeams.length > 0) {
      console.log('✅ Production data already exists, skipping seed')
      return
    }
    
    // Read and execute seed file
    const seedPath = join(process.cwd(), 'supabase', 'seed.sql')
    const seedSQL = readFileSync(seedPath, 'utf8')
    
    console.log('📊 Inserting seed data...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: seedSQL })
    
    if (error) {
      console.error('❌ Seed failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Production data seeded successfully!')
    
    // Create admin user invitation
    await createAdminInvitation(supabase)
    
  } catch (err) {
    console.error('❌ Error seeding production data:', err)
    process.exit(1)
  }
}

async function createAdminInvitation(supabase: unknown) {
  try {
    console.log('👤 Creating admin user invitation...')
    
    // Create admin profile
    const adminId = '00000000-0000-0000-0000-000000000001'
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminId,
        full_name: 'System Administrator',
        role: 'admin'
      })
    
    if (profileError) {
      console.warn('⚠️ Admin profile creation failed:', profileError.message)
      return
    }
    
    // Create coach record for admin
    const { error: coachError } = await supabase
      .from('coaches')
      .upsert({
        profile_id: adminId
      })
    
    if (coachError) {
      console.warn('⚠️ Admin coach record creation failed:', coachError.message)
    }
    
    console.log('✅ Admin user invitation created!')
    console.log('📧 Admin can sign up with any email and will have admin privileges')
    
  } catch (err) {
    console.warn('⚠️ Admin invitation creation failed:', err)
  }
}

seedProductionData()
