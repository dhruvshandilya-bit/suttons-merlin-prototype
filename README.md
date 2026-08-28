# Sutton's × Merlin — Working Prototype

Merlin's UI, running on **Sutton's real data**. Nothing here is mock content: every phase code, rate,
crew lane, job, purchase order and KPI is read from the five workbooks and six PDF samples Zoe sent
on 26 Aug 2026.

```bash
npm install
npm run dev     # http://localhost:5191
```

Registered in `Merlin/.claude/launch.json` as `suttons-prototype`.

---

## Modules

| Screen | Replaces | What it demonstrates |
|---|---|---|
| **Dashboard** | Job Status → `Scorecard` | Their own portfolio counts, AR ageing and **% Not Costed** (87 of 202 jobs, 43%) surfaced as the headline constraint |
| **Jobs** | Job Status → `JNS` / `WIP` / `AR` | 69 real jobs with Service Type, Job Type, GP, **Zone** and **Permit Status** — two columns nobody mentioned on the call |
| **Estimating** | Master Costing | 100 real rate-card lines across SDG and RFG, **one price per crew**, live cost→sell→GP, and their three-tier margin approval |
| **Schedule** | Future Forecast | 84 crew lanes in 12 bands, red/blue/black states, PM initials, and **same-crew ripple** |
| **Day board** | Operations Master | Crew assignments, Plan A/B, 7 PM routes, pick-ups and deliveries, trailer locations |
| **Procurement** | Special Order Materials + the 3 weekly vendor emails | 86 real POs with status, delivery route and verification; vendor delivery schedule with acknowledgement |
| **Field app** | The carpenter folder email | Starrick 1401-26 as a phone screen — scope checklist, PO, progress payment, install links, AP terms, reschedule notice |
| **Org setup** | — | Exactly what gets loaded into Merlin, and the two open questions |

---

## The three things worth showing Zoe

**1 · Same-crew ripple** (Schedule → click any job → Reschedule)
Hover a day and the panel previews every downstream job for *that crew* that moves. Commit it and the
banner names each one. Other crews are untouched — that's Sutton's rule, and it's a different axis
from the dependency ripple Merlin ships today.

**2 · One line item, one price per crew** (Estimating)
Their hidden `EMP / All Star / SAUCEDO` columns become selectable options. Switching crew re-prices the
job and re-runs the approval tier live — 42.5% target, manager below it, owner below 38.5%.

**3 · The number nobody surfaces** (Dashboard)
43% of the backlog is uncosted. They already measure it on the Scorecard tab; nothing acts on it.

---

## Data provenance

`src/data/suttons-raw.json` (247 KB) is generated from:

| Source | What was taken |
|---|---|
| `Master Costing 05_08_2026.xlsx` | `DROPDOWNLIST` (53 phase codes, 37 vendors, 47 subs, 11 business rules, 11 schedule types), `SDG - LAB` + `RFG - LAB` rate cards |
| `Sutton's Job Status_ JNS, WIP, A_R.xlsx` | `JNS` / `WIP` / `AR` rows, `Scorecard` grid, `People List` (53 staff) |
| `Future Forecast.xlsx` | `Project Scheduling 2026` — 84 lanes × 11 days |
| `Special Order Materials.xlsx` | 86 purchase orders |
| `Operations Master.xlsx` | the `08282026` day tab |
| The 6 PDF samples | Carpenter folder content, AP terms, reschedule pattern |

Counters are read, not invented: **PO-SUT-12567** and **1583-26**.

---

## Known simplifications

- Two rate-card trades are loaded (SDG, RFG). The other four (`WND`, `DRE`, `DCK`, `DRY+PNT`) follow the same shape.
- Drag-and-drop on the schedule uses HTML5 DnD; the Reschedule picker in the drawer does the same thing and is what the ripple demo uses.
- Estimating starts pre-seeded with a siding job so the numbers are live on open. Quantities are editable.
- Field app is a single job. Photos and chat are illustrative; the checklist is interactive.
- The **9.75% vs 10.25% sales-tax conflict** is surfaced on Org setup rather than resolved — it's a question for Sutton's.

---

## What this proves about the build

Four of the ten gaps in [`08-what-goes-where.md`](../suttons-onboarding/08-what-goes-where.md) are
exercised here as UI:

- **B2** `ScheduleItem.type` — the 11-value enum is rendered on Org setup and drives nothing yet, because the field doesn't exist
- **B3** same-crew ripple — implemented in `src/state/store.tsx` (`computeRipple`)
- **B5** two-tier GP target + three-tier approval — implemented in `src/components/Estimate.tsx`
- **B1** the field-resource model — the schedule mixes employees and trade partners in one board, which today's `Crew` entity cannot represent

---

## Coverage against everything Zoe named

### Spreadsheets — 5 of 5
| | Screen |
|---|---|
| Sutton's Job Status (all 8 buckets: JNS · WIP · AR · Callback · Punchlist · Legal · Cancelled · Closed) | Jobs, Dashboard |
| Future Forecast | Schedule |
| Operations Master | Day board |
| Master Costing | Estimating, Documents |
| Special Order Materials | Procurement |

### Emails — 6 of 6 (**Emails** screen)
New Contracts · Carpenter Folder · ROOFERSMARTS · Cardinal · Cleetons · the rain-day reschedule chain.
Each shows the real recipients, cadence, verbatim body, why it hurts today and what replaces it,
plus the notification matrix rebuilt from the actual distribution lists.

### Per-job documents — 11 (**Documents** screen)
Job cost estimate (cover sheet) · Construction schedule · Material breakdown · Trade partner sheet ·
Draw information · Dumpster placement (with the site-photo slot) · Customer contract / work scope ·
Pay sheet · Spec sheet · Change order* · PO book page*

\* the two Sutton's has never sent — flagged in-app rather than faked.

### Field-level coverage
- **Job Status**: all 26 columns, including Zone, Permit Status, S.O. Items, Financing, Progress Payments
- **Master Costing**: 53 phase codes, 11 business rules, 100 rate-card lines, 11 schedule types, both GP tiers, the three approval tiers, the separate $20k/$50k spot-check
- **Special Order Materials**: PO number, Ordered By, Expected Date, Deliver To, Status, verification columns
- **Future Forecast**: 84 lanes, 12 bands, PM initials, `*` sub flag, red/blue/black, cell markers (cb, c/o, PL, TMR, DEMO, dumptrailer), PM vacation row
- **Operations Master**: 7 PM lanes, Plan A/B, pick-ups, deliveries, trailers, AssetTiger note
- **Carpenter folder**: every field including PO#, progress payment, install links, AP terms, reschedule notice

### Deliberately not built
CompanyCam (decide: replace or link) · hOVER · Leap · EntryLink · AssetTiger (referenced only) ·
MarketSharp notes migration · AOB and Design-Build credit mechanics · four of the six rate-card trades
(`WND`, `DRE`, `DCK`, `DRY+PNT` — same shape as the two loaded).
