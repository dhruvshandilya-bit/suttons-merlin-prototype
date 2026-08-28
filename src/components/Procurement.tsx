import React, { useMemo, useState } from 'react'
import { Truck, Warehouse, MailCheck, Mail, CheckCircle2, Clock, Send, PackageCheck } from 'lucide-react'
import { SPECIAL_ORDERS, VENDORS, COUNTERS, type SpecialOrder } from '../data/suttons'
import { useStore } from '../state/store'
import { Card, CardHead, Th, Td, Badge, Button, Empty } from './ui'
import { shortDate, cn } from '../lib/util'

const STATUS_TONE: Record<string, any> = {
  'Ordered': 'info', 'Ready at Vendor': 'warn', 'Ready at Warehouse': 'brand',
  'Delivered to Jobsite': 'ok', 'Picked Up': 'ok',
}

export default function Procurement() {
  const { bumpPo, poCounter } = useStore()
  const [view, setView] = useState<'orders' | 'digest'>('orders')
  const [vendor, setVendor] = useState('All')
  const [acked, setAcked] = useState<Record<string, boolean>>({})

  const vendors = useMemo(() => ['All', ...Array.from(new Set(SPECIAL_ORDERS.map(s => s.vendor).filter(Boolean)))], [])
  const rows = useMemo(() => SPECIAL_ORDERS.filter(s => vendor === 'All' || s.vendor === vendor), [vendor])

  const byVendor = useMemo(() => {
    const m = new Map<string, SpecialOrder[]>()
    SPECIAL_ORDERS.filter(s => s.status === 'Ordered' || s.status === 'Ready at Vendor')
      .forEach(s => m.set(s.vendor, [...(m.get(s.vendor) ?? []), s]))
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6)
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-0.5">
          <button onClick={() => setView('orders')}
            className={cn('rounded-md px-3 py-1 text-2xs font-medium', view === 'orders' ? 'bg-brand-400 text-white' : 'text-ink-600 hover:bg-ink-100')}>
            Purchase orders <span className="ml-1 opacity-60">{SPECIAL_ORDERS.length}</span>
          </button>
          <button onClick={() => setView('digest')}
            className={cn('rounded-md px-3 py-1 text-2xs font-medium', view === 'digest' ? 'bg-brand-400 text-white' : 'text-ink-600 hover:bg-ink-100')}>
            Vendor delivery schedule
          </button>
        </div>
        {view === 'orders' && (
          <select value={vendor} onChange={e => setVendor(e.target.value)} className="h-8 rounded-lg border border-line bg-white px-2 text-2xs">
            {vendors.map(v => <option key={v}>{v}</option>)}
          </select>
        )}
        <div className="ml-auto flex items-center gap-2 text-2xs text-ink-500">
          Next PO <span className="tnum rounded bg-ink-100 px-1.5 py-0.5 font-semibold text-ink-950">PO-SUT-{poCounter + 1}</span>
        </div>
      </div>

      {view === 'orders' ? (
        <Card className="overflow-hidden">
          <div className="max-h-[calc(100vh-230px)] overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>PO #</Th><Th>Job</Th><Th>Phase</Th><Th>Vendor</Th><Th>Material</Th>
                  <Th>Ordered by</Th><Th>Expected</Th><Th>Route</Th><Th>Status</Th><Th>Verified</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr key={i} className="hover:bg-ink-50">
                    <Td className="tnum font-medium text-ink-950">{s.po ? `PO-SUT-${s.po}` : '—'}</Td>
                    <Td><div className="font-medium text-ink-950">{s.jobName}</div><div className="tnum text-2xs text-ink-400">{s.jobNo}</div></Td>
                    <Td><Badge tone="neutral">{s.phase}</Badge></Td>
                    <Td className="text-[12px]">{s.vendor}</Td>
                    <Td className="max-w-[240px] truncate text-[12px]" title={s.description}>{s.description}</Td>
                    <Td className="text-2xs text-ink-500">{s.orderedBy}</Td>
                    <Td className="text-2xs tnum">{shortDate(s.expected)}</Td>
                    <Td>
                      <span className="flex items-center gap-1 text-2xs text-ink-500">
                        {s.deliverTo?.includes('Warehouse') ? <Warehouse size={11} /> : <Truck size={11} />}
                        {s.deliverTo?.replace('Vendor to ', '') ?? '—'}
                      </span>
                    </Td>
                    <Td><Badge tone={STATUS_TONE[s.status] ?? 'neutral'}>{s.status}</Badge></Td>
                    <Td>{s.verified ? <CheckCircle2 size={14} className="text-ok-600" /> : <span className="text-2xs text-ink-400">—</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <Empty>No purchase orders.</Empty>}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {byVendor.map(([v, orders]) => {
            const isAcked = acked[v]
            return (
              <Card key={v}>
                <CardHead
                  title={v}
                  sub={`${orders.length} deliveries this week`}
                  right={
                    isAcked
                      ? <Badge tone="ok"><MailCheck size={10} /> Acknowledged</Badge>
                      : <Button size="sm" variant="outline" onClick={() => setAcked({ ...acked, [v]: true })}>
                          <Send size={11} /> Send
                        </Button>
                  }
                />
                <div className="divide-y divide-line">
                  {orders.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 text-[12px]">
                      <span className="w-[70px] shrink-0 tnum text-2xs text-ink-400">{shortDate(s.expected)}</span>
                      <span className="font-medium text-ink-950">{s.jobName}</span>
                      <span className="tnum text-2xs text-ink-400">{s.jobNo}</span>
                      <Badge tone="neutral">{s.phase}</Badge>
                      <span className="ml-auto tnum text-2xs text-ink-500">PO-SUT-{s.po}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-line bg-ink-50 px-4 py-2 text-2xs text-ink-500">
                  {isAcked
                    ? <><PackageCheck size={12} className="text-ok-600" /> Vendor opened the link and confirmed dates — no reply-all thread</>
                    : <><Clock size={12} /> Replaces the Thursday “{v.toUpperCase()} WEEK OF …” email</>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-2xs text-ink-500">
        <Mail size={14} className="mt-0.5 shrink-0 text-ink-400" />
        <span>
          Every row is a real line from <b className="text-ink-700">Special Order Materials</b> — their spreadsheet already
          carries PO number, ordered-by, expected date, delivery route, status and a verification column.
          The PO series continues from <b className="text-ink-700">{COUNTERS.po}</b>, it does not restart.
        </span>
      </div>
    </div>
  )
}
