# VTI Operations MVP — Final coverage audit

**Date:** 30 August 2026  
**Status:** Demo-ready MVP. Not a production-ready system.  
**Architecture:** Existing session overlay (`sessionStorage` key `vti-operations-overlay`) plus seed catalog (`src/data/catalog.ts`). No production database, Auth.js, Wave, Patriot, Wells Fargo, Stripe, AI, chat, university portal, or native apps.

This document is the handover for Chester’s walkthrough. It does not invent answers to open Chester questions.

**Sources used:** `docs/MVP_SCOPE.md`, `docs/MASTER_BUILD_READINESS.md`, `docs/BUILD_PLAN.md`, `docs/DATA_MODEL.md`, `docs/USER_FLOWS.md`, `docs/UI_SCREEN_MAP.md`, `docs/SECURITY_PLAN.md`, `docs/CHESTER_CONFIRMATION_QUESTIONS.md`, `docs/FUTURE_ROADMAP.md`.

---

## 1. What is implemented

Operable in this demo walkthrough:

- Admin 360° dashboard (universities, events, readers, income vs expenses, needs-attention queues)
- University onboarding (6 locked steps → review → submit → success → profile)
- University / contact / insurance / notes records
- Inquiry lifecycle: New → Discovery → Pending admin approval → Coordinator logistics → Won (or lost)
- Event create/detail: ceremonies, travel, hotel, transfers, reader assignment, Call Sheet issue
- Operational calendar (admin month grid + narrow list; university color; Call Sheet signal)
- Assignments as the operational hub (offer / accept / assigned / completed / released)
- Versioned Call Sheets (issue new version; prior issued versions superseded)
- Click-to-accept Call Sheet acknowledgement (working assumption until Chester decides otherwise)
- Reader mobile packet: Home → assignment → Call Sheet → files → expenses → debrief → profile → calendar
- Installable PWA assets (manifest, icons, `sw.js`, standalone / safe-area). Not a native app.
- Expense draft → submit → Chester review
- Debrief form and admin list
- Insurance / document expiration reminders (tracking only)
- Global search and in-app alerts
- Payment tracking: Approve → Mark paid → Mark cashed (manual)
- Account → Clear session changes restores the seed catalog
- Empty / loading / 404 states for overlay hydration

---

## 2. What is demo / tracking only

Honestly labeled in the UI. Not live integrations:

- Payments, invoices, and estimates — tracking copy only; Wave is not connected
- Reader compensation and reimbursement status — tracking copy only; Patriot is not connected
- Cashed date — entered manually; bank feed is not connected
- File / receipt capture — filename + amount stored in session; bytes are not stored
- Reader onboarding / NDA / tax / document fields — catalog and masks; Patriot remains the intended master profile
- Settings notification checkboxes — local workspace UI, not a notification service
- Sign-in — “pending connection”; no Auth.js
- Reader “View as reader” switcher — demo identity overlay (`sessionStorage` key `vti-demo-reader`)
- Session overlay — the current data layer for walkthrough changes

---

## 3. What was tested

Clean-session demo walkthrough on 30 August 2026 (Account showed no session changes, then the full journey, then Clear session changes):

1. Dashboard → University onboarding (all 6 steps locked until valid)
2. Review → Submit → success (“University onboarded successfully”)
3. Create inquiry (university preselected from the new record, not a seed university)
4. Inquiry stages: New → Discovery → Pending admin approval → Coordinator logistics → Won
5. Create event: ceremony (Sat, Nov 21, 2026 · 10:00 AM · America/Chicago), travel, hotel, transfers
6. Assign reader (Sam Okonkwo, lead) at **$2,800.00** USD (stored as cents, displayed as dollars)
7. Issue Call Sheet → toast “Call Sheet v1 issued.”
8. Reader as Sam: identity, assignment, Lakeshore Arena, Nov 21 2026 10:00 AM, $2,800.00
9. Call Sheet click-to-accept → “You accepted this Call Sheet version.”
10. Files empty state (“No files on this assignment yet.”)
11. Expenses: receipt UX requires a photo/PDF first (“Choose a receipt photo or PDF first.”)
12. Admin Payments: Approve → Mark paid → Mark cashed on the new assignment row
13. Account → Clear session changes → seed catalog restored (Harborview, Walden, Eastbridge, Northlake, Riverton; no walkthrough university)

Also verified in this freeze pass:

- Typecheck, lint, and production build
- Listed routes return HTTP 200; a missing path returns 404
- Overlay-only records wait on “Loading this record…” until session hydration (intentional)
- Reader identity switcher does not show the default reader name before hydration

Prior QA also covered: inquiry/event create not flashing Walden before overlay ready; reader calendar duplicate date/time; insurance reminder layout; status labelization; Chester-assumption copy on Settings and calendar.

---

## 4. Known limitations

These are intentional. They must stay documented rather than hidden.

- Payments are tracking only
- No Wave integration
- No Patriot integration
- No bank integration
- No authentication
- No database
- No production file storage
- File inputs / receipts currently store filename + amount
- PWA installation cannot be fully tested in this environment
- Native app installation is out of scope
- Session overlay is intentionally the current data layer
- Overlay-created university/event/assignment detail URLs return HTTP 200 from the App Router, then a client 404 after overlay ready if the record is missing — this is the overlay architecture, not a production 404 pipeline
- Next.js development “issues overlay” can intercept clicks in `next dev`; it is not a product defect

---

## 5. Chester decisions still required

These are **not bugs**. Do not invent answers. The UI continues to label working assumptions. Full text: `docs/CHESTER_CONFIRMATION_QUESTIONS.md`.

- Calendar sample (density / color / hierarchy)
- Name-list delivery (how, size, timing)
- Click-to-accept vs drawn signature vs both
- Who sets reader availability
- Reader calendar grain (assigned-only vs broader filtered month)
- How “cashed” is known today
- November tracking without Wave/Patriot APIs
- Second payment approver
- Wells Fargo confirmation / tracking

Working assumptions used for the walkthrough only:

1. Personal calendar events are admin-only
2. Click-to-accept is the acknowledgement mechanism until Chester chooses otherwise
3. Availability is admin-entered; readers cannot edit it
4. Reader calendar shows assigned events only
5. Cashed dates are entered manually
6. November test may track Wave/Patriot data inside VTI without live APIs
7. Chester is the only payment approver
8. No Wells Fargo connection

---

## 6. Production Phase 1 work that is NOT included

Do not treat the following as started or implied by this freeze:

- Auth.js / real authentication / invite-only accounts
- PostgreSQL (or any production database)
- Encrypted document storage
- Audit log infrastructure
- Live Wave API
- Live Patriot API
- Bank / Wells Fargo feeds
- University portal
- Native iOS/Android applications
- AI, chat, email ingestion, Google Calendar sync
- Additional admin / sub-admin roles
- Replacing the session overlay with a server data layer

---

## 7. Seed / demo data

Do not remove or substantially alter this story unless a bug requires a correction.

| University | Role in the seed story |
|---|---|
| Harborview College of Arts | Prospect / inquiry |
| Walden University | Confirmed fall 2026 with assignments and Call Sheet |
| Eastbridge University | Tentative / unassigned |
| Northlake State University | Offer outstanding |
| Riverton University | Completed / paid |

Default reader identity for `/reader` is Marcus Hale (`reader-marcus`). Use the header switcher (or `sessionStorage` `vti-demo-reader`) to inspect other contractors.

Ceremony times are stored from **America/Chicago** wall clock. November 2026 examples must remain correct (CST/CDT preserved as wall-clock ceremony times).

---

## 8. Demo walkthrough

Start from **Account →** confirm **No session changes** (or **Clear session changes** first).

Then:

1. Dashboard → University onboarding → complete all 6 steps → Review → Submit → success → View university
2. Create inquiry → New → Discovery → Pending admin approval → Coordinator logistics → Won
3. Create event → ceremony → travel → hotel → transfers → assign reader → verify USD compensation → Issue Call Sheet
4. Switch to Reader (correct identity) → verify assignment, location, date/time, compensation → open Call Sheet → accept → files → expenses
5. Return Admin → Payments → Approve → Mark paid → Mark cashed
6. Account → Clear session changes → confirm the seed catalog is restored

---

## 9. Important routes

| Route | Role |
|---|---|
| `/` | Landing (Admin / Reader entry) |
| `/admin` | Dashboard |
| `/admin/clients` | University list |
| `/admin/clients/new` | Onboarding |
| `/admin/inquiries` | Inquiry list |
| `/admin/events` | Event list |
| `/admin/calendar` | Operational calendar |
| `/admin/payments` | Payment tracking |
| `/admin/settings` | Workspace settings |
| `/reader` | Reader home |
| `/reader/calendar` | Assigned events only |
| `/manifest.webmanifest` | PWA manifest |
| `/icons/icon-192` | PWA icon |
| `/icons/icon-512` | PWA icon |
| `/sw.js` | Service worker |

A genuinely missing route (for example `/admin/this-route-does-not-exist`) returns HTTP 404.

---

## 10. How to reset the demo session

**Account → Clear session changes**

This clears `vti-operations-overlay` and restores the seed catalog. It also clears the demo reader switcher (`vti-demo-reader`) so `/reader` opens as Marcus Hale again. It does not change Chester’s open questions or the seed story.

---

## 11. Build / lint / typecheck verification

Run from the repo root:

```
npx tsc --noEmit
npm run lint
npm run build
```

All three must pass before a Chester walkthrough. Results for this freeze are recorded in the freeze report (same date).

Do not claim production readiness. Language: **demo-ready MVP**.

---

## Coverage table (planning-layer map)

**Status values (only these):**

| Status | Meaning |
|---|---|
| IMPLEMENTED | Operable in this MVP walkthrough |
| DEMO/TRACKING | Represented honestly as tracking/session behavior, not a live integration |
| NEEDS CHESTER | Blocked or only a working assumption until Chester confirms |
| PRODUCTION INTEGRATION | Required for a live season; not built (and out of this polish pass) |
| OUT OF MVP | Explicitly later or out of scope |

| Requirement / Workflow | Current Implementation | Status | Demo Ready? | Production Dependency? | Notes |
|---|---|---|---|---|---|
| Admin 360° dashboard | `/admin` metrics, needs-attention queues, upcoming events | IMPLEMENTED | Yes | Auth + live data | KPI set from OQ-16. No decorative charts. |
| University onboarding / client records | 6-step onboard wizard; success → profile or inquiry | IMPLEMENTED | Yes | Database | Coherent record in session overlay. |
| University / contact records | Profile: contacts, events, insurance, activity, notes, billing snapshot | IMPLEMENTED | Yes | Database | Universities do not log in (OQ-09). |
| Inquiry lifecycle | Named stages; won → create event | IMPLEMENTED | Yes | Database | Returning-year interest is on the university/inquiry record where seeded. |
| Event / ceremony handling | Create + detail; travel, lodging, transfers | IMPLEMENTED | Yes | Database | Ceremony times stored as UTC from America/Chicago wall clock. |
| Operational calendar | Month grid (desktop) + list (narrow); university color | IMPLEMENTED | Yes | Database | Visual density still a Chester sample question. |
| Reader onboarding / profile (admin) | Reader detail, masked tax, document expiration | DEMO/TRACKING | Yes | Patriot + encrypted files + auth | Patriot remains master profile SOT. |
| Reader profile (reader view, no self-edit) | `/reader/profile` read-only | IMPLEMENTED | Yes | Auth | Matches OQ-07 working assumption. |
| Availability | Admin-entered unavailable blocks | NEEDS CHESTER | Yes (admin-entered) | — | Readers cannot edit. |
| Assignments as operational hub | Offer / accept; pay tracking row created on offer | IMPLEMENTED | Yes | Database + auth | Admin offers; reader accepts. |
| Versioned Call Sheets | Issue new version; prior issued superseded | IMPLEMENTED | Yes | Database | Generated from structured event/assignment data. |
| Call Sheet acknowledgement | Click-to-accept per version | NEEDS CHESTER | Yes (click-to-accept) | Legal/signature decision | Drawn signature not implemented. |
| University documents in reader packet | Files and notes on assignment hub | DEMO/TRACKING | Yes | Encrypted file storage | Filenames and status notes; no blob storage. |
| Name-list delivery | Status notes surface as operational issues | NEEDS CHESTER | Partial | File pipeline | How lists arrive is unanswered. |
| Reader mobile packet | Routes + bottom nav; More includes calendar and debrief | IMPLEMENTED | Yes | Auth + PWA on HTTPS | Not a native app. |
| Receipt capture | Camera/file input; filename only | DEMO/TRACKING | Yes | File storage | Avoids stuffing images into sessionStorage. |
| Expense submit / review / approve | Draft → submitted → approved / returned | IMPLEMENTED | Yes | Database | Reimbursed payout is payment tracking, not the same click. |
| Debrief | Reader form; admin list; work-again marked by Chester | IMPLEMENTED | Yes | Database | Attached to assignment/event. |
| Insurance / COI reminders | University insurance due; reader DL/passport expiration | IMPLEMENTED | Yes | Database + real dates | Tracking/reminders only. |
| Estimates / invoices tracking | On university/event/payments; Wave labeled as ledger SOT | DEMO/TRACKING | Yes | Wave API (SHOULD) | Live Wave sync is not MVP MUST. |
| Reader compensation visibility | Admin all; reader own pay only | IMPLEMENTED | Yes | Auth + Patriot | Other readers’ pay is not shown on reader Call Sheets. |
| Payment approval (Chester) | Approve → Mark paid → Mark cashed | DEMO/TRACKING | Yes | Patriot payout (SHOULD) | Chester is the only approver in MVP. |
| Paid / cashed tracking | Status fields and manual cashed date | NEEDS CHESTER | Yes (manual) | Bank/Patriot source | How “cashed” is known is unanswered. |
| Receivables vs payables vs reimbursements | Payments page three sections | IMPLEMENTED | Yes | Wave + Patriot | Compensation and reimbursement approved separately. |
| Global search | Header search + Ctrl/Cmd K | IMPLEMENTED | Yes | Search index | Overlay records included once hydrated. |
| Alerts | Unsigned Call Sheets, offers, expenses, insurance, expiring docs | IMPLEMENTED | Yes | Notification transport | In-app only. |
| Settings | Org timezone America/Chicago; tracking-only auth copy | DEMO/TRACKING | Yes | Auth + notification delivery | Checkboxes are local workspace UI. |
| Empty / 404 / refresh / back-forward | Empty states; overlay hydrates from sessionStorage | IMPLEMENTED | Yes | — | Overlay-only records wait briefly on detail routes. |
| Demo reset | Account → Clear session changes | IMPLEMENTED | Yes | — | Restores seed catalog. |
| Role-based access / audit / encryption | Route groups and UI hiding; fields masked | PRODUCTION INTEGRATION | Walkthrough only | Auth.js, Postgres, encryption, audit | BUILD_PLAN Phase 1. |
| Human control over automation | No auto-pay; Call Sheets issued by admin | IMPLEMENTED | Yes | Audit log in production | AI features are OUT OF MVP. |
| Wave / Patriot / Wells Fargo | Explicit tracking copy; not connected | PRODUCTION INTEGRATION | Tracking demo | Respective APIs | SHOULD, not MUST. |
| In-app notes admin ↔ assigned readers | Event notes with visibility | IMPLEMENTED | Yes | Database | SHOULD-level, kept light. |
| Print Call Sheet | Print button / print CSS | IMPLEMENTED | Yes | Optional PDF later | SHOULD. |
| Reader calendar | `/reader/calendar` assigned events only | NEEDS CHESTER | Yes (assigned-only) | — | Broader filtered month still a Chester question. |
| University login / history portal | Not built | OUT OF MVP | — | — | VTI is the operator. |
| Native iOS/Android app | Not built | OUT OF MVP | — | — | Responsive PWA only. |
| AI / chat / email ingestion / Google Calendar sync | Not built | OUT OF MVP | — | — | Future roadmap. |
| Extra admin / sub-admin roles | Single operator framing (Chester) | OUT OF MVP | — | Auth roles | Second approver is a Chester question. |
