import React, { useState } from 'react'
import { Truck, PackageOpen, Container, Users, ChevronUp, ChevronDown, CheckCircle2, Circle, Send, CalendarCheck } from 'lucide-react'
import { OPS_ROWS, OPS_PM_LANES, OPS_LOGISTICS } from '../data/suttons'
import { useStore, DRIVERS } from '../state/store'
import { Card, CardHead, Badge, PMChip, Button } from './ui'
import { parseCell, cn, PM_NAMES } from '../lib/util'

const PM_INITIALS: Record<string, string> = {
  'ADAM S': 'AS', 'BRIAN F': 'BF', 'CORTEZ': 'AC', 'HECTOR': 'HV',
  'JORDAN': 'JC', 'JOSH P': 'JP', 'Rich D.': 'RD',
}

export default function OpsDay() {
  const [sent, setSent] = useState(false)
  const crewJobs = OPS_ROWS.filter(r => r.planA && parseCell(r.planA).job).length
  let lastBand = ''
  return (
    <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5">
      <CalendarCheck size={15} className="shrink-0 text-brand-400" />
      <div className="flex-1 text-2xs text-brand-500">
        <b>Built from the schedule for the next workday.</b> On Friday, scheduling copies Monday's jobs from Future Forecast into a new
        Operations Master tab by hand — here the board already knows. Sending the day plan puts each job's work order on the crew's and PM's phone,
        in place of Brie's email per job.
      </div>
      {sent
        ? <Badge tone="ok"><CheckCircle2 size={10} /> Work orders sent to {crewJobs} crews and 7 PMs</Badge>
        : <Button size="sm" onClick={() => setSent(true)}><Send size={11} /> Send day plan</Button>}
    </div>
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <Card className="overflow-hidden">
        <CardHead title="Crew assignments" sub="Thursday 28 August 2026 — from Operations Master" />
        <div className="max-h-[calc(100vh-260px)] overflow-auto">
          <table className="w-full">
            <tbody>
              {OPS_ROWS.map((r, i) => {
                const band = r.band !== lastBand ? ((lastBand = r.band), r.band) : null
                const a = r.planA ? parseCell(r.planA) : null
                return (
                  <React.Fragment key={i}>
                    {band && (
                      <tr><td colSpan={3} className="border-b border-line bg-ink-100 px-4 py-1 text-2xs font-bold uppercase tracking-wide text-ink-600">{band}</td></tr>
                    )}
                    <tr className={cn('border-b border-line', r.starts && 'bg-brand-50/50')}>
                      <td className="w-[190px] px-4 py-2 align-top">
                        <div className="flex items-start gap-1.5">
                          <Users size={11} className="mt-0.5 shrink-0 text-ink-400" />
                          <div>
                            <div className="text-[12px] font-medium text-ink-950">{r.resource}</div>
                            {r.start && <div className="tnum text-2xs text-ink-400">{r.start}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {a ? (
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[12px] font-medium text-ink-950">{a.name || a.text}</span>
                              {a.job && <span className="tnum text-2xs text-ink-400">{a.job}</span>}
                              <PMChip code={a.pm} />
                              {a.phases.map(p => <Badge key={p} tone="neutral">{p}</Badge>)}
                              {r.starts && <Badge tone="brand">Job start</Badge>}
                            </div>
                            {a.tags.length > 0 && <div className="mt-0.5 text-2xs text-ink-500">{a.tags.join(' · ')}</div>}
                          </div>
                        ) : <span className="text-2xs text-ink-300">—</span>}
                      </td>
                      <td className="w-[200px] px-3 py-2 align-top">
                        {r.planB && (
                          <div className="rounded-md bg-warn-50 px-2 py-1 text-2xs text-warn-700" title="Plan B / next step">
                            {r.planB}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHead title="Project manager routes" sub="From the PM initials on each job — PMs never filled their column, so nobody has to" />
          <div className="divide-y divide-line">
            {OPS_PM_LANES.map(l => (
              <div key={l.name} className="px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <PMChip code={PM_INITIALS[l.name] ?? null} />
                  <span className="text-[12px] font-semibold text-ink-950">{PM_NAMES[PM_INITIALS[l.name]] ?? l.name}</span>
                  <span className="ml-auto text-2xs text-ink-400">{l.items.length} stops</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {l.items.slice(0, 5).map((it, i) => {
                    const c = parseCell(it)
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-2xs text-ink-600">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-ink-300" />
                        <span className="truncate">{c.name || it}</span>
                        {c.job && <span className="tnum text-ink-400">{c.job}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <WarehouseRun />

        {OPS_LOGISTICS.trailers.length > 0 && (
          <Card>
            <CardHead title="Equipment" sub="Reconcile with AssetTiger" />
            <div className="divide-y divide-line">
              {OPS_LOGISTICS.trailers.map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 text-[12px]">
                  <Container size={12} className="text-ink-400" />
                  <span className="font-medium text-ink-950">{t.name}</span>
                  <span className="ml-auto text-2xs text-ink-500">{t.at}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
    </div>
  )
}

/**
 * The bottom of Operations Master — "Carpenter pick-ups and Sutton's deliveries".
 * Scheduling enters it; the warehouse manager reorders by importance and picks
 * the driver; the driver checks each line off. Merlin's shipment states:
 * Pending → Dispatched → Delivered.
 */
function WarehouseRun() {
  const { run, moveRun, setDriver, toggleRun } = useStore()
  const done = run.filter(r => r.done).length
  return (
    <Card>
      <CardHead title="Warehouse run" sub="Warehouse manager sets the order and the driver · driver checks off from the phone"
        right={<span className="tnum text-2xs text-ink-500">{done}/{run.length} delivered</span>} />
      <div className="divide-y divide-line">
        {run.map((r, i) => {
          const status = r.done ? 'Delivered' : r.driver ? 'Dispatched' : 'Pending'
          return (
            <div key={r.id} className={cn('flex items-start gap-2 px-3 py-2', r.done && 'bg-ok-50/40')}>
              <div className="flex shrink-0 flex-col">
                <button onClick={() => moveRun(r.id, -1)} disabled={i === 0} className="text-ink-300 hover:text-ink-700 disabled:opacity-30"><ChevronUp size={12} /></button>
                <button onClick={() => moveRun(r.id, 1)} disabled={i === run.length - 1} className="text-ink-300 hover:text-ink-700 disabled:opacity-30"><ChevronDown size={12} /></button>
              </div>
              <span className="mt-0.5 w-4 shrink-0 tnum text-2xs text-ink-400">{i + 1}</span>
              <button onClick={() => toggleRun(r.id)} className="mt-0.5 shrink-0">
                {r.done ? <CheckCircle2 size={14} className="text-ok-600" /> : <Circle size={14} className="text-ink-300" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn('flex gap-1.5 text-2xs', r.done ? 'text-ink-400 line-through' : 'text-ink-700')}>
                  {r.kind === 'delivery' ? <Truck size={11} className="mt-0.5 shrink-0 text-info-500" /> : <PackageOpen size={11} className="mt-0.5 shrink-0 text-warn-600" />}
                  <span>{r.text}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <select value={r.driver ?? ''} onChange={e => setDriver(r.id, e.target.value)}
                    className="h-6 rounded border border-line bg-white px-1 text-[10px] text-ink-600">
                    <option value="" disabled>{r.kind === 'pickup' ? 'Carpenter picks up' : 'Assign driver…'}</option>
                    {DRIVERS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <Badge tone={status === 'Delivered' ? 'ok' : status === 'Dispatched' ? 'info' : 'neutral'}>{status}</Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
