import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

export const testConfig = {
  // Database
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key',
  
  // Test data
  testTeamCode: 'TEST',
  testPlayerId: 'test-player-id',
  testCoachId: 'test-coach-id',
  
  // Timeouts
  apiTimeout: 10000,
  rlsTimeout: 15000,
  
  // Coverage thresholds
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  }
}

export const createTestSupabaseClient = () => {
  const { createClient } = import('@supabase/supabase-js')
  return createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey)
}

export const createTestServiceClient = () => {
  const { createClient } = import('@supabase/supabase-js')
  return createClient(testConfig.supabaseUrl, testConfig.supabaseServiceKey)
}
