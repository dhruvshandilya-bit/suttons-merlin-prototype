import React from 'react'
import { LANES } from '../../data/suttons'
import { useStore, type Status } from '../../state/store'
import { shortDate } from '../../lib/util'
import { READINESS, ReadinessDot } from './bits'

const LANE = new Map(LANES.map(l => [l.id, l]))
const ORDER: Status[] = ['TENTATIVE', 'CUSTOMER_CONFIRMED', 'LOCKED']

/**
 * Calendar → Week: each day's jobs as chips with Zoe's red / blue / black dot. Click a day for its
 * board. Same data as the Schedule timeline, read by date instead of by crew.
 */
export default function WeekGrid() {
  const { assigns, days, setCalDay, setCalView } = useStore()
  const open = (d: number) => { setCalDay(d); setCalView('day') }

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {days.map((d, i) => {
        const list = assigns.filter(a => a.day === i && !a.unavailable)
        const counts = ORDER.map(s => [s, list.filter(a => a.status === s).length] as const)
        return (
          <div key={i} className="flex min-h-[220px] flex-col rounded-xl border border-line bg-white">
            <button onClick={() => open(i)} className="border-b border-line px-2.5 py-1.5 text-left hover:bg-ink-50">
              <div className="text-[12px] font-semibold text-ink-950">{d.label} <span className="font-normal text-ink-500">{shortDate(d.date)}</span></div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-ink-500">
                {counts.map(([s, n]) => (
                  <span key={s} className="flex items-center gap-1" title={READINESS[s].label}><ReadinessDot status={s} />{n}</span>
                ))}
              </div>
            </button>
            <div className="flex-1 space-y-0.5 p-1.5">
              {list.slice(0, 9).map(a => (
                <button key={a.id} onClick={() => open(i)}
                  className="flex w-full items-center gap-1.5 rounded bg-ink-50 px-1.5 py-0.5 text-left text-[10.5px] text-ink-800 hover:bg-ink-100">
                  <ReadinessDot status={a.status} />
                  <span className="min-w-0 truncate">{a.name}</span>
                  <span className="ml-auto shrink-0 truncate text-[9.5px] text-ink-400">{LANE.get(a.laneId)?.band.split(' ')[0].toLowerCase()}</span>
                </button>
              ))}
              {list.length > 9 && (
                <button onClick={() => open(i)} className="px-1.5 text-[10px] text-brand-400 hover:underline">+{list.length - 9} more — open the day</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
