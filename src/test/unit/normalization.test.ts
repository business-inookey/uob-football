import { describe, it, expect } from 'vitest'

// Mock the normalization logic from composite route
function normalizeStats(raw: Record<string, Record<string, number>>, statKeys: string[]): Record<string, Record<string, number>> {
  const normalized: Record<string, Record<string, number>> = {}
  const playerIds = Object.keys(raw)
  
  for (const pid of playerIds) normalized[pid] = {}

  for (const key of statKeys) {
    let min = Infinity
    let max = -Infinity
    
    // Find min/max for this stat across all players
    for (const pid of playerIds) {
      const v = raw[pid]?.[key]
      if (typeof v === 'number') {
        if (v < min) min = v
        if (v > max) max = v
      }
    }
    
    const denom = max - min
    
    // Normalize each player's value for this stat
    for (const pid of playerIds) {
      const v = raw[pid]?.[key]
      let n = 0.5 // default neutral if missing or no variance
      if (typeof v === 'number') {
        n = denom === 0 ? 0.5 : (v - min) / (denom || 1)
      }
      normalized[pid][key] = n
    }
  }

  return normalized
}

describe('Stat Normalization', () => {
  it('should normalize stats correctly with different ranges', () => {
    const raw = {
      'player1': { pace: 80, stamina: 60 },
      'player2': { pace: 90, stamina: 70 },
      'player3': { pace: 70, stamina: 50 },
    }
    const statKeys = ['pace', 'stamina']

    const normalized = normalizeStats(raw, statKeys)

    // Player with highest pace should have normalized value close to 1
    expect(normalized['player2'].pace).toBeCloseTo(1, 2)
    // Player with lowest pace should have normalized value close to 0
    expect(normalized['player3'].pace).toBeCloseTo(0, 2)
    // Player with middle pace should have normalized value around 0.5
    expect(normalized['player1'].pace).toBeCloseTo(0.5, 2)

    // Same logic for stamina
    expect(normalized['player2'].stamina).toBeCloseTo(1, 2)
    expect(normalized['player3'].stamina).toBeCloseTo(0, 2)
    expect(normalized['player1'].stamina).toBeCloseTo(0.5, 2)
  })

  it('should handle missing stats with default value', () => {
    const raw = {
      'player1': { pace: 80 },
      'player2': { pace: 90 },
      'player3': {}, // No stats
    }
    const statKeys = ['pace']

    const normalized = normalizeStats(raw, statKeys)

    expect(normalized['player1'].pace).toBeCloseTo(0, 2)
    expect(normalized['player2'].pace).toBeCloseTo(1, 2)
    expect(normalized['player3'].pace).toBe(0.5) // Default for missing
  })

  it('should handle identical values with default', () => {
    const raw = {
      'player1': { pace: 80 },
      'player2': { pace: 80 },
      'player3': { pace: 80 },
    }
    const statKeys = ['pace']

    const normalized = normalizeStats(raw, statKeys)

    // All should get default value when no variance
    expect(normalized['player1'].pace).toBe(0.5)
    expect(normalized['player2'].pace).toBe(0.5)
    expect(normalized['player3'].pace).toBe(0.5)
  })

  it('should handle single player', () => {
    const raw = {
      'player1': { pace: 80, stamina: 60 },
    }
    const statKeys = ['pace', 'stamina']

    const normalized = normalizeStats(raw, statKeys)

    // Single player should get default values
    expect(normalized['player1'].pace).toBe(0.5)
    expect(normalized['player1'].stamina).toBe(0.5)
  })

  it('should handle negative values', () => {
    const raw = {
      'player1': { pace: -10 },
      'player2': { pace: 0 },
      'player3': { pace: 10 },
    }
    const statKeys = ['pace']

    const normalized = normalizeStats(raw, statKeys)

    expect(normalized['player1'].pace).toBeCloseTo(0, 2)
    expect(normalized['player2'].pace).toBeCloseTo(0.5, 2)
    expect(normalized['player3'].pace).toBeCloseTo(1, 2)
  })

  it('should handle extreme values', () => {
    const raw = {
      'player1': { pace: 0 },
      'player2': { pace: 1000000 },
    }
    const statKeys = ['pace']

    const normalized = normalizeStats(raw, statKeys)

    expect(normalized['player1'].pace).toBeCloseTo(0, 2)
    expect(normalized['player2'].pace).toBeCloseTo(1, 2)
  })

  it('should handle multiple stats with different ranges', () => {
    const raw = {
      'player1': { pace: 80, stamina: 60, shooting: 70 },
      'player2': { pace: 90, stamina: 70, shooting: 80 },
      'player3': { pace: 70, stamina: 50, shooting: 60 },
    }
    const statKeys = ['pace', 'stamina', 'shooting']

    const normalized = normalizeStats(raw, statKeys)

    // Each stat should be normalized independently
    expect(normalized['player2'].pace).toBeCloseTo(1, 2)
    expect(normalized['player2'].stamina).toBeCloseTo(1, 2)
    expect(normalized['player2'].shooting).toBeCloseTo(1, 2)

    expect(normalized['player3'].pace).toBeCloseTo(0, 2)
    expect(normalized['player3'].stamina).toBeCloseTo(0, 2)
    expect(normalized['player3'].shooting).toBeCloseTo(0, 2)
  })

  it('should handle empty player list', () => {
    const raw = {}
    const statKeys = ['pace']

    const normalized = normalizeStats(raw, statKeys)

    expect(normalized).toEqual({})
  })

  it('should handle empty stat keys', () => {
    const raw = {
      'player1': { pace: 80 },
      'player2': { pace: 90 },
    }
    const statKeys: string[] = []

    const normalized = normalizeStats(raw, statKeys)

    expect(normalized['player1']).toEqual({})
    expect(normalized['player2']).toEqual({})
  })
})
