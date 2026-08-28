import React, { useState } from 'react'
import {
  Mail, Users, Truck, Trash2, CalendarClock, FileSignature, Check, Bell,
  ArrowRight, AlertTriangle,
} from 'lucide-react'
import { Card, CardHead, Badge, Button, PMChip } from './ui'
import { cn } from '../lib/util'

const Section = ({ h, rows }: { h: string; rows: string[][] }) => (
  <div>
    <div className="font-semibold text-ink-950">{h}</div>
    <div className="mt-0.5 space-y-0.5">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex gap-2 text-[12.5px]">
          {k && <span className="shrink-0 font-medium text-ink-700">{k}:</span>}
          <span className="text-ink-600">{v}</span>
        </div>
      ))}
    </div>
  </div>
)

/**
 * The six recurring emails Zoe named, each shown as the Merlin surface that replaces it.
 * Content is verbatim from the samples Sutton's sent on 26 Aug 2026.
 */
type Item = {
  id: string
  subject: string
  from: string
  role: string
  to: string[]
  cadence: string
  replaces: string
  merlin: string
  icon: any
  body: React.ReactNode
  built: boolean
}

const ITEMS: Item[] = [
  {
    id: 'new-contracts',
    subject: 'New Contracts 8/21',
    from: 'Erin Stoecker', role: 'Contract processing',
    to: ['Doug Sutton', 'Trip Sutton', 'Ashley Bowling', 'Brianne Drnjevic', 'Zoe Pittman', 'Brian Farley',
         'John Kelly', 'Darin Peacock', 'Gary Mather', 'Charlotte Espe', 'Lisa Young', 'Cindy Fletcher'],
    cadence: 'Daily, evening',
    replaces: 'The trigger for the whole downstream flow — and nobody actions it',
    merlin: 'Notification on Sale creation + an Incoming queue',
    icon: FileSignature, built: true,
    body: (
      <div className="space-y-3 text-[13px]">
        {[
          { h: 'New Contract', rows: ['Jankousky 1579-26', 'Shoff, Anita 1580-26', 'Stone 1581-26', 'Worrell 1582-26', 'Cragoe 1583-26'] },
          { h: 'Callback', rows: ['Neposchlan 0-1177-21', 'Stevens 1196-26', 'Behymer 1252-26'] },
          { h: 'Change Order', rows: ['Cooper 1199-26'] },
        ].map(s => (
          <div key={s.h}>
            <div className="font-semibold text-ink-950">{s.h}</div>
            {s.rows.map(r => <div key={r} className="tnum text-ink-600">{r}</div>)}
          </div>
        ))}
        <div className="rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-500">
          Sections are dynamic — an earlier sample carried <b>Punchlist</b> instead of Change Order.
        </div>
      </div>
    ),
  },
  {
    id: 'carpenter-folder',
    subject: 'CARPENTER FOLDER / Starrick 1401-26 DRE (AC) / 1717 S Lincoln Ave, Springfield, IL 62704',
    from: 'Brianne Drnjevic', role: 'Project Support Coordinator',
    to: ['Abelardo Cortez (PM)', 'Brian Wanger (lead carpenter)', 'Ashley Bowling', 'Andy Kitowski (warehouse)', 'Zoe Pittman', 'Brian Farley'],
    cadence: 'Per job start',
    replaces: 'Carpenters have no MarketSharp login — this email is their entire view of the job',
    merlin: 'Work order → the Field app screen',
    icon: Users, built: true,
    body: (
      <div className="space-y-3 text-[13px]">
        <Section h="Project Info" rows={[
          ['Start Date', '8/25 → rescheduled to 8/27'],
          ['Project Manager', 'Cortez'],
          ['Lead Carpenter', 'Brian W.'],
          ['PO#', '12567 · $250.00'],
          ['Progress Payment Due (PM only)', 'Due upon substantial completion — $2,958.25'],
          ['Phase Codes to Complete', 'DRE'],
          ['CompanyCam Link', 'app.companycam.com/project_invitations/…'],
        ]} />
        <Section h="Tools & Materials" rows={[
          ['Materials', 'Please pick up material from the warehouse'],
          ['Wrecking / Hauling', 'N/A'],
        ]} />
        <Section h="Schedule" rows={[['Completed Phases', 'N/A'], ['Next Scheduled Phases', 'N/A']]} />
        <Section h="Reminders" rows={[
          ['', 'Check in with your Project Manager at start and end of day'],
          ['', 'Work safely, follow site rules, keep your area clean'],
          ['', 'Photos of progress are helpful when possible'],
        ]} />
        <Section h="Install Instruction Links" rows={[
          ['', 'GAF Roofing (English) · GAF Roofing (Spanish)'],
          ['', 'EPDM (video) · Royal Siding (English / Spanish)'],
          ['', 'Provia: scan QR code on box'],
        ]} />
        <div className="rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-600">
          Invoices to <b>ap@suttonsinc.com</b> only. Friday payment requires submission by <b>Tuesday 9:00 a.m.</b>
          Each invoice must carry job name, job number, itemised amounts with quantities, and any PM-approved extras.
        </div>
        <div>
          <div className="text-2xs font-semibold uppercase tracking-wide text-ink-500">3 attachments</div>
          <div className="mt-1 space-y-0.5 text-2xs text-brand-400">
            <div>Starrick 1401-26 Carpenter Folder.pdf · 274K</div>
            <div>STARRICK, TED 1401-26 DRE pay sheet.pdf · 40K</div>
            <div>Starrick DRE spec sheet.pdf · 103K</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'roofersmart',
    subject: 'ROOFERSMARTS WEEK OF 8/24-8/28',
    from: 'Ashley Bowling', role: 'Project Coordinator',
    to: ['Dalyn Riemann (Roofer’s Mart)', 'Steve Scherff', 'Aaron Poff', 'Kevin Scherff', 'Brian Farley', 'Zoe Pittman', 'Brianne Drnjevic'],
    cadence: 'Thursday, for the following week',
    replaces: 'No acknowledgement, no confirmed date, no audit trail beyond the thread',
    merlin: 'PO send + vendor acknowledgement portal + weekly digest',
    icon: Truck, built: true,
    body: (
      <div className="space-y-2 text-[13px]">
        {[
          ['Monday', ['Christensen 1341-26 (AC) RFG & SDG / PO#11024 / Accessories 1st out + shingles @ 10:30',
                      'Gunterman 1421-26 RFG (AC) / PO#11019 / Accessories 1st out + shingles @ 10:30']],
          ['Tuesday', ['Kantner 1430-26 (HV) RFG / PO#11232 / Accessories 1st out + shingles @ 10:30']],
          ['Wednesday', ['Maitrejean 1448-26 (AC) DMO RFG / PO#11418 / Accessories 1st out + shingles @ 10:30',
                         'Kimple 1366-26 (AC) RFG / PO#11491 / Accessories 1st out + shingles @ 10:30',
                         'Wyatt 1466-26 SDG (HV) / PO#11726 / as early as possible please',
                         'Kick 1367-26 SDG (AC) / PO# 11885 / as early as possible please']],
          ['Thursday', ['Vorce 1453-26 (AC) RFG & SDG / PO#11421 / Accessories 1st out + shingles @ 10:30']],
          ['Friday', ['open']],
          ['Postponed', ['open']],
        ].map(([d, rows]: any) => (
          <div key={d}>
            <div className="font-semibold underline">{d}</div>
            {rows.map((r: string) => <div key={r} className="text-[12px] text-ink-600">• {r}</div>)}
          </div>
        ))}
        <div className="rounded-lg bg-warn-50 px-3 py-2 text-2xs text-warn-700">
          Sent Thu 20 Aug, then <b>re-sent in full Tue 25 Aug</b> with four jobs added. That resend is the
          reschedule mechanism.
        </div>
      </div>
    ),
  },
  {
    id: 'cardinal',
    subject: 'CARDINAL WEEK OF …',
    from: 'Ashley Bowling', role: 'Project Coordinator',
    to: ['Cardinal', 'scheduling'],
    cadence: 'Thursday, for the following week',
    replaces: 'Same format as Roofer’s Mart, ~1 job a week',
    merlin: 'Same vendor digest, different supplier',
    icon: Truck, built: true,
    body: <div className="text-[13px] text-ink-600">Zoe: <i>“Same format as Roofers Mart.”</i> One or two lines a week — Cardinal is a low-volume vendor.</div>,
  },
  {
    id: 'cleeton',
    subject: 'CLEETONS WEEK OF 8/24-8/28',
    from: 'Ashley Bowling', role: 'Project Coordinator',
    to: ['Cleeton Disposal', 'Republic Services', 'scheduling'],
    cadence: 'Thursday, for the following week',
    replaces: 'Dumpster deliveries, swaps and pickups',
    merlin: 'Dumpster PO + the placement doc with its site photo',
    icon: Trash2, built: true,
    body: (
      <div className="space-y-2 text-[13px] text-ink-600">
        <div>Same weekly shape as Roofer’s Mart, for containers rather than materials.</div>
        <div className="rounded-lg bg-ink-50 px-3 py-2 text-2xs">
          Their schedule-type list already separates <b>DUMPSTER DELIVERY</b>, <b>DUMPSTER SWAP</b> and
          <b> DUMPSTER PICKUP</b> — three distinct events, not one.
        </div>
        <div className="rounded-lg bg-ink-50 px-3 py-2 text-2xs">
          Cleeton pricing is banded by size and town: 10 yd $335 · 20 yd $475 · 30 yd $580, plus a delivery
          fee matrix across Auburn, Divernon, Glenarm, Chatham, Decatur, Jacksonville and 20 more.
        </div>
      </div>
    ),
  },
  {
    id: 'reschedule',
    subject: 'THIS JOB HAS BEEN RESCHEDULED TO BEGIN TOMORROW, THURSDAY 8/27',
    from: 'Brianne Drnjevic', role: 'Project Support Coordinator',
    to: ['same thread — all 6 folder recipients'],
    cadence: 'Whenever a job slips',
    replaces: 'A reply-all restating one field and re-attaching everything',
    merlin: 'A date change + notification. The whole thread collapses to one event.',
    icon: CalendarClock, built: true,
    body: (
      <div className="space-y-2 text-[13px]">
        <div className="rounded-lg border border-line p-3">
          <div className="text-2xs text-ink-500">Mon 24 Aug, 2:12 PM</div>
          <div className="mt-0.5">Full carpenter folder · Start Date <b>8/25</b> · 3 attachments</div>
        </div>
        <div className="flex justify-center text-ink-300"><ArrowRight size={14} className="rotate-90" /></div>
        <div className="rounded-lg border border-warn-500/40 bg-warn-50 p-3">
          <div className="text-2xs text-warn-700">Wed 26 Aug, 1:28 PM</div>
          <div className="mt-0.5 font-semibold text-warn-700">THIS JOB HAS BEEN RESCHEDULED TO BEGIN TOMORROW, THURSDAY 8/27</div>
          <div className="mt-0.5 text-2xs text-warn-700">Only <b>Start Date: 8/27</b> restated. All 3 attachments re-sent.</div>
        </div>
        <div className="flex justify-center text-ink-300"><ArrowRight size={14} className="rotate-90" /></div>
        <div className="rounded-lg border border-line p-3">
          <div className="text-2xs text-ink-500">Wed 26 Aug, 3:51 PM</div>
          <div className="mt-0.5 font-semibold">PLEASE CALL TED ON YOUR WAY OUT 1 (217) 494-3218</div>
        </div>
      </div>
    ),
  },
]

export default function Inbox() {
  const [open, setOpen] = useState(ITEMS[0].id)
  const item = ITEMS.find(i => i.id === open)!
  const Icon = item.icon
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="overflow-hidden">
        <CardHead title="Recurring email" sub="All six Zoe named" />
        <div className="divide-y divide-line">
          {ITEMS.map(i => {
            const I = i.icon
            return (
              <button key={i.id} onClick={() => setOpen(i.id)}
                className={cn('flex w-full gap-2.5 px-3 py-2.5 text-left transition-colors',
                  open === i.id ? 'bg-brand-50' : 'hover:bg-ink-50')}>
                <I size={14} className={cn('mt-0.5 shrink-0', open === i.id ? 'text-brand-400' : 'text-ink-400')} />
                <div className="min-w-0">
                  <div className={cn('truncate text-[12.5px] font-medium', open === i.id ? 'text-brand-400' : 'text-ink-950')}>
                    {i.subject.split('/')[0].trim()}
                  </div>
                  <div className="truncate text-2xs text-ink-500">{i.from} · {i.cadence}</div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-start gap-2">
              <Icon size={16} className="mt-0.5 shrink-0 text-ink-400" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold leading-tight text-ink-950">{item.subject}</div>
                <div className="mt-1 text-2xs text-ink-500">
                  <b className="text-ink-700">{item.from}</b> · {item.role} · {item.cadence}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.to.map(t => <Badge key={t} tone="neutral">{t}</Badge>)}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-4">{item.body}</div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-danger-500/30 bg-danger-50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-danger-700">
              <AlertTriangle size={12} /> Why it hurts today
            </div>
            <div className="mt-1 text-[13px] text-danger-700">{item.replaces}</div>
          </div>
          <div className="rounded-xl border border-ok-500/30 bg-ok-50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ok-700">
              <Check size={12} /> Replaced by
            </div>
            <div className="mt-1 text-[13px] text-ok-700">{item.merlin}</div>
          </div>
        </div>

        <Card>
          <CardHead title="Notification matrix" sub="Who Merlin notifies, rebuilt from the real distribution lists" />
          <div className="divide-y divide-line">
            {[
              ['New contract created', '12 department heads — Doug, Trip, Ashley, Brianne, Zoe, Brian F, John K, Darin, Gary, Charlotte, Lisa, Cindy'],
              ['Job scheduled / rescheduled', 'Lead carpenter · PM · 3 schedulers · VP Production · warehouse · customer'],
              ['Delivery date changed', 'Vendor · Ashley · PM'],
              ['Estimate below GP target', 'Manager, then owner below 38.5%'],
              ['Permit REQUIRED, not FILED', 'Scheduling — blocks the job start'],
            ].map(([e, who]) => (
              <div key={e} className="flex gap-3 px-4 py-2.5">
                <Bell size={13} className="mt-0.5 shrink-0 text-ink-400" />
                <div>
                  <div className="text-[13px] font-medium text-ink-950">{e}</div>
                  <div className="text-2xs text-ink-500">{who}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

