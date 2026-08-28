import React from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import { PHASES, VENDORS, SUBS, PEOPLE, RULES, SCHEDULE_TYPES, LANES, COUNTERS } from '../data/suttons'
import { Card, CardHead, Badge } from './ui'
import { money, pct } from '../lib/util'

export default function Setup() {
  const subs = LANES.filter(l => l.isSub).length
  const blocks = [
    { n: 1, label: 'Org type', value: 'STICK_BUILT', note: 'drives defaultByOrgType across the registry' },
    { n: 2, label: 'Users', value: `${PEOPLE.length} staff`, note: 'People List tab, with @suttonsinc.com emails' },
    { n: 3, label: 'Phase codes → BudgetCategory', value: `${PHASES.length} codes`, note: 'labelled “Phase Code”' },
    { n: 4, label: 'Trades', value: `${new Set(LANES.map(l => l.band)).size} bands`, note: 'from Future Forecast' },
    { n: 5, label: 'Resources', value: `${LANES.length} lanes`, note: `${LANES.length - subs} employees · ${subs} trade partners (the * suffix)` },
    { n: 6, label: 'Vendors + subcontractors', value: `${VENDORS.length} + ${SUBS.length}`, note: 'API load — no UI importer' },
    { n: 7, label: 'Labour rate card', value: '100 line items', note: 'per trade, per crew' },
    { n: 8, label: 'Schedule item types', value: `${SCHEDULE_TYPES.length} values`, note: 'separates work from logistics' },
    { n: 9, label: 'PO counter', value: `PO-SUT-${COUNTERS.po}`, note: 'continued, not restarted' },
    { n: 10, label: 'Job counter', value: `${COUNTERS.job}-26`, note: 'continued, not restarted' },
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHead title="Org configuration" sub="Loaded from Sutton's own files — nothing invented" />
        <div className="divide-y divide-line">
          {blocks.map(b => (
            <div key={b.n} className="flex items-center gap-3 px-4 py-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ok-50 text-ok-600 ring-1 ring-inset ring-ok-500/30">
                <Check size={12} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-ink-950">{b.label}</div>
                <div className="text-2xs text-ink-500">{b.note}</div>
              </div>
              <span className="shrink-0 tnum text-[13px] font-semibold text-ink-950">{b.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHead title="Schedule item types" sub="Their 11-value enum — needs a new field on ScheduleItem" />
          <div className="flex flex-wrap gap-1.5 p-4">
            {SCHEDULE_TYPES.map(t => (
              <Badge key={t} tone={t === 'EMPLOYEE' || t === 'TRADE PARTNER' ? 'brand' : 'neutral'}>{t}</Badge>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Business rules" sub="Master Costing → DROPDOWNLIST" />
          <div className="space-y-1.5 px-4 py-3 text-2xs">
            {Object.entries(RULES).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-ink-500">{k}</span>
                <span className="tnum font-medium text-ink-950">{v < 1 && v > 0 ? pct(v, 2) : v >= 1000 ? money(v) : v}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-warn-500/40 bg-warn-50 px-4 py-3 text-2xs text-warn-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Two sales-tax rates appear in the source: <b>10.25%</b> in DROPDOWNLIST and <b>9.75%</b> on Material Breakdown.
            Resolve before PO config.
          </span>
        </div>
      </div>
    </div>
  )
}
