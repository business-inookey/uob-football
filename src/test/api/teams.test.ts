import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/teams/route'

describe('/api/teams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return teams list successfully', async () => {
    const { req } = createMocks({
      method: 'GET',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('code')
    expect(data[0]).toHaveProperty('name')
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: { message: 'Database connection failed' }
          }))
        }))
      }))
    }

    vi.doMock('@/lib/supabase/server', () => ({
      createClient: () => mockSupabase
    }))

    const { req } = createMocks({
      method: 'GET',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
  })
})
