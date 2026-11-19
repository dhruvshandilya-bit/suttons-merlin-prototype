import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, UserX, Container, PackageSearch } from 'lucide-react'
import { LANES, SPECIAL_ORDERS, OPS_LOGISTICS } from '../../data/suttons'
import { ATTENDANCE } from '../../data/forecast'
import { useStore, type Assign } from '../../state/store'
import { Badge, PMChip } from '../ui'
import { cn, shortDate } from '../../lib/util'
import { DailyLogsLink, InBuild, ReadinessChip } from './bits'
import AddWorkTray from './AddWorkTray'

const LANE = new Map(LANES.map(l => [l.id, l]))

/**
 * Calendar → Day: Merlin's day board. One column per crew group — Sutton's trades set up as
 * stations — and each job on that day as a card. Nobody copies Monday into a new sheet: the board
 * is the schedule read for that date. Under it, the day agenda: crew time off, special orders due,
 * equipment out.
 */
export default function DayBoard() {
  const { assigns, days, calDay, setCalDay } = useStore()
  const [groupBy, setGroupBy] = useState<'trade' | 'pm'>('trade')
  const day = days[calDay]
  const todays = useMemo(() => assigns.filter(a => a.day === calDay && !a.unavailable), [assigns, calDay])

  const columns = useMemo(() => {
    const m = new Map<string, Assign[]>()
    todays.forEach(a => {
      const key = groupBy === 'trade' ? (LANE.get(a.laneId)?.band ?? 'OTHER') : (a.pm ?? 'No PM')
      m.set(key, [...(m.get(key) ?? []), a])
    })
    return [...m.entries()].sort((x, y) => y[1].length - x[1].length)
  }, [todays, groupBy])

  const off = ATTENDANCE.filter(a => a.day === calDay)
  const due = SPECIAL_ORDERS.filter(s => s.expected === day?.date)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setCalDay(Math.max(0, calDay - 1))} className="grid h-7 w-7 place-items-center rounded-md border border-line hover:bg-ink-50"><ChevronLeft size={14} /></button>
        <button onClick={() => setCalDay(Math.min(days.length - 1, calDay + 1))} className="grid h-7 w-7 place-items-center rounded-md border border-line hover:bg-ink-50"><ChevronRight size={14} /></button>
        <span className="text-[14px] font-semibold text-ink-950">{day?.label} {shortDate(day?.date)}</span>
        <span className="text-2xs text-ink-500">· {todays.length} jobs on {columns.length} {groupBy === 'trade' ? 'trades' : 'PMs'}</span>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-line p-0.5 text-2xs">
          <span className="px-1.5 text-ink-500">Group by</span>
          {(['trade', 'pm'] as const).map(g => (
            <button key={g} onClick={() => setGroupBy(g)}
              className={cn('rounded-md px-2 py-0.5 font-medium', groupBy === g ? 'bg-ink-950 text-white' : 'text-ink-600 hover:bg-ink-100')}>
              {g === 'trade' ? 'Crew / trade' : 'Project manager'}
            </button>
          ))}
        </div>
      </div>

      <AddWorkTray day={calDay} />

      <div className="flex flex-wrap items-center gap-3 px-1 text-[10.5px] text-ink-500">
        <span className="flex items-center gap-1"><ReadinessChip status="TENTATIVE" /> customer doesn't have the date</span>
        <span className="flex items-center gap-1"><ReadinessChip status="CUSTOMER_CONFIRMED" /> materials need setting up</span>
        <span className="flex items-center gap-1"><ReadinessChip status="LOCKED" /> ready to start</span>
        <span className="flex items-center gap-1"><InBuild /> these colours and the Daily logs links</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {columns.map(([key, list]) => (
          <div key={key} className="w-[220px] shrink-0 space-y-1.5">
            <div className="flex items-center gap-1.5 px-1 text-2xs font-semibold uppercase tracking-wide text-ink-500">
              {groupBy === 'pm' ? <PMChip code={key === 'No PM' ? null : key} /> : null}
              <span className="truncate">{key}</span>
              <span className="ml-auto tnum text-ink-400">{list.length}</span>
            </div>
            {list.map(a => <Card key={a.id} a={a} />)}
          </div>
        ))}
        {columns.length === 0 && <div className="py-10 text-[12px] text-ink-500">Nothing on the schedule this day.</div>}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Agenda icon={UserX} title="Crew time off" sub="From time off and the morning report">
          {off.length === 0 && <Empty>Everyone's in.</Empty>}
          {off.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-[11.5px] text-ink-700">
              <span className="truncate">{a.lane}</span>
              <Badge tone={a.kind === 'called in' ? 'danger' : a.kind === 'weather' ? 'info' : 'warn'} className="ml-auto">{a.raw}</Badge>
            </div>
          ))}
        </Agenda>
        <Agenda icon={PackageSearch} title="Special orders due" sub="From the POs' delivery dates">
          {due.length === 0 && <Empty>None due this day.</Empty>}
          {due.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[11.5px] text-ink-700">
              <span className="font-medium">{s.vendor}</span><span className="truncate text-ink-500">{s.jobName}</span>
              <span className="ml-auto text-2xs text-ink-400">{s.deliverTo}</span>
            </div>
          ))}
        </Agenda>
        <Agenda icon={Container} title="Equipment out" sub="Tools checked out to a job">
          {OPS_LOGISTICS.trailers.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-[11.5px] text-ink-700">
              <span>{t.name}</span><span className="ml-auto truncate text-2xs text-ink-500">{t.at}</span>
            </div>
          ))}
        </Agenda>
      </div>
    </div>
  )
}

function Card({ a }: { a: Assign }) {
  const lane = LANE.get(a.laneId)
  return (
    <div className="rounded-lg border border-line bg-white px-2.5 py-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="min-w-0 truncate text-[12px] font-semibold text-ink-950">{a.name}</span>
        {a.job && <span className="tnum text-[10px] text-ink-400">{a.job}</span>}
        <span className="ml-auto"><PMChip code={a.pm} /></span>
      </div>
      <div className="mt-0.5 truncate text-[10.5px] text-ink-500">
        {lane?.name}{a.phases.length ? ` · ${a.phases.join(', ')}` : ''}
        {a.tags.includes('new') && <span className="ml-1 font-medium text-brand-400">· just booked</span>}
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <ReadinessChip status={a.status} />
        <DailyLogsLink jobNo={a.job} className="ml-auto" />
      </div>
    </div>
  )
}

const Agenda = ({ icon: Icon, title, sub, children }: any) => (
  <div className="rounded-xl border border-line bg-white px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-950"><Icon size={13} className="text-ink-400" />{title}</div>
    <div className="mb-1.5 text-[10.5px] text-ink-500">{sub}</div>
    <div className="space-y-1">{children}</div>
  </div>
)
const Empty = ({ children }: any) => <div className="text-[11px] text-ink-400">{children}</div>
