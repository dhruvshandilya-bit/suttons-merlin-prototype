import { OPS_ROWS, OPS_LOGISTICS, SPECIAL_ORDERS, JOBS, type SpecialOrder } from './suttons'
import { parseCell } from '../lib/util'

/* ── Daily Logs — what replaces typing into Operations Master ──────────────
 * 23 Oct call: PMs fill in their own day plan on Operations Master, but the
 * "Work in progress — next steps" block never gets filled in (notes go into
 * MarketSharp instead), and site photos live in CompanyCam
 * with no written rule for what to shoot. So each job on the day board gets
 * Merlin's Morning and Evening site reports, pre-filled with what Merlin
 * already knows — which deliveries are due (from the POs), who's booked (from
 * the schedule) — and Combined Daily Logs roll the answers up for the day.
 */

/**
 * Zoe's photo rules, written down for the first time. Each one is a required
 * image field on a site report (or a Photo Required step on the work order),
 * and every photo lands in the project's Before & After gallery.
 */
export type SiteReport = 'morning' | 'evening'
export type PhotoRule = {
  key: string; label: string; when: string; report: SiteReport | 'work order'
  required: 'always' | 'first day' | 'when it applies'
}
export const PHOTO_RULES: PhotoRule[] = [
  { key: 'damage', label: 'Pre-existing damage', when: 'Before the job starts — so a cracked driveway is on record as theirs', report: 'morning', required: 'first day' },
  { key: 'start', label: 'Before work starts', when: 'Every day, on arrival', report: 'morning', required: 'always' },
  { key: 'covered', label: 'Before it gets covered', when: 'e.g. open walls before the drywall goes back up', report: 'work order', required: 'when it applies' },
  { key: 'end', label: 'End of day', when: 'Every day, before leaving', report: 'evening', required: 'always' },
]
export const DUE: Record<SiteReport, string> = { morning: '10:00', evening: '18:00' }
export const DAMAGE_PROMPTS = ['Driveway / walkway', 'Siding & trim', 'Landscaping', 'Gutters', 'Windows', 'Interior finishes']

export type DayJob = {
  jobNo: string; name: string; customer: string | null; pm: string | null
  phases: string[]; crew: string[]; starts: boolean; tags: string[]
  deliveries: { key: string; text: string; source: 'po' | 'warehouse' }[]
}

const orderKey = (s: SpecialOrder, i: number) => `${s.po ?? 'x'}-${i}`

/** Every job with a crew on it on the day board, merged across the crew rows. */
export const DAY_JOBS: DayJob[] = (() => {
  const m = new Map<string, DayJob>()
  OPS_ROWS.forEach(r => {
    if (!r.planA) return
    const c = parseCell(r.planA)
    if (!c.job) return
    const j = m.get(c.job) ?? {
      jobNo: c.job, name: c.name, pm: c.pm, phases: [], crew: [], starts: false, tags: [], deliveries: [],
      customer: JOBS.find(x => x.jobNo === c.job)?.customer ?? null,
    }
    j.crew.push(r.resource)
    j.phases = [...new Set([...j.phases, ...c.phases])]
    j.tags = [...new Set([...j.tags, ...c.tags])]
    if (r.starts) j.starts = true
    m.set(c.job, j)
  })
  const all = [...OPS_LOGISTICS.deliveries, ...OPS_LOGISTICS.pickups]
  m.forEach(j => {
    const digits = j.jobNo.replace('-', '')
    all.forEach((t, i) => {
      if (t.replace(/[\s-]/g, '').includes(digits)) j.deliveries.push({ key: `w-${i}`, text: t, source: 'warehouse' })
    })
    SPECIAL_ORDERS.forEach((s, i) => {
      if (s.jobNo === j.jobNo && /Jobsite/i.test(s.deliverTo ?? ''))
        j.deliveries.push({ key: orderKey(s, i), text: `${s.vendor} · ${s.description} · PO-SUT-${s.po ?? '—'}`, source: 'po' })
    })
  })
  return [...m.values()]
})()

export const requiredPhotos = (j: DayJob, report?: SiteReport) =>
  PHOTO_RULES.filter(p => (p.required === 'always' || (p.required === 'first day' && j.starts)) && (!report || p.report === report))
