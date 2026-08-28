import React, { useState } from 'react'
import {
  BarChart3, Table2, ArrowLeftRight, Wallet, Box, LayoutList,
  CalendarDays, Mail, Settings, Smartphone, PanelLeft,
} from 'lucide-react'
import { StoreProvider } from './state/store'
import {
  SideSection, SideItem, TopNav, GlobalBar, PageHeader, StatusTabs,
  RightRail, UserBlock, AppStoreRow,
} from './components/shell'

import Scorecard from './components/Scorecard'
import Jobs from './components/Jobs'
import Estimate from './components/Estimate'
import Schedule from './components/Schedule'
import Procurement from './components/Procurement'
import OpsDay from './components/OpsDay'
import Field from './components/Field'
import Setup from './components/Setup'
import Inbox from './components/Inbox'
import Documents from './components/Documents'
import Phases from './components/Phases'

/**
 * Information architecture mirrors app.merlinai.co exactly:
 * left rail = modules, top bar = that module's sub-nav.
 */
type Mod = 'sales' | 'jobs' | 'materials' | 'finance' | 'orders' | 'operations' | 'calendar' | 'emails' | 'settings'

const MODULES: { key: Mod; label: string; icon: any; group: 'MAIN' | 'COMMUNICATION'; tabs: string[]; landing: string }[] = [
  { key: 'sales',      label: 'Sales',      icon: BarChart3,     group: 'MAIN', landing: 'Dashboard',
    tabs: ['Dashboard', 'Leads', 'Accounts', 'Opportunity', 'Estimate', 'Change Order', 'Configuration'] },
  { key: 'jobs',       label: 'Jobs',       icon: Table2,        group: 'MAIN', landing: 'Home',
    tabs: ['Home', 'Project Phases', 'Job Packet', 'Tasks', 'Services', 'Project Templates'] },
  { key: 'materials',  label: 'Materials',  icon: ArrowLeftRight, group: 'MAIN', landing: 'Purchase',
    tabs: ['Inventory', 'Purchase', 'Requisitions', 'Procure', 'Shopping List', 'Reports'] },
  { key: 'finance',    label: 'Finance',    icon: Wallet,        group: 'MAIN', landing: 'Receivables',
    tabs: ['Receivables', 'Payables', 'Budget', 'Reports'] },
  { key: 'orders',     label: 'Orders',     icon: Box,           group: 'MAIN', landing: 'Orders',
    tabs: ['Orders', 'Shipping', 'Delivery Drivers', 'Price Management'] },
  { key: 'operations', label: 'Operations', icon: LayoutList,    group: 'MAIN', landing: 'Schedule',
    tabs: ['Dashboard', 'Schedule', 'Day Board', 'Work Orders', 'Templates'] },
  { key: 'calendar',   label: 'Calendar',   icon: CalendarDays,  group: 'COMMUNICATION', landing: 'Crew calendar', tabs: ['Crew calendar'] },
  { key: 'emails',     label: 'Emails',     icon: Mail,          group: 'COMMUNICATION', landing: 'Recurring', tabs: ['Recurring', 'Notification matrix'] },
]

export default function App() { return <StoreProvider><Shell /></StoreProvider> }

function Shell() {
  const [mod, setMod] = useState<Mod>('jobs')
  const [tab, setTab] = useState('Home')
  const [mobile, setMobile] = useState(false)
  const m = MODULES.find(x => x.key === mod)

  const go = (k: Mod) => {
    const target = MODULES.find(x => x.key === k)
    setMod(k); setTab(target?.landing ?? '')
  }

  if (mobile) return <MobileFrame onExit={() => setMobile(false)} />

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* ── left rail ── */}
      <aside className="flex w-[208px] shrink-0 flex-col border-r border-line bg-white">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-300 to-brand-500 text-[12px] font-bold text-white">M</span>
          <span className="flex-1 text-[15px] font-semibold text-ink-950">Merlin AI</span>
          <PanelLeft size={15} className="text-ink-400" />
        </div>

        <div className="flex-1 overflow-auto">
          <SideSection>Main</SideSection>
          {MODULES.filter(x => x.group === 'MAIN').map(x => (
            <SideItem key={x.key} icon={x.icon} label={x.label} active={mod === x.key} pinned={x.key === 'jobs'} onClick={() => go(x.key)} />
          ))}
          <SideSection>Communication</SideSection>
          {MODULES.filter(x => x.group === 'COMMUNICATION').map(x => (
            <SideItem key={x.key} icon={x.icon} label={x.label} active={mod === x.key} onClick={() => go(x.key)} />
          ))}
          <SideSection>Recents</SideSection>
          {['Poock, Richard & Rebecca', 'Starrick, Ted', 'Miller, Martha', 'Janssen, Janet'].map(r => (
            <div key={r} className="flex items-center gap-3 px-4 py-[7px] text-[13px] text-ink-700">
              <Table2 size={14} className="shrink-0 text-ink-400" /><span className="truncate">{r}</span>
            </div>
          ))}
          <SideSection>Others</SideSection>
          <AppStoreRow />
          <SideItem icon={Smartphone} label="Field app preview" onClick={() => setMobile(true)} />
          <SideItem icon={Settings} label="Settings" active={mod === 'settings'} onClick={() => { setMod('settings'); setTab('Org setup') }} />
        </div>
        <UserBlock />
      </aside>

      {/* ── main ── */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line px-4">
          {mod === 'settings'
            ? <TopNav items={['Org setup', 'Per Module', 'Organization Level']} value={tab} onChange={setTab} />
            : <TopNav items={m!.tabs} value={tab} onChange={setTab} />}
          <GlobalBar />
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-auto pb-8">
            <Route mod={mod} tab={tab} />
          </div>
          <RightRail />
        </div>
      </main>
    </div>
  )
}

/* ── routing ─────────────────────────────────────────────────────────── */
function Route({ mod, tab }: { mod: Mod; tab: string }) {
  // Sales
  if (mod === 'sales' && tab === 'Dashboard') return <Page title="Sales dashboard" sub="Job Status → Scorecard"><Scorecard /></Page>
  if (mod === 'sales' && tab === 'Estimate') return <Page title="Estimate" sub="Master Costing — rate card, margin tiers, approval"><Estimate /></Page>
  if (mod === 'sales') return <Stub title={tab} module="Sales" />

  // Jobs
  if (mod === 'jobs' && tab === 'Home') return <Jobs />
  if (mod === 'jobs' && tab === 'Project Phases') return <Phases />
  if (mod === 'jobs' && tab === 'Job Packet') return <Page title="Job packet" sub="The 11 per-job documents"><Documents /></Page>
  if (mod === 'jobs') return <Stub title={tab} module="Jobs" />

  // Materials
  if (mod === 'materials' && (tab === 'Purchase' || tab === 'Procure')) return <Page title="Purchase orders" sub="Special Order Materials + the weekly vendor emails"><Procurement /></Page>
  if (mod === 'materials') return <Stub title={tab} module="Materials" />

  // Operations
  if (mod === 'operations' && tab === 'Schedule') return <Page title="Schedule" sub="Future Forecast — crew lanes, red/blue/black, same-crew ripple"><Schedule /></Page>
  if (mod === 'operations' && tab === 'Day Board') return <Page title="Day board" sub="Operations Master — 28 August 2026"><OpsDay /></Page>
  if (mod === 'operations') return <Stub title={tab} module="Operations" />

  if (mod === 'emails') return <Page title="Emails" sub="The six recurring emails"><Inbox /></Page>
  if (mod === 'calendar') return <Page title="Crew calendar" sub="Future Forecast, by crew"><Schedule /></Page>
  if (mod === 'settings') return <Page title="Org setup" sub="What we loaded from Sutton's files"><Setup /></Page>
  return <Stub title={tab} module={mod} />
}

const Page = ({ title, sub, children }: any) => (
  <>
    <PageHeader title={title} sub={sub} />
    <div className="px-6">{children}</div>
  </>
)

const Stub = ({ title, module }: any) => (
  <>
    <PageHeader title={title} sub={`${module} module`} />
    <div className="px-6">
      <div className="grid place-items-center rounded-xl border border-dashed border-ink-300 bg-ink-50 py-20 text-center">
        <div>
          <div className="text-[14px] font-medium text-ink-700">{title}</div>
          <div className="mx-auto mt-1 max-w-sm text-2xs text-ink-500">
            Exists in production Merlin and is empty for Sutton's today. Not part of this prototype's scope.
          </div>
        </div>
      </div>
    </div>
  </>
)

function MobileFrame({ onExit }: any) {
  return (
    <div className="h-screen w-screen overflow-auto bg-ink-100">
      <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
        <button onClick={onExit} className="rounded-lg border border-line px-2.5 py-1 text-2xs text-ink-600 hover:bg-ink-50">← Back to web app</button>
        <span className="text-[13px] font-medium text-ink-950">Field app — carpenter folder</span>
      </div>
      <Field />
    </div>
  )
}
