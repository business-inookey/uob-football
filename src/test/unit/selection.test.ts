import { describe, it, expect } from 'vitest'
import { bestXI, type Formation, type PlayerRow } from '@/lib/selection'

describe('Selection Logic', () => {
  const mockPlayers: PlayerRow[] = [
    // Goalkeepers
    { id: 'gk1', full_name: 'GK1', primary_position: 'GK', composite: 85, speed: 70 },
    { id: 'gk2', full_name: 'GK2', primary_position: 'GK', composite: 80, speed: 65 },
    
    // Defenders
    { id: 'def1', full_name: 'DEF1', primary_position: 'DEF', composite: 90, speed: 80 },
    { id: 'def2', full_name: 'DEF2', primary_position: 'DEF', composite: 85, speed: 75 },
    { id: 'def3', full_name: 'DEF3', primary_position: 'DEF', composite: 80, speed: 70 },
    { id: 'def4', full_name: 'DEF4', primary_position: 'DEF', composite: 75, speed: 65 },
    { id: 'def5', full_name: 'DEF5', primary_position: 'DEF', composite: 70, speed: 60 },
    
    // Midfielders
    { id: 'mid1', full_name: 'MID1', primary_position: 'MID', composite: 95, speed: 85 },
    { id: 'mid2', full_name: 'MID2', primary_position: 'MID', composite: 90, speed: 80 },
    { id: 'mid3', full_name: 'MID3', primary_position: 'MID', composite: 85, speed: 75 },
    { id: 'mid4', full_name: 'MID4', primary_position: 'MID', composite: 80, speed: 70 },
    
    // Wingers
    { id: 'wng1', full_name: 'WNG1', primary_position: 'WNG', composite: 88, speed: 90 },
    { id: 'wng2', full_name: 'WNG2', primary_position: 'WNG', composite: 85, speed: 85 },
    { id: 'wng3', full_name: 'WNG3', primary_position: 'WNG', composite: 80, speed: 80 },
    
    // Strikers
    { id: 'st1', full_name: 'ST1', primary_position: 'ST', composite: 92, speed: 85 },
    { id: 'st2', full_name: 'ST2', primary_position: 'ST', composite: 88, speed: 80 },
    { id: 'st3', full_name: 'ST3', primary_position: 'ST', composite: 85, speed: 75 },
  ]

  describe('bestXI function', () => {
    it('should select correct formation (4-3-3)', () => {
      const formation: Formation = { gk: 1, def: 4, mid: 3, wng: 0, st: 3 }
      const result = bestXI(mockPlayers, formation)

      expect(result.gk).toHaveLength(1)
      expect(result.def).toHaveLength(4)
      expect(result.mid).toHaveLength(3)
      expect(result.wng).toHaveLength(0)
      expect(result.st).toHaveLength(3)
      expect(result.orderedXI).toHaveLength(11)

      // Check that best players are selected
      expect(result.gk[0].id).toBe('gk1') // Highest composite GK
      expect(result.def[0].id).toBe('def1') // Highest composite DEF
      expect(result.mid[0].id).toBe('mid1') // Highest composite MID
      expect(result.st[0].id).toBe('st1') // Highest composite ST
    })

    it('should select correct formation (3-5-2)', () => {
      const formation: Formation = { gk: 1, def: 3, mid: 5, wng: 0, st: 2 }
      const result = bestXI(mockPlayers, formation)

      expect(result.gk).toHaveLength(1)
      expect(result.def).toHaveLength(3)
      expect(result.mid).toHaveLength(5)
      expect(result.wng).toHaveLength(0)
      expect(result.st).toHaveLength(2)
      expect(result.orderedXI).toHaveLength(11)
    })

    it('should select correct formation (4-4-2)', () => {
      const formation: Formation = { gk: 1, def: 4, mid: 4, wng: 0, st: 2 }
      const result = bestXI(mockPlayers, formation)

      expect(result.gk).toHaveLength(1)
      expect(result.def).toHaveLength(4)
      expect(result.mid).toHaveLength(4)
      expect(result.wng).toHaveLength(0)
      expect(result.st).toHaveLength(2)
      expect(result.orderedXI).toHaveLength(11)
    })

    it('should select correct formation with wingers (4-3-3 with wingers)', () => {
      const formation: Formation = { gk: 1, def: 4, mid: 3, wng: 2, st: 1 }
      const result = bestXI(mockPlayers, formation)

      expect(result.gk).toHaveLength(1)
      expect(result.def).toHaveLength(4)
      expect(result.mid).toHaveLength(3)
      expect(result.wng).toHaveLength(2)
      expect(result.st).toHaveLength(1)
      expect(result.orderedXI).toHaveLength(11)

      // Check that wingers are selected
      expect(result.wng[0].primary_position).toBe('WNG')
      expect(result.wng[1].primary_position).toBe('WNG')
    })

    it('should handle insufficient players gracefully', () => {
      const limitedPlayers = mockPlayers.slice(0, 8) // Only 8 players
      const formation: Formation = { gk: 1, def: 4, mid: 3, wng: 0, st: 3 }
      const result = bestXI(limitedPlayers, formation)

      // Should still return a valid formation, even if not all positions are filled optimally
      expect(result.gk).toHaveLength(1)
      expect(result.orderedXI).toHaveLength(8) // All available players
    })

    it('should use speed as tie-breaker when composite scores are equal', () => {
      const playersWithEqualComposite: PlayerRow[] = [
        { id: 'gk1', full_name: 'GK1', primary_position: 'GK', composite: 80, speed: 70 },
        { id: 'gk2', full_name: 'GK2', primary_position: 'GK', composite: 80, speed: 80 }, // Higher speed
        { id: 'def1', full_name: 'DEF1', primary_position: 'DEF', composite: 85, speed: 75 },
        { id: 'def2', full_name: 'DEF2', primary_position: 'DEF', composite: 85, speed: 80 }, // Higher speed
      ]

      const formation: Formation = { gk: 1, def: 1, mid: 0, wng: 0, st: 0 }
      const result = bestXI(playersWithEqualComposite, formation)

      expect(result.gk[0].id).toBe('gk2') // Should select GK with higher speed
      expect(result.def[0].id).toBe('def2') // Should select DEF with higher speed
    })

    it('should handle empty player list', () => {
      const formation: Formation = { gk: 1, def: 4, mid: 3, wng: 0, st: 3 }
      const result = bestXI([], formation)

      expect(result.gk).toHaveLength(0)
      expect(result.def).toHaveLength(0)
      expect(result.mid).toHaveLength(0)
      expect(result.wng).toHaveLength(0)
      expect(result.st).toHaveLength(0)
      expect(result.orderedXI).toHaveLength(0)
    })

    it('should handle players with zero composite scores', () => {
      const playersWithZeroComposite: PlayerRow[] = [
        { id: 'gk1', full_name: 'GK1', primary_position: 'GK', composite: 0, speed: 70 },
        { id: 'gk2', full_name: 'GK2', primary_position: 'GK', composite: 0, speed: 80 },
        { id: 'def1', full_name: 'DEF1', primary_position: 'DEF', composite: 0, speed: 75 },
        { id: 'def2', full_name: 'DEF2', primary_position: 'DEF', composite: 0, speed: 80 },
      ]

      const formation: Formation = { gk: 1, def: 1, mid: 0, wng: 0, st: 0 }
      const result = bestXI(playersWithZeroComposite, formation)

      expect(result.gk).toHaveLength(1)
      expect(result.def).toHaveLength(1)
      expect(result.orderedXI).toHaveLength(2)
    })

    it('should maintain player order in orderedXI', () => {
      const formation: Formation = { gk: 1, def: 2, mid: 2, wng: 0, st: 1 }
      const result = bestXI(mockPlayers, formation)

      // Check that orderedXI contains all selected players
      const allSelectedPlayers = [
        ...result.gk,
        ...result.def,
        ...result.mid,
        ...result.wng,
        ...result.st
      ]

      expect(result.orderedXI).toHaveLength(allSelectedPlayers.length)
      
      // Check that all selected players are in orderedXI
      for (const player of allSelectedPlayers) {
        expect(result.orderedXI).toContain(player)
      }
    })
  })
})
