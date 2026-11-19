import { JOBS, SPECIAL_ORDERS, type Job, type SpecialOrder } from './suttons'
import { FORECAST_TYPES, nextTentative } from './forecast'

/* ── Estimating → scheduling handoff ───────────────────────────────────────
 * Today (23 Oct call): the estimator types $0.01 into Estimated Cost to say
 * "paperwork's in", Brie keys the real cost into QuickBooks and the sheet, and
 * Zoe only knows a job is ready when that cell stops being a penny. Then she
 * checks Special Order Materials by hand for lead times.
 *
 * In Merlin the estimate being completed IS the signal. These stages are
 * derived from the same Job Status columns.
 */
export type Stage = 'costing' | 'ready' | 'plugged'
export const STAGE_LABEL: Record<Stage, string> = {
  costing: 'Costing in progress',
  ready: 'Ready to schedule',
  plugged: 'Scheduled',
}

/** A placeholder counts as done — that's what the estimator means by it. */
export const stageOf = (j: Job): Stage =>
  !j.estCost && !j.costPlaceholder ? 'costing' : j.estStart ? 'plugged' : 'ready'

export const ordersFor = (jobNo: string): SpecialOrder[] =>
  SPECIAL_ORDERS.filter(s => s.jobNo === jobNo)

/** Special orders are "here" once they're sitting at our warehouse or the vendor's. */
export const isHere = (s: SpecialOrder) =>
  /Ready at|Delivered|Picked Up/i.test(s.status)

/** Earliest start = the later of the trade's next tentative date and the last special-order ETA. */
export function earliestStart(j: Job, today = new Date()) {
  const jns = JOBS.filter(x => x.bucket === 'JNS')
  const types = FORECAST_TYPES.filter(t => (j.jobType ?? '').includes(t.type))
  let best = today
  for (const t of types) {
    const count = jns.filter(x => (x.jobType ?? '').includes(t.type)).length
    const { date } = nextTentative(today, count / t.perWeek, t.blackout)
    if (date > best) best = date
  }
  const pending = ordersFor(j.jobNo).filter(s => !isHere(s) && s.expected)
  const eta = pending.reduce<Date | null>((m, s) => {
    const e = new Date(s.expected)
    return !m || e > m ? e : m
  }, null)
  const etaGates = !!eta && eta > best
  return { date: etaGates ? eta! : best, by: etaGates ? 'special order ETA' : 'crew backlog' }
}

/** Job Status "Job Type" → the Future Forecast trade bands (crews) that do the work. */
const BAND_FOR: [RegExp, string][] = [
  [/Roofing/, 'ROOFING'], [/Siding/, 'SIDING'], [/Windows|Doors|Skylights/, 'WINDOWS / DOORS'],
  [/Gutters/, 'GUTTERS'], [/Deck|Patio|Screen Room/, 'DECKS / SUNROOMS'],
  [/Bathroom|Kitchen|Basement|Remodeling|Design Build/, 'REMODELING CARPENTERS'],
  [/Drywall/, 'DRYWALL/PAINT'], [/Service|Temp|AOB/, 'SERVICE TEAM'],
]
export const bandsFor = (jobType: string) => [...new Set(BAND_FOR.filter(([re]) => re.test(jobType)).map(([, b]) => b))]

/** `yyyy-MM-dd` the job's last special order still on its way is due, or null when nothing is pending. */
export const specialOrdersDue = (jobNo: string): string | null =>
  ordersFor(jobNo).filter(s => !isHere(s) && s.expected)
    .reduce<string | null>((m, s) => (!m || s.expected > m ? s.expected : m), null)

export const READY = JOBS.filter(j => j.bucket === 'JNS' && stageOf(j) === 'ready')
export const COSTING = JOBS.filter(j => j.bucket === 'JNS' && stageOf(j) === 'costing')
export const PLUGGED = JOBS.filter(j => j.bucket === 'JNS' && stageOf(j) === 'plugged')
