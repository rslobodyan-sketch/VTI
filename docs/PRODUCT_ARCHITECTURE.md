# VTI Operations Platform — Product Architecture

**Status:** Recommended architecture only. No application code, packages, database, or integrations are being created in this phase.

## 1. Architectural goal

One Next.js application that is the operational source of truth for VTI’s workflow, while **not** becoming VTI’s accounting system or HRIS.

| System | Role |
|---|---|
| VTI Operations Platform | Operational source of truth: inquiries, universities, events, calendar, assignments, Call Sheets, expenses, debriefs, history, operational status |
| Wave | Source of truth for estimates, invoices, and the general ledger (OQ-12) |
| Patriot Software | Source of truth for reader master profile, onboarding, NDA/financial compliance documents, and (if integrated) pay initiation (OQ-13) |

If Wave or Patriot cannot be integrated in time, VTI still tracks the operational status of estimates, invoices, pay, and reimbursement. It does not replace those products.

## 2. Style of system

A **single coherent Next.js 15 application** (App Router).

Not recommended: microservices, a separate mobile backend, a separate calendar service, or a separate “AI layer.”

```
Browser (Admin desktop + Reader phone)
        │
        ▼
Next.js 15  (UI + Server Actions + Route Handlers)
        │
        ├── PostgreSQL (operational data)
        ├── Encrypted file store (documents, receipts, name lists)
        └── Auth.js sessions
```

## 3. Frontend

**Already in the repository (do not change in this phase):**

- Next.js 15.5, React 19, TypeScript, App Router, Tailwind CSS 4, ESLint, npm
- `src/app` only contains the starter page

**Recommended UI approach (later, when building):**

- App Router with route groups for Public, Auth, Admin, Reader
- Server Components for data-heavy admin pages
- Client Components only where interaction requires it (calendar, receipt camera, signature)
- Tailwind for layout and typography
- No component-library dashboard kit (no generic admin template, no Bootstrap card grid)
- Custom operational calendar as a first-class component, not FullCalendar configured to look like Google Calendar
- Print CSS (and optional later PDF) for Call Sheets rather than a paid document SaaS

**Design direction (not built yet):**

Clarity, hierarchy, typography, whitespace, fast workflows, professional calendar, mobile-first reader flows, useful dashboard numbers rather than decorative charts. Align with VTI brand colors when Chester provides them (non-priority).

## 4. Application structure

Recommended later structure (not created in this phase):

```
src/
  app/
    (public)/                 # marketing/login landing if needed
    (auth)/login
    (admin)/                  # Chester
      dashboard/
      universities/
      inquiries/
      events/
      calendar/
      readers/
      assignments/
      call-sheets/
      expenses/
      billing/
      debriefs/
      documents/
      settings/
    (reader)/                 # mobile-first
      home/
      assignments/[id]/
      call-sheet/
      expenses/
      pay/
      profile/
  server/
    auth/                     # Auth.js config, session helpers
    db/                       # schema, queries
    actions/                  # Server Actions by domain
    files/                    # encrypted upload/download
    audit/
    integrations/             # wave.ts, patriot.ts stubs later
  components/
    admin/
    reader/
    calendar/
  lib/
    rbac.ts
    money.ts
    dates.ts
```

Route-level layouts enforce role. A reader hitting `/admin/*` is denied. An admin may impersonate nothing in MVP.

## 5. Data layer

**Recommendation: PostgreSQL + a thin TypeScript data layer.**

| Option | Decision |
|---|---|
| PostgreSQL | Yes. Needed for relational workflow data, audit rows, and concurrent admin/reader use. |
| SQLite | Acceptable only for local experiments; not the production recommendation given sensitive documents and multiple users. |
| ORM | Prefer **Drizzle ORM** when implementation starts (SQL-shaped, small, no runtime magic). Prisma is an acceptable alternative. Do not install either in this phase. |
| Hosting (when deploying) | Neon or another Postgres free tier, or Postgres on a small VPS. Choose at deployment time. |

All money stored as integer cents. All timestamps UTC. Display in Chester’s local time (confirm timezone at implementation; likely US).

Wave/Patriot IDs stored as nullable external references so integration can be added without rewriting the model.

## 6. Authentication

**Recommendation: Auth.js (NextAuth v5) with invite-only accounts.**

| Decision | Rationale |
|---|---|
| Invite-only | Chester operates VTI; readers do not self-signup. Universities do not log in (OQ-09). |
| Email + password, or magic link | BRD does not specify. Invite + password is enough and avoids a paid auth vendor. |
| Session cookies (HTTP-only, Secure, SameSite) | Built-in, free, fits Next.js |
| No Google/Facebook login | Not requested |
| No Clerk / Auth0 / Cognito | Paid or heavier than needed |

Chester creates a Reader user after (or as part of) onboarding. The reader receives a one-time invite to set a password.

## 7. Authorization

Two MVP roles only:

| Role | Access |
|---|---|
| `VTI_ADMIN` | All operational data. Sensitive reader fields. Billing. Payments. Calendar (full). |
| `READER` | Own profile (view), own assignments, own Call Sheets, own expenses, own pay history, permission-filtered calendar (view only). |

Future roles (`SUB_ADMIN`, `UNIVERSITY`) are designed as enum values we do not implement screens for.

Enforcement in three places:

1. Middleware: unauthenticated users cannot enter admin/reader areas
2. Server Actions / queries: every read/write checks role and record ownership
3. UI: readers never see admin navigation, other readers’ pay, SSN, or university billing

Least privilege is required because onboarding may include SSN and driver’s-license images.

## 8. Storage (files / documents)

Required file types from the documents:

- Driver’s license / passport images
- Signed NDAs
- University documents the reader needs
- Name lists (Discovery)
- Receipts
- Call Sheet versions (structured data first; generated document second)

**Recommendation:**

- Files stored **outside** the git repo
- Object storage with encryption at rest (Cloudflare R2 free tier, or encrypted disk on a VPS)
- Application-level encryption for highly sensitive images (DL/passport) before upload
- Access only through authenticated download routes that check assignment/role
- No public bucket URLs
- Receipts and DL images must not be inlined into emails or notifications (SEC-002)

Local filesystem is acceptable for development only. Vercel’s ephemeral filesystem is **not** acceptable for production document storage.

## 9. API / Server Actions

Prefer **Server Actions** for form-driven admin and reader workflows (inquiry, assignment, expense submit, Call Sheet issue, debrief).

Use Route Handlers only for:

- File download/upload
- Auth callbacks
- Future Wave/Patriot webhooks
- Calendar iCal export if ever added (not MVP)

No separate public REST API in MVP. No GraphQL.

## 10. File / document handling

| Document | Stored as | Access |
|---|---|---|
| Call Sheet | Versioned structured record + generated printable view | Admin; assigned reader |
| NDA | File + signed/unsigned status + date | Admin; reader may view own |
| DL / passport | Encrypted file + expiration | Admin only in MVP |
| University packet files | Files on the event/assignment | Admin; assigned reader |
| Name list | File on ceremony/assignment | Admin; assigned reader |
| Receipt | Image/PDF on expense line | Admin; owning reader |

Call Sheets are versioned. Issuing a new version does not destroy the previous one. Reader acceptance is recorded against a specific version.

## 11. Notifications

MVP: **in-app notifications + dashboard queues**, not a paid messaging product.

Examples:

- Insurance due
- DL/passport expiring
- Expense report submitted
- Call Sheet issued / new version
- Assignment offered
- Payment pending approval

Email send (invite, “you have a new Call Sheet”) may use a free transactional tier later. It is not required to start, and in-app messaging is explicitly non-critical if costly (Discovery addendum, COM-005).

University communication remains primarily email, with the ability to **log** notes on the university/event (OQ-10).

## 12. Calendar

Custom module. This is a core product surface, not a third-party calendar widget.

Responsibilities:

- Month view as the default admin operating screen
- Event bars color-coded by university, spanning consecutive days
- Dense but readable content: university, readers, times, names estimate vs last year, quote vs last year, lead reader, housing/transport/airfare and costs, notes, dinners/functions
- Sidebar: available / unavailable readers
- Personal events for Chester
- Click-through to event, assignment, Call Sheet
- Reader view: same visual language, permission-filtered, read-only

Do not make Google Calendar the system of record. Sync is optional/future (SCH-004). Chester’s comment: he builds the calendar manually because Google cannot match his color-coded system.

## 13. Responsive / mobile strategy

| Surface | Strategy |
|---|---|
| Admin / Chester | Desktop-first, usable on tablet. Calendar is designed for a computer monitor (OQ-08). |
| Reader | Mobile-first responsive web. Thumb-reachable primary actions: open Call Sheet, university instructions, photo receipt, expense form, debrief. |
| Native app | Out of MVP. Prove workflows on the web first (NFR-005). |

Reader routes should be a distinct information architecture (home → today’s assignment → Call Sheet / instructions / expenses), not the admin dashboard with CSS breakpoints.

Optional later: PWA install prompt. Not required to start.

## 14. Integrations (direction, not implementation)

| System | MVP posture |
|---|---|
| Wave | SHOULD. Validate API/licensing before writing adapters. Until then, VTI stores estimate/invoice/payment **tracking** records and Chester continues to use Wave as ledger. |
| Patriot | SHOULD. Validate API before architecture lock. Until then, VTI stores onboarding/pay **tracking** records. |
| Email | OPTIONAL. Manual inquiry entry in MVP. |
| Google Calendar | OPTIONAL / not preferred. |
| Wells Fargo | Not MVP. Chester asked; bank aggregation is out of scope until a later decision. |
| AI providers | Not MVP. |

Integration modules should be written as adapters behind internal interfaces (`BillingProvider`, `ReaderHrProvider`) so Wave/Patriot can be connected without rewriting screens.

## 15. Hosting / cost posture

Cursor is the only approved paid development tool (~$20/month). Prefer:

- Next.js built-ins
- Open-source libraries
- Free tiers
- A VPS + Postgres + object storage if that is cheaper/simpler than stitching multiple free SaaS products

Do not introduce paid auth, paid chat, paid automation, or paid design tools as requirements.

## 16. Future scalability

The monolith scales to VTI’s actual size (universities, readers, seasonal events) without rewriting.

Leave seams, do not build them:

- Role enum can add `SUB_ADMIN` and `UNIVERSITY`
- `externalWaveId` / `externalPatriotId` on relevant tables
- Call Sheet version table already append-only
- File store already permissioned by assignment
- Notification table can later fan out to email
- Reader web app can later be wrapped as a native shell

Do not split into microservices, do not add a message bus, and do not add an AI orchestration layer until the operational workflow is proven.
