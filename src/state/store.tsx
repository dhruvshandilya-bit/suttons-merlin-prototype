import React, { createContext, useContext, useState } from 'react'
import { LANES, FF_DAYS, COUNTERS, OPS_LOGISTICS, JOBS } from '../data/suttons'
import { READY, ordersFor } from '../data/handoff'

export type Status = 'TENTATIVE' | 'CUSTOMER_CONFIRMED' | 'LOCKED'
export type Assign = {
  id: string; laneId: string; day: number; raw: string
  job: string | null; name: string; pm: string | null
  phases: string[]; tags: string[]; status: Status; unavailable: boolean
}

import { parseCell, surname } from '../lib/util'

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

/* ── Notifications — what Merlin sends instead of the $0.01 and the email to Brie ── */
export type Notif = { id: string; at: string; title: string; body: string; to: string; jobNo?: string; read: boolean }
const seedNotifs = (): Notif[] =>
  READY.slice(0, 6).map((j, i) => {
    const so = ordersFor(j.jobNo)
    return {
      id: `n-${j.jobNo}`, at: i === 0 ? '2 min ago' : `${i * 3 + 1} h ago`, to: 'Scheduling · Brianne D., Zoe P.',
      title: `${surname(j.customer)} ${j.jobNo} is ready to schedule`,
      body: `Costing complete by ${j.estimator ?? 'estimating'} · ${j.jobType}` +
        (so.length ? ` · ${so.length} special order${so.length > 1 ? 's' : ''} (${[...new Set(so.map(s => s.vendor))].join(', ')})` : ' · no special orders'),
      jobNo: j.jobNo, read: i > 2,
    }
  })

/* ── Warehouse run — the bottom of Operations Master, as a dispatch list ── */
export type RunItem = { id: string; kind: 'delivery' | 'pickup'; text: string; driver: string | null; done: boolean }
export const DRIVERS = ['Delivery driver', 'Warehouse — Shop truck', 'PM to deliver']
const seedRun = (): RunItem[] => [
  ...OPS_LOGISTICS.deliveries.map((t, i) => ({ id: `d${i}`, kind: 'delivery' as const, text: t, driver: i === 0 ? DRIVERS[0] : null, done: false })),
  ...OPS_LOGISTICS.pickups.map((t, i) => ({ id: `p${i}`, kind: 'pickup' as const, text: t, driver: null, done: false })),
]

/* ── Daily Logs state, per job, for the day on the board ───────────────
 * Two site reports a day, as Merlin ships them: Morning (due 10:00) and
 * Evening (due 18:00). Sutton's photo rules would ride on them as required fields (proposed:
 * Merlin can't yet pick an org's report template).
 */
export type Attendance = 'on site' | 'called in' | 'off'
/** As the app's new Daily Log records a delivery that was due: received, part received, or missed. */
export type Delivery = 'received' | 'received some' | 'missed'
export type Report = {
  crew: Record<string, Attendance>
  impact: string
  received: Record<string, Delivery>
  photos: Record<string, number>
  notes: string
  morning: boolean
  evening: boolean
}
export const emptyReport = (): Report => ({ crew: {}, impact: 'None', received: {}, photos: {}, notes: '', morning: false, evening: false })

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
  // handoff
  plugged: Record<string, string>
  plugIn: (jobNo: string, laneId: string, day: number) => void
  deliveryReq: Record<string, string>
  requestDelivery: (key: string, when: string) => void
  notifs: Notif[]
  readAll: () => void
  // day board
  run: RunItem[]
  moveRun: (id: string, dir: -1 | 1) => void
  setDriver: (id: string, d: string) => void
  toggleRun: (id: string) => void
  // daily reports
  reports: Record<string, Report>
  updateReport: (jobNo: string, fn: (r: Report) => Report) => void
  // navigation — the shell reads these so any screen can deep-link (e.g. "Daily logs" next to a job)
  route: { mod: string; tab: string }
  goTo: (mod: string, tab: string) => void
  /** Operations dashboard view, as Merlin's `/operations/dashboard?view=` */
  opsView: OpsView
  setOpsView: (v: OpsView) => void
  calView: 'week' | 'day'
  setCalView: (v: 'week' | 'day') => void
  /** Index into FF_DAYS for the Calendar's Day view. */
  calDay: number
  setCalDay: (d: number) => void
  /** Open the Operations dashboard on a day's board, with the "Add work to this day" tray open. */
  openTray: (day?: number) => void
  trayOpen: boolean
  setTrayOpen: (b: boolean) => void
  /** Jobs → Daily Logs, opened on one job when it is on the day's board. */
  dailyLogJob: string | null
  openDailyLog: (jobNo: string | null) => void
}
export type OpsView = 'today' | 'schedule' | 'calendar'
const C = createContext<Ctx>(null as any)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: any) {
  const [assigns, setAssigns] = useState<Assign[]>(seed)
  const [rippleOn, setRippleOn] = useState(true)
  const [lastRipple, setLastRipple] = useState<RippleStep[] | null>(null)
  const [poCounter, setPo] = useState(COUNTERS.po)
  const [plugged, setPlugged] = useState<Record<string, string>>({})
  const [deliveryReq, setDeliveryReq] = useState<Record<string, string>>({})
  const [notifs, setNotifs] = useState<Notif[]>(seedNotifs)
  const [run, setRun] = useState<RunItem[]>(seedRun)
  const [reports, setReports] = useState<Record<string, Report>>({})
  const [route, setRoute] = useState({ mod: 'operations', tab: 'Dashboard' })
  const [opsView, setOpsView] = useState<OpsView>('calendar')
  const [calView, setCalView] = useState<'week' | 'day'>('day')
  // Open the calendar on the fortnight's busiest day.
  const [calDay, setCalDay] = useState(() => {
    const counts = FF_DAYS.map((_, d) => assigns.filter(a => a.day === d && !a.unavailable).length)
    return counts.indexOf(Math.max(...counts))
  })
  const [trayOpen, setTrayOpen] = useState(false)
  const [dailyLogJob, setDailyLogJob] = useState<string | null>(null)

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

    plugged,
    plugIn: (jobNo, laneId, day) => {
      const j = JOBS.find(x => x.jobNo === jobNo)
      const lane = LANES.find(l => l.id === laneId)
      if (!j || !lane) return
      const phases = parseCell(j.jobType.replace(/Roofing/g, 'RFG').replace(/Siding/g, 'SDG').replace(/Windows/g, 'WND')
        .replace(/Doors \(Exterior\)/g, 'DRE').replace(/Gutters/g, 'GUT').replace(/Deck/g, 'DCK')).phases
      setAssigns(prev => [...prev, {
        id: `new-${jobNo}`, laneId, day, raw: `${surname(j.customer)} ${jobNo}`,
        job: jobNo, name: surname(j.customer), pm: lane.defaultPMs[0] ?? null,
        phases, tags: ['new'], status: 'TENTATIVE', unavailable: false,
      }])
      setPlugged(p => ({ ...p, [jobNo]: `${lane.name} · ${FF_DAYS[day]?.label} ${FF_DAYS[day]?.date.slice(5)}` }))
      setNotifs(n => n.map(x => (x.jobNo === jobNo ? { ...x, read: true } : x)))
    },
    deliveryReq,
    requestDelivery: (key, when) => setDeliveryReq(r => ({ ...r, [key]: when })),
    notifs,
    readAll: () => setNotifs(n => n.map(x => ({ ...x, read: true }))),

    run,
    moveRun: (id, dir) => setRun(prev => {
      const i = prev.findIndex(x => x.id === id), j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev];[next[i], next[j]] = [next[j], next[i]]
      return next
    }),
    setDriver: (id, d) => setRun(prev => prev.map(x => (x.id === id ? { ...x, driver: d } : x))),
    toggleRun: (id) => setRun(prev => prev.map(x => (x.id === id ? { ...x, done: !x.done } : x))),

    reports,
    updateReport: (jobNo, fn) => setReports(r => ({ ...r, [jobNo]: fn(r[jobNo] ?? emptyReport()) })),

    route,
    goTo: (mod, tab) => setRoute({ mod, tab }),
    opsView, setOpsView,
    calView, setCalView,
    calDay, setCalDay,
    trayOpen, setTrayOpen,
    openTray: (day) => {
      if (day != null) setCalDay(day)
      setOpsView('calendar'); setCalView('day'); setTrayOpen(true)
      setRoute({ mod: 'operations', tab: 'Dashboard' })
    },
    dailyLogJob,
    openDailyLog: (jobNo) => {
      setDailyLogJob(jobNo)
      if (jobNo) setRoute({ mod: 'jobs', tab: 'Daily Logs' })
    },
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
