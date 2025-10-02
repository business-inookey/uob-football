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

async function predeploySetup() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('🚀 Running predeploy setup...')
    
    // Run all migrations
    const migrations = [
      '0001_core.sql',
      '0002_view.sql', 
      '0003_rls.sql',
      '0004_add_current_team.sql',
      '0005_lead_coach_permissions.sql',
      '0006_sample_stats.sql',
      '0007_attendance_system.sql'
    ]
    
    for (const migration of migrations) {
      console.log(`📝 Running migration: ${migration}`)
      const migrationPath = join(process.cwd(), 'supabase', 'migrations', migration)
      const migrationSQL = readFileSync(migrationPath, 'utf8')
      
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
      
      if (error) {
        console.error(`❌ Migration ${migration} failed:`, error)
        process.exit(1)
      }
      
      console.log(`✅ Migration ${migration} completed`)
    }
    
    // Seed initial data
    console.log('🌱 Seeding initial data...')
    const seedPath = join(process.cwd(), 'supabase', 'seed.sql')
    const seedSQL = readFileSync(seedPath, 'utf8')
    
    const { error: seedError } = await supabase.rpc('exec_sql', { sql: seedSQL })
    
    if (seedError) {
      console.error('❌ Seed failed:', seedError)
      process.exit(1)
    }
    
    console.log('✅ Initial data seeded')
    
    // Create admin invitation
    await createAdminInvitation(supabase)
    
    console.log('🎉 Predeploy setup completed successfully!')
    
  } catch (err) {
    console.error('❌ Predeploy setup failed:', err)
    process.exit(1)
  }
}

async function createAdminInvitation(supabase: unknown) {
  try {
    console.log('👤 Setting up admin user...')
    
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
    
    console.log('✅ Admin user setup completed!')
    console.log('📧 First admin can sign up and will have full system access')
    
  } catch (err) {
    console.warn('⚠️ Admin setup failed:', err)
  }
}

predeploySetup()
