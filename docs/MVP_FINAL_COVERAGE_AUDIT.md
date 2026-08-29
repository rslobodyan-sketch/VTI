# VTI MVP — Final coverage audit

**Date:** 29 August 2026  
**Scope:** Existing session/demo catalog architecture. No production database, Auth.js, Wave, Patriot, Wells Fargo, Stripe, AI, chat, university portal, or native apps.

**Sources used:** `docs/MVP_SCOPE.md`, `docs/MASTER_BUILD_READINESS.md`, `docs/BUILD_PLAN.md`, `docs/DATA_MODEL.md`, `docs/USER_FLOWS.md`, `docs/UI_SCREEN_MAP.md`, `docs/SECURITY_PLAN.md`, `docs/CHESTER_CONFIRMATION_QUESTIONS.md`, `docs/FUTURE_ROADMAP.md`.

The Word BRD and Discovery Summary named in those files were **not present in this repository**. This audit does not invent requirements; it maps planning-layer MUST / SHOULD / POST-MVP items already extracted from those sources.

**Status values (only these):**

| Status | Meaning |
|---|---|
| IMPLEMENTED | Operable in this MVP walkthrough |
| DEMO/TRACKING | Represented honestly as tracking/session behavior, not a live integration |
| NEEDS CHESTER | Blocked or only a working assumption until Chester confirms |
| PRODUCTION INTEGRATION | Required for a live season; not built (and out of this polish pass) |
| OUT OF MVP | Explicitly later or out of scope |

---

## Coverage table

| Requirement / Workflow | Current Implementation | Status | Demo Ready? | Production Dependency? | Notes |
|---|---|---|---|---|---|
| Admin 360° dashboard (universities, events, readers, income vs expenses, queues) | `/admin` metrics, needs-attention queues, upcoming events | IMPLEMENTED | Yes | Auth + live data | KPI set from OQ-16. No decorative charts. |
| University onboarding / client records | 6-step onboard wizard; creates university, contacts, insurance, profile; success → profile or inquiry | IMPLEMENTED | Yes | Database | Coherent record in session overlay. |
| University / contact records | University profile: contacts, events, insurance, activity, notes, billing snapshot | IMPLEMENTED | Yes | Database | Universities do not log in (OQ-09). |
| Inquiry lifecycle | Stages: initial inquiry → needs conversation → pending admin approval → coordinator logistics → closed won / closed lost; next action copy; won → create event | IMPLEMENTED | Yes | Database | Returning-year interest is on the university/inquiry record where seeded. |
| Event / ceremony handling | Event create + detail; multiple ceremonies; statuses tentative/confirmed/postponed/cancelled; travel, lodging, airfare | IMPLEMENTED | Yes | Database | Ceremony times stored as UTC from America/Chicago wall clock (CST/CDT). |
| Operational calendar | Admin month grid (desktop) + list (narrow viewports); university color; names/quote vs last year; hotel/air/transfer; Call Sheet signal; personal blocks admin-only | IMPLEMENTED | Yes | Database | Visual density still a Chester sample question. Personal events not shown to readers. |
| Reader onboarding / profile (admin) | Reader detail: onboarding, NDA, travel, masked tax, document expiration, availability block | DEMO/TRACKING | Yes | Patriot + encrypted files + auth | Operational copy in catalog. Patriot remains master profile SOT. |
| Reader profile (reader view, no self-edit) | `/reader/profile` read-only; tax masked; license images not shown | IMPLEMENTED | Yes | Auth | Matches OQ-07 working assumption. |
| Availability | Admin-entered unavailable blocks; calendar sidebar available / assigned / unavailable | NEEDS CHESTER | Yes (admin-entered) | — | Working assumption: Chester records availability. Readers cannot edit. |
| Assignments as operational hub | Offer / accept / assigned / completed / released; pay, Call Sheet, expenses, debrief linked | IMPLEMENTED | Yes | Database + auth | Admin offers; reader accepts. |
| Versioned Call Sheets | Issue new version; prior issued versions superseded; admin version history | IMPLEMENTED | Yes | Database | Generated from structured event/assignment data. |
| Call Sheet acknowledgement / signature | Click-to-accept per version; outstanding ack on dashboard/alerts | NEEDS CHESTER | Yes (click-to-accept) | Legal/signature decision | Drawn signature not implemented. Mechanism still a Chester question. |
| University documents / instructions in reader packet | Assignment hub lists files and notes visible to assigned readers | DEMO/TRACKING | Yes | Encrypted file storage | Filenames and status notes; no blob storage in this MVP. |
| Name-list delivery to readers | Status notes on documents (e.g. not yet received) surface as operational issues | NEEDS CHESTER | Partial | File pipeline | How lists arrive (PDF/spreadsheet/portal, size, timing) is unanswered. |
| Reader mobile: Home → assignment → Call Sheet → files → receipt/expense → debrief → profile | Reader routes + bottom nav (Home / Jobs / Packet / Expenses / Profile); More includes calendar and debrief | IMPLEMENTED | Yes | Auth + PWA install on HTTPS | Installable PWA (manifest, icons, standalone, safe-area). Not a native app. |
| Receipt capture | Camera/file input attaches a labeled line to the assignment expense report (filename only, not stored bytes) | DEMO/TRACKING | Yes | File storage | Avoids stuffing images into sessionStorage. |
| Expense submit / review / approve | Draft → submitted → approved / returned; Chester review on admin expense detail | IMPLEMENTED | Yes | Database | Reimbursed payout is payment tracking, not the same click. |
| Debrief | Reader form (event, other readers, staff, problems, plan vs execution, ratings); admin list; work-again / event-ready marked by Chester on the event | IMPLEMENTED | Yes | Database | Attached to assignment/event. |
| Insurance / COI reminders | University insurance due status; dashboard queue; reader DL/passport expiration on reader record and alerts | IMPLEMENTED | Yes | Database + real dates | Tracking/reminders only, not a policy system. |
| Estimates / invoices tracking | Estimates and invoices on university/event/payments; Wave labeled as ledger SOT | DEMO/TRACKING | Yes | Wave API (SHOULD) | Tracking copy only. Live Wave sync is not MVP MUST. |
| Reader compensation visibility | Admin sees all; reader sees own pay only on assignment, expenses, Call Sheet (reader viewer) | IMPLEMENTED | Yes | Auth + Patriot | Other readers’ pay is not shown on reader Call Sheets. |
| Payment approval (Chester) | Payments: Approve → Mark paid (tracking) → Mark cashed (manual) | DEMO/TRACKING | Yes | Patriot payout (SHOULD); Chester-only role | Working assumption: Chester is the only approver in MVP. |
| Paid / cashed tracking | Status fields and manual cashed date | NEEDS CHESTER | Yes (manual) | Bank/Patriot source | How “cashed” is known today is unanswered; manual tracking until then. |
| University receivables vs reader payables vs reimbursements | Payments page three sections with distinct copy | IMPLEMENTED | Yes | Wave + Patriot | Compensation and reimbursement approved separately. |
| Global search | Header search (all admin breakpoints) + Ctrl/Cmd K | IMPLEMENTED | Yes | Search index | Session overlay records are included once hydrated. |
| Alerts | Named items: unsigned Call Sheets, offers, expenses, insurance, expiring docs | IMPLEMENTED | Yes | Notification transport | In-app only. No email/push infrastructure. |
| Settings | Org timezone America/Chicago; notification checkboxes (session UI); tracking-only auth copy | DEMO/TRACKING | Yes | Auth + notification delivery | Checkboxes are local workspace UI, not a notification service. |
| Empty / 404 / refresh / back-forward | Empty states on lists; `/` 404; overlay hydrates from sessionStorage; client navigation keeps provider mounted | IMPLEMENTED | Yes | — | Full reload no longer blocks the shell on “Loading workspace…”. Overlay-only records wait briefly on detail routes. |
| Demo reset | Account → Clear session changes restores seed catalog | IMPLEMENTED | Yes | — | `vti-operations-overlay` cleared to empty overlay. |
| Role-based access / audit log / encrypted documents | Route groups and UI hiding; sensitive fields masked; no Auth.js, audit table, or encryption at rest | PRODUCTION INTEGRATION | Walkthrough only | Auth.js, Postgres, encryption, audit log | BUILD_PLAN Phase 1. Do not claim production security. |
| Human control over automation | No auto-pay; Call Sheets issued by admin; reminders are flags not silent decisions | IMPLEMENTED | Yes | Audit log in production | AI features are OUT OF MVP. |
| Wave integration | Explicit tracking copy; not connected | PRODUCTION INTEGRATION | Tracking demo | Wave API + licensing | SHOULD, not MUST. |
| Patriot integration | Explicit tracking copy; not connected | PRODUCTION INTEGRATION | Tracking demo | Patriot API + licensing | SHOULD, not MUST. |
| Wells Fargo / bank feed | Not connected; cashed date is manual | PRODUCTION INTEGRATION | Tracking demo | Bank API | Confirm MVP tracks status only (Chester Q10). |
| In-app notes admin ↔ assigned readers | Event notes with visibility `admin_and_assigned_readers` | IMPLEMENTED | Yes | Database | SHOULD-level, kept light. Not a messenger. |
| Print Call Sheet | Print button / print CSS | IMPLEMENTED | Yes | Optional PDF export later | SHOULD. |
| Reader calendar (permission-filtered) | `/reader/calendar` assigned events only | NEEDS CHESTER | Yes (assigned-only) | — | Broader filtered month still a Chester question. |
| University login / history portal | Not built | OUT OF MVP | — | — | Chester: VTI is the operator. |
| Native iOS/Android app | Not built | OUT OF MVP | — | — | Responsive PWA only. |
| AI / chat / email ingestion / Google Calendar sync | Not built | OUT OF MVP | — | — | Future roadmap. |
| Extra admin / sub-admin roles | Single operator framing (Chester) | OUT OF MVP | — | Auth roles | Second approver is a Chester question if wanted for November. |

---

## Working assumptions (not silent product decisions)

These match `docs/CHESTER_CONFIRMATION_QUESTIONS.md`. The product uses them for the walkthrough only:

1. Personal calendar events are admin-only.
2. Click-to-accept is the acknowledgement mechanism until Chester chooses drawn signature or both.
3. Availability is admin-entered.
4. Reader calendar shows assigned events only.
5. Cashed dates are entered manually.
6. November test may track Wave/Patriot data inside VTI without live APIs.
7. Chester is the only payment approver.
8. No Wells Fargo connection.

---

## Intentionally not in this MVP pass

- Production authentication and invite-only accounts
- PostgreSQL persistence
- Encrypted document blobs
- Audit log table
- Live Wave / Patriot / bank APIs
- University portal
- Native mobile applications
- AI, chat, paid PWA/notification services
- Additional npm packages beyond the existing Next.js / React / Tailwind stack
