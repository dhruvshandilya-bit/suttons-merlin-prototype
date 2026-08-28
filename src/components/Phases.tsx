import React, { useMemo, useState } from 'react'
import { Building2, Calendar, MapPin, Briefcase, Hash, AlertCircle } from 'lucide-react'
import { JOBS, type Bucket } from '../data/suttons'
import { PageHeader, StatusTabs } from './shell'
import { Badge, Button, PMChip } from './ui'
import { money, shortDate, cn } from '../lib/util'

/** The Project Phases kanban — matching the live board, with the missing columns added. */
const COLS: { key: Bucket; label: string; color: string; live: boolean }[] = [
  { key: 'JNS', label: 'JNS', color: 'bg-brand-400', live: true },
  { key: 'WIP', label: 'WIP', color: 'bg-info-500', live: true },
  { key: 'AR', label: 'AR', color: 'bg-warn-500', live: false },
  { key: 'Punchlist', label: 'Punchlist', color: 'bg-brand-300', live: false },
  { key: 'Callback', label: 'Callback', color: 'bg-danger-500', live: false },
  { key: 'Legal', label: 'Legal', color: 'bg-ink-700', live: false },
  { key: 'Closed', label: 'Closed', color: 'bg-ok-500', live: false },
  { key: 'Cancelled', label: 'Cancelled', color: 'bg-ink-400', live: false },
]

export default function Phases() {
  const [board, setBoard] = useState('Project Phases')
  const byCol = useMemo(() => {
    const m = new Map<string, typeof JOBS>()
    JOBS.forEach(j => m.set(j.bucket, [...(m.get(j.bucket) ?? []), j]))
    return m
  }, [])

  return (
    <>
      <PageHeader
        title="Projects (Phases)"
        sub="Jobs → Project Phases"
        search="Search by name, address, claim no…"
        actions={<>
          <Button variant="outline">Card Fields</Button>
          <Button>Open Phase Config</Button>
        </>}
      />

      <div className="mb-3 flex items-center gap-2 px-6">
        {['All boards', 'Project Phases', 'Commercial Jobs'].map(b => (
          <button key={b} onClick={() => setBoard(b)}
            className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px]',
              board === b ? 'bg-brand-50 font-medium text-brand-400' : 'text-ink-600 hover:bg-ink-100')}>
            {b !== 'All boards' && <span className={cn('h-1.5 w-1.5 rounded-full', b === 'Project Phases' ? 'bg-brand-400' : 'bg-ok-500')} />}
            {b}
          </button>
        ))}
      </div>

      <div className="mx-6 mb-3 flex items-start gap-2 rounded-xl border border-warn-500/40 bg-warn-50 px-4 py-2.5">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-warn-700" />
        <div className="text-2xs text-warn-700">
          Production has only <b>JNS</b>, <b>WIP</b> and <b>Completed w/Balance</b> — plus two strays,
          <b> Exterior</b> and <b> AOB</b>, which are service types not phases. The six columns marked
          <span className="mx-1 rounded bg-white px-1 font-semibold">to add</span> below are missing today.
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto px-6 pb-4">
        {COLS.map(c => {
          const items = byCol.get(c.key) ?? []
          return (
            <div key={c.key} className="flex w-[276px] shrink-0 flex-col rounded-xl border border-line bg-ink-50">
              <div className={cn('h-1 rounded-t-xl', c.color)} />
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-[13px] font-semibold text-ink-950">{c.label}</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[11px] tnum text-ink-600">{items.length}</span>
                {!c.live && <Badge tone="warn" className="ml-auto">to add</Badge>}
              </div>
              <div className="flex-1 space-y-2 overflow-auto px-2 pb-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {items.slice(0, 12).map((j, i) => (
                  <div key={`${j.jobNo}-${j.customer}-${i}`} className="rounded-lg border-l-[3px] border-line bg-white p-2.5 shadow-sm"
                    style={{ borderLeftColor: 'var(--tw-shadow-color, #d1d1d1)' }}>
                    <div className="truncate text-[12.5px] font-medium text-ink-950">Project - {j.customer} - {j.jobType?.split(',')[0]}</div>
                    <div className="mt-1.5 space-y-1 text-2xs text-ink-500">
                      <Line icon={Hash}>{j.jobNo}</Line>
                      <Line icon={Briefcase}>{j.serviceType} · {j.sales}</Line>
                      {j.estStart && <Line icon={Calendar}>{shortDate(j.estStart)} (start date)</Line>}
                      <Line icon={MapPin}>{j.zone ?? '—'} · {j.permit && j.permit !== 'N/A' ? j.permit : 'no permit'}</Line>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="tnum text-2xs font-medium text-ink-700">{money(j.contract)}</span>
                      {j.balance > 0 && <Badge tone="warn">{money(j.balance)} due</Badge>}
                      {!j.estCost && <Badge tone="danger">not costed</Badge>}
                    </div>
                  </div>
                ))}
                {items.length > 12 && (
                  <div className="py-2 text-center text-2xs text-ink-400">+{items.length - 12} more</div>
                )}
                {items.length === 0 && <div className="py-6 text-center text-2xs text-ink-400">Empty</div>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

const Line = ({ icon: Icon, children }: any) => (
  <div className="flex items-center gap-1.5"><Icon size={10} className="shrink-0 text-ink-400" /><span className="truncate">{children}</span></div>
)
