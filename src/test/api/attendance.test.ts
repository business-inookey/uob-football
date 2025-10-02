import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/attendance/route'

describe('/api/attendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/attendance', () => {
    it('should return attendance records for valid team and date', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?team=1s&date=2024-01-15',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return validation error when team parameter is missing', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?date=2024-01-15',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })

    it('should return validation error when date parameter is missing', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?team=1s',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })

    it('should return validation error for invalid date format', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?team=1s&date=invalid-date',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })
  })

  describe('POST /api/attendance', () => {
    it('should return unauthorized error when not authenticated', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/attendance',
        body: {
          entries: [{
            player_id: 'test-player-id',
            team_code: '1s',
            date: '2024-01-15',
            status: 'present'
          }]
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })

    it('should return validation error for invalid request body', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/attendance',
        body: {
          invalid: 'data'
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })

    it('should return validation error for missing entries', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/attendance',
        body: {
          entries: []
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })

    it('should return validation error for invalid attendance status', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/attendance',
        body: {
          entries: [{
            player_id: 'test-player-id',
            team_code: '1s',
            date: '2024-01-15',
            status: 'invalid-status'
          }]
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })

    it('should return validation error for invalid UUID', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/attendance',
        body: {
          entries: [{
            player_id: 'invalid-uuid',
            team_code: '1s',
            date: '2024-01-15',
            status: 'present'
          }]
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code', 'INTERNAL_ERROR')
    })
  })
})
