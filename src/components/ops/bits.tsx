import React from 'react'
import { NotebookText } from 'lucide-react'
import { useStore, type Status } from '../../state/store'
import { cn } from '../../lib/util'

/**
 * Red / blue / black, in Zoe's words. In Merlin these come from two steps on the job's work order
 * ("Confirm date with customer", "Set up materials") — the server works it out; nothing is typed.
 */
export const READINESS: Record<Status, { label: string; word: string; dot: string; chip: string }> = {
  TENTATIVE: { label: 'Tentative', word: "Don't set up — customer doesn't have the date", dot: 'bg-danger-500', chip: 'bg-danger-50 text-danger-700' },
  CUSTOMER_CONFIRMED: { label: 'Confirmed', word: 'Customer has the date — materials need setting up', dot: 'bg-info-500', chip: 'bg-info-50 text-info-600' },
  LOCKED: { label: 'Ready', word: 'Materials set — ready to start', dot: 'bg-ink-950', chip: 'bg-ink-950 text-white' },
}

export const ReadinessDot = ({ status, className }: { status: Status; className?: string }) => (
  <span title={`${READINESS[status].label} — ${READINESS[status].word}`}
    className={cn('inline-block h-[7px] w-[7px] shrink-0 rounded-full', READINESS[status].dot, className)} />
)

export const ReadinessChip = ({ status }: { status: Status }) => (
  <span title={READINESS[status].word} className={cn('rounded px-1.5 py-px text-[10px] font-semibold', READINESS[status].chip)}>
    {READINESS[status].label}
  </span>
)

/** "Daily logs" next to a job — opens Jobs → Daily Logs (on that job when it's on the day's board). */
export function DailyLogsLink({ jobNo, className }: { jobNo: string | null | undefined; className?: string }) {
  const { openDailyLog } = useStore()
  if (!jobNo) return null
  return (
    <button
      onClick={e => { e.stopPropagation(); openDailyLog(jobNo) }}
      className={cn('inline-flex shrink-0 items-center gap-0.5 text-[10.5px] font-medium text-brand-400 hover:underline', className)}>
      <NotebookText size={10} /> Daily logs
    </button>
  )
}

/** Small label for what is being added to Merlin now (code written, not yet released). */
export const InBuild = ({ className }: { className?: string }) => (
  <span title="Being added to Merlin — written, not yet released"
    className={cn('rounded bg-info-50 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-info-600', className)}>
    In build
  </span>
)
