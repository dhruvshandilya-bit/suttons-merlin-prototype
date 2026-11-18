import React, { useMemo, useState } from 'react'
import { Sparkles, X, Send, CalendarRange, ClipboardCheck, Truck, UserX, Mail, CheckCircle2, Snowflake } from 'lucide-react'
import {
  projectForecast, pipelineCounts, costingCounts, SCHEDULING_FACTORS, ATTENDANCE, FORECAST_TYPES,
} from '../data/forecast'
import { READY, ordersFor, isHere, earliestStart } from '../data/handoff'
import { OPS_LOGISTICS, FF_DAYS } from '../data/suttons'
import { DAY_JOBS } from '../data/daily'
import { useStore, emptyReport } from '../state/store'
import { reportProgress } from './DailyReports'
import { Badge, Button } from './ui'
import { cn, shortDate } from '../lib/util'

/**
 * Ask AI — the global agent in the top bar.
 * Project Forecasting deliberately has no screen (Dhruv, 23 Oct): Zoe asks, the
 * agent runs the sheet's own formula and answers. Anything that writes goes
 * through plan-then-confirm — the agent drafts, a person presses send.
 */
type Q = 'forecast' | 'ready' | 'deliveries' | 'attendance' | 'field'
const PROMPTS: { key: Q; icon: any; text: string }[] = [
  { key: 'forecast', icon: CalendarRange, text: 'How many weeks out are we, by project type?' },
  { key: 'ready', icon: ClipboardCheck, text: 'Which costed jobs are ready to schedule, and what are they waiting on?' },
  { key: 'deliveries', icon: Truck, text: "What's on the warehouse run for the day board?" },
  { key: 'attendance', icon: UserX, text: 'Who called in or was off in the last two weeks?' },
  { key: 'field', icon: ClipboardCheck, text: "Give me today's field report across all jobs" },
]

const match = (t: string): Q | null => {
  const s = t.toLowerCase()
  if (/field report|daily log|site report|photo/.test(s)) return 'field'
  if (/week|out|forecast|tentative|backlog|far/.test(s)) return 'forecast'
  if (/ready|costed|schedul|special/.test(s)) return 'ready'
  if (/deliver|warehouse|pick|driver|truck/.test(s)) return 'deliveries'
  if (/called|absent|vacation|off|sick|attendance|rain|weather/.test(s)) return 'attendance'
  return null
}

export default function AskAI({ onClose }: { onClose: () => void }) {
  const [thread, setThread] = useState<{ q: string; a: Q | null }[]>([])
  const [text, setText] = useState('')
  const ask = (q: string, a: Q | null) => { setThread(t => [...t, { q, a }]); setText('') }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/20" onClick={onClose}>
      <div className="flex h-full w-[620px] max-w-full flex-col border-l border-line bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-950 text-white"><Sparkles size={14} /></span>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold text-ink-950">Ask AI</div>
            <div className="text-2xs text-ink-500">Sutton's Inc · all projects · reads Job Status, the schedule and POs</div>
          </div>
          <button onClick={onClose} className="ml-auto text-ink-400 hover:text-ink-700"><X size={16} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto bg-surface px-5 py-4">
          {thread.length === 0 && (
            <div className="space-y-2">
              <div className="text-2xs font-semibold uppercase tracking-wide text-ink-400">Try asking</div>
              {PROMPTS.map(p => (
                <button key={p.key} onClick={() => ask(p.text, p.key)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-left text-[13px] text-ink-800 hover:border-brand-300 hover:bg-brand-50">
                  <p.icon size={14} className="shrink-0 text-brand-400" /> {p.text}
                </button>
              ))}
              <div className="pt-2 text-2xs text-ink-500">
                Project Forecasting has no screen of its own — it's a question you ask, answered with the formula on your tab.
              </div>
            </div>
          )}

          {thread.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-brand-400 px-3 py-2 text-[13px] text-white">{m.q}</div>
              </div>
              <div className="rounded-xl border border-line bg-white p-4">
                {m.a === 'forecast' && <ForecastAnswer />}
                {m.a === 'ready' && <ReadyAnswer />}
                {m.a === 'deliveries' && <DeliveriesAnswer />}
                {m.a === 'attendance' && <AttendanceAnswer />}
                {m.a === 'field' && <FieldAnswer />}
                {m.a === null && (
                  <div className="text-[13px] text-ink-600">
                    This prototype answers five questions from Sutton's own data — forecasting, ready-to-schedule, the warehouse run, attendance and today's field report.
                    Try one of the suggestions below.
                  </div>
                )}
              </div>
            </div>
          ))}

          {thread.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map(p => (
                <button key={p.key} onClick={() => ask(p.text, p.key)}
                  className="rounded-full border border-line bg-white px-2.5 py-1 text-2xs text-ink-600 hover:border-brand-300 hover:text-brand-400">
                  {p.text}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="flex gap-2 border-t border-line px-5 py-3"
          onSubmit={e => { e.preventDefault(); if (text.trim()) ask(text.trim(), match(text)) }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask about any job, crew or delivery…"
            className="h-10 flex-1 rounded-lg border border-line px-3 text-[13px] focus:border-brand-300 focus:outline-none" />
          <button className="grid h-10 w-10 place-items-center rounded-lg bg-ink-950 text-white hover:bg-ink-800"><Send size={15} /></button>
        </form>
      </div>
    </div>
  )
}

/* ── Answers ──────────────────────────────────────────────────────────── */

const longDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function ForecastAnswer() {
  const today = useMemo(() => new Date(), [])
  const [rates, setRates] = useState<Record<string, number>>({})
  const [draft, setDraft] = useState<'none' | 'draft' | 'sent'>('none')
  const rows = projectForecast(today, rates).filter(r => r.count > 0)
  const empty = FORECAST_TYPES.length - rows.length
  const pipe = pipelineCounts()
  const cost = costingCounts()

  return (
    <div className="space-y-3">
      <div className="text-[13px] text-ink-800">
        As of <b>{longDate(today)}</b>, here's how far out each project type is. Weeks out is jobs in <i>Jobs not started</i> ÷
        jobs completed per week; the next tentative date is today plus that many weeks, pushed past any seasonal blackout.
      </div>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[12px]">
          <thead className="bg-ink-50 text-2xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-2.5 py-1.5 text-left font-semibold">Project type</th>
              <th className="px-2 py-1.5 text-right font-semibold">In JNS</th>
              <th className="px-2 py-1.5 text-right font-semibold" title="You change this every month depending on crews">Jobs / wk</th>
              <th className="px-2 py-1.5 text-right font-semibold">Weeks out</th>
              <th className="px-2.5 py-1.5 text-left font-semibold">Next tentative date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(r => (
              <tr key={r.type}>
                <td className="px-2.5 py-1.5 font-medium text-ink-950">{r.type}</td>
                <td className="px-2 py-1.5 text-right tnum">{r.count}</td>
                <td className="px-2 py-1 text-right">
                  <input type="number" step="0.25" min="0.25" value={r.perWeek}
                    onChange={e => setRates({ ...rates, [r.type]: Math.max(0.25, Number(e.target.value) || 0.25) })}
                    className="w-14 rounded border border-line px-1 py-0.5 text-right tnum text-[12px] focus:border-brand-300 focus:outline-none" />
                </td>
                <td className="px-2 py-1.5 text-right tnum">{r.weeksOut.toFixed(1)}</td>
                <td className="px-2.5 py-1.5">
                  <span className="tnum font-medium text-ink-950">{longDate(r.next)}</span>
                  {r.shifted && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-2xs text-info-600" title={`${r.blackout!.start} → ${r.blackout!.end}`}>
                      <Snowflake size={10} /> after {r.blackout!.label}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-2xs text-ink-500">
        {empty} other types have nothing waiting. All dates are tentative — best guess, not a final verdict. Jobs / week is editable: it's the
        number you re-set each month from the crews you have.
      </div>

      <div className="grid grid-cols-2 gap-2">
        {pipe.map(p => (
          <div key={p.label} className="flex items-baseline justify-between rounded-lg border border-line px-3 py-2">
            <span className="text-2xs text-ink-500">{p.label}</span>
            <span className={cn('tnum text-[13px] font-semibold', p.goal && p.count >= p.goal ? 'text-danger-600' : 'text-ink-950')}>
              {p.count}{p.goal && <span className="ml-1 text-2xs font-normal text-ink-400">goal &lt;{p.goal}</span>}
            </span>
          </div>
        ))}
        <div className="col-span-2 flex items-baseline justify-between rounded-lg border border-line px-3 py-2">
          <span className="text-2xs text-ink-500">Jobs not started · costed · costing in progress</span>
          <span className="tnum text-[13px] font-semibold text-ink-950">{cost.total} · {cost.costed} · <span className="text-warn-700">{cost.inProgress}</span></span>
        </div>
      </div>

      {draft === 'none' && (
        <Button variant="outline" onClick={() => setDraft('draft')}><Mail size={13} /> Draft the monthly company-wide email</Button>
      )}
      {draft !== 'none' && (
        <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3">
          <div className="text-2xs font-semibold uppercase tracking-wide text-brand-500">Draft · to All Staff (53)</div>
          <div className="mt-1 text-[12px] font-medium text-ink-950">Project forecasting — {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          <div className="mt-1 text-2xs text-ink-600">
            The table above, then the scheduling factors from your tab: {SCHEDULING_FACTORS.slice(0, 3).join('; ')}; and {SCHEDULING_FACTORS.length - 3} more.
          </div>
          <div className="mt-2 flex items-center gap-2">
            {draft === 'draft'
              ? <><Button size="sm" onClick={() => setDraft('sent')}><Send size={11} /> Review & send</Button>
                  <span className="text-2xs text-ink-500">Nothing goes out until you press send.</span></>
              : <span className="flex items-center gap-1 text-2xs font-medium text-ok-700"><CheckCircle2 size={12} /> Sent to All Staff</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function ReadyAnswer() {
  const today = useMemo(() => new Date(), [])
  const rows = READY.map(j => ({ j, orders: ordersFor(j.jobNo), start: earliestStart(j, today) }))
    .sort((a, b) => +a.start.date - +b.start.date)
  const waiting = rows.filter(r => r.orders.some(o => !isHere(o))).length
  return (
    <div className="space-y-3">
      <div className="text-[13px] text-ink-800">
        <b>{rows.length} jobs</b> have an approved estimate and no start date yet. {waiting} {waiting === 1 ? 'has' : 'have'} a special order
        that isn't in — where the vendor's ETA is later than the crew backlog, the ETA sets the earliest start.
      </div>
      <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
        {rows.slice(0, 10).map(({ j, orders, start }) => (
          <div key={j.jobNo} className="flex items-start gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-medium text-ink-950">{j.customer}</span>
                <span className="tnum text-2xs text-ink-400">{j.jobNo}</span>
              </div>
              <div className="truncate text-2xs text-ink-500">{j.jobType}</div>
              {orders.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {orders.map((o, i) => (
                    <Badge key={i} tone={isHere(o) ? 'ok' : 'info'}>{o.vendor} · {isHere(o) ? o.status : `ETA ${shortDate(o.expected)}`}</Badge>
                  ))}
                </div>
              )}
              {j.missing && <div className="mt-0.5 text-2xs text-warn-700">Missing: {j.missing}</div>}
            </div>
            <div className="shrink-0 text-right">
              <div className="tnum text-[12px] font-medium text-ink-950">{shortDate(start.date.toISOString())}</div>
              <div className="text-2xs text-ink-400">{start.by}</div>
            </div>
          </div>
        ))}
      </div>
      {rows.length > 10 && <div className="text-2xs text-ink-500">+{rows.length - 10} more on Operations → Ready to schedule.</div>}
    </div>
  )
}

function DeliveriesAnswer() {
  const { pickups, deliveries, trailers } = OPS_LOGISTICS
  return (
    <div className="space-y-2 text-[12px]">
      <div className="text-[13px] text-ink-800">
        The day board has <b>{deliveries.length} Sutton's deliver{deliveries.length === 1 ? 'y' : 'ies'}</b> and <b>{pickups.length} carpenter
        pick-up{pickups.length === 1 ? '' : 's'}</b>. The warehouse manager sets the
        order and the driver; each line checks off from the driver's phone.
      </div>
      {deliveries.map((d, i) => <div key={i} className="flex gap-2 text-ink-700"><Truck size={12} className="mt-0.5 shrink-0 text-info-500" />{d}</div>)}
      {pickups.slice(0, 4).map((d, i) => <div key={i} className="flex gap-2 text-ink-700"><ClipboardCheck size={12} className="mt-0.5 shrink-0 text-warn-600" />{d}</div>)}
      <div className="text-2xs text-ink-500">{trailers.filter(t => !/shop/i.test(t.at)).length} trailers are out on jobs; the rest are at the shop.</div>
    </div>
  )
}

function AttendanceAnswer() {
  const by = (k: string) => ATTENDANCE.filter(a => a.kind === k)
  const called = by('called in'), vac = by('vacation'), wx = by('weather')
  const Line = ({ items }: { items: typeof ATTENDANCE }) => (
    <div className="mt-1 flex flex-wrap gap-1">
      {items.map((a, i) => <Badge key={i} tone="neutral">{a.lane} · {FF_DAYS[a.day]?.label.slice(0, 3)} {FF_DAYS[a.day]?.date.slice(5)}</Badge>)}
    </div>
  )
  return (
    <div className="space-y-3 text-[12px]">
      <div className="text-[13px] text-ink-800">
        Across the {FF_DAYS.length} working days on the board: <b>{called.length} called in</b>, <b>{vac.length} vacation days</b> and
        <b> {wx.length} weather days</b> (production only).
      </div>
      <div><div className="text-2xs font-semibold uppercase tracking-wide text-danger-600">Called in</div><Line items={called} /></div>
      <div><div className="text-2xs font-semibold uppercase tracking-wide text-ink-500">Vacation</div><Line items={vac} /></div>
      <div><div className="text-2xs font-semibold uppercase tracking-wide text-info-600">Weather</div><Line items={wx} /></div>
      <div className="text-2xs text-ink-500">Read from the cells on Future Forecast today. In Merlin this comes from the crew section of each daily report.</div>
    </div>
  )
}

function FieldAnswer() {
  const { reports } = useStore()
  const r = (jobNo: string) => reports[jobNo] ?? emptyReport()
  const rows = DAY_JOBS.map(j => ({ j, rep: r(j.jobNo), p: reportProgress(j, r(j.jobNo)) }))
  const morning = rows.filter(x => x.rep.morning).length, evening = rows.filter(x => x.rep.evening).length
  const needs = rows.filter(x => !x.rep.morning || x.p.photosDone < x.p.photos.length)
  const called = rows.flatMap(x => x.j.crew.filter(c => x.rep.crew[c] === 'called in').map(c => `${c.trim()} (${x.j.name})`))
  const missed = rows.flatMap(x => x.j.deliveries.filter(d => x.rep.received[d.key] === 'missed').map(() => x.j.name))
  return (
    <div className="space-y-2 text-[12px]">
      <div className="text-[13px] text-ink-800">
        Thursday 28 August, {DAY_JOBS.length} jobs with crews on them. <b>{morning}</b> morning and <b>{evening}</b> evening site reports are in.
        {called.length > 0 && <> Called in: {called.join(', ')}.</>}
        {missed.length > 0 && <> Deliveries missed at {[...new Set(missed)].join(', ')}.</>}
      </div>
      <div className="text-2xs font-semibold uppercase tracking-wide text-warn-700">Needs attention</div>
      <div className="space-y-1">
        {needs.slice(0, 8).map(({ j, rep, p }) => (
          <div key={j.jobNo} className="flex items-center gap-2 text-ink-700">
            <span className="font-medium text-ink-950">{j.name}</span><span className="tnum text-2xs text-ink-400">{j.jobNo}</span>
            <span className="ml-auto text-2xs text-ink-500">
              {!rep.morning ? 'morning report pending' : `${p.photos.length - p.photosDone} required photo${p.photos.length - p.photosDone > 1 ? 's' : ''} missing`}
            </span>
          </div>
        ))}
        {needs.length === 0 && <div className="text-ok-700">Nothing — every job has its reports and photos.</div>}
      </div>
      <div className="text-2xs text-ink-500">Read from today's Combined Daily Logs. Fill a report on Projects → Daily Logs or in the field app and ask again.</div>
    </div>
  )
}
