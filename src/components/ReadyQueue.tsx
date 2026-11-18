import React, { useMemo, useState } from 'react'
import { ClipboardCheck, PackageCheck, PackageSearch, CalendarPlus, AlertTriangle, Truck, Warehouse, CheckCircle2, ArrowRight, BellRing } from 'lucide-react'
import { LANES, type Job } from '../data/suttons'
import { READY, COSTING, PLUGGED, ordersFor, isHere, earliestStart } from '../data/handoff'
import { useStore } from '../state/store'
import { Card, Badge, Button, PMChip } from './ui'
import { money, pct, shortDate, cn } from '../lib/util'

/** Job Status "Job Type" → the Future Forecast trade band that does the work. */
const BAND_FOR: [RegExp, string][] = [
  [/Roofing/, 'ROOFING'], [/Siding/, 'SIDING'], [/Windows|Doors|Skylights/, 'WINDOWS / DOORS'],
  [/Gutters/, 'GUTTERS'], [/Deck|Patio|Screen Room/, 'DECKS / SUNROOMS'],
  [/Bathroom|Kitchen|Basement|Remodeling|Design Build/, 'REMODELING CARPENTERS'],
  [/Drywall/, 'DRYWALL/PAINT'], [/Service|Temp|AOB/, 'SERVICE TEAM'],
]
export const bandsFor = (jobType: string) => [...new Set(BAND_FOR.filter(([re]) => re.test(jobType)).map(([, b]) => b))]

/**
 * Operations → Ready to schedule. The estimate being completed is the signal —
 * no $0.01 placeholder, no re-keying into QuickBooks, no email to scheduling.
 */
export default function ReadyQueue() {
  const today = useMemo(() => new Date(), [])
  const { plugged } = useStore()
  const rows = useMemo(() => READY.map(j => ({ j, orders: ordersFor(j.jobNo), start: earliestStart(j, today) }))
    .sort((a, b) => +a.start.date - +b.start.date), [today])

  return (
    <div className="space-y-4">
      {/* the pipeline Zoe reads off the Estimated Cost column today */}
      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <Step n={COSTING.length} label="Costing in progress" sub="Incoming · estimate not approved yet — today a blank cell or the $0.01" tone="warn" />
        <ArrowRight size={16} className="hidden self-center text-ink-300 md:block" />
        <Step n={READY.length - Object.keys(plugged).length} label="Ready to schedule" sub="Estimate approved, special-order POs written — a phase on your Project Phases board" tone="brand" active />
        <ArrowRight size={16} className="hidden self-center text-ink-300 md:block" />
        <Step n={PLUGGED.length + Object.keys(plugged).length} label="Scheduled" sub="Plugged into a crew lane — red until the customer has the date" tone="ok" />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-2xs text-brand-500">
        <BellRing size={14} className="mt-0.5 shrink-0" />
        <span>
          <Badge tone="warn" className="mr-1">Proposed</Badge>
          When an estimate is approved, <b>Brianne and Zoe</b> get an Estimate Approved notification, in-app and by push, with every
          special order on the job. Merlin has this notification type but doesn't send it yet. The estimated cost is already on the job and seeds its budget; nobody re-types it into QuickBooks to say it's ready.
        </span>
      </div>

      <div className="space-y-2">
        {rows.map(r => <ReadyCard key={r.j.jobNo} {...r} />)}
      </div>
    </div>
  )
}

const Step = ({ n, label, sub, tone, active }: any) => (
  <div className={cn('rounded-xl border bg-white px-4 py-3', active ? 'border-brand-300 ring-2 ring-brand-100' : 'border-line')}>
    <div className="flex items-baseline gap-2">
      <span className={cn('text-[22px] font-semibold tnum', tone === 'warn' ? 'text-warn-700' : tone === 'ok' ? 'text-ok-700' : 'text-brand-400')}>{n}</span>
      <span className="text-[13px] font-medium text-ink-950">{label}</span>
    </div>
    <div className="mt-0.5 text-2xs text-ink-500">{sub}</div>
  </div>
)

function ReadyCard({ j, orders, start }: { j: Job; orders: ReturnType<typeof ordersFor>; start: ReturnType<typeof earliestStart> }) {
  const { plugged, plugIn, days, deliveryReq, requestDelivery } = useStore()
  const [picking, setPicking] = useState(false)
  const bands = bandsFor(j.jobType ?? '')
  const lanes = LANES.filter(l => bands.includes(l.band)).slice(0, 8)
  const [lane, setLane] = useState(lanes[0]?.id ?? '')
  const [day, setDay] = useState(0)
  const done = plugged[j.jobNo]
  const pending = orders.filter(o => !isHere(o))

  return (
    <Card className={cn('px-4 py-3', done && 'opacity-80')}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-[220px] flex-1">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={14} className="text-brand-400" />
            <span className="text-[14px] font-semibold text-ink-950">{j.customer}</span>
            <span className="tnum text-2xs text-ink-400">{j.jobNo}</span>
            {j.zone && <Badge>{j.zone.replace('Zone ', 'Z')}</Badge>}
          </div>
          <div className="mt-0.5 text-2xs text-ink-500">
            {j.jobType} · estimated by <b className="text-ink-700">{j.estimator ?? '—'}</b> {j.dateEstimated && <>on {shortDate(j.dateEstimated)}</>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-2xs">
            <span>Contract <b className="tnum text-ink-950">{money(j.contract)}</b></span>
            <span>Est. cost <b className="tnum text-ink-950">{j.estCost ? money(j.estCost) : 'from the estimate'}</b></span>
            <span className={cn('font-medium', j.estGP == null ? 'text-ink-400' : j.estGP >= 0.425 ? 'text-ok-600' : j.estGP >= 0.385 ? 'text-warn-700' : 'text-danger-600')}>GP {pct(j.estGP)}</span>
          </div>
          {j.costPlaceholder && (
            <div className="mt-1.5 text-2xs text-brand-500">
              Job Status shows <b>“{j.costPlaceholder}”</b> in Estimated Cost — the estimator's “paperwork's in” marker. Today this waits for Brie to key the real cost.
            </div>
          )}
          {j.missing && (
            <div className="mt-1.5 flex items-center gap-1 text-2xs text-warn-700"><AlertTriangle size={11} /> Missing paperwork: {j.missing}</div>
          )}
        </div>

        <div className="w-[300px]">
          <div className="text-2xs font-semibold uppercase tracking-wide text-ink-400">Special orders</div>
          {orders.length === 0 && <div className="mt-1 text-2xs text-ink-500">{j.so === 'N' ? 'None on this job' : 'No PO written yet'}</div>}
          <div className="mt-1 space-y-1">
            {orders.map((o, i) => {
              const key = `${j.jobNo}-${i}`
              const atVendor = o.status === 'Ready at Vendor'
              return (
                <div key={i} className="flex items-center gap-1.5 text-2xs">
                  {isHere(o) ? <PackageCheck size={11} className="shrink-0 text-ok-600" /> : <PackageSearch size={11} className="shrink-0 text-info-500" />}
                  <span className="font-medium text-ink-800">{o.vendor}</span>
                  <span className="truncate text-ink-500" title={o.description}>{o.description}</span>
                  <span className="ml-auto shrink-0">
                    {deliveryReq[key]
                      ? <Badge tone="ok"><Truck size={9} /> {deliveryReq[key]}</Badge>
                      : atVendor && done
                        ? <button onClick={() => requestDelivery(key, 'Delivery requested')} className="rounded border border-brand-300 px-1 text-[10px] font-medium text-brand-400 hover:bg-brand-50">Call for delivery</button>
                        : <Badge tone={isHere(o) ? 'ok' : 'info'}>{isHere(o) ? o.status.replace('Ready at ', 'At ') : `ETA ${shortDate(o.expected)}`}</Badge>}
                  </span>
                </div>
              )
            })}
          </div>
          {orders.some(o => o.status === 'Ready at Vendor') && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-ink-400"><Warehouse size={10} /> Sits at the vendor until scheduling calls it to the job site</div>
          )}
        </div>

        <div className="w-[170px] text-right">
          <div className="text-2xs font-semibold uppercase tracking-wide text-ink-400">Earliest start</div>
          <div className="text-[15px] font-semibold tnum text-ink-950">{start.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className={cn('text-2xs', pending.length && start.by === 'special order ETA' ? 'text-info-600' : 'text-ink-500')}>set by {start.by}</div>
          {!done && !picking && (
            <Button size="sm" className="mt-2" onClick={() => setPicking(true)}><CalendarPlus size={11} /> Plug in</Button>
          )}
        </div>
      </div>

      {picking && !done && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-ink-50 px-3 py-2">
          <span className="text-2xs text-ink-500">Crew</span>
          <select value={lane} onChange={e => setLane(e.target.value)} className="h-7 rounded-md border border-line bg-white px-1.5 text-2xs">
            {lanes.map(l => <option key={l.id} value={l.id}>{l.name}{l.isSub ? ' (trade partner)' : ''}</option>)}
          </select>
          <span className="text-2xs text-ink-500">Day</span>
          <select value={day} onChange={e => setDay(Number(e.target.value))} className="h-7 rounded-md border border-line bg-white px-1.5 text-2xs">
            {days.map((d, i) => <option key={i} value={i}>{d.label} {d.date.slice(5)}</option>)}
          </select>
          <span className="text-2xs text-ink-400">PM from the crew's default: <PMChip code={LANES.find(l => l.id === lane)?.defaultPMs[0] ?? null} /></span>
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setPicking(false)}>Cancel</Button>
            <Button size="sm" disabled={!lane} onClick={() => { plugIn(j.jobNo, lane, day); setPicking(false) }}>Put on the board</Button>
          </div>
        </div>
      )}
      {done && (
        <div className="mt-2 flex items-center gap-1.5 text-2xs text-danger-700">
          <CheckCircle2 size={12} className="text-ok-600" />
          On the board: <b>{done}</b> — <span className="rounded bg-danger-50 px-1 font-medium">red</span> until the customer has the date.
          {orders.some(o => o.status === 'Ready at Vendor') && <span className="text-ink-500">Call the vendor delivery in for the start date.</span>}
        </div>
      )}
    </Card>
  )
}
