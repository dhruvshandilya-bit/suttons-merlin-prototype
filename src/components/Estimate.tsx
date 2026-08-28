import React, { useMemo, useState } from 'react'
import { Check, ChevronDown, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { RATE_CARDS, RULES, PHASES } from '../data/suttons'
import { Card, CardHead, Badge, Th, Td, Button } from './ui'
import { money, pct, cn } from '../lib/util'

type Qty = Record<string, number>

export default function Estimate() {
  const [cardIdx, setCardIdx] = useState(0)
  const card = RATE_CARDS[cardIdx]
  const [crew, setCrew] = useState(0)
  // seeded to reproduce a real siding job off their own rate card
  const [qty, setQty] = useState<Qty>(() => ({
    'INSTALLATION SIDING::SIDING REMOVAL STEEL/ALUMINIUM/VINYL (Includes tear off of existing siding w/ disposal)': 24,
    'INSTALLATION SIDING::VINYL/(this includes the installation of fanfold or house wrap including taping all seams and flashing windows/doors and': 24,
    'CLADDING::SINGLE WINDOW - CLADDING': 7,
    'GUTTER & SOFFIT/ FASCIA::REMOVE GUTTERS (includes removal of gutters and disposal)': 120,
  }))
  const [material, setMaterial] = useState(6480.94)
  const [tradePartner, setTradePartner] = useState(191.09)
  const [contract, setContract] = useState(15600)

  const key = (i: any) => `${i.group}::${i.name}`
  const lines = useMemo(
    () => card.items.map(i => ({ ...i, q: qty[key(i)] ?? 0, rate: i.rates[crew] ?? 0 }))
      .filter(l => l.q > 0)
      .map(l => ({ ...l, total: l.q * (l.rate ?? 0) })),
    [card, crew, qty],
  )

  const labor = lines.reduce((s, l) => s + l.total, 0)
  const subtotal = labor + material + tradePartner
  const isSmall = subtotal < RULES['Small Job Threshold']
  const gpTarget = isSmall ? RULES['Small Job GP Target'] : RULES['Standard Job GP Target']
  const minSell = subtotal / (1 - gpTarget)
  const overhead = minSell - subtotal
  const gp = contract > 0 ? (contract - subtotal) / contract : 0
  const changeOrderNeeded = Math.max(0, minSell - contract)

  const ownerT = RULES['Owner Approval GP Threshold']
  const tier =
    gp >= gpTarget ? { label: 'No approval needed', tone: 'ok' as const, Icon: ShieldCheck }
    : gp >= ownerT ? { label: 'Manager approval required', tone: 'warn' as const, Icon: ShieldAlert }
    : { label: 'Owner approval required', tone: 'danger' as const, Icon: ShieldX }

  const spotCheck = contract > RULES['Standard Verification Threshold']
    ? 'Spot check required — over $50k'
    : contract > RULES['Remodeling Verification Threshold']
      ? 'Spot check required if remodeling — over $20k' : null

  const byPhase = useMemo(() => {
    const trade = card.trade
    const rows = [
      { code: trade, name: PHASES.find(p => p.code === trade)?.name ?? trade, cost: labor + material },
      { code: 'WRH', name: 'Wrecking & Hauling', cost: tradePartner },
    ].filter(r => r.cost > 0)
    return rows.map(r => ({ ...r, sell: r.cost / (1 - gpTarget) }))
  }, [card, labor, material, tradePartner, gpTarget])

  const groups = useMemo(() => Array.from(new Set(card.items.map(i => i.group))), [card])
  const [open, setOpen] = useState<string | null>(groups[1] ?? groups[0])

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Card>
          <CardHead
            title="Rate card"
            sub={`${card.tab} · ${card.items.length} line items · loaded from Master Costing`}
            right={
              <div className="flex items-center gap-2">
                <select value={cardIdx} onChange={e => { setCardIdx(+e.target.value); setCrew(0) }}
                  className="h-7 rounded-lg border border-line bg-white px-2 text-2xs">
                  {RATE_CARDS.map((c, i) => <option key={c.tab} value={i}>{c.tab}</option>)}
                </select>
              </div>
            }
          />
          <div className="border-b border-line px-4 py-2.5">
            <div className="text-2xs font-semibold uppercase tracking-wide text-ink-500">Who does the work</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {card.crews.map((c, i) => {
                const cost = card.items.reduce((s, it) => s + (qty[`${it.group}::${it.name}`] ?? 0) * (it.rates[i] ?? 0), 0)
                const best = card.crews.every((_, j) =>
                  cost <= card.items.reduce((s, it) => s + (qty[`${it.group}::${it.name}`] ?? 0) * (it.rates[j] ?? 0), 0) || cost === 0)
                return (
                  <button key={c} onClick={() => setCrew(i)}
                    className={cn('rounded-lg border px-3 py-1.5 text-left transition-colors',
                      crew === i ? 'border-brand-400 bg-brand-50' : 'border-line bg-white hover:bg-ink-50')}>
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink-950">
                      {c}
                      {crew === i && <Check size={11} className="text-brand-400" />}
                      {best && cost > 0 && crew !== i && <Badge tone="ok">cheapest</Badge>}
                    </div>
                    <div className="tnum text-2xs text-ink-500">{cost > 0 ? money(cost, 2) : '—'}</div>
                  </button>
                )
              })}
            </div>
            <div className="mt-1.5 text-2xs text-ink-500">
              Same line item, one price per crew — exactly the hidden columns in their labour tabs.
            </div>
          </div>

          <div className="max-h-[420px] overflow-auto">
            {groups.map(g => (
              <div key={g}>
                <button onClick={() => setOpen(open === g ? null : g)}
                  className="flex w-full items-center gap-2 border-b border-line bg-ink-50 px-4 py-2 text-left text-2xs font-bold uppercase tracking-wide text-ink-600 hover:bg-ink-100">
                  <ChevronDown size={12} className={cn('transition-transform', open !== g && '-rotate-90')} />
                  {g}
                </button>
                {open === g && (
                  <table className="w-full">
                    <thead>
                      <tr>
                        <Th>Line item</Th><Th className="w-16">Unit</Th>
                        <Th className="w-20 text-right">Rate</Th>
                        <Th className="w-20 text-right">Qty</Th>
                        <Th className="w-24 text-right">Total</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.items.filter(i => i.group === g).map(i => {
                        const k = key(i), q = qty[k] ?? 0, rate = i.rates[crew]
                        return (
                          <tr key={k} className={cn(q > 0 && 'bg-brand-50/40')}>
                            <Td className="text-[12px]" title={i.name}>{i.name.slice(0, 78)}{i.name.length > 78 ? '…' : ''}</Td>
                            <Td className="text-2xs text-ink-500">{i.unit}</Td>
                            <Td className="text-right tnum">{rate == null ? '—' : money(rate, 2)}</Td>
                            <Td className="text-right">
                              <input type="number" min={0} value={q || ''} placeholder="0"
                                onChange={e => setQty({ ...qty, [k]: Number(e.target.value) })}
                                className="h-6 w-16 rounded border border-line px-1.5 text-right text-[12px] tnum focus:border-brand-400 focus:outline-none" />
                            </Td>
                            <Td className={cn('text-right tnum', q > 0 && 'font-semibold text-ink-950')}>
                              {q > 0 && rate != null ? money(q * rate, 2) : '—'}
                            </Td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Sell price by phase" sub="Seeds the project budget on conversion — no re-keying" />
          <table className="w-full">
            <thead><tr><Th>Phase</Th><Th className="text-right">Cost</Th><Th className="text-right">Sell price</Th></tr></thead>
            <tbody>
              {byPhase.map(r => (
                <tr key={r.code}>
                  <Td className="font-medium text-ink-950">{r.code} — {r.name}</Td>
                  <Td className="text-right tnum">{money(r.cost, 2)}</Td>
                  <Td className="text-right tnum font-semibold">{money(r.sell, 2)}</Td>
                </tr>
              ))}
              <tr className="bg-ink-50">
                <Td className="font-semibold text-ink-950">Total</Td>
                <Td className="text-right tnum font-semibold">{money(byPhase.reduce((s, r) => s + r.cost, 0), 2)}</Td>
                <Td className="text-right tnum font-semibold">{money(byPhase.reduce((s, r) => s + r.sell, 0), 2)}</Td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      {/* cover sheet */}
      <div className="space-y-4">
        <Card>
          <CardHead title="Job cost breakdown" sub="Their cover sheet, computed" />
          <div className="divide-y divide-line">
            <Line label="Labor" value={money(labor, 2)} />
            <LineInput label="Material" value={material} onChange={setMaterial} />
            <LineInput label="Trade partner / equipment" value={tradePartner} onChange={setTradePartner} />
            <Line label="Subtotal cost" value={money(subtotal, 2)} strong />
            <Line label="Overhead markup" value={money(overhead, 2)} />
            <Line label="Minimum sell price" value={money(minSell, 2)} strong />
          </div>
        </Card>

        <Card>
          <CardHead
            title="Contract metrics"
            right={<Badge tone={isSmall ? 'info' : 'neutral'}>{isSmall ? 'Small job' : 'Standard'}</Badge>}
          />
          <div className="divide-y divide-line">
            <LineInput label="Contract amount" value={contract} onChange={setContract} />
            <Line label="Change order needed" value={money(changeOrderNeeded, 2)} tone={changeOrderNeeded > 0 ? 'danger' : undefined} />
            <Line label="Estimated gross profit" value={pct(gp, 2)} strong tone={gp >= gpTarget ? 'ok' : gp >= ownerT ? 'warn' : 'danger'} />
            <Line label="Gross profit target" value={pct(gpTarget, 2)} />
          </div>
          <div className={cn('flex items-center gap-2 border-t border-line px-4 py-3',
            tier.tone === 'ok' && 'bg-ok-50', tier.tone === 'warn' && 'bg-warn-50', tier.tone === 'danger' && 'bg-danger-50')}>
            <tier.Icon size={16} className={cn(tier.tone === 'ok' && 'text-ok-600', tier.tone === 'warn' && 'text-warn-700', tier.tone === 'danger' && 'text-danger-600')} />
            <div>
              <div className={cn('text-[13px] font-semibold',
                tier.tone === 'ok' && 'text-ok-700', tier.tone === 'warn' && 'text-warn-700', tier.tone === 'danger' && 'text-danger-700')}>
                {tier.label}
              </div>
              <div className="text-2xs text-ink-500">
                &gt;{pct(gpTarget, 1)} none · {pct(ownerT, 1)}–{pct(gpTarget, 1)} manager · &lt;{pct(ownerT, 1)} owner
              </div>
            </div>
          </div>
          {spotCheck && (
            <div className="border-t border-line bg-ink-50 px-4 py-2 text-2xs text-ink-600">{spotCheck}</div>
          )}
        </Card>

        <Card>
          <CardHead title="Org rules in play" sub="Loaded from DROPDOWNLIST" />
          <div className="space-y-1.5 px-4 py-3 text-2xs">
            {Object.entries(RULES).filter(([k]) => !k.startsWith('Zero')).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-ink-500">{k}</span>
                <span className="tnum font-medium text-ink-950">
                  {v < 1 && v > 0 ? pct(v, 2) : v >= 1000 ? money(v) : v}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Button className="w-full" disabled={gp < ownerT}>
          {gp >= gpTarget ? 'Ready to send — release to scheduling' : gp >= ownerT ? 'Send for manager approval' : 'Blocked — below owner threshold'}
        </Button>
      </div>
    </div>
  )
}

const Line = ({ label, value, strong, tone }: any) => (
  <div className="flex items-center justify-between px-4 py-2">
    <span className={cn('text-[13px]', strong ? 'font-medium text-ink-950' : 'text-ink-600')}>{label}</span>
    <span className={cn('tnum text-[13px]', strong && 'font-semibold',
      tone === 'ok' && 'text-ok-600', tone === 'warn' && 'text-warn-700', tone === 'danger' && 'text-danger-600',
      !tone && 'text-ink-950')}>{value}</span>
  </div>
)
const LineInput = ({ label, value, onChange }: any) => (
  <div className="flex items-center justify-between px-4 py-2">
    <span className="text-[13px] text-ink-600">{label}</span>
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
      className="h-7 w-28 rounded border border-line px-2 text-right text-[13px] tnum focus:border-brand-400 focus:outline-none" />
  </div>
)
