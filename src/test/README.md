# UoB Football Test Suite

This directory contains comprehensive tests for the UoB Football application, covering API endpoints, Row Level Security (RLS), business logic, and accessibility.

## Test Structure

```
src/test/
├── api/                    # API endpoint tests
│   ├── teams.test.ts
│   ├── players.test.ts
│   └── attendance.test.ts
├── rls/                    # Row Level Security tests
│   ├── attendance-rls.test.ts
│   └── team-weights-rls.test.ts
├── unit/                   # Business logic unit tests
│   ├── selection.test.ts
│   └── normalization.test.ts
├── accessibility/          # Accessibility tests
│   ├── login.test.tsx
│   └── players.test.tsx
├── config/                 # Test configuration
│   └── test-env.ts
├── setup.ts               # Test setup and mocks
├── test-utils.tsx         # Testing utilities
└── run-all-tests.ts       # Test runner script
```

## Running Tests

### All Tests
```bash
npm run test
```

### Specific Test Suites
```bash
# API tests only
npm run test:api

# RLS tests only
npm run test:rls

# Unit tests only
npm run test:unit

# Accessibility tests only
npm run test:accessibility
```

### With Coverage
```bash
npm run test:coverage
```

### Interactive UI
```bash
npm run test:ui
```

## Test Categories

### 1. API Tests (`src/test/api/`)

Tests API endpoints for:
- ✅ Input validation with Zod schemas
- ✅ Authentication and authorization
- ✅ Error handling and status codes
- ✅ Response format consistency
- ✅ Database operations

**Coverage**: All API routes with happy/sad path scenarios

### 2. RLS Tests (`src/test/rls/`)

Tests Row Level Security policies for:
- ✅ Team-based access control
- ✅ Role-based permissions (lead vs assistant coaches)
- ✅ Anonymous user restrictions
- ✅ Cross-team data isolation
- ✅ CRUD operation permissions

**Coverage**: Critical tables (attendance, team_weights, players, etc.)

### 3. Unit Tests (`src/test/unit/`)

Tests business logic for:
- ✅ Player selection algorithms
- ✅ Stat normalization functions
- ✅ Formation validation
- ✅ Composite score calculations
- ✅ Tie-breaker logic

**Coverage**: Core business logic with edge cases

### 4. Accessibility Tests (`src/test/accessibility/`)

Tests accessibility compliance for:
- ✅ WCAG 2.1 AA standards
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast ratios
- ✅ ARIA attributes
- ✅ Focus management

**Coverage**: Critical user-facing pages

## Test Configuration

### Environment Variables

Create `.env.test` for test-specific configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-key
```

### Test Data

Tests use isolated test data that is:
- Created before each test
- Cleaned up after each test
- Scoped to test-specific teams/players
- Non-interfering with production data

## Writing Tests

### API Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/teams/route'

describe('/api/teams', () => {
  it('should return teams list successfully', async () => {
    const { req } = createMocks({ method: 'GET' })
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
```

### RLS Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Attendance RLS Tests', () => {
  let serviceClient: ReturnType<typeof createClient>
  let anonClient: ReturnType<typeof createClient>

  beforeEach(async () => {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    anonClient = createClient(supabaseUrl, supabaseAnonKey)
    // Setup test data
  })

  it('should allow authenticated coach to insert attendance', async () => {
    const { data, error } = await authenticatedClient
      .from('attendance')
      .insert({ /* test data */ })

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

### Accessibility Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'

describe('Login Page Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<LoginPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

## Coverage Goals

- **API Routes**: 100% coverage
- **RLS Policies**: 100% coverage (happy/sad paths)
- **Business Logic**: 90% coverage
- **Accessibility**: Critical pages 100% compliant

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Pre-deployment checks

## Debugging Tests

### Failed API Tests
1. Check network connectivity to Supabase
2. Verify environment variables
3. Check database schema matches expectations

### Failed RLS Tests
1. Verify RLS policies are enabled
2. Check test data setup/cleanup
3. Verify user roles and permissions

### Failed Accessibility Tests
1. Check for missing ARIA attributes
2. Verify color contrast ratios
3. Test keyboard navigation manually

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Realistic Data**: Use realistic test data
4. **Edge Cases**: Test boundary conditions
5. **Error Scenarios**: Test both success and failure paths
6. **Performance**: Keep tests fast and efficient

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure `.env.test` is properly configured
2. **Database Connection**: Verify Supabase instance is running
3. **Test Data**: Check that test data is properly isolated
4. **Mocking**: Ensure mocks are properly configured

### Getting Help

- Check test logs for detailed error messages
- Verify test configuration matches environment
- Ensure all dependencies are installed
- Check for TypeScript compilation errors
