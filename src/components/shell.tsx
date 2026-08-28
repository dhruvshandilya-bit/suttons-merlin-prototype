import React from 'react'
import { Search, Bell, Sparkles, PanelLeft, ChevronDown, Moon, Apple, Play, Maximize2, Columns3, Download, Filter, LayoutGrid, Table2 } from 'lucide-react'
import { cn } from '../lib/util'

/* ── Left sidebar — mirrors app.merlinai.co ───────────────────────────── */
export const SideSection = ({ children }: any) => (
  <div className="flex items-center gap-1 px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
    {children} <ChevronDown size={10} className="opacity-60" />
  </div>
)

export const SideItem = ({ icon: Icon, label, active, pinned, onClick }: any) => (
  <button onClick={onClick}
    className={cn('relative mx-0 flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] transition-colors',
      active ? 'bg-ink-100 font-medium text-ink-950' : 'text-ink-700 hover:bg-ink-50')}>
    {active && <span className="absolute left-0 top-0 h-full w-[3px] bg-brand-400" />}
    <Icon size={15} className={active ? 'text-ink-700' : 'text-ink-500'} />
    <span className="flex-1 truncate">{label}</span>
    {pinned && <span className="text-brand-400">📌</span>}
  </button>
)

/* ── Module top nav — the horizontal sub-tabs inside each module ──────── */
export const TopNav = ({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-1 overflow-x-auto">
    {items.map(i => (
      <button key={i} onClick={() => onChange(i)}
        className={cn('whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors',
          value === i ? 'bg-ink-200 font-medium text-ink-950' : 'text-ink-700 hover:bg-ink-100')}>
        {i}
      </button>
    ))}
  </div>
)

/* ── Global bar ───────────────────────────────────────────────────────── */
export const GlobalBar = () => (
  <div className="ml-auto flex shrink-0 items-center gap-2">
    <div className="relative hidden md:block">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input placeholder="Search accounts, projects, i…"
        className="h-9 w-[280px] rounded-lg border border-line bg-white pl-8 pr-16 text-[13px] placeholder:text-ink-400 focus:border-brand-300 focus:outline-none" />
      <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 gap-1">
        <kbd className="rounded border border-line px-1 text-[10px] text-ink-400">⌘</kbd>
        <kbd className="rounded border border-line px-1 text-[10px] text-ink-400">K</kbd>
      </span>
    </div>
    <button className="flex h-9 items-center gap-1.5 rounded-lg bg-ink-950 px-3 text-[13px] font-medium text-white hover:bg-ink-800">
      <Sparkles size={14} /> Ask AI
    </button>
    <button className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100">
      <Bell size={16} />
      <span className="absolute right-1 top-1 rounded-full bg-danger-500 px-1 text-[9px] font-bold text-white">9+</span>
    </button>
  </div>
)

/* ── Page header — title + actions, the pattern on every Merlin page ──── */
export const PageHeader = ({ title, sub, search, actions }: any) => (
  <div className="flex flex-wrap items-center gap-3 px-6 pb-3 pt-5">
    <div>
      <h1 className="text-[22px] font-semibold leading-tight text-ink-950">{title}</h1>
      {sub && <div className="text-2xs text-ink-500">{sub}</div>}
    </div>
    <div className="ml-auto flex items-center gap-2">
      {search !== false && (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input placeholder={typeof search === 'string' ? search : 'Search'}
            className="h-9 w-[210px] rounded-lg border border-line bg-white pl-7 pr-2 text-[13px] focus:border-brand-300 focus:outline-none" />
        </div>
      )}
      <button className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-600 hover:bg-ink-50"><Filter size={14} /></button>
      {actions}
    </div>
  </div>
)

/* ── Status pill tabs with counts (Incoming 9 · Scheduled 334 · …) ────── */
export const StatusTabs = ({ items, value, onChange }: {
  items: { key: string; label: string; count?: number | string }[]; value: string; onChange: (k: string) => void
}) => (
  <div className="mx-6 flex flex-wrap items-center gap-1 rounded-lg border border-line bg-white p-1">
    {items.map(i => (
      <button key={i.key} onClick={() => onChange(i.key)}
        className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] transition-colors',
          value === i.key ? 'bg-ink-200 font-medium text-ink-950' : 'text-ink-500 hover:bg-ink-100')}>
        {i.label}
        {i.count !== undefined && (
          <span className={cn('rounded px-1.5 py-0.5 text-[11px] tnum',
            value === i.key ? 'bg-brand-400 text-white' : 'bg-ink-100 text-ink-500')}>{i.count}</span>
        )}
      </button>
    ))}
  </div>
)

/* ── Table card — the "PROJECTS 163 · Rows per load · Columns · Export" strip ── */
export const TableCard = ({ title, count, right, children }: any) => (
  <div className="mx-6 overflow-hidden rounded-xl border border-line bg-white">
    <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
      <span className="text-[13px] font-semibold uppercase tracking-wide text-ink-950">{title}</span>
      {count !== undefined && <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] tnum text-ink-600">{count}</span>}
      <div className="ml-auto flex items-center gap-1">
        {right}
        <button className="flex h-7 items-center gap-1 rounded-md px-2 text-2xs text-ink-600 hover:bg-ink-100"><Columns3 size={12} /> Columns</button>
        <button className="flex h-7 items-center gap-1 rounded-md px-2 text-2xs text-ink-600 hover:bg-ink-100"><Download size={12} /> Export</button>
        <button className="grid h-7 w-7 place-items-center rounded-md text-ink-500 hover:bg-ink-100"><Maximize2 size={12} /></button>
      </div>
    </div>
    {children}
  </div>
)

/* ── Right vertical rail (Project Agent / Activity) ───────────────────── */
export const RightRail = () => (
  <div className="flex w-9 shrink-0 flex-col items-center gap-2 border-l border-line bg-white pt-3">
    <button className="grid h-7 w-7 place-items-center rounded text-ink-400 hover:bg-ink-100"><PanelLeft size={14} /></button>
    <div className="mt-2 flex flex-col items-center gap-3">
      <RailTab label="Project Agent" icon={<Sparkles size={13} />} />
      <RailTab label="Activity" icon={<LayoutGrid size={13} />} />
    </div>
  </div>
)
const RailTab = ({ label, icon }: any) => (
  <button className="flex flex-col items-center gap-1.5 rounded-l-md bg-brand-400 py-2.5 text-white">
    <span className="px-1.5">{icon}</span>
    <span className="[writing-mode:vertical-rl] text-[10px] font-medium tracking-wide">{label}</span>
  </button>
)

/* ── Bottom user block ────────────────────────────────────────────────── */
export const UserBlock = () => (
  <div className="flex items-center gap-2 border-t border-line px-3 py-3">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-400 text-[11px] font-bold text-white">ZP</span>
    <div className="min-w-0 flex-1 leading-tight">
      <div className="truncate text-[13px] font-medium text-ink-950">Zoe</div>
      <div className="truncate text-2xs text-ink-500">Sutton's Inc</div>
    </div>
    <ChevronDown size={13} className="text-ink-400" />
    <span className="text-[11px] font-semibold text-ink-500">AA</span>
    <Moon size={13} className="text-ink-400" />
  </div>
)

export const AppStoreRow = () => (
  <div className="flex items-center gap-3 px-4 py-[7px] text-[13px] text-ink-700">
    <span className="grid h-[15px] w-[15px] place-items-center"><span className="text-ink-500">📱</span></span>
    <span className="flex-1">Get the App</span>
    <Apple size={13} className="text-ink-400" />
    <Play size={13} className="text-ink-400" />
  </div>
)
