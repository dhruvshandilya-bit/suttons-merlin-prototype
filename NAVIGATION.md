# Sutton's Prototype — Step-by-Step Navigation

```bash
npm run dev --prefix suttons-prototype   # http://localhost:5191
```

The chrome now mirrors `app.merlinai.co`: **left rail = modules**, **top bar = that module's sub-nav**,
global search + Ask AI + bell top-right, and the Project Agent / Activity rail down the right edge.

---

## The layout, part by part

| Element | What it is | Matches production |
|---|---|---|
| Left rail, 208px | `MAIN` → Sales · Jobs · Materials · Finance · Orders · Operations · `COMMUNICATION` → Calendar · Emails · `RECENTS` · `OTHERS` | ✅ same order, same groups |
| Pin on **Jobs** | Sutton's pinned module | ✅ |
| Top bar | The active module's sub-tabs | ✅ |
| Global search | `Search accounts, projects, i…` with ⌘K | ✅ |
| **Ask AI** | Dark button, sparkle icon | ✅ |
| Bell with `9+` | Notifications | ✅ |
| Right rail | Project Agent · Activity, vertical purple tabs | ✅ |
| Bottom-left | Avatar · name · org · `AA` font size · dark-mode moon | ✅ |

---

## 1 · Jobs → Home — *the job register*

**Replaces:** Sutton's Job Status workbook.

1. **Status pills** run across the top with live counts — `Jobs not started 69 · Work in progress 39 · Receivables 38 · Callback 6 · Punchlist 4 · Legal 13 · Cancelled 43 · Closed 44`. Click any to switch bucket.
   *All eight of their tabs. Production Merlin only has three of these as phases.*
2. **Service filter** — the dropdown on the left. Six values: AOB, Design, Exteriors, Remodeling, Service, Emergency.
3. **`Not costed 29`** — click it. This is the constraint: jobs waiting on estimating.
4. **Search** — customer, job number, or rep.
5. **The table** — Customer (with their note underneath) · Job # · Service · Type · Sales/Estimator · Contract · Balance · Est. cost · GP · Zone · Permit · S.O.
   - **GP colours by their own thresholds**: green ≥ 42.5%, amber ≥ 38.5%, red below.
   - **Est. cost** shows an amber `not costed` chip where the number is missing — that's their `$0.01` placeholder.
   - **Zone** (`Z1`–`Z6`) and **Permit** (`FILED` / `REQUIRED`) are the two columns nobody mentioned on the call.

---

## 2 · Jobs → Project Phases — *the kanban*

**Replaces:** the Job Status tabs, as a board.

1. Board selector: `All boards · ● Project Phases · ● Commercial Jobs` — same two boards as production.
2. **Amber banner** names the gap: production has only JNS, WIP and Completed w/Balance, plus two strays (`Exterior`, `AOB`) that are service types, not phases.
3. Eight columns. The six marked **`to add`** don't exist in production yet.
4. **Each card** carries what production's cards don't: job number, service type, sales rep, start date, **Zone**, **Permit status**, contract value, balance due, and a `not costed` chip.

> **Show this one to Zoe.** It's the clearest picture of what's missing from the live board.

---

## 3 · Jobs → Job Packet — *every document for one job*

**Replaces:** the 11 documents Sutton's produces per job.

Left list, click through top to bottom:

| # | Document | What to point out |
|---|---|---|
| 1 | **Job cost estimate** | Martha Miller 1542-26 in full — labor $2,294, material $6,480.94, subtotal $8,966.03, min sell **$15,593.09**, GP **42.53%** vs 42.5% target → *"READY TO SEND · No approval needed"*. The approval rule is printed underneath. |
| 2 | **Construction schedule** | The **11-value schedule type** list. `ScheduleItem` has no type field — this is gap B2. |
| 3 | **Material breakdown** | The **`who orders`** column — scheduling for stock, estimating for special order. Their split-ordering rule, already written down. Also shows the 9.75% vs 10.25% tax conflict. |
| 4 | **Trade partner sheet** | Minimum charges — $500 excavation, $175 gutters. |
| 5 | **Draw information** | *"PROJECT MANAGERS HAVE ACCESS TO EDIT THIS SECTION ONLY."* Becomes payment milestones. |
| 6 | **Dumpster placement** | The site-photo slot, and Cleeton's price bands + town delivery matrix. **Keep this document as-is** — Zoe agreed. |
| 7 | **Customer contract** | 7 pages from MarketSharp. Keep their format at launch. |
| 8 | **Pay sheet** | Carpenter folder attachment — generated from the estimate's crew column. |
| 9 | **Spec sheet** | Carpenter folder attachment — from the Special Order Materials line. |
| 10–11 | **Change order · PO book page** | Marked `?` — **never supplied**. Flagged rather than faked. |

---

## 4 · Sales → Estimate — *the rate card*

**Replaces:** Master Costing.

1. **Rate card selector** top-right: `SDG - LAB` / `RFG - LAB`.
2. **"Who does the work"** — the crew buttons. Each shows the running cost for the current quantities.
   Click between **EMP · All Star · SAUCEDO** and watch every number on the right recalculate.
   *Their hidden pay columns, as selectable options.* The cheapest crew gets a green chip.
   *Roofing has four crews — EMP, All Star, Unity, Rottie. The crew set changes by trade.*
3. **Line-item groups** — click a header to expand. Type a quantity in the `Qty` column; the row highlights and the total appears.
4. **Right column, top to bottom:**
   - **Job cost breakdown** — labor computes from the lines; material and trade partner are editable.
   - **Contract metrics** — type a contract amount and watch GP move.
   - **The approval banner** changes live: green *No approval needed* → amber *Manager approval* below 42.5% → red *Owner approval* below 38.5%. A `Small job` chip appears under $2,000, where the target becomes 45%.
   - **Org rules in play** — all 11 values from their DROPDOWNLIST tab.
5. **Sell price by phase** at the bottom — this is what seeds the project budget.

> **Try this:** set contract to `14000`. GP drops to ~36% and the button turns red — *Blocked, below owner threshold.*

---

## 5 · Operations → Dashboard — *Future Forecast, the $0.01 and Operations Master, on one Merlin page*

Merlin's `/operations/dashboard` with its three views (toggle top-left; the URL it maps to is shown beside it).

**Today** — four tiles: *Ready to schedule* (opens the tray), *On tomorrow's board*, *Morning reports in* (opens Daily Logs on
a job), *Crew off today*; the fortnight's red / blue / black counts; ready jobs still waiting on special orders.

**Schedule** — the crew timeline (Future Forecast):
1. **Trade band filter**, legend in Zoe's words, crew rows (trade partners carry a wrench), default PM initials.
2. **Click any job** → drawer with crew, PM, phases and the source cell; **hover a day** to preview *"Moves N later jobs for this crew"*.
3. **`Same-crew ripple`** — only that crew's later jobs move. Other crews are untouched.

> **The demo:** filter to `SIDING`, click Stapleton 1395-25 on SAUCEDA BRO'S, hover Thursday. Six downstream jobs preview.

**Calendar** — `Week | Day`:
- **Week**: each day's jobs as chips with a red / blue / black dot and the day's counts. Click a day to open it.
- **Day** — the day board. Opens on the fortnight's busiest day.
  1. **Add work to this day** — Merlin's unscheduled tray = Ready to schedule. 22 costed jobs first, then the ones still being
     costed. Each row: *Costed*, *Special orders due* (amber when after this day), missing paperwork, **Daily logs**.
     **Book it here** → crew (filtered to the job's trade) → **Book it**. The card appears on the board as *just booked*, red.
  2. **Board** — one column per trade; **Group by → Project manager** regroups by PM initials. Each card: job, crew, phases,
     red / blue / black chip, **Daily logs**.
  3. **Agenda** — crew time off (called in / vacation / weather), special orders due that day, equipment out.

---

## 7 · Materials → Purchase — *procurement*

**Replaces:** Special Order Materials + the three weekly vendor emails.

1. **`Purchase orders 86`** tab — every real PO. Columns: PO # · Job · Phase · Vendor · Material · Ordered by · Expected · **Route** (warehouse vs jobsite) · **Status** · **Verified**.
   *Their status enum: Ordered → Ready at Vendor / Ready at Warehouse → Delivered to Jobsite.*
2. **Vendor filter** dropdown.
3. **`Vendor delivery schedule`** tab — one card per vendor. Click **Send** and the card flips to *"Vendor opened the link and confirmed dates — no reply-all thread."*
   Each card names the email it replaces.
4. **Top-right** always shows the next PO number, continuing from **12,567**.

---

## 8 · Emails — *all six recurring emails*

**Replaces:** the Gmail integration layer.

Click each in the left list:

1. **New Contracts 8/21** — the real 12 recipients, and the dynamic sections (New Contract / Callback / Change Order; an earlier sample had Punchlist).
2. **Carpenter Folder** — every field, including the install-instruction links and the AP terms (`ap@suttonsinc.com`, Tuesday 9 a.m. for Friday payment) and the three attachments.
3. **ROOFERSMARTS week of 8/24–8/28** — verbatim, with the note that it was **re-sent in full on Tue 25 Aug** with four jobs added. That resend *is* their reschedule mechanism.
4. **Cardinal** — Zoe: *"same format as Roofers Mart."*
5. **Cleetons** — dumpster deliveries, with the three distinct event types and the price/town matrix.
6. **The reschedule chain** — the Starrick thread as three timestamped messages.

Under each: **red panel** = why it hurts today, **green panel** = what replaces it.
Bottom: the **notification matrix**, rebuilt from the real distribution lists.

---

## 9 · Field app preview — *what the crew, PMs and drivers do on the phone*

Left rail → `OTHERS` → **Field app preview**. Header: job, phase, PM chip, address, Call, Clock in, and the reschedule notice.

- **My day** — the 5 pm *"Your plan for Thu 27 Aug"* push, then today's jobs in order. PMs: Ask AI on the project dashboard gives the brief.
- **Work order** — the scope checklist with photo-required steps, materials, hauling, progress payment, PO, install links, AP terms.
- **Daily log** — the morning and evening reports (same form as Jobs → Daily Logs).
- **Materials** — morning truck load, evening return; used = loaded − back; the office approves before job cost moves.
- **Photos** — *Normal* or *Bespoke* before / after pairs; filter All / Bespoke / Normal.
- **Time off** — Leave, Overtime, and the new **Called in**, **Sick**, **Vacation**.

Drivers get the warehouse run from Ask AI; trade partners get a text or email link to their tasks instead of the app.

---

## 10 · Settings → Org setup — *what actually gets loaded*

Ten green ticks, each a real count read from their files: org type `STICK_BUILT` · 53 staff · 53 phase codes ·
12 trade bands · **84 lanes (49 employees, 35 trade partners)** · 37 + 47 vendors and subs · 100 rate-card
lines · 11 schedule types · PO counter · job counter.

Right side: the 11-value schedule-type enum, all 11 business rules, and the **amber warning** on the
9.75% vs 10.25% tax conflict.

---

## 11 · Ready to schedule — *the end of the $0.01*

It's the Calendar's **Add work to this day** tray (section 5). When an estimate is marked costing complete, the job moves to the
"Ready to schedule" phase and scheduling gets a bell, push and email with its special orders — the **bell** top-right holds them;
click one to open the tray. *(In build.)*

## 12 · Jobs → Daily Logs — *what replaces the empty next-steps block and CompanyCam*

1. Five tiles: site reports in, personnel on site, jobs missing required photos, deliveries missed, impacts.
2. **Combined Daily Logs** — every job with a crew on it on the day board, with Morning / Evening status.
3. Click a job → **Morning** report: who's on site (on site / called in / off), *before work starts* photo, and on day 1 the
   *pre-existing damage* photo. Submit stays disabled until they're done. *(Needs Sutton's own report template — the setting is in build.)*
4. **Evening** report: deliveries due (POs due that day) → received / received some / missed, impacts
   (weather delay), *end of day* photo, notes for tomorrow.
5. The same form is the **Daily log** tab in the field app.

## 13 · Ask AI — *Project Forecasting without a screen*

Top-right **Ask AI** → *"How many weeks out are we, by project type?"* — the Project Forecasting tab's formula, live. Change a
jobs/week number and the dates move. Types inside a seasonal blackout get pushed past it. **Draft the monthly company-wide email**
shows a draft; nothing sends until you press send. **"Plan tomorrow's warehouse run"** lists tomorrow's deliveries (job starts
first) and carpenter pick-ups — reorder with the arrows, then **Review & send** to the driver *(sending is proposed)*. Also try
*"Which costed jobs are ready to schedule?"* and *"Give me today's field report across all jobs"*.

## 14 · Finance → Budget — *estimated vs actual*

WIP jobs with budget = estimated cost. Actual to date is blank because Sutton's never fills Cost to Date in the sheet — that's the
point. The right-hand card is Zoe's 2×4 example (marked *Example*).

---

## Suggested 10-minute demo order

| | Screen | Line |
|---|---|---|
| 1 | Sales → Dashboard | *"43% of your backlog is uncosted. You already measure it — nobody sees it."* |
| 2 | Jobs → Project Phases | *"Here's your board with all eight of your tabs, not three."* |
| 3 | Sales → Estimate | *"Same line, one price per crew. Watch the approval change as margin moves."* |
| 4 | Operations → Dashboard → Schedule | *"Move one job. Only that crew's later jobs follow."* |
| 5 | Materials → Purchase | *"Your Thursday emails, with acknowledgement."* |
| 6 | Field app preview | *"The carpenter folder, on the phone."* |
| 7 | Jobs → Job Packet | *"Every document you make for a job — and the two you haven't sent us."* |

**For Zoe's follow-up:** the bell → *Add work to this day* → **Book it here** (it lands red on the day board) → **Daily logs** on a card →
fill a morning report → Ask AI (*weeks out*, *tomorrow's warehouse run*) → Field app (*My day*, *Time off*).
