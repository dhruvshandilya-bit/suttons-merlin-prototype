import React, { useState } from 'react'
import { ChevronRight, Plus, AlertTriangle } from 'lucide-react'
import { LANES, type Job } from '../../data/suttons'
import { READY, COSTING, bandsFor, specialOrdersDue } from '../../data/handoff'
import { useStore } from '../../state/store'
import { Button } from '../ui'
import { cn, shortDate, surname } from '../../lib/util'
import { DailyLogsLink, InBuild } from './bits'

/**
 * "Add work to this day" — Merlin's unscheduled tray on the Operations calendar, which IS the
 * Ready-to-schedule list. Costed jobs first. Each row says what a scheduler checks before booking
 * (costed? special orders due when?) and links to the job's Daily Logs. "Book it here" puts the
 * job on this day for a crew — red until the customer has the date.
 */
export default function AddWorkTray({ day }: { day: number }) {
  const { plugged, days, trayOpen, setTrayOpen } = useStore()
  const ready = READY.filter(j => !plugged[j.jobNo])
  const costing = COSTING.slice(0, 6)
  const dayDate = days[day]?.date

  return (
    <section className="rounded-xl border border-dashed border-line bg-white">
      <button onClick={() => setTrayOpen(!trayOpen)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
        <Plus size={14} className="text-ink-400" />
        Add work to this day
        <span className="text-2xs font-normal text-ink-500">· {ready.length} ready to schedule, {COSTING.length} still being costed</span>
        <ChevronRight size={13} className={cn('ml-auto text-ink-400 transition-transform', trayOpen && 'rotate-90')} />
      </button>
      {trayOpen && (
        <div className="space-y-1.5 border-t border-line px-3 py-3">
          <div className="flex items-center gap-2 px-1 pb-1 text-2xs text-ink-500">
            Unscheduled work on Merlin's Operations calendar — costed first. <InBuild /> costed and special-order lines, Daily logs links.
          </div>
          {ready.map(j => <TrayRow key={j.jobNo} j={j} day={day} dayDate={dayDate} costed />)}
          {costing.length > 0 && (
            <div className="px-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-ink-400">Still being costed</div>
          )}
          {costing.map(j => <TrayRow key={j.jobNo} j={j} day={day} dayDate={dayDate} costed={false} />)}
        </div>
      )}
    </section>
  )
}

function TrayRow({ j, day, dayDate, costed }: { j: Job; day: number; dayDate?: string; costed: boolean }) {
  const { plugIn, days } = useStore()
  const [picking, setPicking] = useState(false)
  const lanes = LANES.filter(l => bandsFor(j.jobType ?? '').includes(l.band)).slice(0, 10)
  const [lane, setLane] = useState(lanes[0]?.id ?? '')
  const due = specialOrdersDue(j.jobNo)
  const late = !!due && !!dayDate && dayDate < due

  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="flex items-center gap-2 px-3 py-2 text-[12px]">
        <span className="font-medium text-ink-950">{surname(j.customer)}</span>
        <span className="tnum text-2xs text-ink-400">{j.jobNo}</span>
        <span className="min-w-0 truncate text-2xs text-ink-500">{j.jobType}</span>
        {costed
          ? !picking && <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setPicking(true)}>Book it here</Button>
          : <span className="ml-auto text-2xs text-ink-400">Book once costed</span>}
      </div>
      <div className="flex items-center gap-3 border-t border-line px-3 py-1.5 text-[10.5px]">
        <span className={cn('font-medium', costed ? 'text-ok-700' : 'text-ink-400')}>{costed ? 'Costed' : 'Costing in progress'}</span>
        {due && (
          <span className={cn('flex items-center gap-1', late ? 'font-medium text-warn-700' : 'text-ink-500')}>
            {late && <AlertTriangle size={10} />}
            Special orders due {shortDate(due)}{late ? ' — after this day' : ''}
          </span>
        )}
        {j.missing && <span className="truncate text-warn-700">Missing: {j.missing}</span>}
        <DailyLogsLink jobNo={j.jobNo} className="ml-auto" />
      </div>
      {picking && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-ink-50 px-3 py-2">
          <span className="text-2xs text-ink-500">Crew</span>
          <select value={lane} onChange={e => setLane(e.target.value)} className="h-7 rounded-md border border-line bg-white px-1.5 text-2xs">
            {lanes.map(l => <option key={l.id} value={l.id}>{l.name}{l.isSub ? ' (trade partner)' : ''}</option>)}
          </select>
          <span className="text-2xs text-ink-500">on {days[day]?.label} {days[day]?.date.slice(5)}</span>
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setPicking(false)}>Cancel</Button>
            <Button size="sm" disabled={!lane} onClick={() => { plugIn(j.jobNo, lane, day); setPicking(false) }}>Book it</Button>
          </div>
        </div>
      )}
    </div>
  )
}
