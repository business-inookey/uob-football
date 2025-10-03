#!/usr/bin/env tsx

import { execSync } from 'child_process'

async function runBasicTests() {
  console.log('🧪 Running Basic UoB Football Tests\n')
  console.log('=' .repeat(50))
  
  const testSuites = [
    { name: 'Unit Tests', command: 'npm run test:unit' },
    { name: 'API Tests', command: 'npm run test:api' },
    { name: 'Accessibility Tests', command: 'npm run test:accessibility' },
  ]
  
  let totalPassed = 0
  let totalFailed = 0
  
  for (const suite of testSuites) {
    console.log(`\n📋 Running ${suite.name}...`)
    console.log('-'.repeat(30))
    
    try {
      execSync(suite.command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log(`✅ ${suite.name} passed`)
      totalPassed++
    } catch {
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
    console.log('\n🎉 All basic tests passed!')
    console.log('💡 Note: RLS tests require database setup and are skipped for now')
    process.exit(0)
  } else {
    console.log('\n💥 Some tests failed!')
    process.exit(1)
  }
}

runBasicTests()
