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
| **Ready to schedule** | the $0.01 placeholder + email to Brie | Estimate approved → scheduling, with special orders, ETAs and earliest start; plug a job into a crew lane |
| **Day board** | Operations Master | Built from the schedule; crew assignments, Plan A/B, 7 PM routes, the warehouse run as a dispatch list, trailers |
| **Daily Logs** | Operations Master's "Work in progress — next steps" block + CompanyCam | Morning/evening site reports per job, required photos, Combined Daily Logs |
| **Budget** | WIP's empty Cost to Date column | Project actuals — estimated vs actual cost |
| **Ask AI** | Project Forecasting tab | Weeks out by project type, ready-to-schedule, warehouse run, attendance, today's field report |
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

## After the 23 Oct operations call with Zoe

Zoe walked the flow from "estimate done" to "crew on site". Each step below is now in the prototype, using
the names Merlin actually ships (checked against `ether-web-v1`, `ether-server` and `merlin-flutter`).

| What Zoe described | What it is today | In the prototype | Merlin surface |
|---|---|---|---|
| Estimator types **$0.01** (or their initials) in Estimated Cost to say "paperwork's in"; Brie keys the real cost into QuickBooks; Zoe waits for the cell to change | 5 live JNS rows carry a placeholder (`$0.01` ×1, `DP` ×3, `GM` ×1) | **Operations → Ready to schedule**, a **Ready to schedule** column on Project Phases, a Stage column on Jobs → Home, and the **bell** | Estimate Approved notification to scheduling (in-app, push, email); a Project Phase added in Phase Config |
| Zoe checks Special Order Materials by hand for lead times | Separate workbook | Each ready job lists its special-order POs with status/ETA; **earliest start** = later of crew backlog and vendor ETA | PO `expectedArrivalAt` |
| Materials sit at the vendor; scheduling calls them to the job site when ready | Phone / email | **Call for delivery** on POs that are *Ready at Vendor*, once the job is plugged in | PO delivery mode + supplier digest |
| **Project Forecasting** tab, sent company-wide monthly — weeks out = JNS count ÷ jobs/week, next date = today + weeks × 7, seasonal blackouts | Formula tab | **No screen** (Dhruv's call). **Ask AI → "How many weeks out are we?"** runs the same formula, with jobs/week editable and the blackout shift, then drafts the monthly email for a human to send | Ask AI (plan-then-confirm for writes) |
| Red / blue / black on Future Forecast | Font colour | Legend now uses Zoe's exact words; job drawer has a **Before it turns black** checklist (customer date · special orders · vendor delivery · dumpster) | Calendar stages, configured |
| Future Forecast also logs **called in / vacation / rain / cold** for production | Typed into cells | Those cells now render as attendance/weather markers; **Ask AI → "Who called in?"** reads them | Morning site report + Impacts (weather delay) |
| Friday: copy Monday's jobs from Future Forecast into a new **Operations Master** tab; Brie emails each PM and carpenter their plan | Manual copy + email per job | **Day Board** says it's built from the schedule; **Send day plan** pushes work orders to crews and PMs | Work orders on the field app |
| PMs fill in their own day plan on Operations Master, but the "Work in progress — next steps" block — "no one fills that part out" | Next steps go into MarketSharp as a note | Day Board PM routes are read from each PM's day-plan column; the next step lives on each job's evening report | Daily Logs |
| Deliveries block is the driver's checklist; warehouse manager reorders by importance and assigns drivers | Checkbox column | **Warehouse run** — reorder, assign driver, Pending → Dispatched → Delivered | Delivery drivers / shipments |
| **CompanyCam**: before/during/after, pre-existing damage, start and end of every day — no written rule | Habit | **Jobs → Daily Logs**: Morning and Evening site reports per job with **required photos**; **Combined Daily Logs** for the day; same form in the field app's **Daily log** tab; photo-required steps on the work order | Daily Logs, site reports (morning 10:00 / evening 18:00), required image fields, Before & After gallery |
| Estimated cost ≠ actual cost (miscut 2×4s aren't chargeable) | Actuals in QuickBooks; WIP's Cost to Date column is empty on all rows | **Finance → Budget** as Project Actuals — budget from the estimate, actual from bills, variance, plus Zoe's 2×4 example (labelled) | Project Actuals |

**Also:** the earlier pseudonymising pass had renamed "Sutton's" to a fake surname in three Operations
Master labels, which filed every Sutton's delivery under pick-ups. Fixed in `suttons-raw.json`.

**Not in Merlin today, so shown as configuration, not as product:** a "called in" attendance status
(Sutton's morning site report asks it as a question), and a built-in "ready to schedule" state (it's a
Project Phase). Ask AI's answers here are computed in the browser from the loaded data.

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
