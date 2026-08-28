import React from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { SCORECARD, COUNTERS } from '../data/suttons'
import { Card, CardHead, Stat, Th, Td, Badge } from './ui'
import { money, pct, cn } from '../lib/util'

export default function Scorecard() {
  const t = SCORECARD.totals
  const agingTotal = SCORECARD.aging.reduce((s, a) => s + (a.amount ?? 0), 0)
  const over30 = (SCORECARD.aging[0].amount ?? 0) + (SCORECARD.aging[1].amount ?? 0) + (SCORECARD.aging[2].amount ?? 0)

  return (
    <div className="space-y-4">
      {/* the number that matters */}
      <div className="flex items-start gap-3 rounded-xl border border-warn-500/40 bg-warn-50 px-4 py-3">
        <TrendingDown size={18} className="mt-0.5 shrink-0 text-warn-700" />
        <div>
          <div className="text-[13px] font-semibold text-warn-700">
            {t.notCosted} of {t.total} jobs are not costed — {pct(t.pctNot, 0)} of the backlog
          </div>
          <div className="mt-0.5 text-2xs text-warn-700/80">
            Scheduling can't plug a job until estimating releases it. This is the constraint on the whole pipeline.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {SCORECARD.portfolios.map(p => (
          <Stat
            key={p.name}
            label={p.name}
            value={p.count ?? '—'}
            sub={`${money(p.contract)} · ${money(p.outstanding)} out`}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHead
            title="Backlog by project type"
            sub="Jobs Not Started — costed vs waiting on estimating"
          />
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Project type</Th><Th className="text-right">Total</Th>
                  <Th className="text-right">Costed</Th><Th className="text-right">Not costed</Th>
                  <Th className="w-[130px]">% not costed</Th>
                  <Th className="text-right">Contract</Th><Th className="text-right">Balance due</Th>
                </tr>
              </thead>
              <tbody>
                {SCORECARD.costing.map(r => (
                  <tr key={r.type} className="hover:bg-ink-50">
                    <Td className="font-medium text-ink-950">{r.type}</Td>
                    <Td className="text-right tnum">{r.total}</Td>
                    <Td className="text-right tnum text-ink-500">{r.costed}</Td>
                    <Td className={cn('text-right tnum font-medium', r.notCosted > 0 && 'text-warn-700')}>{r.notCosted}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-200">
                          <div
                            className={cn('h-full rounded-full', r.pctNot > 0.5 ? 'bg-danger-500' : r.pctNot > 0.3 ? 'bg-warn-500' : 'bg-ok-500')}
                            style={{ width: `${Math.min(100, r.pctNot * 100)}%` }}
                          />
                        </div>
                        <span className="tnum text-2xs text-ink-500">{pct(r.pctNot, 0)}</span>
                      </div>
                    </Td>
                    <Td className="text-right tnum">{money(r.contract)}</Td>
                    <Td className="text-right tnum">{money(r.balance)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead
              title="Receivables ageing"
              sub={`${money(agingTotal)} outstanding`}
              right={<Badge tone="danger">{money(over30)} over 30</Badge>}
            />
            <div className="space-y-2 p-4">
              {SCORECARD.aging.map((a, i) => {
                const share = agingTotal ? (a.amount ?? 0) / agingTotal : 0
                return (
                  <div key={a.bucket}>
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className={cn(i === 0 ? 'font-medium text-danger-600' : 'text-ink-700')}>{a.bucket}</span>
                      <span className="tnum text-ink-950">{money(a.amount)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-200">
                      <div
                        className={cn('h-full rounded-full', i === 0 ? 'bg-danger-500' : i === 1 ? 'bg-warn-500' : 'bg-brand-300')}
                        style={{ width: `${share * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHead title="Sequence counters" sub="Continued from Sutton's, not restarted" />
            <div className="grid grid-cols-2 divide-x divide-line">
              <div className="px-4 py-3">
                <div className="text-2xs uppercase tracking-wide text-ink-500">Next PO</div>
                <div className="mt-0.5 text-lg font-semibold tnum">PO-SUT-{COUNTERS.po + 1}</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-2xs uppercase tracking-wide text-ink-500">Next job</div>
                <div className="mt-0.5 text-lg font-semibold tnum">{COUNTERS.job + 1}-26</div>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-2xs text-ink-500">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-ink-400" />
            Every figure on this page is read from Sutton's own <span className="font-medium text-ink-700">Job Status → Scorecard</span> tab. Nothing is invented.
          </div>
        </div>
      </div>
    </div>
  )
}
