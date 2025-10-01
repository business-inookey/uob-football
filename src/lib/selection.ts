export type Formation = { gk: number; def: number; mid: number; wng: number; st: number }

export type PlayerRow = {
  id: string
  full_name: string
  primary_position: 'GK'|'DEF'|'MID'|'WNG'|'ST'
  // Composite score computed for team context (0..1 typical)
  composite: number
  // Tie-breaker stat (higher is better). If missing, treat as 0
  speed?: number
}

export type BestXIResult = {
  gk: PlayerRow[]
  def: PlayerRow[]
  mid: PlayerRow[]
  wng: PlayerRow[]
  st: PlayerRow[]
  orderedXI: PlayerRow[]
}

function positionKey(pos: string): keyof BestXIResult {
  switch (pos) {
    case 'GK': return 'gk'
    case 'DEF': return 'def'
    case 'MID': return 'mid'
    case 'WNG': return 'wng'
    case 'ST': return 'st'
    default: return 'mid'
  }
}

function takeTop(players: PlayerRow[], count: number): PlayerRow[] {
  if (count <= 0) return []
  return players
    .slice()
    .sort((a, b) => {
      // Primary: composite desc
      if (b.composite !== a.composite) return b.composite - a.composite
      // Tie-breaker: speed desc, missing -> 0
      const sa = a.speed ?? 0
      const sb = b.speed ?? 0
      if (sb !== sa) return sb - sa
      // Stable final: name asc for determinism
      return a.full_name.localeCompare(b.full_name)
    })
    .slice(0, Math.max(0, count))
}

export function bestXI(players: PlayerRow[], formation: Formation): BestXIResult {
  console.log('bestXI called with:', { playerCount: players.length, formation })
  
  const byPos: Record<'GK'|'DEF'|'MID'|'WNG'|'ST', PlayerRow[]> = {
    GK: [], DEF: [], MID: [], WNG: [], ST: []
  }
  for (const p of players) {
    const key = (['GK','DEF','MID','WNG','ST'] as const).includes(p.primary_position as any)
      ? p.primary_position as 'GK'|'DEF'|'MID'|'WNG'|'ST'
      : 'MID'
    byPos[key].push(p)
  }
  
  console.log('Players by position:', {
    GK: byPos.GK.length,
    DEF: byPos.DEF.length,
    MID: byPos.MID.length,
    WNG: byPos.WNG.length,
    ST: byPos.ST.length
  })

  let gk = takeTop(byPos.GK, formation.gk)
  let def = takeTop(byPos.DEF, formation.def)
  let mid = takeTop(byPos.MID, formation.mid)
  let wng = takeTop(byPos.WNG, formation.wng)
  let st = takeTop(byPos.ST, formation.st)

  // Fill shortages per position with nearest alternative roles
  const selectedIds = new Set<string>([...gk, ...def, ...mid, ...wng, ...st].map(p => p.id))
  const sortedAll = players
    .slice()
    .filter(p => !selectedIds.has(p.id))
    .sort((a, b) => {
      if (b.composite !== a.composite) return b.composite - a.composite
      const sa = a.speed ?? 0
      const sb = b.speed ?? 0
      if (sb !== sa) return sb - sa
      return a.full_name.localeCompare(b.full_name)
    })

  function fill(bucket: PlayerRow[], needed: number, prefs: Array<'GK'|'DEF'|'MID'|'WNG'|'ST'>) {
    if (needed <= 0) return bucket
    // Try preferred positions first
    for (const pref of prefs) {
      if (bucket.length >= needed) break
      for (const cand of byPos[pref]) {
        if (bucket.length >= needed) break
        if (selectedIds.has(cand.id)) continue
        bucket.push(cand)
        selectedIds.add(cand.id)
      }
    }
    // Fallback: take from global best remaining
    let i = 0
    while (bucket.length < needed && i < sortedAll.length) {
      const cand = sortedAll[i++]
      if (selectedIds.has(cand.id)) continue
      bucket.push(cand)
      selectedIds.add(cand.id)
    }
    return bucket
  }

  // Define substitution preferences per role
  gk = fill(gk, formation.gk, ['GK', 'DEF'])
  def = fill(def, formation.def, ['DEF', 'MID', 'WNG'])
  mid = fill(mid, formation.mid, ['MID', 'WNG', 'DEF'])
  wng = fill(wng, formation.wng, ['WNG', 'MID', 'ST'])
  st  = fill(st,  formation.st,  ['ST', 'WNG', 'MID'])

  const orderedXI = [...gk, ...def, ...mid, ...wng, ...st]

  console.log('Selection result:', {
    gk: gk.length,
    def: def.length, 
    mid: mid.length,
    wng: wng.length,
    st: st.length,
    total: orderedXI.length,
    expected: formation.gk + formation.def + formation.mid + formation.wng + formation.st
  })

  return { gk, def, mid, wng, st, orderedXI }
}


