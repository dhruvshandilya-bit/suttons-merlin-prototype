import React, { useState } from 'react'
import {
  ChevronLeft, Camera, CheckCircle2, Circle, MapPin, Phone,
  FileText, Truck, Trash2, ExternalLink, DollarSign, Clock,
} from 'lucide-react'
import { cn } from '../lib/util'
import { ReportForm } from './DailyReports'
import type { DayJob } from '../data/daily'
import { MyDay, Materials, Photos, TimeOff } from './FieldExtras'

/** The Starrick 1401-26 carpenter folder, as a phone screen. */
const JOB = {
  no: '1401-26', customer: 'Starrick, Ted', phase: 'DRE — Doors Exterior',
  address: '1717 S Lincoln Ave, Springfield, IL 62704',
  pm: 'Cortez', pmCode: 'AC', lead: 'Brian W.',
  start: 'Thu 27 Aug', po: '12567', poAmount: '$250.00',
  progressPayment: 'Due upon substantial completion — $2,958.25',
  materials: 'Pick up material from the warehouse',
  hauling: 'N/A',
  phone: '(217) 494-3218',
  note: 'Please call Ted on your way out',
  links: ['GAF Roofing (English)', 'GAF Roofing (Spanish)', 'EPDM (video)', 'Royal Siding (English)', 'Provia — scan QR on box'],
}
/** Work-order steps from the DRE process flow. `photo` = Photo Required on the step. */
const STEPS = [
  { name: 'Check in with project manager', done: true },
  { name: 'Remove existing door and frame', done: true, photo: true },
  { name: 'Dry fit new Provia entry door', done: false },
  { name: 'Set, shim and fasten frame', done: false, photo: true },
  { name: 'Insulate and trim out', done: false },
  { name: 'Install storm door', done: false },
  { name: 'Final clean-up and photos', done: false, photo: true },
]

/** Today's daily log for this job — the same site reports the office sees on Projects → Daily Logs. */
const FIELD_JOB: DayJob = {
  jobNo: '1401-26', name: 'Starrick', customer: 'Starrick, Ted', pm: 'AC', phases: ['DRE'],
  crew: ['Brian Wanger'], starts: true, tags: [],
  deliveries: [{ key: 'f-wh', text: 'Provia entry door — pick up from the warehouse (verified 8/19)', source: 'warehouse' }],
}

type Tab = 'day' | 'work' | 'log' | 'materials' | 'photos' | 'timeoff'
const TABS: [Tab, string][] = [
  ['day', 'My day'], ['work', 'Work order'], ['log', 'Daily log'],
  ['materials', 'Materials'], ['photos', 'Photos'], ['timeoff', 'Time off'],
]

export default function Field() {
  const [steps, setSteps] = useState(STEPS)
  const [tab, setTab] = useState<Tab>('day')
  const done = steps.filter(s => s.done).length

  return (
    <div className="grid place-items-center py-6">
      <div className="w-[390px] overflow-hidden rounded-[2rem] border-[10px] border-ink-950 bg-white shadow-2xl">
        {/* status bar */}
        <div className="flex items-center justify-between bg-ink-950 px-6 py-1.5 text-[10px] text-white">
          <span>9:41</span><span className="tracking-widest">▂▄▆ ⌁</span>
        </div>

        {/* header */}
        <div className="bg-brand-400 px-4 pb-4 pt-3 text-white">
          <div className="flex items-center gap-2 text-[13px]">
            <ChevronLeft size={16} /> <span className="opacity-80">Today</span>
            <span className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{JOB.pmCode}</span>
          </div>
          <div className="mt-2 text-[17px] font-semibold leading-tight">{JOB.customer}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] opacity-90">
            <span className="tnum">{JOB.no}</span> · <span>{JOB.phase}</span>
          </div>
          <a className="mt-2 flex items-center gap-1.5 text-[12px] underline opacity-90">
            <MapPin size={12} /> {JOB.address}
          </a>
          <div className="mt-3 flex gap-2">
            <a className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/20 py-2 text-[12px] font-medium">
              <Phone size={13} /> Call Ted
            </a>
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/20 py-2 text-[12px] font-medium">
              <Clock size={13} /> Clock in
            </div>
          </div>
        </div>

        {/* alert carried from the reschedule reply-all */}
        <div className="border-b border-warn-500/30 bg-warn-50 px-4 py-2 text-[12px] text-warn-700">
          <b>Rescheduled</b> — start moved to {JOB.start}. {JOB.note}.
        </div>

        {/* tabs */}
        <div className="flex overflow-x-auto border-b border-line">
          {TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('shrink-0 px-3 py-2.5 text-[11.5px] font-medium',
                tab === t ? 'border-b-2 border-brand-400 text-brand-400' : 'text-ink-500')}>
              {label}
            </button>
          ))}
        </div>

        <div className="h-[430px] overflow-auto bg-surface p-3">
          {tab === 'work' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-white p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-ink-950">Scope</span>
                  <span className="tnum text-[11px] text-ink-500">{done}/{steps.length}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-200">
                  <div className="h-full rounded-full bg-brand-400 transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
                </div>
                <div className="mt-2.5 space-y-1">
                  {steps.map((s, i) => (
                    <button key={i}
                      onClick={() => setSteps(steps.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                      className="flex w-full items-start gap-2 rounded-lg px-1 py-1.5 text-left hover:bg-ink-50">
                      {s.done
                        ? <CheckCircle2 size={16} className="mt-px shrink-0 text-ok-600" />
                        : <Circle size={16} className="mt-px shrink-0 text-ink-300" />}
                      <span className={cn('flex-1 text-[12.5px]', s.done ? 'text-ink-400 line-through' : 'text-ink-800')}>{s.name}</span>
                      {s.photo && <span className="flex shrink-0 items-center gap-0.5 rounded bg-brand-50 px-1 text-[9px] font-medium text-brand-400"><Camera size={9} /> Photo required</span>}
                    </button>
                  ))}
                </div>
              </div>

              <Info icon={Truck} label="Materials" value={JOB.materials} />
              <Info icon={Trash2} label="Wrecking / hauling" value={JOB.hauling} />
              <Info icon={DollarSign} label="Progress payment (PM only)" value={JOB.progressPayment} />
              <Info icon={FileText} label="Purchase order" value={`PO-SUT-${JOB.po} · ${JOB.poAmount}`} />

              <div className="rounded-xl border border-line bg-white p-3">
                <div className="text-[12px] font-semibold text-ink-950">Install instructions</div>
                <div className="mt-1.5 space-y-1">
                  {JOB.links.map(l => (
                    <a key={l} className="flex items-center gap-1.5 text-[12px] text-brand-400">
                      <ExternalLink size={11} /> {l}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-3 text-[11px] text-ink-500">
                Invoices to <b className="text-ink-700">ap@suttonsinc.com</b> by <b className="text-ink-700">Tuesday 9:00 a.m.</b> for
                Friday payment. Include job name, job number, itemised amounts with quantities, and any PM-approved extras.
              </div>
            </div>
          )}

          {tab === 'day' && <MyDay />}
          {tab === 'log' && <ReportForm j={FIELD_JOB} />}
          {tab === 'materials' && <Materials />}
          {tab === 'timeoff' && <TimeOff />}
          {tab === 'photos' && <Photos />}

        </div>
      </div>

      <div className="mt-4 max-w-[420px] text-center text-2xs text-ink-500">
        What the crew does on the phone: their day (and the 5 pm plan for tomorrow), the work order with photo steps, the morning
        and evening reports, the truck's materials, before / after photos, and time off. Drivers get the warehouse run here; trade
        partners get a link by text or email instead of the app.
      </div>
    </div>
  )
}

const Info = ({ icon: Icon, label, value }: any) => (
  <div className="flex gap-2.5 rounded-xl border border-line bg-white p-3">
    <Icon size={15} className="mt-0.5 shrink-0 text-ink-400" />
    <div>
      <div className="text-[11px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-[12.5px] font-medium text-ink-900">{value}</div>
    </div>
  </div>
)
