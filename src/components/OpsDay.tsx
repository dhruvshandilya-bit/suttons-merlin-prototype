import React from 'react'
import { Truck, PackageOpen, Container, Users, Wrench } from 'lucide-react'
import { OPS_ROWS, OPS_PM_LANES, OPS_LOGISTICS } from '../data/suttons'
import { Card, CardHead, Badge, PMChip } from './ui'
import { parseCell, cn, PM_NAMES } from '../lib/util'

const PM_INITIALS: Record<string, string> = {
  'ADAM S': 'AS', 'BRIAN F': 'BF', 'CORTEZ': 'AC', 'HECTOR': 'HV',
  'JORDAN': 'JC', 'JOSH P': 'JP', 'Rich D.': 'RD',
}

export default function OpsDay() {
  let lastBand = ''
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
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
          <CardHead title="Project manager routes" sub="7 PMs — the columns on their day board" />
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

        <Card>
          <CardHead title="Pick-ups & deliveries" sub="Becomes PO delivery mode, not a spreadsheet block" />
          <div className="divide-y divide-line">
            {OPS_LOGISTICS.pickups.map((p, i) => (
              <div key={i} className="flex gap-2 px-4 py-2 text-2xs text-ink-600">
                <PackageOpen size={12} className="mt-0.5 shrink-0 text-warn-600" /><span>{p}</span>
              </div>
            ))}
            {OPS_LOGISTICS.deliveries.map((p, i) => (
              <div key={i} className="flex gap-2 px-4 py-2 text-2xs text-ink-600">
                <Truck size={12} className="mt-0.5 shrink-0 text-info-500" /><span>{p}</span>
              </div>
            ))}
          </div>
        </Card>

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
  )
}
