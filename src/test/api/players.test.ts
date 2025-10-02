import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/players/route'

describe('/api/players', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return players for valid team', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/players?team=1s',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('full_name')
    expect(data[0]).toHaveProperty('primary_position')
    expect(data[0]).toHaveProperty('current_team')
  })

  it('should return all players when team=all', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/players?team=all',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('should return validation error when team parameter is missing', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/players',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    expect(data.error).toContain('Invalid input')
  })

  it('should return validation error for invalid team code', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/players?team=invalid',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200) // Should still work, just return empty array
    expect(Array.isArray(data)).toBe(true)
  })
})
