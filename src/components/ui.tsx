import React from 'react'
import { cn } from '../lib/util'

export const Card = ({ className, children }: any) => (
  <div className={cn('rounded-xl border border-line bg-white', className)}>{children}</div>
)

export const CardHead = ({ title, sub, right }: any) => (
  <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
    <div>
      <div className="text-[13px] font-semibold text-ink-950">{title}</div>
      {sub && <div className="mt-0.5 text-2xs text-ink-500">{sub}</div>}
    </div>
    {right}
  </div>
)

const TONE: Record<string, string> = {
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
  brand: 'bg-brand-50 text-brand-400 ring-brand-200',
  ok: 'bg-ok-50 text-ok-700 ring-ok-500/30',
  warn: 'bg-warn-50 text-warn-700 ring-warn-500/30',
  danger: 'bg-danger-50 text-danger-700 ring-danger-500/30',
  info: 'bg-info-50 text-info-600 ring-info-500/30',
}
export const Badge = ({ tone = 'neutral', className, children }: any) => (
  <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium ring-1 ring-inset', TONE[tone], className)}>
    {children}
  </span>
)

export const Button = ({ variant = 'default', size = 'md', className, children, ...p }: any) => (
  <button
    {...p}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50',
      size === 'sm' ? 'h-7 px-2 text-2xs' : 'h-8 px-3 text-[13px]',
      variant === 'default' && 'bg-brand-400 text-white hover:bg-brand-500',
      variant === 'outline' && 'border border-line bg-white text-ink-700 hover:bg-ink-50',
      variant === 'ghost' && 'text-ink-600 hover:bg-ink-100',
      className,
    )}
  >
    {children}
  </button>
)

export const Stat = ({ label, value, sub, tone }: any) => (
  <div className="rounded-xl border border-line bg-white px-4 py-3">
    <div className="text-2xs font-medium uppercase tracking-wide text-ink-500">{label}</div>
    <div className={cn('mt-1 text-[22px] font-semibold leading-tight tnum', tone === 'danger' ? 'text-danger-600' : 'text-ink-950')}>{value}</div>
    {sub && <div className="mt-0.5 text-2xs text-ink-500">{sub}</div>}
  </div>
)

export const Th = ({ className, children }: any) => (
  <th className={cn('sticky top-0 z-10 whitespace-nowrap border-b border-line bg-white px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-ink-500', className)}>
    {children}
  </th>
)
export const Td = ({ className, children, ...p }: any) => (
  <td {...p} className={cn('border-b border-line px-3 py-2 align-top text-[13px] text-ink-700', className)}>{children}</td>
)

export const PMChip = ({ code }: { code: string | null }) =>
  code ? (
    <span className="inline-grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-50 text-[9px] font-bold text-brand-400 ring-1 ring-inset ring-brand-200">
      {code}
    </span>
  ) : null

export const Empty = ({ children }: any) => (
  <div className="grid place-items-center rounded-xl border border-dashed border-ink-300 bg-white py-14 text-[13px] text-ink-500">{children}</div>
)

export const SectionLabel = ({ children }: any) => (
  <div className="px-3 pb-1 pt-3 text-2xs font-semibold uppercase tracking-wide text-ink-400">{children}</div>
)
