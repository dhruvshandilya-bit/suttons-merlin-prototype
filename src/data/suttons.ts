import raw from './suttons-raw.json'
import { parseCell } from '../lib/util'

export const RULES = raw.rules as Record<string, number>
/** The source lists end with a count cell — drop any pure-number entry. */
const noCount = (v: string) => v && !/^\d+$/.test(v.trim())

export const PHASES = (raw.phases as { code: string; name: string }[]).filter(p => noCount(p.code))
export const VENDORS = (raw.vendors as string[]).filter(noCount)
export const SUBS = (raw.subs as string[]).filter(noCount)
export const PEOPLE = (() => {
  const seen = new Set<string>()
  return (raw.people as { name: string; email: string }[]).filter(p => {
    if (!p.email || seen.has(p.email)) return false
    seen.add(p.email); return true
  })
})()
export const ESTIMATORS = raw.estimators as string[]
export const SALES_REPS = raw.salesReps as string[]
export const SCHEDULE_TYPES = raw.scheduleTypes as string[]
export const RATE_CARDS = raw.rateCards as RateCard[]

export type RateCard = {
  tab: string; trade: string; crews: string[]
  items: { group: string; name: string; unit: string; rates: (number | null)[] }[]
}

export type Job = {
  serviceType: string; customer: string; jobNo: string; jobType: string
  sales: string; estimator: string; contractDate: string; contract: number
  balance: number; dateEstimated: string | null; estCost: number | null
  estGP: number | null; estStart: string | null; so: string | null
  notes: string | null; pm: string | null; zone: string | null
  permit: string | null; payments: string | null; financing: string | null
  bucket: Bucket
}
export type Bucket = 'JNS' | 'WIP' | 'AR' | 'Callback' | 'Punchlist' | 'Legal' | 'Cancelled' | 'Closed'

const toJob = (r: any, bucket: Bucket): Job => ({
  serviceType: r['Service Type'], customer: r['Customer'], jobNo: r['Job #'],
  jobType: r['Job Type'], sales: r['Sales'], estimator: r['Estimator'],
  contractDate: r['Contract Date'], contract: r['Contract$'] ?? 0, balance: r['Balance Due'] ?? 0,
  dateEstimated: r['Date Estimated'] ?? null, estCost: r['Estimated Cost'] ?? null,
  estGP: r['Estimated GP'] ?? null, estStart: r['Estimated Start Date'] ?? null,
  so: r['S.O. Items Y/N'] ?? null, notes: r['Notes'] ?? null,
  pm: r['Project Manager'] ?? null, zone: r['Zone'] ?? null, permit: r['Permit Status'] ?? null,
  payments: r['Start / Progress Payments'] ?? null, financing: r['Financing Info'] ?? null,
  bucket,
})

const extra = (raw as any).extraBuckets ?? {}
export const JOBS: Job[] = [
  ...(raw.jns as any[]).map(r => toJob(r, 'JNS')),
  ...(raw.wip as any[]).map(r => toJob(r, 'WIP')),
  ...(raw.ar as any[]).map(r => toJob(r, 'AR')),
  ...((extra.Callback ?? []) as any[]).map(r => toJob(r, 'Callback')),
  ...((extra.Punchlist ?? []) as any[]).map(r => toJob(r, 'Punchlist')),
  ...((extra.Legal ?? []) as any[]).map(r => toJob(r, 'Legal')),
  ...((extra.Cancelled ?? []) as any[]).map(r => toJob(r, 'Cancelled')),
  ...((extra.Closed ?? []) as any[]).map(r => toJob(r, 'Closed')),
].filter(j => j.jobNo)

export type SpecialOrder = {
  jobName: string; jobNo: string; phase: string; vendor: string; description: string
  orderedBy: string; orderDate: string; expected: string; deliverTo: string
  status: string; po: number | null; received: string | null; verified: boolean
}
export const SPECIAL_ORDERS: SpecialOrder[] = (raw.specialOrders as any[]).map(r => ({
  jobName: r['Job Name'], jobNo: r['Job #'], phase: r['Phase'], vendor: r['Vendor'],
  description: r['Material(s)/Description'], orderedBy: r['Ordered By'],
  orderDate: r['Order Date'], expected: r['Expected Date'], deliverTo: r['Deliver To'],
  status: r['Status'] ?? 'Ordered', po: typeof r['PO Number'] === 'number' ? r['PO Number'] : null,
  received: r['Received Date'] ?? null, verified: !!r['Order Verified'],
})).filter(s => s.jobNo)

/* ── Future Forecast → crew lanes ─────────────────────────────────────── */
const CREW_RE = /\(([A-Z]{2})\)/g
export type Lane = {
  id: string; band: string; label: string; name: string
  defaultPMs: string[]; isSub: boolean; isLead: boolean
  cells: (string | null)[]
}
const ffGrid = raw.ffGrid as (string | null)[][]
export const FF_DAYS: { label: string; date: string }[] = (() => {
  const names = ffGrid[1] ?? [], dates = ffGrid[2] ?? []
  const out: { label: string; date: string }[] = []
  for (let c = 1; c < 12; c++) if (names[c]) out.push({ label: String(names[c]), date: String(dates[c] ?? '') })
  return out
})()

/** The real trade bands on Future Forecast — anything else on col A is a resource lane. */
const BANDS = new Set([
  'ROOFING', 'SIDING', 'WINDOWS / DOORS', 'SERVICE TEAM', 'GUTTERS', 'DECKS / SUNROOMS',
  'REMODELING CARPENTERS', 'DRYWALL/PAINT', 'SPECIALTY TRADES', 'FLOORING', 'COUNTERTOPS',
  'RESTORATION/CLEANING', 'CONCRETE', 'FENCING',
])

export const LANES: Lane[] = (() => {
  const out: Lane[] = []
  let band = 'ROOFING'
  for (let r = 4; r < ffGrid.length; r++) {
    const a = ffGrid[r]?.[0]
    if (!a) continue
    const label = String(a).trim()
    const cells = ffGrid[r].slice(1, 12).map(v => (v ? String(v) : null))
    if (BANDS.has(label.toUpperCase())) { band = label.toUpperCase(); continue }
    if (/^PM VACATION/i.test(label)) continue
    const pms = [...label.matchAll(CREW_RE)].map(m => m[1])
    out.push({
      id: `lane-${r}`, band, label,
      name: label.replace(CREW_RE, '').replace(/LEAD/i, '').replace(/\*/g, '').trim(),
      defaultPMs: pms, isSub: label.includes('*'), isLead: /LEAD/i.test(label), cells,
    })
  }
  return out
})()

export const PM_VACATION: (string | null)[] = (ffGrid[3] ?? []).slice(1, 12).map(v => (v ? String(v) : null))

/* ── Operations Master day board ──────────────────────────────────────── */
const ops = raw.opsDay as (string | null)[][]
export const OPS_PM_COLUMNS = (ops[0] ?? []).slice(8, 15)
  .map(h => (h ? String(h).replace(': JOB SITE(S)', '').trim() : ''))
  .filter(Boolean)

export type OpsRow = { band: string; resource: string; start: string | null; planA: string | null; planB: string | null; starts: string | null }
export const OPS_ROWS: OpsRow[] = (() => {
  const out: OpsRow[] = []; let band = ''
  for (let r = 1; r < ops.length; r++) {
    const row = ops[r] ?? []
    if (row[0] && !row[3]) { band = String(row[0]); continue }
    if (/CARPENTER PICK-UPS|VENDOR DELIVERIES|SUTTON'S TRAILERS|ALL EQUIPMENT/i.test(String(row[0] ?? ''))) break
    if (!row[3]) continue
    out.push({
      band, resource: String(row[3]).trim(),
      start: row[4] ? String(row[4]).slice(0, 5) : null,
      planA: row[5] ? String(row[5]) : null,
      planB: row[6] ? String(row[6]) : null,
      starts: row[1] ? String(row[1]) : null,
    })
  }
  return out
})()

export const OPS_PM_LANES = OPS_PM_COLUMNS.map((name, i) => ({
  name,
  items: ops.slice(1, 12).map(row => row[8 + i]).filter(Boolean).map(v => String(v)),
}))

export const OPS_LOGISTICS = (() => {
  const pickups: string[] = [], deliveries: string[] = [], trailers: { name: string; at: string }[] = []
  let section = ''
  for (let r = 45; r < ops.length; r++) {
    const row = ops[r] ?? []
    const b = row[1] ? String(row[1]) : ''
    if (/Carpenter to pick-up/i.test(b)) { section = 'pickup'; continue }
    if (/Sutton's Deliveries|Estimated Materials/i.test(b)) { section = 'delivery'; continue }
    if (/VENDOR DELIVERIES/i.test(b)) { section = 'vendor'; continue }
    if (/SUTTON'S TRAILERS/i.test(b)) { section = 'trailer'; continue }
    if (!b) continue
    if (section === 'pickup' && b.length > 12) pickups.push(b)
    else if (section === 'delivery' && b.length > 12) deliveries.push(b)
    else if (section === 'trailer' && row[2]) trailers.push({ name: b, at: String(row[2]) })
  }
  return { pickups, deliveries, trailers }
})()

/* ── Scorecard ─────────────────────────────────────────────────────────── */
const sc = raw.scorecardGrid as any[][]
const num = (v: any) => (typeof v === 'number' ? v : null)
export const SCORECARD = {
  portfolios: [
    { name: 'Jobs Not Started', count: num(sc[1]?.[1]), contract: num(sc[2]?.[1]), outstanding: num(sc[3]?.[1]) },
    { name: 'Work In Progress', count: num(sc[1]?.[3]), contract: num(sc[2]?.[3]), outstanding: num(sc[3]?.[3]) },
    { name: 'Accounts Receivable', count: num(sc[1]?.[7]), contract: num(sc[2]?.[7]), outstanding: num(sc[3]?.[7]) },
    { name: 'Callback', count: num(sc[1]?.[9]), contract: num(sc[2]?.[9]), outstanding: num(sc[3]?.[9]) },
    { name: 'Legal', count: num(sc[1]?.[11]), contract: num(sc[2]?.[11]), outstanding: num(sc[3]?.[11]) },
    { name: 'Punchlist', count: num(sc[1]?.[5]), contract: num(sc[2]?.[5]), outstanding: num(sc[3]?.[5]) },
  ],
  aging: [
    { bucket: '90+ days', amount: num(sc[4]?.[7]) },
    { bucket: '60–90', amount: num(sc[5]?.[7]) },
    { bucket: '30–60', amount: num(sc[6]?.[7]) },
    { bucket: 'Under 30', amount: num(sc[7]?.[7]) },
    { bucket: 'No date', amount: num(sc[8]?.[7]) },
  ],
  costing: (() => {
    const rows: { type: string; total: number; costed: number; notCosted: number; pctNot: number; contract: number; balance: number }[] = []
    for (let r = 11; r <= 28; r++) {
      const t = sc[r]?.[0]
      if (!t || typeof sc[r]?.[1] !== 'number') continue
      if (String(t).startsWith('Total')) continue
      rows.push({
        type: String(t), total: sc[r][1], costed: sc[r][2] ?? 0, notCosted: sc[r][3] ?? 0,
        pctNot: sc[r][4] ?? 0, contract: sc[r][5] ?? 0, balance: sc[r][6] ?? 0,
      })
    }
    return rows
  })(),
  totals: { total: num(sc[29]?.[1]), costed: num(sc[29]?.[2]), notCosted: num(sc[29]?.[3]), pctNot: num(sc[29]?.[4]) },
}

/* ── Counters, read from the source files ─────────────────────────────── */
export const COUNTERS = {
  // ignore obvious mis-keys (a few rows carry an order number in the PO column)
  po: Math.max(...SPECIAL_ORDERS.map(s => s.po ?? 0).filter(n => n > 1000 && n < 20000), 12567),
  job: 1583,
}

export const parse = parseCell


/* ── Per-job documents (templates read from Master Costing) ───────────── */
import docs from './docs-raw.json'
export const DOC_TEMPLATES = docs as Record<string, (string | number | null)[][]>
