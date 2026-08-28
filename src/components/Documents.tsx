import React, { useState } from 'react'
import { FileText, Image as ImageIcon, Check, Wallet, Truck, Hammer, ScrollText, ClipboardList } from 'lucide-react'
import { DOC_TEMPLATES, PHASES, RULES } from '../data/suttons'
import { Card, CardHead, Badge, Th, Td } from './ui'
import { money, pct, cn } from '../lib/util'

type DocKey =
  | 'cover' | 'schedule' | 'material' | 'dumpster' | 'trade' | 'draw'
  | 'contract' | 'paysheet' | 'spec' | 'changeorder' | 'pobook'

const DOCS: { key: DocKey; name: string; source: string; icon: any; note: string }[] = [
  { key: 'cover', name: 'Job cost estimate', source: 'Master Costing → COVER SHEET', icon: Wallet, note: 'Becomes the estimate header + approval gate' },
  { key: 'schedule', name: 'Construction schedule', source: 'Master Costing → CONSTUCTION SCHEDULE', icon: ClipboardList, note: 'Becomes the project schedule template' },
  { key: 'material', name: 'Material breakdown', source: 'Master Costing → MATERIAL BREAKDOWN', icon: FileText, note: 'Becomes purchase orders + the stock/special-order rule' },
  { key: 'trade', name: 'Trade partner sheet', source: 'Master Costing → TRADE PARTNER', icon: Hammer, note: 'Subcontract lines with allowances and minimum charges' },
  { key: 'draw', name: 'Draw information', source: 'Master Costing → labour tabs, PM-editable block', icon: Wallet, note: 'Becomes payment milestones' },
  { key: 'dumpster', name: 'Dumpster placement', source: 'Master Costing → DUMPSTER DOC + WRH-SUB', icon: Truck, note: 'Keep as-is — attach to the dumpster PO' },
  { key: 'contract', name: 'Customer contract / work scope', source: 'MarketSharp, 7 pages', icon: ScrollText, note: 'Signed. Keep their format at launch.' },
  { key: 'paysheet', name: 'Pay sheet', source: 'Carpenter folder attachment', icon: Wallet, note: 'What the crew is paid for this phase' },
  { key: 'spec', name: 'Spec sheet', source: 'Carpenter folder attachment', icon: FileText, note: 'Product spec for the phase' },
  { key: 'changeorder', name: 'Change order', source: 'Referenced in MarketSharp notes', icon: FileText, note: 'Never shown — still to collect' },
  { key: 'pobook', name: 'PO book page', source: 'Physical carbon pad', icon: FileText, note: 'Never shown — still to collect' },
]

export default function Documents() {
  const [key, setKey] = useState<DocKey>('cover')
  const doc = DOCS.find(d => d.key === key)!
  const Icon = doc.icon
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="overflow-hidden">
        <CardHead title="Per-job documents" sub="Everything Sutton's produces for one job" />
        <div className="divide-y divide-line">
          {DOCS.map(d => {
            const I = d.icon
            const missing = d.key === 'changeorder' || d.key === 'pobook'
            return (
              <button key={d.key} onClick={() => setKey(d.key)}
                className={cn('flex w-full gap-2.5 px-3 py-2.5 text-left transition-colors',
                  key === d.key ? 'bg-brand-50' : 'hover:bg-ink-50')}>
                <I size={14} className={cn('mt-0.5 shrink-0', key === d.key ? 'text-brand-400' : 'text-ink-400')} />
                <div className="min-w-0">
                  <div className={cn('truncate text-[12.5px] font-medium', key === d.key ? 'text-brand-400' : 'text-ink-950')}>
                    {d.name}
                  </div>
                  <div className="truncate text-2xs text-ink-500">{d.source}</div>
                </div>
                {missing && <Badge tone="warn" className="ml-auto shrink-0">?</Badge>}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHead
            title={<span className="flex items-center gap-2"><Icon size={15} className="text-ink-400" />{doc.name}</span>}
            sub={doc.source}
            right={<Badge tone="brand">{doc.note}</Badge>}
          />
          <div className="p-4">{render(key)}</div>
        </Card>
      </div>
    </div>
  )
}

function grid(k: string) { return (DOC_TEMPLATES[k] ?? []) as any[][] }

function render(key: DocKey) {
  switch (key) {
    case 'cover': return <Cover />
    case 'schedule': return <ConstructionSchedule />
    case 'material': return <MaterialBreakdown />
    case 'trade': return <TradePartner />
    case 'draw': return <Draw />
    case 'dumpster': return <Dumpster />
    case 'contract': return <Contract />
    case 'paysheet': return <PaySheet />
    case 'spec': return <SpecSheet />
    default: return <Missing />
  }
}

/* Martha Miller 1542-26 — the worked example they sent */
const MM = {
  name: 'Martha Miller', no: '1542-26', address: '2024 Croydon Dr. Springfield',
  rep: 'Ben Venturini', costing: 'Gary Mather', type: 'Non-Remodeling',
  labor: 2294.0, material: 6480.94, trade: 191.09, subtotal: 8966.03,
  overhead: 6627.06, minSell: 15593.09, contract: 15600, gp: 0.4253, target: 0.425,
  completed: '8/26/2026 1:54 PM',
}

const Cover = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <H>Client information</H>
      <KV rows={[['Job name', MM.name], ['Job number', MM.no], ['Job site address', MM.address],
                 ['Sales representative', MM.rep], ['Costing assigned to', MM.costing],
                 ['Project type', MM.type], ['>$20k Remodeling + >$50k all — verified by', '—'],
                 ['Costing complete', '✓'], ['Completed timestamp', MM.completed]]} />
      <H className="mt-4">Job cost breakdown</H>
      <KV rows={[['Labor', money(MM.labor, 2)], ['Material', money(MM.material, 2)],
                 ['Trade partner / equipment / other', money(MM.trade, 2)],
                 ['Subtotal cost', money(MM.subtotal, 2)], ['Overhead markup', money(MM.overhead, 2)],
                 ['Minimum sell price', money(MM.minSell, 2)]]} />
    </div>
    <div>
      <H>Contract metrics</H>
      <KV rows={[['Minimum contract price', money(MM.minSell, 2)], ['Total change order needed', '$0.00'],
                 ['Estimated gross profit', pct(MM.gp, 2)], ['Gross profit target', pct(MM.target, 2)]]} />
      <div className="mt-3 rounded-lg border border-ok-500/30 bg-ok-50 px-3 py-2">
        <div className="text-[13px] font-semibold text-ok-700">READY TO SEND · No approval needed</div>
        <div className="mt-0.5 text-2xs text-ok-700/80">
          &gt;{pct(RULES['Standard Job GP Target'], 1)} none · {pct(RULES['Owner Approval GP Threshold'], 1)}–
          {pct(RULES['Standard Job GP Target'], 1)} manager · &lt;{pct(RULES['Owner Approval GP Threshold'], 1)} owner
        </div>
      </div>
      <H className="mt-4">Costing includes</H>
      <div className="rounded-lg border border-line">
        <div className="flex items-center justify-between border-b border-line px-3 py-2 text-[13px]">
          <span className="flex items-center gap-2"><Check size={12} className="text-ok-600" />Original Contract</span>
          <span className="tnum font-medium">{money(MM.contract, 2)}</span>
        </div>
        <div className="flex items-center justify-between bg-warn-50 px-3 py-2 text-[13px] font-semibold">
          <span>Total contract amount</span><span className="tnum">{money(MM.contract, 2)}</span>
        </div>
      </div>
      <div className="mt-2 text-2xs text-ink-500">
        Ten blank checkbox rows follow — the change-order / inclusion register. Ask Trip what all the entries can be.
      </div>
    </div>
  </div>
)

const ConstructionSchedule = () => (
  <div>
    <div className="mb-2 text-2xs uppercase tracking-wide text-ink-500">Construction schedule (list in order of construction)</div>
    <table className="w-full border border-line">
      <thead><tr><Th>Phase</Th><Th>Schedule type</Th><Th className="text-right">Pay</Th><Th>Description</Th></tr></thead>
      <tbody>
        <tr>
          <Td className="font-medium text-ink-950">SDG — Siding, Fascia &amp; Soffit</Td>
          <Td><Badge tone="brand">EMPLOYEE</Badge></Td>
          <Td className="text-right tnum">$1,529.33</Td>
          <Td className="text-[12px]">Remove wood shelves and brackets below three of the windows. Remove any other 1x's necessary for a smooth surface to attach the siding to. Wrap 7 windows and 1 garage door in white. Detach and reset the fencing against the corner of the house. Install Haven Insulated Board and Batten in Redwood.</Td>
        </tr>
      </tbody>
    </table>
    <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-600">
      <b>Schedule type</b> is an 11-value list: EMPLOYEE · TRADE PARTNER · MATERIAL DELIVERY ·
      MATERIAL PICKUP / RETURN · DUMPSTER DELIVERY · DUMPSTER SWAP · DUMPSTER PICKUP ·
      EQUIPMENT DELIVERY · EQUIPMENT PICKUP · INSPECTION · OTHER JOB EVENT.
      Merlin's <code className="rounded bg-white px-1">ScheduleItem</code> has no type field — this is gap B2.
    </div>
    <div className="mt-2 text-2xs text-ink-500">
      "List in order of construction" — phase order carries meaning. Confirm with Trip whether it's a real dependency chain.
    </div>
  </div>
)

const MaterialBreakdown = () => (
  <div>
    <table className="w-full border border-line">
      <thead>
        <tr>
          <Th>Phase code</Th><Th>Description</Th><Th>Who orders</Th><Th>PO #</Th><Th>S.O.</Th>
          <Th>Vendor</Th><Th className="text-right">Qty</Th><Th className="text-right">Price</Th><Th className="text-right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {[
          ['GUT — Gutters', 'Gutter RX 6 Inch, White', 'estimating', '5pc', 'YES', 'GPI', 0, 11.40, 0],
          ['GUT — Gutters', 'ZIP SCREWS, White', 'estimating', '—', 'YES', 'GPI', 0, 6.00, 0],
          ['DRY — Drywall', '4x8 1/2" Drywall', 'scheduling', '—', 'NO', 'MENARDS', 1, 11.98, 11.98],
          ['DRY — Drywall', '20 min mud', 'scheduling', '—', 'NO', 'MENARDS', 1, 10.19, 10.19],
          ['DRY — Drywall', '6 yards tape', 'scheduling', '—', 'NO', 'MENARDS', 1, 3.99, 3.99],
        ].map((r: any, i) => (
          <tr key={i}>
            <Td className="font-medium text-ink-950">{r[0]}</Td>
            <Td className="text-[12px]">{r[1]}</Td>
            <Td><Badge tone={r[2] === 'scheduling' ? 'info' : 'warn'}>{r[2]}</Badge></Td>
            <Td className="tnum text-2xs">{r[3]}</Td>
            <Td>{r[4] === 'YES' ? <Badge tone="warn">S.O.</Badge> : <span className="text-2xs text-ink-400">—</span>}</Td>
            <Td className="text-[12px]">{r[5]}</Td>
            <Td className="text-right tnum">{r[6]}</Td>
            <Td className="text-right tnum">{money(r[7], 2)}</Td>
            <Td className="text-right tnum">{money(r[8], 2)}</Td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-600">
      The <b>who is ordering</b> column is the split-ordering policy, already written down.
      Stock / big-box items are ordered by <b>scheduling</b> at job start so they don't sit in the warehouse;
      special-order items are ordered by <b>estimating</b> at costing time. Sections: Foundation Materials ·
      Finishing Materials · Service Sheet. Tax applied here is <b>9.75%</b> — the config tab says 10.25%.
    </div>
  </div>
)

const TradePartner = () => (
  <div>
    <table className="w-full border border-line">
      <thead><tr><Th>Phase code</Th><Th>Description</Th><Th>Trade partner</Th><Th>Allowance</Th><Th>PO number</Th><Th className="text-right">Total</Th></tr></thead>
      <tbody>
        {[['EXC — Excavation', '—', '—', '$500 MIN.', '—', 0],
          ['GUT — Gutters', '—', 'Springfield Gutters', '$175 MIN', '—', 0],
          ['WRH — Wrecking & Hauling', '20 yd container', 'Cleeton Disposal', '—', '9851', 475]].map((r: any, i) => (
          <tr key={i}>
            <Td className="font-medium text-ink-950">{r[0]}</Td><Td>{r[1]}</Td><Td>{r[2]}</Td>
            <Td>{r[3] !== '—' && <Badge tone="warn">{r[3]}</Badge>}</Td>
            <Td className="tnum">{r[4]}</Td><Td className="text-right tnum">{money(r[5], 2)}</Td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-3 text-2xs text-ink-500">
      All 53 phase codes appear as rows. Minimum charges are per-phase business rules that need a home on the estimate.
    </div>
  </div>
)

const Draw = () => (
  <div>
    <div className="rounded-lg border border-warn-500/40 bg-warn-50 px-3 py-2 text-2xs text-warn-700">
      "PROJECT MANAGERS HAVE ACCESS TO EDIT THIS SECTION ONLY" · "TO BE UPDATED EVERY TIME A DRAW IS MADE ON A JOB"
    </div>
    <table className="mt-3 w-full border border-line">
      <thead><tr><Th>Draw</Th><Th>P.O. #</Th><Th className="text-right">Amount</Th></tr></thead>
      <tbody>
        {[['Draw 1', '12567', 250], ['Draw 2', '—', 0], ['Draw 3', '—', 0]].map((r: any, i) => (
          <tr key={i}><Td>{r[0]}</Td><Td className="tnum">{r[1]}</Td><Td className="text-right tnum">{money(r[2], 2)}</Td></tr>
        ))}
        <tr className="bg-ink-50"><Td className="font-semibold">Balance</Td><Td /><Td className="text-right tnum font-semibold">{money(2708.25, 2)}</Td></tr>
      </tbody>
    </table>
    <div className="mt-3 text-2xs text-ink-500">
      Becomes <b>payment milestones</b> on the project, with PM-only edit rights. Ties to the carpenter folder's
      "Progress Payment Due (PM only)" line.
    </div>
  </div>
)

const Dumpster = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <table className="w-full border border-line">
        <tbody>
          {[['Job name', 'Janssen, Janet'], ['Job number', '1145-26'],
            ['Address', '1600 E Lake Dr., Springfield'], ['Container size', '20 yd'],
            ['PO number', '9851'], ['Placement notes', 'On the driveway w/ RollSkates or Plywood']].map(([k, v]) => (
            <tr key={k}><Td className="w-[150px] bg-ink-50 font-medium text-ink-950">{k}</Td><Td>{v}</Td></tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-600">
        Cleeton pricing: 10 yd $335 · 20 yd $475 · 30 yd $580, plus a town-by-town delivery fee matrix
        (Auburn, Divernon, Glenarm, Chatham, Decatur, Jacksonville and 20 more) — $50 to $200.
      </div>
    </div>
    <div>
      <div className="text-2xs uppercase tracking-wide text-ink-500">Dumpster location image</div>
      <div className="mt-1 grid h-[190px] place-items-center rounded-lg border-2 border-dashed border-ink-300 bg-ink-50 text-ink-400">
        <div className="text-center"><ImageIcon size={22} className="mx-auto" /><div className="mt-1 text-2xs">Site photo</div></div>
      </div>
      <div className="mt-2 rounded-lg border border-ok-500/30 bg-ok-50 px-3 py-2 text-2xs text-ok-700">
        <b>Keep this document as-is.</b> Zoe agreed on the call — attach it to the dumpster purchase order rather than rebuilding it.
      </div>
    </div>
  </div>
)

const Contract = () => (
  <div className="space-y-3 text-[13px]">
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-ink-950">Customer Information</div>
          <div className="mt-0.5 text-ink-600">Rock Jr. Jennifer Daniels<br />3458 Lightfoot Dr, Springfield IL 62707<br />217-553-0666</div>
        </div>
        <div className="text-right text-ink-600">
          <div className="font-semibold text-ink-950">Sutton's</div>
          1926 N Peoria Rd<br />Springfield, Illinois 62702<br />(217) 528-3911<br />
          <span className="text-2xs">Rep: Phil Grussenmeyer</span>
        </div>
      </div>
      <div className="mt-3 border-t border-line pt-3">
        <Row2 k="Locations INCLUDED in the scope of work" v="Whole Property" />
        <Row2 k="Locations EXCLUDED from the scope of work" v="None" />
      </div>
      <div className="mt-3 rounded-lg bg-ink-50 p-3">
        <div className="font-semibold text-ink-950">Scope and Selections</div>
        <ul className="mt-1 list-inside list-disc text-ink-600">
          <li>Drywall Repairs</li><li>Remove existing outlet plate cover</li>
          <li>Patch hole around perimeter of the outlet</li><li>Sand and finish</li>
          <li>No painting included · Paint by purchaser</li>
          <li>Please call Rock Daniels at 217-544-1313 to schedule the job</li>
        </ul>
      </div>
      <div className="mt-3 flex gap-8 border-t border-line pt-3 text-2xs text-ink-500">
        <div>Customer signature · 05/18/2026</div><div>Sutton's representative · 05/18/2026</div>
      </div>
    </div>
    <div className="rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-600">
      7 pages, generated by MarketSharp and already signed. <b>Keep their format at launch</b> — replacing a
      settled legal document has no operational payoff. Merlin takes the operational side only.
    </div>
  </div>
)

const PaySheet = () => (
  <div>
    <table className="w-full border border-line">
      <thead><tr><Th>Line item</Th><Th>Unit</Th><Th className="text-right">Qty</Th><Th className="text-right">Rate</Th><Th className="text-right">Pay</Th></tr></thead>
      <tbody>
        {[['Entry door — install w/ storm door', 'EA', 1, 85.00, 85.00],
          ['Door casing (with storm door)', 'EA', 1, 85.00, 85.00],
          ['Site considerations', 'HR', 3.2, 25.00, 80.00]].map((r: any, i) => (
          <tr key={i}>
            <Td>{r[0]}</Td><Td className="text-2xs text-ink-500">{r[1]}</Td>
            <Td className="text-right tnum">{r[2]}</Td><Td className="text-right tnum">{money(r[3], 2)}</Td>
            <Td className="text-right tnum font-medium">{money(r[4], 2)}</Td>
          </tr>
        ))}
        <tr className="bg-ink-50"><Td colSpan={4} className="font-semibold">Total</Td><Td className="text-right tnum font-semibold">{money(250, 2)}</Td></tr>
      </tbody>
    </table>
    <div className="mt-3 text-2xs text-ink-500">
      Attached to every carpenter folder as <code className="rounded bg-ink-100 px-1">STARRICK, TED 1401-26 DRE pay sheet.pdf</code>.
      Generated from the estimate's crew column — no separate document to maintain.
    </div>
  </div>
)

const SpecSheet = () => (
  <div className="space-y-3 text-[13px]">
    <div className="rounded-lg border border-line p-4">
      <div className="font-semibold text-ink-950">Starrick DRE spec sheet</div>
      <div className="mt-2 space-y-1 text-ink-600">
        <Row2 k="Product" v="Provia entry door, order # 15501721" />
        <Row2 k="Colour / finish" v="per selection sheet" />
        <Row2 k="Hardware" v="storm door, included" />
        <Row2 k="Install reference" v="Provia — scan QR code on box" />
      </div>
    </div>
    <div className="rounded-lg bg-ink-50 px-3 py-2 text-2xs text-ink-600">
      Third carpenter-folder attachment. In Merlin this is the <b>material/product spec on the work order</b>,
      pulled from the Special Order Materials line — vendor, order number and description are already recorded there.
    </div>
  </div>
)

const Missing = () => (
  <div className="rounded-lg border border-dashed border-warn-500/50 bg-warn-50 px-4 py-6 text-center">
    <div className="text-[13px] font-semibold text-warn-700">Not yet supplied by Sutton's</div>
    <div className="mx-auto mt-1 max-w-md text-2xs text-warn-700/80">
      The change-order document is referenced in a MarketSharp note ("I approve the change order to add gutters
      and facia") but was never shown. The PO book page is a physical carbon pad — we need a photo of a blank
      page, front and back, plus the current number. The series is at <b>12,567</b> from other sources.
    </div>
  </div>
)

const H = ({ children, className }: any) => (
  <div className={cn('mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-500', className)}>{children}</div>
)
const KV = ({ rows }: { rows: (string | number)[][] }) => (
  <div className="rounded-lg border border-line">
    {rows.map(([k, v], i) => (
      <div key={i} className={cn('flex justify-between gap-3 px-3 py-1.5 text-[13px]', i > 0 && 'border-t border-line')}>
        <span className="text-ink-600">{k}</span>
        <span className="tnum font-medium text-ink-950">{v}</span>
      </div>
    ))}
  </div>
)
const Row2 = ({ k, v }: any) => (
  <div className="flex justify-between gap-3 border-b border-line py-1 last:border-0">
    <span className="text-ink-600">{k}</span><span className="font-medium text-ink-950">{v}</span>
  </div>
)
