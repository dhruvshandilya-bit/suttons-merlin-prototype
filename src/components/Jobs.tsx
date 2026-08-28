import React, { useMemo, useState } from 'react'
import { Search, FileWarning, MapPin, Stamp } from 'lucide-react'
import { JOBS, type Job } from '../data/suttons'
import { Card, Th, Td, Badge, PMChip, Empty, Button } from './ui'
import { PageHeader, StatusTabs, TableCard } from './shell'
import { money, pct, shortDate, cn } from '../lib/util'

const BUCKETS = ['JNS', 'WIP', 'AR', 'Callback', 'Punchlist', 'Legal', 'Cancelled', 'Closed'] as const
const LABEL: Record<string, string> = {
  JNS: 'Jobs not started', WIP: 'Work in progress', AR: 'Receivables',
  Callback: 'Callback', Punchlist: 'Punchlist', Legal: 'Legal', Cancelled: 'Cancelled', Closed: 'Closed',
}

export default function Jobs() {
  const [bucket, setBucket] = useState<typeof BUCKETS[number]>('JNS')
  const [q, setQ] = useState('')
  const [svc, setSvc] = useState('All')
  const [onlyUncosted, setOnlyUncosted] = useState(false)

  const services = useMemo(() => ['All', ...Array.from(new Set(JOBS.map(j => j.serviceType).filter(Boolean)))], [])
  const rows = useMemo(() => JOBS.filter(j =>
    j.bucket === bucket &&
    (svc === 'All' || j.serviceType === svc) &&
    (!onlyUncosted || !j.estCost) &&
    (!q || `${j.customer} ${j.jobNo} ${j.jobType} ${j.sales} ${j.estimator}`.toLowerCase().includes(q.toLowerCase()))
  ), [bucket, svc, q, onlyUncosted])

  const uncosted = JOBS.filter(j => j.bucket === bucket && !j.estCost).length

  return (
    <>
      <PageHeader
        title="Projects"
        sub="Jobs → Home · from Sutton's Job Status"
        search="Search projects"
        actions={<Button>+ Add project</Button>}
      />
      <StatusTabs
        value={bucket}
        onChange={(k: any) => setBucket(k)}
        items={BUCKETS.map(b => ({ key: b, label: LABEL[b], count: JOBS.filter(j => j.bucket === b).length }))}
      />
      <div className="flex flex-wrap items-center gap-2 px-6 py-3">
        <select value={svc} onChange={e => setSvc(e.target.value)} className="h-8 rounded-lg border border-line bg-white px-2 text-2xs">
          {services.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setOnlyUncosted(!onlyUncosted)}
          className={cn('flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-2xs font-medium',
            onlyUncosted ? 'border-warn-500 bg-warn-50 text-warn-700' : 'border-line bg-white text-ink-600 hover:bg-ink-50')}>
          <FileWarning size={12} /> Not costed <span className="opacity-60">{uncosted}</span>
        </button>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customer, job #, rep…"
            className="h-8 w-64 rounded-lg border border-line bg-white pl-7 pr-2 text-[13px] focus:border-brand-300 focus:outline-none" />
        </div>
      </div>

      <TableCard title="Projects" count={rows.length} right={<span className="mr-2 text-2xs text-ink-500">Rows per load 50</span>}>
        <div className="max-h-[calc(100vh-300px)] overflow-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Customer</Th><Th>Job #</Th><Th>Service</Th><Th>Type</Th>
                <Th>Sales / Estimator</Th><Th className="text-right">Contract</Th>
                <Th className="text-right">Balance</Th><Th className="text-right">Est. cost</Th>
                <Th className="text-right">GP</Th><Th>Zone</Th><Th>Permit</Th><Th>S.O.</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j, i) => (
                <tr key={`${j.jobNo}-${j.customer}-${i}`} className="hover:bg-ink-50">
                  <Td className="max-w-[190px]">
                    <div className="truncate font-medium text-ink-950">{j.customer}</div>
                    {j.notes && <div className="truncate text-2xs text-ink-400" title={j.notes}>{j.notes.split('\n')[0]}</div>}
                  </Td>
                  <Td className="tnum">{j.jobNo}</Td>
                  <Td><Badge tone={j.serviceType === 'Exteriors' ? 'info' : j.serviceType === 'Remodeling' ? 'brand' : 'neutral'}>{j.serviceType}</Badge></Td>
                  <Td className="max-w-[150px] truncate text-2xs" title={j.jobType}>{j.jobType}</Td>
                  <Td className="text-2xs">
                    <div>{j.sales}</div>
                    <div className="text-ink-400">{j.estimator ?? '—'}</div>
                  </Td>
                  <Td className="text-right tnum">{money(j.contract)}</Td>
                  <Td className="text-right tnum">{money(j.balance)}</Td>
                  <Td className={cn('text-right tnum', !j.estCost && 'text-warn-700')}>
                    {j.estCost ? money(j.estCost) : <Badge tone="warn">not costed</Badge>}
                  </Td>
                  <Td className={cn('text-right tnum font-medium',
                    j.estGP == null ? 'text-ink-400' : j.estGP >= 0.425 ? 'text-ok-600' : j.estGP >= 0.385 ? 'text-warn-700' : 'text-danger-600')}>
                    {pct(j.estGP)}
                  </Td>
                  <Td className="text-2xs">{j.zone && <span className="flex items-center gap-1 text-ink-500"><MapPin size={10} />{j.zone.replace('Zone ', 'Z')}</span>}</Td>
                  <Td>
                    {j.permit && j.permit !== 'N/A' && (
                      <Badge tone={j.permit === 'FILED' ? 'ok' : 'warn'}>
                        <Stamp size={9} />{j.permit}
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-2xs">{j.so && <Badge tone={j.so.includes('All Here') ? 'ok' : 'info'}>{j.so}</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty>No jobs match.</Empty>}
        </div>
      </TableCard>
      <div className="px-6 py-3 text-2xs text-ink-500">
        {rows.length} of {JOBS.filter(j => j.bucket === bucket).length} · loaded from <b>Sutton's Job Status</b>.
        Zone and Permit Status are real columns nobody mentioned on the call.
      </div>
    </>
  )
}
