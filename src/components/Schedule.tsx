import React, { useMemo, useState } from 'react'
import { Users, Wrench, Undo2, Info, X, CalendarClock } from 'lucide-react'
import { LANES, PM_VACATION } from '../data/suttons'
import { useStore, type Assign, type Status } from '../state/store'
import { Card, Badge, Button, PMChip } from './ui'
import { cn, PM_NAMES } from '../lib/util'

const STATUS_STYLE: Record<Status, string> = {
  TENTATIVE: 'border-danger-500 bg-danger-50 text-danger-700',
  CUSTOMER_CONFIRMED: 'border-info-500 bg-info-50 text-info-600',
  LOCKED: 'border-ink-800 bg-ink-100 text-ink-950',
}
const STATUS_LABEL: Record<Status, string> = {
  TENTATIVE: 'Tentative — customer not called',
  CUSTOMER_CONFIRMED: 'Customer confirmed — Ashley to set up materials',
  LOCKED: 'Locked — materials ordered',
}
const NEXT: Record<Status, Status> = {
  TENTATIVE: 'CUSTOMER_CONFIRMED', CUSTOMER_CONFIRMED: 'LOCKED', LOCKED: 'TENTATIVE',
}

export default function Schedule() {
  const { assigns, days, move, preview, setStatus, rippleOn, setRippleOn, lastRipple, clearRipple } = useStore()
  const [drag, setDrag] = useState<{ id: string; laneId: string } | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [sel, setSel] = useState<Assign | null>(null)
  const [band, setBand] = useState<string>('All')

  const bands = useMemo(() => ['All', ...Array.from(new Set(LANES.map(l => l.band)))], [])
  const lanes = useMemo(() => LANES.filter(l => band === 'All' || l.band === band), [band])
  const previewIds = useMemo(() => {
    if (!drag || !over) return new Set<string>()
    const [, dayStr] = over.split('::')
    return new Set(preview(drag.id, Number(dayStr)).map(s => s.id))
  }, [drag, over, preview])

  const byCell = useMemo(() => {
    const m = new Map<string, Assign[]>()
    assigns.forEach(a => {
      const k = `${a.laneId}::${a.day}`
      m.set(k, [...(m.get(k) ?? []), a])
    })
    return m
  }, [assigns])

  let lastBand = ''

  return (
    <div className="space-y-3">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-0.5">
          {bands.map(b => (
            <button key={b} onClick={() => setBand(b)}
              className={cn('rounded-md px-2.5 py-1 text-2xs font-medium transition-colors',
                band === b ? 'bg-brand-400 text-white' : 'text-ink-600 hover:bg-ink-100')}>
              {b === 'All' ? 'All trades' : b}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-2xs text-ink-600">
            <input type="checkbox" checked={rippleOn} onChange={e => setRippleOn(e.target.checked)} className="accent-brand-400" />
            Same-crew ripple
          </label>
          <div className="flex items-center gap-2 text-2xs">
            {(['TENTATIVE', 'CUSTOMER_CONFIRMED', 'LOCKED'] as Status[]).map(s => (
              <span key={s} className="flex items-center gap-1 text-ink-500">
                <span className={cn('h-2.5 w-2.5 rounded-sm border-2', STATUS_STYLE[s])} />
                {s === 'TENTATIVE' ? 'Red' : s === 'CUSTOMER_CONFIRMED' ? 'Blue' : 'Black'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {lastRipple && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <CalendarClock size={16} className="mt-0.5 shrink-0 text-brand-400" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-brand-500">
              {lastRipple.length - 1} downstream job{lastRipple.length > 2 ? 's' : ''} moved with the crew
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-2xs text-brand-400">
              {lastRipple.slice(1).map(s => (
                <span key={s.id}>{s.name} · {days[s.from]?.label} → <b>{days[s.to]?.label}</b></span>
              ))}
            </div>
            <div className="mt-1 text-2xs text-ink-500">Other crews untouched — that's Sutton's rule, not a dependency chain.</div>
          </div>
          <button onClick={clearRipple} className="text-brand-300 hover:text-brand-500"><X size={14} /></button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-30 w-[230px] border-b border-r border-line bg-white px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-ink-500">
                  Crew
                </th>
                {days.map((d, i) => (
                  <th key={i} className="sticky top-0 z-20 min-w-[150px] border-b border-r border-line bg-white px-2 py-2 text-left">
                    <div className="text-2xs font-semibold text-ink-950">{d.label}</div>
                    <div className="text-2xs text-ink-400">{d.date?.slice(5)}</div>
                    {PM_VACATION[i] && (
                      <div className="mt-1 truncate rounded bg-warn-50 px-1 py-0.5 text-[9px] text-warn-700" title={PM_VACATION[i]!}>
                        PM off: {PM_VACATION[i]}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lanes.map(lane => {
                const bandRow = lane.band !== lastBand ? ((lastBand = lane.band), lane.band) : null
                return (
                  <React.Fragment key={lane.id}>
                    {bandRow && (
                      <tr>
                        <td colSpan={days.length + 1} className="sticky left-0 border-b border-line bg-ink-100 px-3 py-1 text-2xs font-bold uppercase tracking-wide text-ink-600">
                          {bandRow}
                        </td>
                      </tr>
                    )}
                    <tr className="group">
                      <td className="sticky left-0 z-10 border-b border-r border-line bg-white px-3 py-2 align-top">
                        <div className="flex items-start gap-1.5">
                          {lane.isSub
                            ? <Wrench size={12} className="mt-0.5 shrink-0 text-warn-600" />
                            : <Users size={12} className="mt-0.5 shrink-0 text-ink-400" />}
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-medium text-ink-950" title={lane.label}>{lane.name}</div>
                            <div className="mt-0.5 flex items-center gap-1">
                              {lane.defaultPMs.map(p => <PMChip key={p} code={p} />)}
                              {lane.isLead && <Badge tone="neutral">Lead</Badge>}
                              {lane.isSub && <Badge tone="warn">Trade partner</Badge>}
                            </div>
                          </div>
                        </div>
                      </td>
                      {days.map((_, day) => {
                        const key = `${lane.id}::${day}`
                        const items = byCell.get(key) ?? []
                        const isOver = over === key && drag?.laneId === lane.id
                        return (
                          <td
                            key={day}
                            onDragOver={e => { if (drag?.laneId === lane.id) { e.preventDefault(); setOver(key) } }}
                            onDragLeave={() => setOver(o => (o === key ? null : o))}
                            onDrop={e => {
                              e.preventDefault()
                              if (drag?.laneId === lane.id) move(drag.id, day)
                              setDrag(null); setOver(null)
                            }}
                            className={cn('border-b border-r border-line px-1.5 py-1.5 align-top', isOver && 'drag-over')}
                          >
                            <div className="space-y-1">
                              {items.map(a => (
                                <div
                                  key={a.id}
                                  draggable={!a.unavailable}
                                  onDragStart={() => setDrag({ id: a.id, laneId: a.laneId })}
                                  onDragEnd={() => { setDrag(null); setOver(null) }}
                                  onClick={() => setSel(a)}
                                  title={a.raw}
                                  className={cn(
                                    'cursor-pointer rounded-md border-l-[3px] px-1.5 py-1 text-[11px] leading-tight transition-all',
                                    a.unavailable
                                      ? 'border-ink-300 bg-ink-50 italic text-ink-500'
                                      : STATUS_STYLE[a.status],
                                    previewIds.has(a.id) && drag?.id !== a.id && 'ring-2 ring-brand-300 ring-offset-1',
                                    drag?.id === a.id && 'opacity-40',
                                  )}
                                >
                                  <div className="flex items-center gap-1">
                                    <span className="truncate font-semibold">{a.name || a.raw}</span>
                                    {a.pm && <span className="ml-auto shrink-0 text-[9px] font-bold opacity-60">{a.pm}</span>}
                                  </div>
                                  {(a.job || a.phases.length > 0) && (
                                    <div className="mt-0.5 flex items-center gap-1 text-[9px] opacity-70">
                                      {a.job && <span className="tnum">{a.job}</span>}
                                      {a.phases.slice(0, 2).map(p => <span key={p} className="rounded bg-white/60 px-1">{p}</span>)}
                                    </div>
                                  )}
                                  {a.tags.length > 0 && (
                                    <div className="mt-0.5 truncate text-[9px] italic opacity-60">{a.tags.join(' · ')}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-2xs text-ink-500">
        <Info size={14} className="mt-0.5 shrink-0 text-ink-400" />
        <span>
          Drag a job within its own crew row to reschedule. With ripple on, every later job for
          <b className="text-ink-700"> that crew only</b> shifts by the same number of days — other crews are untouched.
          Click any job to change its status. All {LANES.length} lanes and every cell are read from
          <b className="text-ink-700"> Future Forecast → Project Scheduling 2026</b>.
        </span>
      </div>

      {sel && (
        <Drawer
          a={sel}
          days={days}
          onClose={() => setSel(null)}
          onStatus={s => { setStatus(sel.id, s); setSel({ ...sel, status: s }) }}
          onMove={d => { move(sel.id, d); setSel(null) }}
          previewFor={d => preview(sel.id, d)}
        />
      )}
    </div>
  )
}

function Drawer({ a, days, onClose, onStatus, onMove, previewFor }: any) {
  const lane = LANES.find(l => l.id === a.laneId)
  const [hover, setHover] = useState<number | null>(null)
  const steps = hover != null ? previewFor(hover) : []
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/20" onClick={onClose}>
      <div className="h-full w-[380px] overflow-auto border-l border-line bg-white p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xs uppercase tracking-wide text-ink-500">{a.job ?? 'No job number'}</div>
            <div className="mt-0.5 text-lg font-semibold leading-tight">{a.name || a.raw}</div>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={16} /></button>
        </div>

        <div className="mt-4 space-y-3 text-[13px]">
          <Row label="Crew">{lane?.name} {lane?.isSub && <Badge tone="warn">Trade partner</Badge>}</Row>
          <Row label="Project manager">
            {a.pm ? <span className="flex items-center gap-1.5"><PMChip code={a.pm} />{PM_NAMES[a.pm] ?? a.pm}</span> : '—'}
          </Row>
          <Row label="Phases">{a.phases.length ? a.phases.join(', ') : '—'}</Row>
          <Row label="Markers">{a.tags.length ? a.tags.join(' · ') : '—'}</Row>
          <Row label="Source cell"><code className="rounded bg-ink-100 px-1 py-0.5 text-2xs">{a.raw}</code></Row>
        </div>

        <div className="mt-5">
          <div className="text-2xs font-semibold uppercase tracking-wide text-ink-500">Reschedule</div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {days.map((d: any, i: number) => (
              <button
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onMove(i)}
                className={cn(
                  'rounded-lg border px-1 py-1.5 text-center text-2xs transition-colors',
                  i === a.day
                    ? 'border-brand-400 bg-brand-50 font-semibold text-brand-400'
                    : 'border-line bg-white text-ink-600 hover:border-brand-300 hover:bg-brand-50',
                )}
              >
                <div className="font-medium">{d.label.slice(0, 3)}</div>
                <div className="tnum text-[9px] opacity-60">{d.date?.slice(5)}</div>
              </button>
            ))}
          </div>
          {steps.length > 1 && (
            <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
              <div className="text-2xs font-semibold text-brand-500">
                Moves {steps.length - 1} later job{steps.length > 2 ? 's' : ''} for this crew
              </div>
              <div className="mt-1 space-y-0.5">
                {steps.slice(1).map((s: any) => (
                  <div key={s.id} className="text-2xs text-brand-400">
                    {s.name} · {days[s.from]?.label} → <b>{days[s.to]?.label}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
          {hover != null && steps.length === 1 && hover !== a.day && (
            <div className="mt-2 text-2xs text-ink-500">No downstream jobs for this crew — nothing else moves.</div>
          )}
        </div>

        <div className="mt-5">
          <div className="text-2xs font-semibold uppercase tracking-wide text-ink-500">Schedule status</div>
          <div className="mt-2 space-y-1.5">
            {(['TENTATIVE', 'CUSTOMER_CONFIRMED', 'LOCKED'] as Status[]).map(s => (
              <button key={s} onClick={() => onStatus(s)}
                className={cn('flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition-colors',
                  a.status === s ? STATUS_STYLE[s] : 'border-line bg-white text-ink-600 hover:bg-ink-50')}>
                <span className={cn('h-2.5 w-2.5 rounded-sm border-2', STATUS_STYLE[s])} />
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="mt-2 text-2xs text-ink-500">
            Replaces the red / blue / black cell colouring — the same three states, with three owners.
          </div>
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, children }: any) => (
  <div className="flex gap-3">
    <div className="w-[110px] shrink-0 text-ink-500">{label}</div>
    <div className="flex-1 font-medium text-ink-950">{children}</div>
  </div>
)
