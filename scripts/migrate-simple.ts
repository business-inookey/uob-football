#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('Make sure your .env.local file exists and contains these variables.')
  process.exit(1)
}

async function runSQLDirect(sql: string, description: string) {
  console.log(`Running: ${description}`)
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
    body: JSON.stringify({ sql })
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error(`Error in ${description}:`, error)
    process.exit(1)
  }
  
  console.log(`✅ ${description} completed successfully`)
}

async function runMigration(filename: string) {
  console.log(`Running migration: ${filename}`)
  
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename)
  const sql = readFileSync(migrationPath, 'utf8')
  
  await runSQLDirect(sql, filename)
}

async function runSeed() {
  console.log('Running seed data...')
  
  const seedPath = join(process.cwd(), 'supabase', 'seed.sql')
  const sql = readFileSync(seedPath, 'utf8')
  
  await runSQLDirect(sql, 'seed data')
}

async function main() {
  try {
    // Run migrations in order
    await runMigration('0001_core.sql')
    await runMigration('0002_view.sql')
    await runMigration('0003_rls.sql')
    
    // Run seed data
    await runSeed()
    
    console.log('🎉 All migrations and seeds completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
