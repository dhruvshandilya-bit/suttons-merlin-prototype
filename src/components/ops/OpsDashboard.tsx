import React from 'react'
import { Sun, GanttChart, CalendarDays, ClipboardCheck, PackageSearch, NotebookText, UserX, ArrowRight } from 'lucide-react'
import { READY, specialOrdersDue } from '../../data/handoff'
import { ATTENDANCE } from '../../data/forecast'
import { DAY_JOBS } from '../../data/daily'
import { useStore, type OpsView } from '../../state/store'
import { Card, CardHead } from '../ui'
import { cn, shortDate, surname } from '../../lib/util'
import Schedule from '../Schedule'
import WeekGrid from './WeekGrid'
import DayBoard from './DayBoard'
import { READINESS, ReadinessDot } from './bits'

const VIEWS: { key: OpsView; label: string; icon: any }[] = [
  { key: 'today', label: 'Today', icon: Sun },
  { key: 'schedule', label: 'Schedule', icon: GanttChart },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
]

/**
 * Operations → Dashboard, as Merlin's /operations/dashboard: one page, three views.
 * Ready to schedule is the Calendar's unscheduled tray; the Day board is the Calendar's Day view;
 * the Schedule is the crew timeline. Nothing here is a new screen in Merlin.
 */
export default function OpsDashboard() {
  const { opsView, setOpsView, calView, setCalView } = useStore()
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-line bg-white p-0.5">
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => setOpsView(v.key)}
              className={cn('flex items-center gap-1.5 rounded-md px-3 py-1 text-[12.5px] font-medium',
                opsView === v.key ? 'bg-ink-950 text-white' : 'text-ink-600 hover:bg-ink-100')}>
              <v.icon size={13} /> {v.label}
            </button>
          ))}
        </div>
        <span className="text-2xs text-ink-400">app.merlinai.co/operations/dashboard?view={opsView}</span>
        {opsView === 'calendar' && (
          <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-line bg-white p-0.5 text-2xs">
            {(['week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setCalView(v)}
                className={cn('rounded-md px-2.5 py-1 font-medium capitalize', calView === v ? 'bg-ink-100 text-ink-950' : 'text-ink-500 hover:bg-ink-50')}>
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {opsView === 'today' && <Today />}
      {opsView === 'schedule' && (
        <>
          <div className="rounded-lg border border-line bg-white px-3 py-2 text-2xs text-ink-500">
            Merlin's Schedule timeline, with Sutton's crews set up as stations — each lane is a crew, from Future Forecast.
            Drag a job and that crew's later jobs move with it.
          </div>
          <Schedule />
        </>
      )}
      {opsView === 'calendar' && (calView === 'week' ? <WeekGrid /> : <DayBoard />)}
    </div>
  )
}

function Today() {
  const { assigns, plugged, reports, openTray, setOpsView, setCalView, setCalDay, openDailyLog } = useStore()
  const ready = READY.filter(j => !plugged[j.jobNo])
  const tomorrow = assigns.filter(a => a.day === 1 && !a.unavailable)
  const lateMaterials = ready.filter(j => !!specialOrdersDue(j.jobNo))
  const reportsIn = DAY_JOBS.filter(j => reports[j.jobNo]?.morning).length
  const off = ATTENDANCE.filter(a => a.day === 0)
  const byStatus = (['TENTATIVE', 'CUSTOMER_CONFIRMED', 'LOCKED'] as const).map(s => [s, assigns.filter(a => a.status === s && !a.unavailable).length] as const)

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Tile icon={ClipboardCheck} n={ready.length} label="Ready to schedule" sub="Costed, not on the calendar" action="Open the tray" onClick={() => openTray()} />
        <Tile icon={CalendarDays} n={tomorrow.length} label="On tomorrow's board" sub="Everyone gets their plan at 5 pm" action="Open the day"
          onClick={() => { setCalDay(1); setCalView('day'); setOpsView('calendar') }} />
        <Tile icon={NotebookText} n={`${reportsIn}/${DAY_JOBS.length}`} label="Morning reports in" sub="Due 10:00" action="Daily Logs" onClick={() => openDailyLog(DAY_JOBS[0]?.jobNo ?? null)} />
        <Tile icon={UserX} n={off.length} label="Crew off today" sub="Called in, vacation, weather" action="Open the day"
          onClick={() => { setCalDay(0); setCalView('day'); setOpsView('calendar') }} />
      </div>
      <Card>
        <CardHead title="This fortnight on the schedule" sub="Red / blue / black, read from each job's work order steps" />
        <div className="flex flex-wrap gap-4 px-4 py-3">
          {byStatus.map(([s, n]) => (
            <div key={s} className="flex items-center gap-2 text-[12px]">
              <ReadinessDot status={s} className="h-2.5 w-2.5" />
              <b className="tnum text-[15px] text-ink-950">{n}</b>
              <span className="text-ink-600">{READINESS[s].label}</span>
              <span className="text-2xs text-ink-400">— {READINESS[s].word}</span>
            </div>
          ))}
        </div>
      </Card>
      {lateMaterials.length > 0 && (
        <Card>
          <CardHead title="Ready jobs still waiting on special orders" sub="Don't give a start date before these are due" />
          <div className="divide-y divide-line">
            {lateMaterials.slice(0, 6).map(j => (
              <div key={j.jobNo} className="flex items-center gap-2 px-4 py-2 text-[12px]">
                <PackageSearch size={13} className="text-info-500" />
                <span className="font-medium text-ink-950">{surname(j.customer)}</span>
                <span className="tnum text-2xs text-ink-400">{j.jobNo}</span>
                <span className="ml-auto text-2xs text-ink-600">due {shortDate(specialOrdersDue(j.jobNo))}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

const Tile = ({ icon: Icon, n, label, sub, action, onClick }: any) => (
  <button onClick={onClick} className="group rounded-xl border border-line bg-white px-4 py-3 text-left hover:border-brand-300">
    <div className="flex items-center gap-2 text-2xs font-medium uppercase tracking-wide text-ink-500"><Icon size={12} />{label}</div>
    <div className="mt-1 text-[22px] font-semibold tnum text-ink-950">{n}</div>
    <div className="text-2xs text-ink-500">{sub}</div>
    <div className="mt-1 flex items-center gap-1 text-2xs font-medium text-brand-400 opacity-80 group-hover:opacity-100">{action} <ArrowRight size={11} /></div>
  </button>
)
