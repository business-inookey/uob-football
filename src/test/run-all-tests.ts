#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const testSuites = [
  { name: 'API Tests', command: 'npm run test:api', path: 'src/test/api' },
  { name: 'RLS Tests', command: 'npm run test:rls', path: 'src/test/rls' },
  { name: 'Unit Tests', command: 'npm run test:unit', path: 'src/test/unit' },
  { name: 'Accessibility Tests', command: 'npm run test:accessibility', path: 'src/test/accessibility' },
]

async function runAllTests() {
  console.log('🧪 Running UoB Football Test Suite\n')
  console.log('=' .repeat(50))
  
  let totalPassed = 0
  let totalFailed = 0
  
  for (const suite of testSuites) {
    console.log(`\n📋 Running ${suite.name}...`)
    console.log('-'.repeat(30))
    
    if (!existsSync(path.join(process.cwd(), suite.path))) {
      console.log(`⚠️  Skipping ${suite.name} - directory not found`)
      continue
    }
    
    try {
      execSync(suite.command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log(`✅ ${suite.name} passed`)
      totalPassed++
    } catch (_error) {
      console.log(`❌ ${suite.name} failed`)
      totalFailed++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Summary:')
  console.log(`✅ Passed: ${totalPassed}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`📈 Total: ${totalPassed + totalFailed}`)
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('\n💥 Some tests failed!')
    process.exit(1)
  }
}

// Run coverage if requested
if (process.argv.includes('--coverage')) {
  console.log('📊 Running tests with coverage...')
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' })
  } catch (_error) {
    console.log('❌ Coverage tests failed')
    process.exit(1)
  }
} else {
  runAllTests()
}
