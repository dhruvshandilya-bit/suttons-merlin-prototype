import React, { createContext, useContext, useMemo, useState } from 'react'
import { LANES, FF_DAYS, SPECIAL_ORDERS, COUNTERS } from '../data/suttons'

export type Status = 'TENTATIVE' | 'CUSTOMER_CONFIRMED' | 'LOCKED'
export type Assign = {
  id: string; laneId: string; day: number; raw: string
  job: string | null; name: string; pm: string | null
  phases: string[]; tags: string[]; status: Status; unavailable: boolean
}

import { parseCell } from '../lib/util'

/** Seed assignments from the real Future Forecast grid. */
function seed(): Assign[] {
  const out: Assign[] = []
  LANES.forEach(lane =>
    lane.cells.forEach((cell, day) => {
      if (!cell) return
      // a cell can hold two jobs separated by "/"
      const parts = cell.split(' / ').filter(p => p.trim())
      parts.forEach((p, k) => {
        const c = parseCell(p)
        out.push({
          id: `${lane.id}-${day}-${k}`, laneId: lane.id, day, raw: p.trim(),
          job: c.job, name: c.name || p.trim().slice(0, 26), pm: c.pm ?? lane.defaultPMs[0] ?? null,
          phases: c.phases, tags: c.tags,
          status: c.unavailable ? 'TENTATIVE' : k === 0 ? 'LOCKED' : 'CUSTOMER_CONFIRMED',
          unavailable: c.unavailable,
        })
      })
    }),
  )
  return out
}

export type RippleStep = { id: string; name: string; from: number; to: number }

type Ctx = {
  assigns: Assign[]
  days: typeof FF_DAYS
  move: (id: string, toDay: number) => void
  preview: (id: string, toDay: number) => RippleStep[]
  setStatus: (id: string, s: Status) => void
  rippleOn: boolean
  setRippleOn: (b: boolean) => void
  lastRipple: RippleStep[] | null
  clearRipple: () => void
  poCounter: number
  bumpPo: () => number
}
const C = createContext<Ctx>(null as any)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: any) {
  const [assigns, setAssigns] = useState<Assign[]>(seed)
  const [rippleOn, setRippleOn] = useState(true)
  const [lastRipple, setLastRipple] = useState<RippleStep[] | null>(null)
  const [poCounter, setPo] = useState(COUNTERS.po)

  /** Sutton's rule: shifting a job pushes only THAT CREW's later jobs by the same amount. */
  function computeRipple(list: Assign[], id: string, toDay: number): RippleStep[] {
    const a = list.find(x => x.id === id)
    if (!a) return []
    const delta = toDay - a.day
    const steps: RippleStep[] = [{ id: a.id, name: a.name, from: a.day, to: toDay }]
    if (!rippleOn || delta <= 0) return steps
    list
      .filter(x => x.laneId === a.laneId && x.id !== a.id && x.day > a.day && !x.unavailable)
      .sort((x, y) => x.day - y.day)
      .forEach(x => steps.push({ id: x.id, name: x.name, from: x.day, to: Math.min(x.day + delta, FF_DAYS.length - 1) }))
    return steps
  }

  const value: Ctx = {
    assigns, days: FF_DAYS, rippleOn, setRippleOn, lastRipple,
    clearRipple: () => setLastRipple(null),
    poCounter,
    bumpPo: () => { const n = poCounter + 1; setPo(n); return n },
    preview: (id, toDay) => computeRipple(assigns, id, toDay),
    move: (id, toDay) => {
      setAssigns(prev => {
        const steps = computeRipple(prev, id, toDay)
        const map = new Map(steps.map(s => [s.id, s.to]))
        setLastRipple(steps.length > 1 ? steps : null)
        return prev.map(a => (map.has(a.id) ? { ...a, day: map.get(a.id)! } : a))
      })
    },
    setStatus: (id, s) => setAssigns(prev => prev.map(a => (a.id === id ? { ...a, status: s } : a))),
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
