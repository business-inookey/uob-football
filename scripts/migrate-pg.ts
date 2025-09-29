#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve, join } from 'path'
import { readFileSync } from 'fs'
import { Client } from 'pg'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const dbUrl = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL (or POSTGRES_URL / DATABASE_URL) in .env.local')
  process.exit(1)
}

function readSql(file: string) {
  const full = join(process.cwd(), 'supabase', 'migrations', file)
  return readFileSync(full, 'utf8')
}

async function runSql(client: Client, sql: string, label: string) {
  process.stdout.write(`Running: ${label} ... `)
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('OK')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error(`\nFailed: ${label}`)
    console.error(e)
    process.exit(1)
  }
}

async function main() {
  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  // Core, view, RLS
  await runSql(client, readSql('0001_core.sql'), '0001_core.sql')
  await runSql(client, readSql('0002_view.sql'), '0002_view.sql')
  await runSql(client, readSql('0003_rls.sql'), '0003_rls.sql')

  // Seed
  const seed = readFileSync(join(process.cwd(), 'supabase', 'seed.sql'), 'utf8')
  await runSql(client, seed, 'seed.sql')

  await client.end()
  console.log('🎉 All migrations and seeds completed successfully!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


