import React from 'react'
import { Info, Receipt } from 'lucide-react'
import { JOBS } from '../data/suttons'
import { Card, CardHead, Th, Td, Badge, Stat } from './ui'
import { money, pct, cn } from '../lib/util'

/**
 * Finance → Budget, as Merlin's Project Actuals view.
 * Zoe, 23 Oct: estimated and actual cost "are usually different" — actual
 * includes things the customer can't be charged for (miscut 2×4s), and it only
 * lands once the bills are paid. Today that lives in QuickBooks: the WIP tab's
 * Cost to Date and Over / Under Budget columns are empty on every row.
 */
const EXAMPLE = [
  { code: 'FRM', line: '2×4×8 stud', budgetQty: 10, actualQty: 12, unit: 4.85, note: '2 miscut on site — a real cost, but not chargeable to the customer' },
  { code: 'FRM', line: 'Sheathing — approved change order', budgetQty: 4, actualQty: 4, unit: 32, note: 'Change orders raise the estimated cost too, so this one shows no variance' },
]

export default function Budget() {
  const wip = JOBS.filter(j => j.bucket === 'WIP')
  const budget = wip.reduce((s, j) => s + (j.estCost ?? 0), 0)
  const recorded = wip.filter(j => j.costToDate != null).length
  const exBudget = EXAMPLE.reduce((s, l) => s + l.budgetQty * l.unit, 0)
  const exActual = EXAMPLE.reduce((s, l) => s + l.actualQty * l.unit, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Jobs in progress" value={wip.length} sub="WIP tab" />
        <Stat label="Budget (estimated cost)" value={money(budget)} sub="seeded from each approved estimate" />
        <Stat label="Actual to date recorded" value={`${recorded} / ${wip.length}`} tone={recorded ? undefined : 'danger'} sub="Cost to Date is blank on every WIP row today" />
        <Stat label="Where actuals live today" value="QuickBooks" sub="once the bills are paid — not on the job" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="overflow-hidden">
          <CardHead title="Project actuals — work in progress" sub="Budget from the estimate · actual from bills and POs posted to the job · variance as it happens" />
          <div className="max-h-[calc(100vh-330px)] overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Job</Th><Th className="text-right">Contract</Th><Th className="text-right">Budget</Th>
                  <Th className="text-right">Actual to date (net)</Th><Th className="text-right">Variance</Th>
                  <Th className="w-[120px]">Complete</Th><Th className="text-right">Est. GP</Th>
                </tr>
              </thead>
              <tbody>
                {wip.map((j, i) => (
                  <tr key={`${j.jobNo}-${i}`} className="hover:bg-ink-50">
                    <Td>
                      <div className="font-medium text-ink-950">{j.customer}</div>
                      <div className="tnum text-2xs text-ink-400">{j.jobNo} · {j.jobType}</div>
                    </Td>
                    <Td className="text-right tnum">{money(j.contract)}</Td>
                    <Td className="text-right tnum">{money(j.estCost)}</Td>
                    <Td className="text-right">{j.costToDate != null ? money(j.costToDate) : <Badge tone="neutral">not in sheet</Badge>}</Td>
                    <Td className="text-right tnum text-ink-400">{j.costToDate != null && j.estCost ? money(j.estCost - j.costToDate) : '—'}</Td>
                    <Td>
                      {j.pctComplete != null && (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-200">
                            <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.min(100, j.pctComplete * 100)}%` }} />
                          </div>
                          <span className="tnum text-2xs text-ink-500">{pct(j.pctComplete, 0)}</span>
                        </div>
                      )}
                    </Td>
                    <Td className={cn('text-right tnum font-medium',
                      j.estGP == null ? 'text-ink-400' : j.estGP >= 0.425 ? 'text-ok-600' : j.estGP >= 0.385 ? 'text-warn-700' : 'text-danger-600')}>{pct(j.estGP)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Why estimated and actual differ" sub="Zoe's example — illustrative quantities, Sutton's codes" right={<Badge tone="warn">Example</Badge>} />
            <div className="divide-y divide-line">
              {EXAMPLE.map(l => {
                const v = (l.budgetQty - l.actualQty) * l.unit
                return (
                  <div key={l.line} className="px-4 py-2.5">
                    <div className="flex items-center gap-2 text-[12px]">
                      <Badge>{l.code}</Badge>
                      <span className="flex-1 font-medium text-ink-950">{l.line}</span>
                      <span className={cn('tnum font-semibold', v < 0 ? 'text-danger-600' : 'text-ink-500')}>{v < 0 ? money(v, 2) : '—'}</span>
                    </div>
                    <div className="mt-0.5 flex gap-3 pl-1 text-2xs text-ink-500">
                      <span>Budget {l.budgetQty} × {money(l.unit, 2)}</span><span>Actual {l.actualQty} × {money(l.unit, 2)}</span>
                    </div>
                    {l.note && <div className="mt-0.5 pl-1 text-2xs text-ink-400">{l.note}</div>}
                  </div>
                )
              })}
              <div className="flex items-baseline justify-between bg-ink-50 px-4 py-2 text-[12px]">
                <span className="text-ink-500">Budget {money(exBudget, 2)} · actual {money(exActual, 2)}</span>
                <span className="font-semibold text-danger-600">{money(exBudget - exActual, 2)} variance</span>
              </div>
            </div>
          </Card>
          <div className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-2xs text-ink-500">
            <Receipt size={14} className="mt-0.5 shrink-0 text-ink-400" />
            <span>
              The estimate's cost lines become the job's budget by phase code the moment it's approved. Bills and POs posted to the
              job are the actual — so the change order you <b className="text-ink-700">can</b> charge for and the miscut you <b className="text-ink-700">can't</b> both
              show up as variance, with the line that caused it.
            </span>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-2xs text-ink-500">
            <Info size={14} className="mt-0.5 shrink-0 text-ink-400" />
            Budget, contract, % complete and GP are read from the WIP tab. Actual to date is blank because Sutton's doesn't track it in the sheet.
          </div>
        </div>
      </div>
    </div>
  )
}
