import React, { useState } from 'react'
import {
  ChevronLeft, Camera, MessageSquare, CheckCircle2, Circle, MapPin, Phone,
  FileText, Truck, Trash2, ExternalLink, DollarSign, Clock,
} from 'lucide-react'
import { cn } from '../lib/util'

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
const STEPS = [
  { name: 'Check in with project manager', done: true },
  { name: 'Remove existing door and frame', done: true },
  { name: 'Dry fit new Provia entry door', done: false },
  { name: 'Set, shim and fasten frame', done: false },
  { name: 'Insulate and trim out', done: false },
  { name: 'Install storm door', done: false },
  { name: 'Final clean-up and photos', done: false },
]

export default function Field() {
  const [steps, setSteps] = useState(STEPS)
  const [tab, setTab] = useState<'work' | 'photos' | 'chat'>('work')
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
        <div className="flex border-b border-line">
          {(['work', 'photos', 'chat'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('flex-1 py-2.5 text-[12px] font-medium capitalize',
                tab === t ? 'border-b-2 border-brand-400 text-brand-400' : 'text-ink-500')}>
              {t === 'work' ? 'Work' : t === 'photos' ? 'Photos' : 'Chat'}
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
                      <span className={cn('text-[12.5px]', s.done ? 'text-ink-400 line-through' : 'text-ink-800')}>{s.name}</span>
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

          {tab === 'photos' && (
            <div className="space-y-3">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-white py-8 text-[13px] font-medium text-ink-600">
                <Camera size={18} /> Take progress photo
              </button>
              <div className="grid grid-cols-3 gap-2">
                {['Before', 'Before', 'Frame out', 'Dry fit'].map((c, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-ink-200 to-ink-300">
                    <div className="flex h-full items-end p-1.5"><span className="text-[9px] font-medium text-ink-700">{c}</span></div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-ink-500">Replaces the CompanyCam link in the folder email.</div>
            </div>
          )}

          {tab === 'chat' && (
            <div className="space-y-2">
              <Msg who="Cortez" pm text="Start moved to Thursday 8/27 — Ted asked for a call on your way out." />
              <Msg me text="Copy. Materials picked up from the warehouse this morning." />
              <Msg who="Ashley" text="Provia door is at the warehouse, verified 8/19." />
              <div className="flex gap-2 pt-2">
                <input placeholder="Message the team…" className="h-9 flex-1 rounded-full border border-line px-3 text-[12px]" />
                <button className="grid h-9 w-9 place-items-center rounded-full bg-brand-400 text-white"><MessageSquare size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 max-w-[420px] text-center text-2xs text-ink-500">
        The Starrick 1401-26 carpenter folder — subject line, PO number, progress payment, install links, AP terms and the
        reschedule notice — as one screen. Carpenters have no MarketSharp login today, so this email is their entire view of the job.
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

const Msg = ({ who, text, me, pm }: any) => (
  <div className={cn('flex', me && 'justify-end')}>
    <div className={cn('max-w-[80%] rounded-2xl px-3 py-2 text-[12px]',
      me ? 'bg-brand-400 text-white' : 'border border-line bg-white text-ink-800')}>
      {!me && <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-ink-500">{who}{pm && <span className="rounded bg-brand-50 px-1 text-brand-400">PM</span>}</div>}
      {text}
    </div>
  </div>
)
