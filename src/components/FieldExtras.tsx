import React, { useState } from 'react'
import { Bell, MapPin, Camera, Images, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '../lib/util'
import { InBuild } from './ops/bits'

/**
 * The field-app screens beyond the work order and the daily log — what the crew, PMs and drivers
 * do on the phone in the final Sutton's setup.
 */

/** My day: the 5 pm "your plan for tomorrow" push, then today's jobs in order. */
export function MyDay() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          <Bell size={11} /> Merlin · 5:00 pm yesterday <InBuild className="ml-auto" />
        </div>
        <div className="mt-1 text-[12.5px] font-semibold text-ink-950">Your plan for Thu 27 Aug</div>
        <div className="mt-0.5 space-y-0.5 text-[11.5px] text-ink-700">
          <div>Starrick 1401-26 — Doors Exterior — 1717 S Lincoln Ave</div>
          <div>Cochran 1366-26 — Storm door — 4 Hawthorn Ct</div>
        </div>
      </div>
      {[
        { t: '7:30', job: 'Starrick 1401-26', what: 'Doors Exterior · lead', place: '1717 S Lincoln Ave', pm: 'AC' },
        { t: '13:00', job: 'Cochran 1366-26', what: 'Storm door', place: '4 Hawthorn Ct', pm: 'AC' },
      ].map(r => (
        <div key={r.job} className="flex gap-3 rounded-xl border border-line bg-white p-3">
          <span className="tnum w-10 shrink-0 text-[12px] font-semibold text-ink-950">{r.t}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium text-ink-950">{r.job}</div>
            <div className="text-[11px] text-ink-500">{r.what} · PM {r.pm}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-400"><MapPin size={10} />{r.place}</div>
          </div>
        </div>
      ))}
      <div className="flex gap-2 rounded-xl border border-line bg-white p-3 text-[11px] text-ink-600">
        <Sparkles size={13} className="mt-0.5 shrink-0 text-ink-400" />
        <span><b className="text-ink-800">PMs:</b> Ask AI on the project dashboard gives the brief: latest notes, yesterday's next steps, what's due.</span>
      </div>
    </div>
  )
}

/** Daily Materials: what went on the truck this morning and what came back tonight. Office approves the return. */
export function Materials() {
  const [rows, setRows] = useState([
    { item: 'Provia entry door 36"', unit: 'ea', loaded: 1, back: 0 },
    { item: 'Low-expansion foam', unit: 'can', loaded: 4, back: 1 },
    { item: 'PVC trim 1x4x16', unit: 'pc', loaded: 6, back: 2 },
  ])
  const [sent, setSent] = useState(false)
  const set = (i: number, k: 'loaded' | 'back', v: number) =>
    setRows(r => r.map((x, j) => (j === i ? { ...x, [k]: Math.max(0, v) } : x)))
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-white p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-ink-950">Truck load and return</span>
          <span className="text-[10px] text-ink-400">or say it — voice fills the numbers</span>
        </div>
        <table className="mt-2 w-full text-[11.5px]">
          <thead><tr className="text-left text-[10px] uppercase tracking-wide text-ink-400">
            <th className="pb-1 font-medium">Item</th><th className="pb-1 text-right font-medium">Loaded</th>
            <th className="pb-1 text-right font-medium">Back</th><th className="pb-1 text-right font-medium">Used</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.item} className="border-t border-line">
                <td className="py-1.5 text-ink-800">{r.item}</td>
                {(['loaded', 'back'] as const).map(k => (
                  <td key={k} className="py-1.5 text-right">
                    <input type="number" value={r[k]} onChange={e => set(i, k, Number(e.target.value))}
                      className="tnum w-12 rounded border border-line px-1 text-right" />
                  </td>
                ))}
                <td className="tnum py-1.5 text-right font-semibold text-ink-950">{r.loaded - r.back} {r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sent
        ? <div className="flex items-center gap-1.5 rounded-xl bg-ok-50 px-3 py-2 text-[11.5px] text-ok-700"><CheckCircle2 size={13} /> Sent to the office — stock and job cost move once they approve.</div>
        : <button onClick={() => setSent(true)} className="w-full rounded-xl bg-brand-400 py-2.5 text-[12.5px] font-semibold text-white">Send evening return</button>}
      <div className="text-[10.5px] text-ink-500">Used = loaded − back. It lands on the job's cost only after the office approves the return.</div>
    </div>
  )
}

/** Photos: Bespoke = a before / after pair with a location; Normal = anything else. */
export function Photos() {
  const [filter, setFilter] = useState<'All' | 'Bespoke' | 'Normal'>('All')
  const photos = [
    { kind: 'Bespoke', label: 'Front entry — before / after' },
    { kind: 'Bespoke', label: 'Driveway crack (day 1) — before' },
    { kind: 'Normal', label: 'Frame out' },
    { kind: 'Normal', label: 'Dry fit' },
  ].filter(p => filter === 'All' || p.kind === filter)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button className="flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-ink-300 bg-white py-5 text-[12px] font-medium text-ink-600">
          <Camera size={17} /> Normal photo
        </button>
        <button className="flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-brand-300 bg-white py-5 text-[12px] font-medium text-brand-400">
          <Images size={17} /> Bespoke before / after
        </button>
      </div>
      <div className="flex gap-1">
        {(['All', 'Bespoke', 'Normal'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', filter === f ? 'bg-ink-950 text-white' : 'bg-white text-ink-600 ring-1 ring-line')}>{f}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          <div key={i} className="aspect-[4/3] rounded-lg bg-gradient-to-br from-ink-200 to-ink-300">
            <div className="flex h-full flex-col justify-end p-1.5">
              <span className="text-[9px] font-semibold uppercase text-ink-600">{p.kind}</span>
              <span className="text-[10px] font-medium text-ink-800">{p.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[10.5px] text-ink-500">
        All in Project Files → Photos. Start-of-day, end-of-day and damage photos are also asked on the morning and evening reports.
      </div>
    </div>
  )
}

/** Time off: what a crew member (or the office, for them) files. */
export function TimeOff() {
  const [type, setType] = useState('Called in')
  const [sent, setSent] = useState(false)
  const types = [
    { t: 'Leave', live: true }, { t: 'Overtime', live: true },
    { t: 'Called in', live: false }, { t: 'Sick', live: false }, { t: 'Vacation', live: false },
  ]
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-white p-3">
        <div className="text-[12px] font-semibold text-ink-950">Request time off</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {types.map(x => (
            <button key={x.t} onClick={() => setType(x.t)}
              className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
                type === x.t ? 'bg-brand-400 text-white' : 'bg-ink-50 text-ink-700 ring-1 ring-line')}>
              {x.t}{!x.live && <span className={cn('text-[8.5px] font-bold uppercase', type === x.t ? 'text-white/80' : 'text-info-600')}>new</span>}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <label className="space-y-0.5"><span className="text-ink-500">From</span><div className="rounded border border-line px-2 py-1">Thu 27 Aug</div></label>
          <label className="space-y-0.5"><span className="text-ink-500">To</span><div className="rounded border border-line px-2 py-1">Thu 27 Aug</div></label>
        </div>
      </div>
      {sent
        ? <div className="flex items-center gap-1.5 rounded-xl bg-ok-50 px-3 py-2 text-[11.5px] text-ok-700"><CheckCircle2 size={13} /> Sent — it shows on the Operations calendar as crew time off.</div>
        : <button onClick={() => setSent(true)} className="w-full rounded-xl bg-brand-400 py-2.5 text-[12.5px] font-semibold text-white">Send</button>}
      <div className="flex items-center gap-1.5 text-[10.5px] text-ink-500">
        <InBuild /> Called in, Sick and Vacation are being added. Leave and Overtime are in the app today.
      </div>
    </div>
  )
}
