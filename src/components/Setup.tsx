import React from 'react'
import { Check, AlertTriangle, Plus } from 'lucide-react'
import { PHASES, VENDORS, SUBS, PEOPLE, RULES, SCHEDULE_TYPES, LANES, COUNTERS } from '../data/suttons'
import { FORECAST_TYPES } from '../data/forecast'
import { PHOTO_RULES } from '../data/daily'
import { Card, CardHead, Badge } from './ui'
import { money, pct } from '../lib/util'
import { InBuild } from './ops/bits'

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
  /** From the calls with Zoe. `inBuild` rows are being added to Merlin now (19 Nov 2026); the rest are settings today. */
  const fromCall = [
    { label: 'Ready to schedule: on costing complete', value: 'Brianne D. · Zoe P.', inBuild: true, note: 'when the estimate is marked costed: move the job to the "Ready to schedule" phase and tell scheduling (bell, push, email) with its special orders' },
    { label: 'Work-order template per job type', value: '5 steps', note: 'Confirm date with customer · Set up materials (special orders, deliveries, dumpster, big-box) · Send job packet · the work, per trade · Walkthrough' },
    { label: 'Red / blue / black', value: 'From 2 steps', inBuild: true, note: '"Confirm date with customer" done = blue; "Set up materials" done = black — shown on the Operations calendar' },
    { label: 'Crews as stations', value: `${new Set(LANES.map(l => l.band)).size} trades`, note: 'each crew or trade partner is a station, so the Operations calendar and day board group by crew' },
    { label: 'Morning site report', value: 'Sutton\'s template', inBuild: true, note: "who isn't here and why · start-of-day photo · damage photo on day 1 — needs the report-template setting" },
    { label: 'Evening site report', value: 'Sutton\'s template', inBuild: true, note: 'deliveries due from the POs · weather and delays · end-of-day photo · next steps' },
    { label: 'Next-workday plan', value: '5 pm', inBuild: true, note: 'each person gets their jobs for the next business day as one push' },
    { label: 'Ask AI: forecasting inputs', value: `${FORECAST_TYPES.length} project types`, note: 'jobs per week + seasonal blackouts, from the Project Forecasting tab' },
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
        <div className="border-t border-line bg-ink-50 px-4 py-2 text-2xs font-semibold uppercase tracking-wide text-ink-500">Added after the 23 Oct operations call</div>
        <div className="divide-y divide-line">
          {fromCall.map(b => (
            <div key={b.label} className="flex items-center gap-3 px-4 py-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-400 ring-1 ring-inset ring-brand-200">
                <Plus size={12} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink-950">{b.label}{b.inBuild && <InBuild />}</div>
                <div className="text-2xs text-ink-500">{b.note}</div>
              </div>
              <span className="shrink-0 text-[12px] font-semibold text-ink-950">{b.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHead title="Project forecasting inputs" sub="What Ask AI divides by — Zoe re-sets jobs per week monthly" />
          <div className="space-y-1 px-4 py-3 text-2xs">
            {FORECAST_TYPES.map(t => (
              <div key={t.type} className="flex justify-between gap-3">
                <span className="text-ink-500">{t.type}{t.blackout && <span className="ml-1 text-info-600">· off {t.blackout.start.slice(5)} → {t.blackout.end.slice(5)}</span>}</span>
                <span className="tnum font-medium text-ink-950">{t.perWeek}/wk</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Photo rules" sub="Required photo questions on Sutton's own report templates" right={<InBuild />} />
          <div className="flex flex-wrap gap-1.5 p-4">
            {PHOTO_RULES.map(p => <Badge key={p.key} tone={p.required === 'always' ? 'brand' : 'neutral'}>{p.label}</Badge>)}
          </div>
        </Card>

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
