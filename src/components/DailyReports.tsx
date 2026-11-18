import React, { useState } from 'react'
import {
  Camera, CheckCircle2, Circle, CloudRain, Snowflake, Wind, Truck, UserCheck, UserX, AlertTriangle, FileText, X, Mic, Sunrise, Sunset, Images,
} from 'lucide-react'
import { DAY_JOBS, PHOTO_RULES, DAMAGE_PROMPTS, DUE, requiredPhotos, type DayJob, type SiteReport } from '../data/daily'
import { useStore, emptyReport, type Report, type Attendance, type Delivery } from '../state/store'
import { Card, CardHead, Badge, Button, PMChip, Stat, Th, Td } from './ui'
import { cn, PM_NAMES } from '../lib/util'

/** Weather conditions are captured automatically; the crew only flags an impact. */
export const IMPACTS = [
  { key: 'None', icon: CheckCircle2 }, { key: 'Rain', icon: CloudRain }, { key: 'Cold', icon: Snowflake }, { key: 'Wind', icon: Wind },
]

/** What's still needed on each site report before it can be submitted. */
export function reportProgress(j: DayJob, r: Report) {
  const need = (report: SiteReport) => {
    const missing: string[] = []
    requiredPhotos(j, report).forEach(p => { if (!(r.photos[p.key] ?? 0)) missing.push(`${p.label.toLowerCase()} photo`) })
    if (report === 'morning' && j.crew.some(c => !r.crew[c])) missing.push('crew check-in')
    if (report === 'evening') {
      const open = j.deliveries.filter(d => !r.received[d.key]).length
      if (open) missing.push(`${open} deliver${open > 1 ? 'ies' : 'y'}`)
    }
    return missing
  }
  const photos = requiredPhotos(j)
  return {
    photos, photosDone: photos.filter(p => (r.photos[p.key] ?? 0) > 0).length,
    delDone: j.deliveries.filter(d => r.received[d.key]).length,
    morning: need('morning'), evening: need('evening'),
  }
}

/** Merlin's compliance states for a site report. */
const Compliance = ({ done, label }: { done: boolean; label: string }) =>
  done ? <Badge tone="ok"><CheckCircle2 size={10} /> {label} · Submitted</Badge> : <Badge tone="warn">{label} · Pending</Badge>

/**
 * Projects → Daily Logs, across every job on the board. The combined view is
 * the roll-up of each job's site reports — no one types the Operations Master grid.
 */
export default function DailyReports() {
  const { reports } = useStore()
  const [open, setOpen] = useState<DayJob | null>(null)
  const r = (j: DayJob) => reports[j.jobNo] ?? emptyReport()

  const submitted = DAY_JOBS.filter(j => r(j).morning).length + DAY_JOBS.filter(j => r(j).evening).length
  const calledIn = DAY_JOBS.flatMap(j => j.crew.filter(c => r(j).crew[c] === 'called in'))
  const onSite = DAY_JOBS.flatMap(j => j.crew.filter(c => r(j).crew[c] === 'on site')).length
  const missed = DAY_JOBS.flatMap(j => j.deliveries.filter(d => r(j).received[d.key] === 'missed'))
  const photoGaps = DAY_JOBS.filter(j => { const p = reportProgress(j, r(j)); return p.photosDone < p.photos.length }).length
  const impacts = DAY_JOBS.filter(j => r(j).impact !== 'None')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Site reports" value={`${submitted} / ${DAY_JOBS.length * 2}`} sub={`morning due ${DUE.morning} · evening ${DUE.evening}`} />
        <Stat label="Personnel on site" value={onSite} sub={calledIn.length ? `${calledIn.length} called in: ${calledIn.slice(0, 2).map(c => c.trim()).join(', ')}` : 'from morning check-in'} />
        <Stat label="Missing required photos" value={photoGaps} tone={photoGaps ? 'danger' : undefined} sub="jobs short a before / after / damage photo" />
        <Stat label="Deliveries missed" value={missed.length} tone={missed.length ? 'danger' : undefined} sub="answered against the POs due today" />
        <Stat label="Impacts" value={impacts.length} sub={impacts.length ? impacts.map(j => `${j.name} · ${r(j).impact}`).slice(0, 2).join(', ') : 'weather delays flagged by crews'} />
      </div>

      <Card className="overflow-hidden">
        <CardHead
          title="Combined Daily Logs — Thursday 28 August 2026"
          sub="Every job with a crew on it today. Open one to fill in its site reports the way the carpenter does on the phone."
          right={<Button variant="outline" size="sm"><FileText size={11} /> Download PDF</Button>}
        />
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Job</Th><Th>Personnel</Th><Th>Impacts</Th><Th>Deliveries</Th><Th>Photos</Th><Th>Site reports</Th>
              </tr>
            </thead>
            <tbody>
              {DAY_JOBS.map(j => {
                const rep = r(j)
                const p = reportProgress(j, rep)
                return (
                  <tr key={j.jobNo} className="cursor-pointer hover:bg-ink-50" onClick={() => setOpen(j)}>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-ink-950">{j.name}</span>
                        <span className="tnum text-2xs text-ink-400">{j.jobNo}</span>
                        <PMChip code={j.pm} />
                        {j.starts && <Badge tone="brand">Day 1</Badge>}
                      </div>
                      <div className="mt-0.5 flex gap-1">{j.phases.map(ph => <Badge key={ph}>{ph}</Badge>)}</div>
                    </Td>
                    <Td className="text-2xs">
                      {j.crew.map(c => (
                        <div key={c} className={cn('flex items-center gap-1', rep.crew[c] === 'called in' && 'text-danger-600')}>
                          {rep.crew[c] === 'on site' ? <UserCheck size={10} className="text-ok-600" />
                            : rep.crew[c] ? <UserX size={10} /> : <Circle size={9} className="text-ink-300" />}
                          {c.trim()}{rep.crew[c] && rep.crew[c] !== 'on site' && <span className="text-[10px]">· {rep.crew[c]}</span>}
                        </div>
                      ))}
                    </Td>
                    <Td className="text-2xs">{rep.impact !== 'None' ? <Badge tone="info">Weather · {rep.impact}</Badge> : <span className="text-ink-300">—</span>}</Td>
                    <Td className="text-2xs tnum">{j.deliveries.length ? `${p.delDone}/${j.deliveries.length} answered` : <span className="text-ink-300">none due</span>}</Td>
                    <Td className="text-2xs tnum">
                      <span className={cn(p.photosDone < p.photos.length ? 'text-warn-700' : 'text-ok-700')}>{p.photosDone}/{p.photos.length} required</span>
                    </Td>
                    <Td><div className="flex flex-col items-start gap-1"><Compliance done={rep.morning} label="Morning" /><Compliance done={rep.evening} label="Evening" /></div></Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Photo rules" sub="What Zoe described on the 23 Oct call — required fields on the site reports, saved to the job's Before & After gallery" />
          <div className="divide-y divide-line">
            {PHOTO_RULES.map(p => (
              <div key={p.key} className="flex items-start gap-2.5 px-4 py-2.5">
                <Camera size={13} className="mt-0.5 shrink-0 text-brand-400" />
                <div className="flex-1">
                  <div className="text-[12px] font-medium text-ink-950">{p.label}</div>
                  <div className="text-2xs text-ink-500">{p.when}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <Badge tone={p.required === 'always' ? 'brand' : 'neutral'}>
                    {p.required === 'always' ? 'Required daily' : p.required === 'first day' ? 'Required day 1' : 'Photo Required step'}
                  </Badge>
                  <span className="text-[10px] text-ink-400">{p.report === 'work order' ? 'on the work order' : `${p.report} report`}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="What this replaces" />
          <div className="space-y-2 px-4 py-3 text-2xs text-ink-600">
            <p><b className="text-ink-800">Operations Master, "Work in progress — next steps".</b> PMs do fill in their own day plan on the right-hand side; it's the next-steps block that stays empty ("no one fills that part out") — PMs put a note in MarketSharp instead. Here the next step lives on each job's evening report, where the whole team sees it.</p>
            <p><b className="text-ink-800">"Called in", "Vacation Day", rain and cold days</b> typed into Future Forecast cells. Morning check-in and the Impacts section record the same thing, once, from the site.</p>
            <p><b className="text-ink-800">CompanyCam.</b> Before / during / after photos with no written rule. The rules on the left are required fields — a report can't be submitted without them.</p>
            <p className="text-ink-400">Absence reasons ("called in", "off") are added as a question on Sutton's morning site report — Merlin's crew roster itself only knows clock-in and clock-out.</p>
          </div>
        </Card>
      </div>

      {open && <ReportDrawer j={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function ReportDrawer({ j, onClose }: { j: DayJob; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/20" onClick={onClose}>
      <div className="h-full w-[440px] overflow-auto border-l border-line bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-2xs uppercase tracking-wide text-ink-500">Daily Logs · {j.jobNo} · Thu 28 Aug</div>
            <div className="mt-0.5 text-lg font-semibold leading-tight">{j.name}</div>
            <div className="mt-1 flex items-center gap-1.5 text-2xs text-ink-500"><PMChip code={j.pm} />{PM_NAMES[j.pm ?? ''] ?? '—'}</div>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={16} /></button>
        </div>
        <div className="p-5"><ReportForm j={j} /></div>
      </div>
    </div>
  )
}

/** Shared with the field app — the same two site reports, the same gates. */
export function ReportForm({ j }: { j: DayJob }) {
  const { reports, updateReport } = useStore()
  const rep = reports[j.jobNo] ?? emptyReport()
  const p = reportProgress(j, rep)
  const up = (fn: (r: Report) => Report) => updateReport(j.jobNo, fn)
  const [which, setWhich] = useState<SiteReport>(rep.morning ? 'evening' : 'morning')
  const box = 'rounded-xl border border-line bg-white p-3'
  const h = 'text-[12px] font-semibold text-ink-950'
  const missing = which === 'morning' ? p.morning : p.evening
  const done = which === 'morning' ? rep.morning : rep.evening

  const PhotoTile = ({ k }: { k: string }) => {
    const rule = PHOTO_RULES.find(x => x.key === k)!
    const n = rep.photos[k] ?? 0
    const req = rule.required === 'always' || (rule.required === 'first day' && j.starts)
    return (
      <button onClick={() => up(x => ({ ...x, photos: { ...x.photos, [k]: n + 1 } }))}
        className={cn('flex flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left',
          n ? 'border-ok-500/40 bg-ok-50' : req ? 'border-dashed border-warn-500 bg-warn-50/40' : 'border-dashed border-line')}>
        <span className="flex items-center gap-1 text-[11px] font-medium text-ink-800">
          <Camera size={11} className={n ? 'text-ok-600' : 'text-ink-400'} />{rule.label}
        </span>
        <span className="text-[10px] text-ink-500">{n ? `${n} photo${n > 1 ? 's' : ''} · in gallery` : req ? 'Required — tap to take' : 'If it applies'}</span>
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-ink-50 p-1">
        {(['morning', 'evening'] as SiteReport[]).map(w => (
          <button key={w} onClick={() => setWhich(w)}
            className={cn('flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium capitalize',
              which === w ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-500')}>
            {w === 'morning' ? <Sunrise size={13} /> : <Sunset size={13} />} {w}
            {(w === 'morning' ? rep.morning : rep.evening) && <CheckCircle2 size={11} className="text-ok-600" />}
          </button>
        ))}
      </div>

      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 py-2 text-[12px] font-medium text-brand-400">
        <Mic size={13} /> Tap to speak — Quick Log fills the answers below
      </button>

      {done ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-xl border border-ok-500/30 bg-ok-50 p-3 text-[12px] text-ok-700">
            <CheckCircle2 size={15} className="mt-px shrink-0" />
            <div>
              {which === 'morning'
                ? <>Morning report submitted — {j.crew.filter(c => rep.crew[c] === 'on site').length} of {j.crew.length} on site.</>
                : <>Evening report submitted — {j.deliveries.filter(d => rep.received[d.key] === 'received').length} of {j.deliveries.length} deliveries received.</>}
              {' '}It's in today's Combined Daily Logs.
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => up(r => ({ ...r, [which]: false }))}>Edit report</Button>
        </div>
      ) : which === 'morning' ? (
        <>
          <div className={box}>
            <div className={h}>Who's on site today?</div>
            <div className="mt-2 space-y-1.5">
              {j.crew.map(c => (
                <div key={c} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[12px] text-ink-800">{c.trim()}</span>
                  {(['on site', 'called in', 'off'] as Attendance[]).map(a => (
                    <button key={a} onClick={() => up(r => ({ ...r, crew: { ...r.crew, [c]: a } }))}
                      className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                        rep.crew[c] === a
                          ? a === 'on site' ? 'border-ok-500 bg-ok-50 text-ok-700' : 'border-danger-500 bg-danger-50 text-danger-700'
                          : 'border-line text-ink-500 hover:bg-ink-50')}>{a}</button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className={box}>
            <div className={h}>Photos</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {j.starts && <PhotoTile k="damage" />}
              <PhotoTile k="start" />
            </div>
            {j.starts && <div className="mt-2 text-[10px] text-ink-500">Day 1 — walk the property first: {DAMAGE_PROMPTS.join(' · ')}.</div>}
          </div>
        </>
      ) : (
        <>
          <div className={box}>
            <div className="flex items-baseline justify-between">
              <span className={h}>Deliveries due today</span>
              <span className="text-[10px] text-ink-400">from the POs and the warehouse run</span>
            </div>
            {j.deliveries.length === 0 && <div className="mt-1.5 text-[11px] text-ink-400">Nothing scheduled to this job today.</div>}
            <div className="mt-2 space-y-2">
              {j.deliveries.map(d => (
                <div key={d.key}>
                  <div className="flex items-start gap-1.5 text-[11.5px] text-ink-700"><Truck size={11} className="mt-0.5 shrink-0 text-info-500" />{d.text}</div>
                  <div className="mt-1 flex gap-1 pl-4">
                    {(['received', 'received some', 'missed'] as Delivery[]).map(v => (
                      <button key={v} onClick={() => up(r => ({ ...r, received: { ...r.received, [d.key]: v } }))}
                        className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                          rep.received[d.key] === v
                            ? v === 'received' ? 'border-ok-500 bg-ok-50 text-ok-700' : 'border-warn-500 bg-warn-50 text-warn-700'
                            : 'border-line text-ink-500 hover:bg-ink-50')}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={box}>
            <div className="flex items-baseline justify-between">
              <span className={h}>Impacts</span>
              <span className="text-[10px] text-ink-400">temperature and conditions are captured automatically</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {IMPACTS.map(w => (
                <button key={w.key} onClick={() => up(r => ({ ...r, impact: w.key }))}
                  className={cn('flex flex-col items-center gap-0.5 rounded-lg border py-1.5 text-[10px]',
                    rep.impact === w.key ? 'border-brand-400 bg-brand-50 text-brand-400' : 'border-line text-ink-500 hover:bg-ink-50')}>
                  <w.icon size={14} />{w.key === 'None' ? 'No delay' : w.key}
                </button>
              ))}
            </div>
          </div>
          <div className={box}>
            <div className={h}>Photos</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <PhotoTile k="end" />
              <PhotoTile k="covered" />
            </div>
          </div>
          <div className={box}>
            <div className={h}>Notes for tomorrow</div>
            <textarea value={rep.notes} onChange={e => up(r => ({ ...r, notes: e.target.value }))} rows={2}
              placeholder="What got done, what's next, anything the customer said…"
              className="mt-1.5 w-full resize-none rounded-lg border border-line px-2 py-1.5 text-[12px] focus:border-brand-300 focus:outline-none" />
          </div>
        </>
      )}

      {!done && missing.length > 0 && (
        <div className="flex items-start gap-1.5 text-[11px] text-warn-700">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" /> Still needed: {missing.join(', ')}
        </div>
      )}
      {!done && (
        <Button className="w-full" disabled={missing.length > 0}
          onClick={() => { up(r => ({ ...r, [which]: true })); if (which === 'morning') setWhich('evening') }}>
          Submit {which} report <span className="opacity-60">· due {DUE[which]}</span>
        </Button>
      )}
      <div className="flex items-center gap-1 text-[10px] text-ink-400"><Images size={10} /> Photos are saved to this job's Before & After gallery.</div>
    </div>
  )
}
