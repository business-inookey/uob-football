// Test Configuration Example
// Copy this file to test-config.ts and update with your test values

export const testConfig = {
  // Supabase Configuration (use test instance)
  supabaseUrl: 'http://localhost:54321',
  supabaseAnonKey: 'your-test-anon-key',
  supabaseServiceKey: 'your-test-service-role-key',
  
  // Test Database Configuration
  databaseUrl: 'postgresql://postgres:password@localhost:54322/postgres',
  
  // Test-specific settings
  nodeEnv: 'test',
  appUrl: 'http://localhost:3000',
  
  // Test data configuration
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
