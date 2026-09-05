# VTI Operations Platform — Project context (handoff / memory)

**Purpose:** A new Cursor conversation should read this file first and continue the project **without redesigning decisions already made**.

**Product:** Voice Talent International (VTI) Operations Platform  
**Primary operator:** Chester Tadeja  
**Repository:** `D:\Chester Project\vtimvp` (package name `vtimvp`)  
**Handoff date:** 4 September 2026  
**Product language (locked):** **demo-ready MVP**. Not production-ready. Do not claim otherwise.

**This file does not replace the planning docs.** It is the continuation memory. Canonical planning sources remain in `docs/`. Where this file and a planning doc conflict on *requirements*, prefer the latest BRD + Chester comments as encoded in `docs/MVP_SCOPE.md` and `docs/CHESTER_CONFIRMATION_QUESTIONS.md`. Where they conflict on *what the app actually does today*, prefer this file plus `docs/MVP_FINAL_COVERAGE_AUDIT.md` and the source in `src/`.

**Do not invent missing information.** Items that are not evidenced in the repo, planning docs, or recorded conversation are marked **UNKNOWN / NEEDS VERIFICATION**.

---

## How a new conversation should start

1. Read this file.
2. Read `docs/MVP_FINAL_COVERAGE_AUDIT.md` (freeze snapshot, 30 August 2026).
3. Read `docs/CHESTER_CONFIRMATION_QUESTIONS.md` (open Chester questions — **not bugs**).
4. Inspect `src/data/catalog.ts` (seed story) and `src/components/operations/operations-store.tsx` (session overlay).
5. Do **not** start Phase 1 (Auth.js, Postgres, Wave, Patriot) unless Chester has explicitly decided to leave the demo-ready freeze.
6. Do **not** redesign the design system, seed story, lifecycle, or Wave/Patriot boundaries.

---

## 1. What this product is

A single operations product so Chester can run a commencement season from inquiry through history, and assigned readers can execute an event from a phone.

It must feel like **one operational system**, not disconnected screens.

Validated lifecycle (Chester / BRD):

**Inquiry → Event → Calendar → reader availability → Assignment → Call Sheet → execution → Expenses → Debrief → invoice/payment tracking → historical record**

VTI tracks **operations**. It must **not** replace:

- **Wave** — ledger source of truth (estimates, invoices, general ledger)
- **Patriot** — reader master profile / compliance / intended pay initiator

Universities do **not** log in (OQ-09). Native iOS/Android is **not** v1. Payments are **never** auto-approved.

---

## 2. Source documents and priority

**Source priority (planning layer):**

1. Latest Business Requirements Document, including Chester’s Word comments and §13 answers: `02_VTI_Business_Requirements_Document (1).docx`
2. Earlier Discovery Summary: `Chester_VTI_Milestone_1_Discovery_Summary_FINAL.docx`

Where those two conflict, **BRD + Chester comments win**. Nothing in the planning layer was supposed to be invented.

**UNKNOWN / NEEDS VERIFICATION:** Those `.docx` files were **not found in this repository** by file search on 4 September 2026. Their content is preserved only as encoded in `docs/*.md`. Do not assume the Word files sit in the repo unless verified on disk.

**Planning docs already in the repo (do not rewrite unless asked):**

| File | Role |
|---|---|
| `docs/MVP_SCOPE.md` | MUST / SHOULD / MUST NOT; lifecycle; Wave/Patriot boundaries |
| `docs/PRODUCT_ARCHITECTURE.md` | Target Phase 1 architecture (Postgres, Auth.js, adapters) — **not what is running** |
| `docs/DATA_MODEL.md` | Logical model; money in cents; Wave/Patriot SOT table |
| `docs/USER_FLOWS.md` | Admin / reader / university-as-operated-by-Chester flows |
| `docs/UI_SCREEN_MAP.md` | Screen inventory; public marketing site out of scope |
| `docs/BUILD_PLAN.md` | Phases 0–10; Wave/Patriot after API validation |
| `docs/MASTER_BUILD_READINESS.md` | Go / no-go framing for a November test |
| `docs/SECURITY_PLAN.md` | Target security; encryption/audit for production |
| `docs/FUTURE_ROADMAP.md` | Post-MVP; explicitly *not* a public website CMS |
| `docs/CHESTER_CONFIRMATION_QUESTIONS.md` | Ten open questions |
| `docs/PHASE_0_COMPLETION.md` | Foundation shell (28 August 2026); Phase 1 not started |
| `docs/MVP_FINAL_COVERAGE_AUDIT.md` | Demo freeze audit (30 August 2026) |

`README.md` is still the **create-next-app boilerplate**. It is **not** the product description.

---

## 3. Original client requirements (as encoded — not re-invented)

Labels from the BRD (preserved in `MVP_SCOPE.md`): **FACT**, **INFERENCE**, **OPEN**.

Core FACTS that drove the product:

- Chester is the primary daily user and final authority on assignments and pay.
- Operational knowledge currently lives in Chester’s head, email, and spreadsheets; the product exists to make that visible.
- Lifecycle above is the backbone.
- Reader mobile minimum: Call Sheet, university instructions, receipt capture, expense report (OQ-20 / NFR-005).
- Dashboard KPIs Chester named: universities served, events, readers utilized, potential income, expenses, plus needs-attention queues (upcoming, blocked, pending expenses, unpaid, reminders) — **no decorative widgets**.
- Calendar is purpose-built, color-coded by university, consecutive days share color. Google Calendar is **not** the operating surface.
- Call Sheets are treated as a legal contract and must be **versioned**; readers acknowledge/accept a version.
- Veteran readers usually get first choice; experience determines lead; Chester has final say; shadows exist so new readers can become the university’s reader later.
- If a reader cannot do the job, Chester releases them back to the pool.
- Payments require human approval every time. Automation is reminders and pre-fill, never silent payment.
- Wave remains accounting SOT. Patriot remains reader master / compliance SOT.
- Universities have never needed login; VTI remains the operator now. A later university portal for payment/event history is left open, not built.
- Brand colors: Chester marked **non-priority**. Do not treat the current palette as official VTI brand.
- Timeline from sources: November/December test, January/February correction, March–August commencement season (OQ-19). **Whether that timeline is still the live plan as of this handoff is UNKNOWN / NEEDS VERIFICATION** (no new Chester date confirmation is recorded in this conversation).

---

## 4. Chester’s business and operational requirements

Chester operates VTI as a commencement-name-reading business serving universities.

Operational needs encoded in planning docs:

- Log interest when it arrives (today: email interest form), then move stages as university administration and coordinators move.
- Distinguish **initial contact** vs **commencement coordinator**.
- Returning universities: record interest/commitment for the following year; do not force a blank inquiry every season.
- Event remains **unconfirmed** until coordinator confirms interest **and** a budget is available → then **tentative**.
- Event statuses used in the domain: `tentative` | `confirmed` | `postponed` | `cancelled`.
- Enter this year’s estimated names and quote; last year’s names and quote if known.
- Logistics: hotel, transportation, airfare, costs, refunds/credits, notations, team dinners/functions in the same university color.
- Matching criteria: sound, university preference, availability, geography.
- Multiple readers and multiple ceremonies are allowed.
- After the event: expenses + receipts, debrief, invoice/payment tracking, historical “event ready.”
- Chester adds **personal events** so he can see his own booked times (visibility to readers is a confirmation question; working assumption: admin-only).
- Insurance / COI due dates and reader document expiration are tracked as operational reminders, not as a compliance product.

---

## 5. Product vision

A usable operations system for **one operator (Chester)** and **invited readers**, covering the full commencement engagement without making VTI the accounting ledger or the HR/payroll system.

Honesty rule: if Wave, Patriot, or the bank are not connected, the UI must **say so**. Do not fake sync.

The product is **not**:

- A multi-tenant SaaS for other agencies
- A freelance reader marketplace
- A public marketing CMS
- A university self-service portal (MVP)
- An AI operations center
- A native mobile app (until web is proven)

---

## 6. Website vision

**This repository is the operations platform, not a public VTI marketing website.**

From `docs/UI_SCREEN_MAP.md`:

- **Public marketing site** — not required to operate VTI — **OUT OF SCOPE unless Chester later asks**.
- Login / invite landing is the intended public *product* surface (Phase 1). Current `/` is an Admin / Reader **chooser**, not marketing.

From `docs/FUTURE_ROADMAP.md`: “Public website CMS” is listed under **what is not a documented future idea**. Do not treat a marketing site as roadmap.

**UNKNOWN / NEEDS VERIFICATION:** Visual identity, copy, and CMS for any separate Voice Talent International marketing site. Not specified in this repo.

---

## 7. Website inquiry requirements

Interest arrives today via an **email interest form**. Chester **logs it manually** in VTI.

MVP capture fields (OQ-01 / user flows): contact name, email, university, department, notes, status/stage. Next action visible on the dashboard.

**Email ingestion is optional/future**, not implemented.

There is **no public website inquiry form** in this app. Admin routes:

- `/admin/inquiries` — pipeline
- `/admin/inquiries/new` — create
- `/admin/inquiries/[id]` — detail / stage changes

Inquiry stages in code (`src/types/operations.ts` labels):

| Internal id | UI label |
|---|---|
| `initial_inquiry` | New |
| `needs_conversation` | Discovery |
| `pending_admin_approval` | Pending admin approval |
| `coordinator_logistics` | Coordinator logistics |
| `closed_won` | Won |
| `closed_lost` | Lost |

Won can proceed to **Create event**. Lost is a closed outcome.

**Do not invent** a public web form, CRM, or Mailchimp-style capture unless Chester asks.

---

## 8. MVP vision (what “done” means for this freeze)

The **smallest product** that:

- Moves operational knowledge out of Chester’s head into a visible system
- Gives Chester a 360° operational view
- Gives readers a simple mobile path: Call Sheet, instructions/files, receipts, expenses, debrief, assigned calendar
- Keeps automation transparent and under administrative control
- Can be walked through as a realistic commencement engagement **without spreadsheets as the operating system**
- Does **not** claim Wave / Patriot / bank integrations that do not exist

**Current status:** that walkthrough exists as a **session-overlay demo**. It is freeze-ready for Chester’s review. It is **not** a live-season production system.

---

## 9. Production vs MVP boundaries

| Layer | This demo-ready MVP | Production / Phase 1+ (not started) |
|---|---|---|
| Data | Seed catalog + `sessionStorage` overlay | PostgreSQL (logical model in `DATA_MODEL.md`) |
| Auth | Route groups + UI only; Settings says “pending connection” | Auth.js, invite-only, no university registration |
| Files | Filename + amount (receipts); no bytes | Encrypted file storage |
| Money | Integer cents internally; USD display | Same model + Wave as official ledger |
| Pay | Manual Approve → Mark paid → Mark cashed | Patriot as intended initiator; still human approval |
| Audit | None | Audit log table |
| Hosting / secrets | Local `next dev` | UNKNOWN / NEEDS VERIFICATION — no hosting decision recorded here |
| PWA | Manifest, icons, `sw.js`, standalone / safe-area | Real HTTPS install test |

`docs/PRODUCT_ARCHITECTURE.md` and `docs/BUILD_PLAN.md` Phase 1 describe Auth.js + Postgres. **That architecture was recommended, not implemented.** Do not “complete Phase 1” inside a demo freeze unless Chester explicitly starts production work.

---

## 10. Existing architecture (what actually runs)

**App Router Next.js** with two role shells:

- `(admin)` — desktop operations
- `(reader)` — mobile-first packet

**Intentional data layer:**

1. Immutable-in-practice seed: `src/data/catalog.ts`
2. Client overlay: `sessionStorage` key **`vti-operations-overlay`**
3. Merge in `src/components/operations/operations-store.tsx`
4. Demo reader identity: `sessionStorage` key **`vti-demo-reader`** (default `reader-marcus` / Marcus Hale)

Walkthrough mutations (new university, inquiry, event, assignment, Call Sheet, expenses, payment status) live in the overlay until **Account → Clear session changes**.

Clear session:

- Removes `vti-operations-overlay`
- Also removes `vti-demo-reader` so `/reader` returns to Marcus Hale
- Restores seed universities: Harborview, Walden, Eastbridge, Northlake, Riverton

**Hydration rule:** overlay hydrates **client-side**. UI must wait (`RecordPending`, demo-reader `ready`, inquiry/event create waits) so seed records (Walden / Marcus) do not flash before overlay is ready.

**Overlay-only detail URLs:** App Router returns HTTP 200; after hydration the client may 404 if the id is not in overlay. **Do not rebuild as true HTTP 404 without a server data layer.**

Providers: `src/components/providers.tsx` wraps operations store, toasts, demo session.

No server actions as a persistence layer. No API routes for business data. **UNKNOWN / NEEDS VERIFICATION:** exact list of `src/app/api` routes beyond PWA/icons — treat as none for operations data unless verified.

---

## 11. Technology stack (actual)

From `package.json` (do not assume extras):

- Next.js **15.5.24** (dev/build with Turbopack)
- React **19.1.0**
- TypeScript 5
- Tailwind CSS **4** (`@tailwindcss/postcss`)
- ESLint 9 + `eslint-config-next`
- npm

**Not in the app:** Auth.js, Prisma/Postgres, Wave SDK, Patriot, Stripe, Google Calendar, Wells Fargo, AI SDKs, Radix/shadcn as a design kit.

**Capture-only (not a product dependency):** `scripts/capture-demo.mjs` uses Playwright. Playwright was installed for capture and is **not** a `package.json` dependency. Output: `demo-output/` (webm + screenshots). MP4 was **not** produced (no system ffmpeg; Playwright ffmpeg VP8-only).

Fonts (root layout): IBM Plex Sans (`--font-ui`), Source Serif 4 (`--font-display`), IBM Plex Mono (`--font-numeric`).

Timezone constant: `America/Chicago` (`src/lib/format.ts` `CHICAGO_TZ`). Ceremony times stored as UTC derived from Chicago wall clock (CST/CDT preserved as wall-clock times). Money: integer **cents**; `formatMoney` displays USD.

---

## 12. Routes / pages

Landing: `/` — Admin / Reader entry (not a marketing site).

**Admin**

| Route | Purpose |
|---|---|
| `/admin` | 360° dashboard |
| `/admin/calendar` | Operational month calendar |
| `/admin/inquiries` | Inquiry pipeline |
| `/admin/inquiries/new` | Create inquiry |
| `/admin/inquiries/[id]` | Inquiry detail / stages |
| `/admin/clients` | University list |
| `/admin/clients/new` | 6-step university onboarding |
| `/admin/clients/[id]` | University profile |
| `/admin/events` | Event list |
| `/admin/events/new` | Create event |
| `/admin/events/[id]` | Event detail (ceremonies, logistics, assign, Call Sheet) |
| `/admin/readers` | Reader list |
| `/admin/readers/[id]` | Reader record |
| `/admin/assignments` | Assignment board |
| `/admin/assignments/[id]` | Assignment detail |
| `/admin/call-sheets` | Call Sheet list |
| `/admin/call-sheets/[id]` | Call Sheet document |
| `/admin/expenses` | Expense inbox |
| `/admin/expenses/[id]` | Expense detail |
| `/admin/debriefs` | Debrief rollup |
| `/admin/payments` | Receivables / payables / reimbursements tracking |
| `/admin/settings` | Workspace settings (timezone read-only Chicago; auth/ledger pending copy) |

**Reader**

| Route | Purpose |
|---|---|
| `/reader` | Home packet |
| `/reader/assignments` | Jobs list |
| `/reader/assignments/[id]` | Assignment hub |
| `/reader/call-sheets` | Packet list |
| `/reader/call-sheets/[id]` | Call Sheet + click-to-accept |
| `/reader/calendar` | Assigned events only (working assumption) |
| `/reader/expenses` | Receipt + expense |
| `/reader/debrief` | Debrief form |
| `/reader/profile` | Read-only profile (OQ-07) |

**PWA**

- `/manifest.webmanifest` — start URL `/reader`, short name “VTI Reader”
- `/icons/icon-192`, `/icons/icon-512`
- `/sw.js`

Genuinely missing paths return HTTP 404 (e.g. `/admin/this-route-does-not-exist`).

---

## 13. Components (inventory)

Do not introduce a new component library.

**Layout / PWA / demo**

- `layout/admin-shell.tsx`, `layout/reader-shell.tsx`
- `pwa/register-service-worker.tsx`, `pwa/install-hint.tsx`
- `demo/demo-banner.tsx`, `demo/demo-action.tsx`, `demo/demo-reader.tsx`, `demo/demo-session.tsx`

**Operations (business)**

- `operations/operations-store.tsx` — overlay merge, mutations, search, payments helpers
- `operations/university-onboarding.tsx` — 6 locked steps
- `operations/university-profile.tsx`
- `operations/inquiry-create.tsx`, `inquiry-detail.tsx`
- `operations/event-create.tsx`, `event-detail.tsx`
- `operations/record-pending.tsx` — wait for overlay before treating missing ids as 404

**Calendar / Call Sheet / reader**

- `calendar/month-calendar.tsx`
- `call-sheet/call-sheet-document.tsx`, `call-sheet/print-call-sheet-button.tsx`
- `reader/receipt-capture.tsx`, `reader/touch-row.tsx`

**UI primitives** (no third-party kit): button, button-link, input/textarea, field, select, dialog, dropdown-menu, toast, page-header, breadcrumbs, panel, badge, empty-state, error-state, skeleton, fact-grid, text-link, search-params-boundary

**Data display:** `data/section.tsx`, `data/table.tsx`, `data/metric.tsx`, `data/filter-pills.tsx`

**Other:** `status/status-badge.tsx`, `foundation/placeholder-page.tsx`, `foundation/foundation-controls.tsx`, `providers.tsx`

---

## 14. Data model (implemented types vs logical production model)

**Canonical logical model:** `docs/DATA_MODEL.md` (entities, Wave/Patriot split, future tables not to build now).

**Implemented TypeScript domain:** `src/types/domain.ts`  
**Overlay extras:** `src/types/operations.ts` (`UniversityProfile`, activity, search hits, inquiry labels)

**Roles in types:** `VTI_ADMIN` | `READER` only.

Important domain enums (code):

- Inquiry stages — see §7
- Event status: `tentative` | `confirmed` | `postponed` | `cancelled`
- Ceremony kind: `commencement` | `related_group` | `team_dinner` | `function`
- Assignment role: `lead` | `reader` | `shadow`
- Assignment status: `offered` | `accepted` | `declined` | `assigned` | `released_to_pool` | `completed`
- Call Sheet: `draft` | `issued` | `superseded`
- Expense: `draft` | `submitted` | `approved` | `rejected` | `reimbursed`
- Compensation: `promised` | `pending_approval` | `approved` | `queued` | `paid` | `cashed` | `void`
- Invoice / estimate statuses exist for **tracking copy**
- Documents: `valid` | `expiring` | `expired` | `missing`
- Insurance: `not_started` | `submitted` | `accepted` | `change_needed`

**Money:** integer cents everywhere. Display via `formatMoney`. Demo walkthrough compensation example: **$2,800.00** = `280000` cents.

**Catalog root** includes users, readers, emergency contacts, clients (universities), contacts, inquiries, events, ceremonies, assignments, call sheets, acknowledgements, files (metadata), expenses, debriefs, compensation rows, estimates, invoices, university payments, availability blocks, personal calendar events, insurance records, documents — **as seed objects**, not a database.

Future entities explicitly **not** to build now (`MASTER_BUILD_READINESS`): `UniversityUser`, `SubAdminGrant`, `MessageThread`, `WaveSyncEvent`, `PatriotSyncEvent`, `BankTransaction`, `AiRecommendation`, `PolicyRecord`.

---

## 15. User roles and permissions

**In the running app there is no real authentication.** Anyone who opens `/admin` or `/reader` sees that shell. This is demo-only.

**Intended MVP roles (BRD / architecture):**

| Role | Who | May |
|---|---|---|
| `VTI_ADMIN` | Chester (seed `user-chester`) | Full operations; only payment approver in MVP working assumption |
| `READER` | Invited subcontractors | Own assignments, Call Sheets, files, expenses, debrief, own pay, assigned calendar; **cannot** edit profile after onboarding (OQ-07); **cannot** see other readers’ pay |

**Must not exist in MVP unless Chester answers Q9 yes:** second admin / business-associate approver, university users, social login, university self-registration.

Reader identity in the demo is a **header switcher** (`demo-reader.tsx`). Hide the switcher until overlay/identity is `ready` (shows “Loading…”). Do not flash Marcus then swap.

Compensation visibility: admin sees all; reader Call Sheets show **own** pay only.

---

## 16. Admin workflows

Chester’s path (also the locked demo journey):

1. **Dashboard** — metrics + needs-attention; jump to work.
2. **University onboarding** (`/admin/clients/new`) — 6 steps, cannot skip required validity:
   1. University details — required: name, city, state
   2. Contacts — required: primary name, email, phone
   3. Operations
   4. Billing
   5. Compliance
   6. Review → Submit → success (“University onboarded successfully”) → profile
3. **Create inquiry** — university preselected from the new record (not a seed university).
4. **Advance stages** — New → Discovery → Pending admin approval → Coordinator logistics → Won (or Lost).
5. **Create event** — ceremonies (Chicago wall clock), travel, hotel, transfers.
6. **Assign reader** — offer with compensation; `offerAssignment` must create a **compensation** row (`promised`) so Payments works. Overlay assignments without a row are **healed on merge**.
7. **Issue Call Sheet** — versioned; issuing a new version supersedes prior issued.
8. **Review expenses / debriefs**.
9. **Payments** — Approve → Mark paid → Mark cashed (manual). Three sections: university receivables vs reader payables vs reimbursements. Compensation and reimbursement approved separately.
10. **Clear session** to restore seed.

Also: global search (header + Ctrl/Cmd K), in-app alerts (unsigned Call Sheets, offers, expenses, insurance, expiring docs), reader records, calendar with university colors and personal events (admin).

Settings notification checkboxes are **local UI**, not a notification service.

---

## 17. Reader workflows

Mobile-first shell, bottom nav: Home, Jobs, Packet, Expenses, Profile. Calendar and Debrief live under “More” / dedicated routes.

Typical packet:

1. Home — identity and current work
2. Assignment — location, date/time (Chicago), own pay, logistics
3. Call Sheet — click-to-accept current version (working assumption until Chester decides signature)
4. Files — metadata / empty state (“No files on this assignment yet.”)
5. Expenses — receipt photo/PDF **required** before amount (“Choose a receipt photo or PDF first.”); filename stored, not bytes
6. Debrief
7. Profile — read-only
8. Calendar — **assigned events only** (working assumption)

PWA is installable in principle; **PWA install was not fully tested** in the freeze environment.

---

## 18. University workflows

Universities **do not use the app**. Chester operates their record:

- Profile: contacts, events, insurance, notes, billing snapshot, activity
- Inquiry pipeline until Won
- Returning-year interest/commitment where seeded or entered
- Insurance / COI due tracking
- Estimates/invoices as **VTI tracking copy**; UI should not imply Wave is connected

A future university login for payment/event history is **post-MVP** and a distinct product surface (`FUTURE_ROADMAP` §9).

---

## 19. Event workflows

- Create from a won inquiry or from Events.
- Ceremonies have name, start (Chicago), venue, kind, estimated names, optional sound check / call time.
- Logistics notes: travel, airfare, hotel, transfers, credits/refunds.
- Status: tentative (interest + budget) vs confirmed vs postponed vs cancelled.
- Calendar: month grid (desktop) + narrow list; consecutive days share `calendarColor`; Call Sheet signal on the calendar.
- Reader assignment from event detail; multiple readers/roles.
- Issue Call Sheet from structured event + assignment data (not a free-floating Word doc in-app).

Seed Walden is the dense story (see §22). Walkthrough-created events (e.g. Lakeshore Arena, Sat Nov 21 2026 10:00 AM) exist **only in overlay** until cleared.

---

## 20. Assignment workflows

Assignments are the **operational hub**.

Admin: offer (role + promised pay) → reader accept → assigned → completed; or declined / released to pool.

**Implementation decision:** offering an assignment creates a compensation tracking row at `promised`. Without that row, Payments would not show newly created jobs. Do not remove this heal/create behavior.

Readers accept from the reader shell for **their** demo identity.

Pay is shown to the assigned reader; other readers’ pay is not on reader Call Sheets.

---

## 21. Call Sheet workflows

- Generated from event/assignment/logistics snapshots.
- Versions: issue new → prior **issued** becomes **superseded**.
- Seed example: Walden `cs-walden-v1` superseded, `cs-walden-v2` issued; Riverton has a completed-season sheet.
- Reader **click-to-accept** per version. Drawn signature **not** implemented.
- Print button / print CSS exist (SHOULD). Dedicated PDF export is later.
- Legal-contract framing comes from Chester; mechanism is **NEEDS CHESTER** (Q3).

---

## 22. Expense workflows

Reader: attach receipt (camera/file) → amount → submit.  
Admin: inbox → approve or return/reject.  
Reimbursed **payout** is a **Payments** tracking action, not the same click as expense approve.

Receipts: **filename + amount only** in session. Do not stuff image bytes into `sessionStorage`.

---

## 23. Financial workflows

**Principle:** VTI tracks operational money; Wave is official invoices/GL; Patriot is intended reader pay/compliance master.

Admin Payments page (three sections):

1. University / invoice **receivables** (tracking)
2. Reader **compensation** (Approve → Mark paid → Mark cashed)
3. **Reimbursements** (separate approval)

Cashed date is **manual**. How Chester knows a check was cashed is **open** (Q7).

Estimates may appear around Stage 2 / qualification (Chester: closer to Stage 2); stored in VTI; official copy in Wave.

UI copy must remain honest: “tracked in VTI — Wave is official” (or equivalent). Dual ledgers will drift; that is documented, not hidden.

**No** auto-approve. **No** unattended payouts. **No** balance-sheet product inside VTI.

---

## 24. Documents

- University document placeholders on onboarding/profile (required / on_file / expired) — tracking.
- Reader documents (DL, passport, NDA flags, masked tax IDs) — catalog + masks; Patriot remains intended master.
- Event packet files: original filename metadata (e.g. seed `Walden_Fall2026_Reader_Instructions.pdf`, `Walden_Fall2026_NameList.xlsx`).
- Name-list **delivery method, size, timing** — **NEEDS CHESTER** (Q2). Seed notes say Walden name list expected Nov 12; that is story, not a file pipeline.
- Production: encrypted at rest, omitted from logs (`DATA_MODEL.md` / `SECURITY_PLAN.md`) — **not implemented**.

---

## 25. Current demo data (seed story — do not substantially alter)

Constants in `catalog.ts`:

- `DEMO_AS_OF` = `2026-08-28`
- `DEMO_CATALOG_REVISION` = `walden-fri-nov-13`
- `DEMO_ADMIN_USER_ID` = `user-chester`
- `DEMO_DEFAULT_READER_ID` = `reader-marcus`

**Universities**

| id | Name | Role in story |
|---|---|---|
| `uni-harborview` | Harborview College of Arts | Prospect / inquiry (`status: prospect`) |
| `uni-walden` | Walden University | Confirmed fall 2026; assignments + Call Sheets |
| `uni-eastbridge` | Eastbridge University | Tentative / Sam released to pool |
| `uni-northlake` | Northlake State University | Offer outstanding (Priya) |
| `uni-riverton` | Riverton University | Completed / paid; event-ready next season |

Calendar colors (seed): Walden `#6b2d3c`, Northlake `#1f4e79`, Eastbridge `#3d5a3a`, Riverton `#5c4a2e`, Harborview `#4a5560`.

**Readers:** Marcus Hale (lead, veteran first-choice), Elena Voss, Jordan Park (shadow on Walden), Priya Raman, Sam Okonkwo.

**Walden event:** `evt-walden-fall-2026` confirmed. Ceremonies include Friday undergraduate **2026-11-13** 10:00 AM Chicago wall clock (`startsAt` `2026-11-13T16:00:00.000Z`), further Fri/Sat/Sun ceremonies + team dinner. Venue: Minneapolis Convention Center (Hall A/B). Marcus lead `$2,800.00` (`280000` cents).

**Do not replace this story** unless a bug requires a correction. Walkthrough universities (e.g. “Lakeshore”) must disappear after Clear session.

---

## 26. Design system

Tokens in `src/app/globals.css` (light only):

- Paper `#f3efe6`, raised `#fbf9f4`, inset `#ebe6da`
- Ink `#1b1814`, muted `#5e574c`, faint `#8a8275`
- Accent `#1e3b34` (also viewport `themeColor` and PWA theme)
- Semantic danger / warning / success / info + soft backgrounds
- Radius small (3/5/8px); operational, not a consumer-app kit

Admin: left nav, header, main. Reader: compact header, bottom nav, larger touch (`--touch: 2.75rem`).

**Do not** introduce a generic dashboard kit, shadcn restyle, or dark mode as a product requirement (none is specified).

Status labels: `src/lib/status.ts` `labelize` + `toneFor` — keep human labels, not raw snake_case in UI.

---

## 27. Brand rules

- Product name in metadata: **VTI Operations**. Manifest long name: **Voice Talent International**.
- Chester marked **brand colors as non-priority**. Current palette is **operational**, not official VTI brand. Do not present it as brand-locked forever; also **do not** invent a new brand system in a freeze.
- No marketing clutter on the operations entry (`UI_SCREEN_MAP`).
- Honest tracking copy over polished “connected to Wave” fiction.

---

## 28. UX decisions (locked unless Chester overrides)

- Vertical slice over disconnected screens; calendar + assignment + Call Sheet + reader phone path are the heart of the demo.
- Overlay hydration: never flash the wrong university/reader before `ready`.
- Inquiry/event create waits for overlay so Walden is not the false default.
- Reader switcher hidden until ready.
- Click-to-accept until Chester chooses drawn signature or both.
- Availability admin-entered; readers cannot edit it.
- Reader calendar = assigned only.
- Personal calendar events admin-only (recommended; still Q6).
- Chester-only payment approval.
- Expense receipt required before amount.
- Empty / loading / 404 states are product requirements, not afterthoughts.
- Next.js **dev issues overlay** intercepting clicks is **not** a product bug.
- Capture script may inject a **runtime cursor overlay** for video; that is **not** app code.

---

## 29. Features already implemented

See `docs/MVP_FINAL_COVERAGE_AUDIT.md` §1 and coverage table. Summary:

Admin 360° dashboard; university onboarding + profiles; inquiry lifecycle; event create/detail; operational calendar; assignments hub; versioned Call Sheets; reader mobile packet; PWA assets; expenses; debriefs; insurance/document expiration **tracking**; global search; in-app alerts; payment tracking Approve → paid → cashed; session reset; overlay hydration empty/loading states; print Call Sheet; light admin↔reader notes on events.

---

## 30. Features intentionally not implemented

- Auth.js / invite email / password reset
- PostgreSQL or any production DB
- Encrypted blob storage / real receipts
- Audit infrastructure
- Live Wave, Patriot, Wells Fargo, Google Calendar
- University portal / university login
- Native iOS/Android
- AI, chat product, email ingestion
- Extra admin / sub-admin roles
- Drawn Call Sheet signature
- Reader self-service profile/availability edit
- Public marketing website / CMS
- Replacing Wave or Patriot
- Auto-pay, auto-assign, auto-invoice
- True HTTP 404 for overlay-only records

SHOULD items that must not block this MVP: live APIs, brand-color polish, richer multi-year dossier, GPS-free logistics as a dedicated product field, dedicated messaging, PDF Call Sheet.

---

## 31. Integrations discussed

| System | Role | MVP stance |
|---|---|---|
| **Wave** | Estimates, invoices, GL SOT (OQ-12) | Tracking records + nullable `waveExternalId` / equivalent; **not connected**. Manual Wave entry. |
| **Patriot** | Reader master, NDA/financial compliance, intended pay initiator (OQ-13) | Operational copy + masks; **not connected**. |
| **Wells Fargo** | Chester asked about business banking | **Not in MUST**. Q10: confirm tracking-only. Working assumption: no bank connection. |
| Email | Inquiry arrives as email form today | Manual log; ingestion later |
| Google Calendar | Not SOT | Out of MVP |
| Stripe | Not in sources as ledger | Not used |

Adapters (`BillingProvider`, `ReaderHrProvider`) are an **architecture recommendation**, not code in this repo.

Honest gap if APIs are missing: **double entry** for official invoices and reader master data; VTI still gives operational visibility. Documented, not hidden.

---

## 32. Wave requirements (do not dilute)

- Wave **must remain** the accounting source of truth.
- VTI **MUST** track estimate/invoice/payment **status** (billed, due, reminded, paid, amount) for operations.
- VTI **MUST NOT** replace Wave.
- Live Wave API is **SHOULD**, after API/licensing/cost validation. APIs may not be free.
- November test question (Q8): is tracking-inside-VTI + manual Wave/Patriot acceptable? **Unanswered.** Working assumption used in the demo: **yes, tracking-only**, labeled honestly.
- UI must not pretend a live integration exists.
- Chester asked how a balance sheet fits: **answer remains Wave**, not VTI.

---

## 33. Important decisions made throughout the project

**Requirements / product**

- Two roles only for MVP: VTI Admin and Reader.
- No university login in MVP.
- Purpose-built calendar, not Google as SOT.
- Call Sheets versioned.
- Human approval always for pay.
- Brand colors non-priority.
- Public marketing site out of scope.

**Implementation (this codebase / freeze conversation)**

- Demo data layer = catalog + session overlay (not a fake “connected” backend).
- Session overlay is **intentional**, not a temporary accident to hide.
- Hydration gating to prevent Walden/Marcus flash.
- `offerAssignment` creates compensation `promised` row; merge heals missing rows.
- Clear session also clears demo reader key.
- Receipts = filename + amount, not bytes.
- Ceremony times: Chicago wall clock → UTC storage.
- Working assumptions listed in coverage audit §5 are **labeled in Settings/calendar copy** where relevant — do not silently treat them as Chester-signed decisions.

**Build plan vs reality**

- Phase 0 foundation (shell, tokens, routes) completed 28 August 2026.
- Later phases were implemented as **demo screens on overlay**, not as Phase 1 Auth+DB.
- `PHASE_0_COMPLETION.md` still says Phase 1 has not started — that remains true for **production** auth/DB even though the UI is no longer placeholders.

---

## 34. Things that must NOT be changed

Unless Chester (or an explicit new task) says otherwise:

1. Lifecycle backbone and Wave/Patriot SOT split.
2. “Demo-ready MVP” language — do not call it production-ready.
3. Seed story universities/readers/Walden November 2026 ceremonies.
4. Session overlay architecture **as the current data layer** (do not silently swap to a database mid-freeze).
5. Overlay-only 200-then-client-404 behavior **without** a server data layer.
6. Design tokens / no new design system.
7. Locked demo walkthrough (onboarding → inquiry stages → event → Sam $2,800 → Call Sheet v1 → reader accept → expenses → payments → clear session).
8. No auto-pay, no university login, no native app, no fake Wave sync.
9. Working assumptions must stay labeled until Chester answers the ten questions.
10. Do not invent answers to `CHESTER_CONFIRMATION_QUESTIONS.md`.
11. Do not put image bytes in `sessionStorage`.
12. Do not show other readers’ compensation on reader surfaces.
13. Do not make the public `/` page a marketing site.

---

## 35. Known bugs / issues

**Documented limitations (intentional, not “fix by pretending production”):**

- Overlay-only records: HTTP 200 then client 404 after hydration if missing.
- Next.js `next dev` issues overlay can intercept clicks.
- Receipts/files: metadata only.
- No auth, no DB, no live ledgers.
- PWA install not fully verified in freeze environment.

**Fixed in the freeze/polish pass (do not reintroduce):**

- Assignment offer without compensation row (Payments empty for new jobs)
- Reader identity flash before hydration
- Inquiry/event create flashing Walden before overlay ready
- Reader calendar duplicate date/time
- Insurance reminder layout / status labelization (covered in freeze notes)

**Capture / demo video (not product bugs):**

- Playwright journey video exists as **WebM** (`demo-output/vti-demo-journey.webm`, ~4:19 in last capture). **MP4 not created.**
- Early capture pacing was too fast; later capture added a runtime cursor overlay and slower pacing. **UNKNOWN / NEEDS VERIFICATION** whether the latest file on disk is the polished take — confirm `demo-output/` timestamps if needed.
- Port **3000** hung during some QA; capture also used **3001**. Last capture note: `http://localhost:3000`.

**UNKNOWN / NEEDS VERIFICATION:** any Chester-reported bugs after a live walkthrough — **none recorded**. Git working tree at conversation start had many modified UI files; whether those are fully committed is a git question, not a product defect.

---

## 36. QA results

**Freeze QA (30 August 2026)** — recorded in `MVP_FINAL_COVERAGE_AUDIT.md`:

- `npx tsc --noEmit`, `npm run lint`, `npm run build` passed.
- Listed routes HTTP 200; missing route HTTP 404.
- Clean-session full Lakeshore-style walkthrough passed, then seed restore (Harborview, Walden, Eastbridge, Northlake, Riverton; no walkthrough university).
- Overlay “Loading this record…” until hydration — intentional.
- Reader switcher does not show default name before hydration.

**This is internal QA, not Chester sign-off.**

---

## 37. Previous client feedback

Chester’s feedback is encoded as **Word comments and §13 answers** in the BRD, then distilled into planning docs. Do not invent additional verbal sessions.

Already decided by Chester (from `CHESTER_CONFIRMATION_QUESTIONS.md` “not asking” table):

- University login not needed now
- Google Calendar not SOT
- Readers do not edit profiles initially
- Call Sheets remain versioned
- Dashboard KPI set
- Debrief topics listed in OQ-17 (see `USER_FLOWS.md` / BRD encoding — do not invent extra topics here)
- Payments always approved by a human
- Native app not the minimum (web first)
- Timeline Nov/Dec → Jan/Feb → Mar–Aug (as of BRD; currency UNKNOWN)
- Onboarding fields listed in OQ-05/06
- Event tentative/cancelled/postponed rules defined
- Brand colors non-priority

Chester also worried about the **gap if Wave/Patriot are not connected** — answered in docs as tracking-first, double entry, do not fake sync.

---

## 38. Chester’s latest feedback

**No new Chester BRD answers and no recorded Chester walkthrough of this demo-ready MVP are in this conversation.**

Open questions remain the ten in `docs/CHESTER_CONFIRMATION_QUESTIONS.md` (calendar sample; name lists; signature mechanism; who sets availability; reader calendar grain; personal event visibility; how “cashed” is known; November tracking without APIs; second payment approver; Wells Fargo).

**Latest instructions from the project owner in Cursor (not Chester-the-client):**

1. Freeze the demo-ready MVP; stop scope expansion.
2. Capture a paced demo video/screenshots (`scripts/capture-demo.mjs`) without changing product behavior.
3. **Stop making code changes** and write this handoff document only.

Treat Chester walkthrough as the **next product step**, then Phase 1 only after explicit Chester decisions on the open questions and production architecture.

---

## 39. Rationale behind existing implementation decisions

| Decision | Why |
|---|---|
| Session overlay instead of Postgres now | Deliver a walkable vertical slice for Chester without claiming production auth/DB; Phase 1 remains a separate, explicit start. |
| Tracking copy for invoices/pay | BRD: Wave/Patriot SOT; APIs unvalidated; Chester asked about the gap. Honesty > fake sync. |
| Click-to-accept | Acknowledgement is required; drawn signature is unconfirmed (Q3). |
| Admin-entered availability | Readers cannot edit profile; availability ownership unconfirmed (Q4). |
| Reader calendar assigned-only | “Not the entire calendar” + permission-driven; broader grain unconfirmed (Q5). |
| Manual cashed date | Bank/Patriot source unconfirmed (Q7). |
| Single approver | Second admin unconfirmed (Q9); BRD later unless November needs it. |
| No university login | OQ-09 FACT. |
| Filenames not bytes | `sessionStorage` size/security; production file store is Phase 1. |
| Hydration waits | Overlay is client-only; flashing seed data looks like a bug and breaks the walkthrough. |
| Compensation row on offer | Payments page is the demo’s money proof; assignments without a row were invisible there. |
| Clear session clears reader key | Reset must return a deterministic Marcus Hale home. |
| Operational palette | Brand colors non-priority; still need a restrained professional shell (Phase 0). |
| PWA not native | Prove reader workflows on responsive web first (NFR-005). |
| Capture script separate from app | Video polish must not alter product files. |

---

## 40. Locked demo journey (must remain intact)

Start: **Account →** confirm **No session changes** (or **Clear session changes** first).

1. Dashboard → University onboarding (all 6 steps locked until valid)
2. Review → Submit → success → view university
3. Create inquiry (new university, not a seed client)
4. Stages: New → Discovery → Pending admin approval → Coordinator logistics → Won
5. Create event: ceremony (example used in QA: Sat Nov 21 2026 · 10:00 AM · America/Chicago), travel, hotel, transfers
6. Assign **Sam Okonkwo**, lead, **$2,800.00 USD**
7. Issue Call Sheet → toast “Call Sheet v1 issued.”
8. Reader as Sam: identity, assignment, venue, Nov 21 2026 10:00 AM, $2,800.00
9. Click-to-accept → “You accepted this Call Sheet version.”
10. Files empty state
11. Expenses: receipt required first
12. Admin Payments: Approve → Mark paid → Mark cashed on the new assignment row
13. Clear session → seed restored (five seed universities only)

---

## 41. How to run (local)

```
npm run dev
```

Open `http://localhost:3000` (or the port Next prints). Admin `/admin`, Reader `/reader`.

Verify before a Chester walkthrough:

```
npx tsc --noEmit
npm run lint
npm run build
```

Capture (optional, not product): `scripts/capture-demo.mjs` against a running server; artifacts under `demo-output/`.

---

## 42. Recommended next steps (do not start unless asked)

1. Chester walkthrough of the frozen demo.
2. Collect answers to the ten confirmation questions.
3. Only then: Phase 1 (Auth.js, Postgres, encrypted files, audit) **or** a scoped correction pass.
4. Wave/Patriot adapters only after API, licensing, and cost validation.

---

## 43. Explicit unknowns

- Location of original `.docx` BRD / Discovery files in this workspace
- Hosting / production domain / secrets
- Whether Nov/Dec 2026 test dates are still the live business plan
- Chester’s verdict on the ten questions
- Chester’s reaction to the demo-ready UI
- Official VTI brand colors / logo usage
- Name-list operational practice
- How “cashed” is known in real life
- Whether a separate public website exists outside this repo
- Whether `demo-output/` artifacts are committed or gitignored
- Whether freeze UI changes are committed to git (working tree was dirty at conversation start)

When in doubt: **label it, do not invent it.**
