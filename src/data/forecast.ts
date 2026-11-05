import { JOBS, LANES } from './suttons'
import { parseCell } from '../lib/util'

/* ── Project Forecasting — Job Status → `Project Forecasting` tab ──────────
 * The tab Zoe sends company-wide at the start of every month. Per the 23 Oct
 * call it does not get a screen: Ask AI answers it on demand, using the same
 * three inputs the sheet uses.
 *
 *   Weeks out          = jobs of that type in JNS ÷ jobs completed per week
 *   Next tentative date = TODAY() + weeks out × 7, pushed past the seasonal blackout
 *
 * `perWeek` is the far-right column Zoe re-sets every month from the crews she
 * has. Rates, notes, blackouts and goals are read from the sheet (no PII).
 */
export type ForecastType = {
  type: string; perWeek: number; note?: string
  blackout?: { start: string; end: string; label: string }
}

const BEST_GUESS = 'Best guess only, not a final verdict.'
export const FORECAST_TYPES: ForecastType[] = [
  { type: 'AOB', perWeek: 20 },
  { type: 'Temp / Emergency', perWeek: 8 },
  { type: 'Service (<$5K)', perWeek: 3.5, note: 'Contact scheduling directly for emergencies.' },
  { type: 'Roofing', perWeek: 10, note: BEST_GUESS, blackout: { start: '2026-11-26', end: '2027-03-15', label: 'roofing blackout' } },
  { type: 'Siding', perWeek: 5, note: BEST_GUESS, blackout: { start: '2026-12-15', end: '2027-02-01', label: 'siding slowdown' } },
  { type: 'Doors (Exterior)', perWeek: 6 },
  { type: 'Windows', perWeek: 6 },
  { type: 'Gutters', perWeek: 8, note: BEST_GUESS, blackout: { start: '2026-12-15', end: '2027-02-01', label: 'gutter slowdown' } },
  { type: 'Deck', perWeek: 1, note: BEST_GUESS, blackout: { start: '2026-12-15', end: '2027-02-01', label: 'deck slowdown' } },
  { type: 'Patio / Porch', perWeek: 0.33, note: BEST_GUESS, blackout: { start: '2026-12-15', end: '2027-02-01', label: 'patio/porch slowdown' } },
  { type: 'Screen Room / Sun Room', perWeek: 0.25, note: BEST_GUESS, blackout: { start: '2026-12-15', end: '2027-02-01', label: 'sunroom slowdown' } },
  { type: 'Basement', perWeek: 0.25 },
  { type: 'Bathroom', perWeek: 0.33 },
  { type: 'Kitchen', perWeek: 0.25 },
  { type: 'Drywall / Painting', perWeek: 1 },
  { type: 'Other Remodeling', perWeek: 1.5 },
]

export const PIPELINE_GOALS: { label: string; bucket: string[]; goal?: number }[] = [
  { label: 'Punchlists / Callbacks', bucket: ['Punchlist', 'Callback'], goal: 20 },
  { label: 'Jobs in progress', bucket: ['WIP'], goal: 40 },
  { label: 'Jobs in A/R', bucket: ['AR'], goal: 30 },
  { label: 'Jobs in Legal', bucket: ['Legal'] },
]

/** Printed under the table on the monthly email — verbatim from the tab. */
export const SCHEDULING_FACTORS = [
  'Missing paperwork or unclear workscopes — #1 cause of delays, by far',
  'Multi-phase projects are coordinated together unless a portion is an emergency',
  'Project zoning — zoned projects are coordinated together',
  'Job costing delays (complexity, size, remeasure dates)',
  'Changes in labour workforce, carpenter vacations and sick days',
  'Special order products — still a major disconnect between what is promised and what is possible',
  'Weather (rain / wind / cold)',
  'Open punchlists and callbacks',
  'Emergencies',
  'Current WIP change orders or outstanding WIP projects',
  'A cluster of new sales, or a new sale of a large project',
]

const DAY = 86_400_000
const d = (iso: string) => new Date(`${iso}T00:00:00`)

/** The sheet's own IF(AND(…)) blackout formula, line for line. */
export function nextTentative(today: Date, weeksOut: number, b?: ForecastType['blackout']) {
  const plain = new Date(+today + weeksOut * 7 * DAY)
  if (!b) return { date: plain, shifted: false }
  const s = d(b.start), e = d(b.end)
  if (today <= s && plain > s) return { date: new Date(+plain + (+e - +s)), shifted: true }
  if (today >= s && today < e) return { date: new Date(+e + weeksOut * 7 * DAY), shifted: true }
  return { date: plain, shifted: false }
}

export type ForecastRow = ForecastType & { count: number; weeksOut: number; next: Date; shifted: boolean }

/** COUNTIFS(JNS[Job Type], "*"&type&"*") — a multi-trade job counts once per trade. */
export function projectForecast(today = new Date(), rates: Record<string, number> = {}): ForecastRow[] {
  const jns = JOBS.filter(j => j.bucket === 'JNS')
  return FORECAST_TYPES.map(t => {
    const perWeek = rates[t.type] ?? t.perWeek
    const count = jns.filter(j => (j.jobType ?? '').includes(t.type)).length
    const weeksOut = perWeek ? count / perWeek : 0
    const { date, shifted } = nextTentative(today, weeksOut, t.blackout)
    return { ...t, perWeek, count, weeksOut, next: date, shifted }
  })
}

export const pipelineCounts = () =>
  PIPELINE_GOALS.map(g => ({ ...g, count: JOBS.filter(j => g.bucket.includes(j.bucket)).length }))

export const costingCounts = () => {
  const jns = JOBS.filter(j => j.bucket === 'JNS')
  // COUNTA(JNS[Estimated Cost]) — a $0.01 or initials placeholder counts, as on the tab
  const costed = jns.filter(j => j.estCost || j.costPlaceholder).length
  return { total: jns.length, costed, inProgress: jns.length - costed }
}

/* ── Attendance + weather — the "called in / Vacation Day / cold day" cells ──
 * Future Forecast doubles as the production attendance log. These are the real
 * cells from the loaded fortnight. In Merlin they come from the crew section of
 * each day's daily report, not from someone typing into the board.
 */
export type AttendanceKind = 'called in' | 'vacation' | 'weather' | 'season'
export const attendanceKind = (raw: string): AttendanceKind | null => {
  if (/called in|sick/i.test(raw)) return 'called in'
  if (/vacation|pto|\boff\b/i.test(raw)) return 'vacation'
  if (/cold day|rain|snow|wind/i.test(raw)) return 'weather'
  if (/SZN DNE/i.test(raw)) return 'season'
  return null
}

export const ATTENDANCE = (() => {
  const out: { lane: string; band: string; day: number; kind: AttendanceKind; raw: string }[] = []
  LANES.forEach(l => l.cells.forEach((c, day) => {
    if (!c) return
    const k = attendanceKind(c)
    if (k && !parseCell(c).job) out.push({ lane: l.name, band: l.band, day, kind: k, raw: c })
  }))
  return out
})()
