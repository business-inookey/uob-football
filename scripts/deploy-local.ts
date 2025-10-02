#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function deployLocal() {
  try {
    console.log('🚀 Starting local deployment preparation...')
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:')
      missingVars.forEach(varName => console.error(`  - ${varName}`))
      process.exit(1)
    }
    
    console.log('✅ Environment variables check passed')
    
    // Run linting
    console.log('🔍 Running ESLint...')
    execSync('npm run lint', { stdio: 'inherit' })
    console.log('✅ Linting passed')
    
    // Run type checking
    console.log('🔍 Running TypeScript check...')
    execSync('npm run typecheck', { stdio: 'inherit' })
    console.log('✅ Type checking passed')
    
    // Run tests
    console.log('🧪 Running tests...')
    execSync('npm run test:run', { stdio: 'inherit' })
    console.log('✅ Tests passed')
    
    // Run migrations
    console.log('📝 Running database migrations...')
    execSync('npm run migrate', { stdio: 'inherit' })
    console.log('✅ Migrations completed')
    
    // Build application
    console.log('🏗️ Building application...')
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ Build completed')
    
    console.log('🎉 Local deployment preparation completed successfully!')
    console.log('📋 Next steps:')
    console.log('  1. Push to GitHub main branch')
    console.log('  2. Monitor GitHub Actions workflow')
    console.log('  3. Verify Vercel deployment')
    console.log('  4. Test production URL')
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error)
    process.exit(1)
  }
}

deployLocal()
