# VTI Technical Architecture Specification

**Status:** Engineering specification only. Not an implementation commit.  
**Authority:** VTI Operational Master Blueprint (product) + Chester BRD / operating process (business) + existing MVP (implementation evidence).  
**Date:** 6 September 2026  
**Starting code evidence:** commit `0b39997` (Final Brand & Calendar Refinement) and prior docs under `docs/`.

---

## Document purpose

This specification translates the approved operational model into implementable engineering decisions so another engineer can build without inventing business rules.

**Success statement this architecture must support:**

> Chester can operate a complete VTI season from VTI without maintaining the current operational spreadsheets or encoding operational information into calendar notes.

If a design choice cannot support that statement, it is rejected.

**Non-goals for this phase:** application code, package installs, migrations, UI changes, repository refactors.

---

## Architecture summary

| Layer | Decision |
|---|---|
| Application | Single Next.js App Router monolith (Admin + Reader) |
| Operational SOT | PostgreSQL |
| Files | Encrypted object storage; authenticated download only |
| Auth | Invite-only sessions (Auth.js or equivalent); two roles: `VTI_ADMIN`, `READER` |
| Aggregate root | **Event** |
| Calendar | Projection of Event + Ceremony + Assignment + Travel + PersonalEvent |
| Command Center | Derived attention items (Task + Conflict + Notification), not KPI wallpaper |
| Accounting SOT | Wave (official); VTI tracks operational money |
| Reader master SOT | Patriot (intended); VTI keeps operational copy |
| Automation | Explicit rules engine: trigger → condition → actions → human gate → audit |
| Integrations | Adapters with external IDs; **never** pretend sync exists |

---

# 1. Domain model

## 1.1 Entity classification (mandatory evaluation)

| Candidate | Classification | Decision |
|---|---|---|
| University (`Client`) | **FIRST-CLASS** | Keep. Renamed in UX to University; table may remain `client`. |
| UniversityContact (`ClientContact`) | **FIRST-CLASS** | Keep. |
| Inquiry | **FIRST-CLASS** | Keep; must resolve to University + optional Event. |
| Engagement | **ATTRIBUTE / VIEW** | Not a separate table. An Engagement is the University↔season relationship expressed by Inquiry stage + Event(s). Query view only. |
| Event | **FIRST-CLASS** | Primary aggregate root. |
| Ceremony | **FIRST-CLASS** | Child of Event. |
| Reader (`ReaderProfile`) | **FIRST-CLASS** | Keep. |
| ReaderAvailability (`AvailabilityBlock`) | **FIRST-CLASS** | Explicit unavailable/available windows. Busy-ness also **DERIVED**. |
| Assignment | **FIRST-CLASS** | Keep. |
| AssignmentRole | **ATTRIBUTE** | Enum on Assignment (`lead` \| `reader` \| `shadow`). Not its own table. |
| CallSheet | **FIRST-CLASS** | Versioned packet snapshot. |
| CallSheetVersion | **ATTRIBUTE** | Integer `version` on CallSheet + append-only rows. Do not invent a second orphan entity. |
| Flight | **FIRST-CLASS** | Replaces airfare prose. |
| HotelStay | **FIRST-CLASS** | Replaces accommodation prose. |
| GroundTransfer | **FIRST-CLASS** | Replaces transfer prose. |
| TravelCredit | **FIRST-CLASS** | Refund/credit against travel cost (not free text). |
| ExpenseReport | **FIRST-CLASS** | Keep. |
| ExpenseLine | **FIRST-CLASS** | Keep. |
| Receipt | **FIRST-CLASS** | Real file + metadata (not `receiptLabel` alone). |
| Invoice | **FIRST-CLASS** | Tracking copy; Wave official. |
| Payment (`UniversityPayment`) | **FIRST-CLASS** | Payment against Invoice. |
| ReaderCompensation | **FIRST-CLASS** | Promised / approved / paid / cashed. |
| Check | **ATTRIBUTE** | Fields on ReaderCompensation (`checkNumber`, `paidOn`, `cashedOn`). Promote to first-class only if multi-check payouts per line become real. |
| Document | **FIRST-CLASS** | Split: `FileObject` + `EventDocument` / `ReaderDocument` / `WorkspaceDocument`. |
| Task | **FIRST-CLASS** | Attention + work unit. |
| Reminder | **DERIVED / DELIVERY** | Not a durable business entity. Implemented as Task due rules + Notification. |
| PersonalEvent (`PersonalTimeBlock`) | **FIRST-CLASS** | Admin-only. |
| ExternalCommitment | **DEFERRED** | Until Chester confirms a source other than PersonalEvent / Availability. Model as PersonalEvent kind=`external` if needed later. |
| Debrief | **FIRST-CLASS** | Keep. |
| CommunicationLog | **FIRST-CLASS** | Replaces OperationalNote as structured log; free-form body allowed with typed metadata. |
| Notification | **FIRST-CLASS** | Real delivery record. |
| Conflict | **DERIVED** | Computed; persist only acknowledged/overridden exceptions (optional `ConflictOverride`). |
| AuditLog | **FIRST-CLASS** | Keep / implement. |
| HistoricalRecord | **DERIVED VIEW** | Prior-year Event snapshots queried from past Events; not a write table. |
| Estimate | **FIRST-CLASS** | Tracking; may convert to Invoice. |
| InsuranceRequirement | **FIRST-CLASS** | University annual compliance. |
| NotificationPreference | **FIRST-CLASS** | Real prefs only when channels exist. |
| AssignmentHistory | **FIRST-CLASS** | Append-only staffing history. |
| LedgerLine | **DERIVED VIEW** | Rolled from Estimate/Invoice/Payment/Compensation/Expense/Travel costs. Optional materialized view later. |
| CalendarNote | **REMOVE as SOT** | Display annotations only if derived; no operational storage. |
| User | **FIRST-CLASS** | Auth identity. |

---

## 1.2 First-class entities (detail)

Conventions:

- Money: integer **cents**.
- Time: store **UTC**; display America/Chicago for VTI operations unless Event overrides.
- Soft-delete: prefer `archivedAt` / terminal status over hard delete for operational records.
- Privacy: `PUBLIC_OPS` · `READER_SCOPED` · `ADMIN_ONLY` · `SENSITIVE` (encrypted / reveal-audited).

### University (Client)

| | |
|---|---|
| **Purpose** | Recurring customer / history owner. |
| **Ownership** | VTI Admin. |
| **Lifecycle** | `prospect` → `active` → `inactive` (archive). |
| **Required** | name, status, calendarColor. |
| **Optional** | isReturning, notes, kind. |
| **Relationships** | 1:* Contact, Inquiry, Event, InsuranceRequirement, Estimate, Invoice. |
| **SOT** | VTI. |
| **Derived** | lastEventAt, openARCents, workAgainRate, nextInsuranceDue. |
| **Audit** | create/update/status; note changes. |
| **Delete** | Soft-archive only if no open Events/Invoices; else block. |
| **Privacy** | ADMIN_ONLY (university commercial data). |

### UniversityContact

| | |
|---|---|
| **Purpose** | People Chester actually talks to. |
| **Ownership** | Admin. |
| **Lifecycle** | Active / archived. |
| **Required** | clientId, name; email or phone. |
| **Optional** | department, roleTitle, isPrimary, preferredContactMethod, notes. |
| **Relationships** | *N:1 University; referenced by CommunicationLog. |
| **SOT** | VTI. |
| **Privacy** | ADMIN_ONLY. |

### Inquiry

| | |
|---|---|
| **Purpose** | Pipeline before / into an operable Event. |
| **Ownership** | Admin. |
| **Lifecycle** | See §3 Inquiry state machine. Must end `closed_won` or `closed_lost`. |
| **Required** | clientId (or create Client on save), contactName, email, universityName, stage. |
| **Optional** | department, returningInterest, nextAction, nextActionAt, estimatedValueCents, expectedEventDate. |
| **Relationships** | N:1 University; 0..1 Event (on win). |
| **SOT** | VTI. |
| **Derived** | ageDays, isStale. |
| **Audit** | stage transitions. |
| **Privacy** | ADMIN_ONLY. |

### Event (aggregate root)

| | |
|---|---|
| **Purpose** | One commencement (or related) engagement weekend / operational control record. |
| **Ownership** | Admin. |
| **Lifecycle** | See §3 Event state machine. |
| **Required** | clientId, name, status, timezone (default America/Chicago). |
| **Optional** | tentativeReason, estimatedGraduateCount, priorYearGraduateCount, quoteAmountCents, priorYearQuoteAmountCents, workAgainRecommendation, eventReady, displayAnnotation (short derived override only). |
| **Removed from SOT** | `travelNotes`, `airfareNotes`, `accommodationNotes`, `transferNotes`, `CalendarNote` as storage. |
| **Relationships** | See §2. |
| **SOT** | VTI for operations. |
| **Derived** | readiness, staffingStatus, financialStatus, conflictCount, openTaskCount, windowStart/End. |
| **Audit** | all status and money-affecting changes. |
| **Delete** | Cancel + archive; never hard-delete after Call Sheet issued or money recorded. |
| **Privacy** | ADMIN_ONLY commercial fields; READER_SCOPED logistics for assigned readers. |

### Ceremony

| | |
|---|---|
| **Purpose** | Timed session (commencement, related group, dinner, function). |
| **Ownership** | Admin via Event. |
| **Lifecycle** | planned → completed \| cancelled (with Event). |
| **Required** | eventId, name, startsAt, endsAt, kind. |
| **Optional** | venueName, venueAddress, estimatedNames, callTime, soundCheckAt. |
| **Relationships** | N:1 Event; 0:* EventDocument (name list). |
| **SOT** | VTI. |
| **Privacy** | READER_SCOPED for assigned readers. |

### Reader

| | |
|---|---|
| **Purpose** | Subcontractor talent for matching, logistics, pay. |
| **Ownership** | Admin writes; Reader view non-sensitive. |
| **Lifecycle** | onboardingStatus: not_started → in_progress → ready \| blocked; isActive. |
| **Required** | contractorName, legalName, email, primaryPhone, compensationCategory, businessType, onboardingStatus. |
| **Optional / sensitive** | taxId (encrypted), DOB (encrypted), KTN (encrypted), soundNotes, geographyNotes, veteranStatus, airline/seat, shirtSize, notes. |
| **Relationships** | 0..1 User; addresses; emergency contacts; documents; availability; assignments; compensation. |
| **SOT** | Operational copy in VTI; **Patriot** intended master when integrated. |
| **Privacy** | SENSITIVE fields ADMIN_ONLY; Reader sees non-sensitive own profile + own pay. |

### ReaderAvailability (AvailabilityBlock)

| | |
|---|---|
| **Purpose** | Explicit available/unavailable windows. |
| **Ownership** | Admin (MVP assumption); optional reader_submit later. |
| **Required** | readerId, startsAt, endsAt, kind. |
| **Optional** | notes, source (`admin_entered` \| `reader_submitted`). |
| **SOT** | VTI. |
| **Derived busy** | Assignment ceremony windows + travel day buffers. |
| **Privacy** | ADMIN_ONLY (sidebar); reader may see own blocks. |

### Assignment

| | |
|---|---|
| **Purpose** | Staffing link Event ↔ Reader. |
| **Ownership** | Admin creates; Reader accepts/declines offer. |
| **Lifecycle** | §3 Assignment. |
| **Required** | eventId, readerId, role, status, promisedPayCents. |
| **Optional** | priorYearPayCents, logisticsStatus. |
| **Relationships** | CallSheetAcknowledgement; ExpenseReport; ReaderCompensation; Debrief; AssignmentHistory. |
| **SOT** | VTI. |
| **Audit** | every transition. |
| **Delete** | Release to pool; never erase history. |
| **Privacy** | Admin full; Reader own only. |

### CallSheet

| | |
|---|---|
| **Purpose** | Versioned legal-operational packet snapshot. |
| **Ownership** | Admin generates/issues; Reader acknowledges. |
| **Lifecycle** | draft → issued → superseded. |
| **Required** | eventId, version, status; snapshot fields at issue time. |
| **Optional** | issuedAt, issuedByUserId. |
| **Relationships** | 1:* Acknowledgement; generated from Event graph then editable before issue. |
| **SOT** | VTI (issued snapshot is immutable). |
| **Privacy** | Admin; assigned readers for issued versions. |

### Flight / HotelStay / GroundTransfer / TravelCredit

| | |
|---|---|
| **Purpose** | Structured travel replacing Event prose. |
| **Ownership** | Admin via Event. |
| **Required (Flight)** | eventId, readerId?, airline, flightNumber?, departsAt, arrivesAt, paidBy (`vti`\|`reader`\|`university`\|`unknown`), amountCents?. |
| **Required (HotelStay)** | eventId, propertyName, checkInDate, checkOutDate, roomCount?, estimateCents?, confirmation?. |
| **Required (GroundTransfer)** | eventId, notes or provider, estimateCents?. |
| **Required (TravelCredit)** | eventId, amountCents, reason, relatedFlightId?. |
| **SOT** | VTI. |
| **Derived** | Event travelCostCents, missingTravel flags. |
| **Privacy** | Admin; assigned readers see own/relevant travel on Call Sheet. |

### ExpenseReport / ExpenseLine / Receipt

| | |
|---|---|
| **Purpose** | Reader reimbursement package. |
| **Ownership** | Reader drafts/submits; Admin reviews. |
| **Lifecycle** | §3 Expense. |
| **Required** | assignmentId, readerId; lines with amountCents, incurredOn, description. |
| **Receipt** | fileObjectId required before attach completes. |
| **SOT** | VTI. |
| **Privacy** | Admin; owning reader. Receipt images SENSITIVE. |

### Estimate / Invoice / UniversityPayment

| | |
|---|---|
| **Purpose** | University AR tracking. Wave remains ledger SOT. |
| **Ownership** | Admin. |
| **Required Invoice** | clientId, eventId?, amountCents, status. |
| **Optional** | waveExternalId, billedOn, dueOn, lastRemindedOn, paidOn. |
| **Payment** | invoiceId, amountCents, paidOn, method. |
| **SOT** | Tracking in VTI; official in Wave. |
| **Derived** | outstandingBalanceCents = invoice − sum(payments). |
| **Privacy** | ADMIN_ONLY. Never on Reader calendar/packet. |

### ReaderCompensation

| | |
|---|---|
| **Purpose** | Reader AP: professional fee and reimbursement payout tracking. |
| **Ownership** | System creates promised; Admin approves/pays/cashes. |
| **Lifecycle** | §3. |
| **Required** | assignmentId, readerId, kind (`compensation`\|`reimbursement`), amountCents, status. |
| **Check attributes** | checkNumber?, paidOn?, cashedOn? (manual until bank). |
| **Optional** | patriotExternalId. |
| **SOT** | VTI tracking; Patriot initiation deferred. |
| **Privacy** | Admin; owning reader only. |

### FileObject + EventDocument / ReaderDocument / WorkspaceDocument

| | |
|---|---|
| **Purpose** | Real binaries + metadata. |
| **Ownership** | Uploader; access by policy. |
| **Required FileObject** | storageKey, mimeType, byteSize, checksum, encryptionFlag, uploadedByUserId. |
| **EventDocument** | eventId, kind (`university_instruction`\|`name_list`\|`other`), fileObjectId, visibleToAssignedReaders. |
| **ReaderDocument** | readerId, kind (`drivers_license`\|`passport`\|`nda`\|`other`), fileObjectId?, expiresOn, status. |
| **SOT** | VTI storage. |
| **Privacy** | DL/passport ADMIN_ONLY; name lists assigned readers; workspace docs admin. |

### Task

| | |
|---|---|
| **Purpose** | Work unit for Command Center. |
| **Ownership** | Default VTI Admin; may assign later. |
| **Required** | sourceType, sourceId, title, status, priority, createdAt. |
| **Optional** | dueAt, eventId, clientId, readerId, resolutionNote. |
| **Lifecycle** | open → in_progress → done \| cancelled \| snoozed. |
| **SOT** | VTI. |
| **Privacy** | ADMIN_ONLY (unless reader-owned task is added later). |

### PersonalEvent

| | |
|---|---|
| **Purpose** | Chester’s booked personal time on operational calendar. |
| **Ownership** | Admin user. |
| **Required** | userId, title, startsAt, endsAt. |
| **Optional** | notes, showOnOperationalCalendar. |
| **Privacy** | ADMIN_ONLY. Never project to readers. |

### Debrief

| | |
|---|---|
| **Purpose** | Post-event reader report. |
| **Ownership** | Reader submits; Admin reads; workAgain is Admin on Event. |
| **Required** | assignmentId, eventId, readerId, narrative fields, ratings, submittedAt. |
| **SOT** | VTI. |
| **Privacy** | Admin; owning reader. Other readers’ identities in narrative are qualitative only. |

### CommunicationLog

| | |
|---|---|
| **Purpose** | Recorded operational communication / decision (email/phone/meeting), not a chat product. |
| **Ownership** | Admin. |
| **Required** | body, authorUserId, createdAt, visibility. |
| **Optional** | clientId, eventId, assignmentId, contactId, channel (`email`\|`phone`\|`in_person`\|`other`). |
| **Replaces** | CalendarNote-as-SOT and ad-hoc OperationalNote for decisions. |
| **Privacy** | visibility: admin_only \| admin_and_assigned_readers. |

### Notification

| | |
|---|---|
| **Purpose** | Durable delivery of attention to a user. |
| **Required** | userId, kind, title, href, createdAt. |
| **Optional** | body (no sensitive values), readAt, deliveredAt, channel, deliveryStatus. |
| **SOT** | VTI. |
| **Privacy** | Recipient only; never embed SSN/DL/pay amounts of others. |

### ConflictOverride (optional persist)

| | |
|---|---|
| **Purpose** | Human acknowledgement that a derived conflict is accepted. |
| **Required** | conflictKey, actorUserId, reason, createdAt. |
| **Default** | Conflicts are **derived**; do not duplicate as editable conflict rows. |

### AuditLog

| | |
|---|---|
| **Purpose** | Material change trail. |
| **Required** | actorUserId, entityType, entityId, action, createdAt. |
| **Optional** | previousJson, newJson (redacted), reason. |
| **Privacy** | ADMIN_ONLY; never log raw SSN/DL bytes. |

### User

| | |
|---|---|
| **Purpose** | Login identity. |
| **Required** | email, role, isActive. |
| **Relationships** | 0..1 Reader. |
| **SOT** | VTI auth. |

### InsuranceRequirement

| | |
|---|---|
| **Purpose** | Annual university insurance reminder/status. |
| **Required** | clientId, year, status, dueOn. |
| **SOT** | VTI (not a policy system). |

### NotificationPreference

| | |
|---|---|
| **Purpose** | Real channel prefs once notifications exist. |
| **Required** | userId, kind, channel, enabled. |
| **Rule** | Do not ship UI toggles without a working channel. |

---

# 2. Event aggregate

## 2.1 Boundary

```
Event
├── Ceremony[]
├── Assignment[] (+ AssignmentHistory)
├── Travel
│   ├── Flight[]
│   ├── HotelStay[]
│   ├── GroundTransfer[]
│   └── TravelCredit[]
├── CallSheet[] (versions)
├── CallSheetAcknowledgement[] (via assignments)
├── EventDocument[] (+ FileObject)
├── ExpenseReport[] (via assignments)
├── Estimate / Invoice / UniversityPayment (event-scoped)
├── ReaderCompensation[] (via assignments)
├── Debrief[]
├── Task[] (event-scoped)
├── CommunicationLog[] (event-scoped)
├── derived Conflicts
└── derived Readiness / FinancialStatus / CalendarProjection
```

University, Reader, PersonalEvent, InsuranceRequirement live **outside** the aggregate but are referenced.

## 2.2 Invariants

1. Every Ceremony belongs to exactly one Event.
2. An Assignment cannot target a cancelled Event (except historical read).
3. Issuing a Call Sheet requires: Event not cancelled; ≥1 live Assignment in `accepted`/`assigned`; no blocking Conflict unless ConflictOverride exists.
4. Travel children must reference the Event; optional readerId when person-specific.
5. Quote/invoice/payment for the engagement should prefer `eventId` set (university-level invoices allowed but must be linkable).
6. Soft-deleted/archived Event remains readable for history.

## 2.3 Operations that MUST go through Event service

| Command | Why |
|---|---|
| `createEvent` / `updateEventStatus` | Cascades calendar, tasks, conflicts |
| `addCeremony` / `updateCeremony` / `cancelCeremony` | Calendar + CS readiness |
| `offerAssignment` / `acceptAssignment` / `declineAssignment` / `releaseAssignment` / `completeAssignment` | Staffing + history + pay lines |
| `upsertTravel*` | Missing-travel tasks + CS generation inputs |
| `generateCallSheetDraft` / `issueCallSheet` | Snapshot + notify + supersede |
| `attachEventDocument` | Name-list readiness |
| `recordEstimate` / `recordInvoice` / `recordUniversityPayment` | Financial status |
| `approveExpense` / `rejectExpense` (event-linked) | Reimbursement lines |
| `approveReaderCompensation` / `markCompensationPaid` / `markCompensationCashed` | AP |
| `submitDebrief` (reader) / `setWorkAgain` / `setEventReady` | History |
| `addCommunication` | Decision log |
| `resolveTask` (event-scoped) | Attention |

**Forbidden:** writing Assignment status, travel prose-on-Event, or Call Sheet issue from ad-hoc UI bypassing Event service validation.

## 2.4 Queries on Event

- `getEventControlRecord(eventId)` — full aggregate for Admin UI
- `getEventReadiness(eventId)`
- `getEventFinancialSummary(eventId)`
- `getEventCalendarProjection(eventId)`
- `getReaderEventPacket(eventId, readerId)` — privacy filtered

---

# 3. State machines

Legend: **A** = Admin, **R** = Reader, **S** = System.

## 3.1 Inquiry

**States:** `initial_inquiry` → `needs_conversation` → `pending_admin_approval` → `coordinator_logistics` → `closed_won` | `closed_lost`

| Transition | Actor | Side effects |
|---|---|---|
| forward along pipeline | A | update nextAction; CommunicationLog optional |
| `→ closed_won` | A | ensure University active; **create or activate Event** (draft/tentative); Task “Confirm ceremonies & quote”; Audit |
| `→ closed_lost` | A | cancel open Tasks; Audit; no Event create |
| reopen from lost | A | only to `initial_inquiry` with reason |

**Invalid:** skip to `closed_won` without University; delete Inquiry with linked Event.

## 3.2 Engagement

**Not a stored state machine.** Derived:

- `prospecting` = open Inquiry, no Event
- `active` = Event in tentative/confirmed
- `complete` = Event completed/cancelled + terminal money
- `returning` = University.isReturning or returningInterest

## 3.3 Event

**States:** `draft` → `tentative` → `confirmed` → `completed`  
Also: `postponed`, `cancelled` from tentative/confirmed.

| Transition | Actor | Conditions | Side effects |
|---|---|---|---|
| draft → tentative | A | interest + budget available (Chester rule) | Calendar appears; Tasks for staffing/travel |
| tentative → confirmed | A | ceremonies exist | Notify assigned readers if any; readiness recalc |
| → postponed | A | reason required | Keep assignments; Task “Reschedule ceremonies”; CS may need reissue |
| → cancelled | A | reason required | Release live offers; void unpaid promised pay optional with confirmation; supersede draft CS; Tasks cancelled; Audit |
| confirmed → completed | A or S | after last ceremony end + Admin confirm | Debrief Tasks; invoice Task if unpaid |

**Invalid:** confirmed without ceremony; hard-delete after issue/pay.

## 3.4 Ceremony

**States:** `scheduled` → `completed` | `cancelled`

| Transition | Actor | Side effects |
|---|---|---|
| update times/venue | A | Conflict recalc; CS draft stale flag |
| cancel | A | Conflict/readiness; if last ceremony cancelled → prompt Event cancel/postpone |

## 3.5 Assignment

**States:** `offered` → `accepted` → `assigned` → `completed`  
Also: `declined`, `released_to_pool` from offered/accepted/assigned.

| Transition | Actor | Side effects |
|---|---|---|
| create offered | A | Notification to reader; Task “Await response”; Conflict check |
| accept | R | status accepted; Event staffing; calendar chip; create promised ReaderCompensation; travel Tasks if missing; notify Admin |
| decline | R | release staffing; Task “Replace reader”; notify Admin; history |
| Admin promote to assigned | A | after accept or direct assign (policy: prefer offer); CS readiness |
| release_to_pool | A | history preserved; void unapproved compensation with reason; Conflict clear; Task replace; block treating as staffed |
| complete | A/S | after Event complete |

**Invalid:** reader accept another’s assignment; assign to unavailable reader without ConflictOverride; issue CS for declined reader.

## 3.6 Reader Availability

**States on block:** active window until `endsAt` or archived.

| Transition | Actor | Side effects |
|---|---|---|
| create unavailable | A (or R later) | Conflict scan overlapping assignments; Tasks |
| archive block | A | Conflict recalc |

Busy from assignments is **derived**, not a status write.

## 3.7 Call Sheet

**States:** `draft` → `issued` → `superseded`

| Transition | Actor | Side effects |
|---|---|---|
| generate draft | A/S | Fill from Event graph; Admin may edit |
| issue | A | version++; prior issued → superseded; Notifications to assigned readers; Ack Tasks; calendar badge |
| acknowledge | R | CallSheetAcknowledgement; clear ack Task for that reader |

**Invalid:** issue with zero live assignments; mutate issued row (create new version instead).

## 3.8 Travel

Per child: `planned` → `confirmed` → `cancelled` (optional fields).  
Missing travel is not a state — it is a **readiness Conflict/Task**.

## 3.9 Expense

**States:** `draft` → `submitted` → `approved` | `rejected` → `reimbursed`

| Transition | Actor | Side effects |
|---|---|---|
| submit | R | Admin Task + Notification |
| approve | A | create/update ReaderCompensation kind=reimbursement pending_approval or approved per policy; Audit |
| reject | A | reason required; notify Reader |
| reimbursed | A | after compensation paid |

## 3.10 Invoice

**States:** `draft` → `sent` → `due` → `reminded` → `paid` | `void`

| Transition | Actor | Side effects |
|---|---|---|
| send | A | set billedOn/dueOn; Task watch due |
| mark due / remind | S/A | Notification; lastRemindedOn |
| payment recorded | A | if sum≥amount → paid; Event AR update |
| void | A | reason; Audit |

UI must label: **Tracked in VTI — Wave is official.**

## 3.11 University Payment

**States:** recorded (immutable except void-with-reason).  
Side effects: recompute invoice balance, Event financialStatus, university history, close Tasks.

## 3.12 Reader Compensation

**States:** `promised` → `pending_approval` → `approved` → `queued` → `paid` → `cashed` | `void`

| Transition | Actor | Side effects |
|---|---|---|
| promised auto | S | on accept/assign |
| pending_approval / approve | A | **human required**; Audit |
| queued | A | only when Patriot connected; else skip |
| paid | A | set paidOn, checkNumber optional; notify Reader |
| cashed | A | set cashedOn **manual** until bank; notify optional |
| void | A | reason; Audit |

## 3.13 Check

**Not independent.** Attributes on compensation. “Check issued” = `paid` + optional `checkNumber`. “Cashed” = `cashedOn` set.

## 3.14 Task

**States:** `open` → `in_progress` → `done` | `cancelled` | `snoozed`

| Transition | Actor | Side effects |
|---|---|---|
| auto-create | S | from automation |
| complete | A | if source condition still true, warn (do not silently recreate storm — use debounce keys) |
| snooze | A | dueAt update |

---

# 4. Automation engine

## 4.1 Architecture

```
Domain command succeeds
  → emit DomainEvent (in-process)
  → RuleMatcher (declarative rules)
  → ActionExecutor (tasks, notifications, derived refresh, compensation lines)
  → HumanGate (if required: stop and create Task / require command)
  → AuditLog
```

Rules are code-declared in Phase 1–3; DB-editable rules are deferred.

**Idempotency:** each rule has `idempotencyKey = ruleId + sourceId + version`.

## 4.2 Rule catalog

| ID | Trigger | Condition | Automatic actions | Human required | Audit |
|---|---|---|---|---|---|
| R01 | ReaderAvailability unavailable created | overlaps Assignment live | Conflicts; Tasks “Replace/confirm”; notify Admin; set Event staffing degraded | Choose replacement / override | yes |
| R02 | Assignment offered | — | Notify Reader; Task await response | Reader accept/decline | yes |
| R03 | Assignment accepted | — | Staffing+calendar; promised Compensation; travel-missing Tasks; notify Admin; CS readiness | Issue CS | yes |
| R04 | Assignment declined/released | — | History; clear chip; Task replace; void unapproved pay with policy; CS readiness false | Assign new reader | yes |
| R05 | CallSheet issued | staffing valid | Supersede prior; notify readers; ack Tasks; badge | — | yes |
| R06 | CallSheet ack | — | Clear reader ack Task; if all acked clear Event unsigned flag | — | yes |
| R07 | Travel child missing while Event tentative/confirmed and Assignment live | hotel/flight rules by role | Task + Conflict `missing_travel` | Enter travel or override | yes |
| R08 | EventDocument name_list uploaded | — | Clear `missing_name_list` Conflict; optional Task “Reissue CS?” | Confirm reissue | yes |
| R09 | Event → confirmed | — | Notify assigned; readiness | — | yes |
| R10 | Event → cancelled | — | Cancel open Tasks; release offers; notify; Audit reason | Confirm void pay | yes |
| R11 | UniversityPayment recorded | — | Balance; AR status; close overdue Task; university history | — | yes |
| R12 | Expense submitted | — | Admin Task + Notification | Approve/reject | yes |
| R13 | Expense approved | — | Reimbursement Compensation line | Approve pay | yes |
| R14 | Compensation approved | — | Task “Mark paid / queue” | Mark paid | yes |
| R15 | Compensation paid | — | Notify Reader; Task optional “Confirm cashed” | Mark cashed | yes |
| R16 | Invoice due passed unpaid | — | Notification + Task overdue | Chase university | yes |
| R17 | Insurance due approaching | N days | Task + Notification | Mark status | yes |
| R18 | ReaderDocument expiring/missing | — | Task + Notification Admin | Update docs | yes |
| R19 | Ceremony times changed | CS issued | Flag CS stale; Task “Reissue CS?” | Reissue | yes |
| R20 | Debrief submitted | — | Mark assignment debrief done; Task Admin “Work again?” | setWorkAgain/eventReady | yes |

### Human vs automatic

| Automatic | Chester approval required |
|---|---|
| Tasks, notifications, derived conflicts/readiness, calendar projection refresh, promised pay line create, CS supersede bookkeeping, balance math | Assign/release readers, issue CS, approve expense, approve compensation, mark paid/cashed, Event status confirm/cancel, workAgain/eventReady, ConflictOverride, void money |

---

# 5. Source of truth matrix

| DATA | VTI SOT? | EXTERNAL | MANUAL NOW? | DERIVED? | SYNC | INTEGRATION STATUS |
|---|---|---|---|---|---|---|
| University / contacts | Yes | — | Yes entry | No | — | None |
| Inquiry / Event / Ceremony | Yes | — | Yes | Partial readiness | — | None |
| Calendar display | Projection | Google (legacy) | No (must not be) | Yes | None | **Not SOT; no sync** |
| Spreadsheet ops | Replace | Excel | Was yes | — | Import later | Migrate then abandon |
| Reader profile ops copy | Yes | Patriot | Yes | No | Future pull | **Not connected** |
| Reader tax/ID files | Yes encrypted | Patriot | Yes | Expiry status | Future | **Not connected** |
| Availability | Yes | — | Admin | Busy derived | — | None |
| Assignment / CS | Yes | — | Yes | — | — | None |
| Travel objects | Yes | Airlines/hotels | Yes | Cost sums | — | None |
| Name lists / university docs | Yes files | Email/portal | Upload | — | — | None |
| Estimate/Invoice/GL | Tracking | **Wave** | Dual entry | Balances | Future | **Tracking only** |
| University payments | Tracking | Wave/bank | Yes | Outstanding | Future | **No bank feed** |
| Reader compensation | Tracking | Patriot | Yes | — | Future queue | **Tracking only** |
| Check cashed | Tracking | Bank/Patriot | **Manual** | No | Future | **No Wells Fargo** |
| Expenses/receipts | Yes | — | Reader | Totals | — | None |
| Tasks/Notifications | Yes | Email provider | — | From rules | Outbound email later | In-app first |
| Audit | Yes | — | — | — | — | None |
| Personal events | Yes | — | Yes | — | — | None |

---

# 6. Financial model

## 6.1 Principle

Do **not** recreate the Checks and Payouts workbook as tables. Model **economic facts** and **calculate** workbook columns.

## 6.2 University (receivable) side

| Concept | Representation | Class |
|---|---|---|
| Quote | Event.quoteAmountCents | SOURCE (Admin) |
| Prior-year quote | Event.priorYearQuoteAmountCents | SOURCE (copied from prior Event / manual) |
| Estimate | Estimate row | SOURCE tracking |
| Invoice amount billed | Invoice.amountCents | SOURCE tracking (Wave official) |
| Amount paid | sum(UniversityPayment.amountCents) | CALCULATED |
| Outstanding | invoice − paid | CALCULATED |
| Projected receivables | sum outstanding where Event confirmed/tentative | PROJECTED |
| University financial history | query Invoices/Payments by clientId | DERIVED VIEW |
| Event margin (ops) | quote − (reader pay + reimbursements + travel costs) | PROJECTED (not accounting profit) |

## 6.3 Reader (payable) side

| Concept | Representation | Class |
|---|---|---|
| Professional fee promised | Assignment.promisedPayCents → Compensation | SOURCE → line |
| Prior-year reader pay | Assignment.priorYearPayCents | SOURCE |
| Expenses | ExpenseLine sums | SOURCE |
| Adjustments / holds | Compensation void/adjust note or adjustment line | SOURCE + Audit |
| Check number | ReaderCompensation.checkNumber | MANUAL |
| Pay date | paidOn | MANUAL confirmation |
| Paid status | status≥paid | SOURCE |
| Cashed | cashedOn | MANUAL confirmation |
| Projected payables | sum promised/approved unpaid | PROJECTED |
| Reader financial history | Compensation by readerId | DERIVED |

## 6.4 Travel costs

| Concept | Representation | Class |
|---|---|---|
| Airfare paid | Flight.amountCents where paidBy=vti | SOURCE |
| Hotel estimate/actual | HotelStay.estimateCents / actualCents | SOURCE |
| Credits/refunds | TravelCredit.amountCents | SOURCE |
| Net travel | sum costs − credits | CALCULATED |

## 6.5 Traceability rule

Every Command Center or dashboard money figure must deep-link to underlying Event / Invoice / Compensation / Expense / Travel rows. No orphan KPI.

## 6.6 External honesty

- Wave amounts may differ from VTI tracking; UI shows “VTI tracked” vs optional `waveExternalId`.
- Never label tracking as “synced” unless adapter reports success.

---

# 7. Calendar architecture

## 7.1 Nature

**Projection only.** No `CalendarEvent` write model for operations.

Inputs: Ceremony, Assignment (live), Travel (optional chips), PersonalEvent, derived Conflict badges, Task due badges (admin), Call Sheet unsigned flag.

## 7.2 Admin month projection

Per day cell:

- University color bar across consecutive ceremony days
- University name, ceremony times, dinner/function
- Lead + assignment signal
- Names this/last year, quote this/last year (Admin only)
- Hotel / Air / Transfer presence flags from travel objects
- Conflict/task badges
- PersonalEvent blocks (admin)

## 7.3 Reader month projection

- Assigned Events only
- University, ceremony, start time
- No quotes, no other readers’ pay, no university AR, no PersonalEvent, no Admin notes admin_only

## 7.4 On Event change

Any Event aggregate write → recompute projection caches (or query live) → Conflict engine → Readiness → open Task rules → notify if rule says so.

## 7.5 Filters

Admin: university, status, unstaffed, conflicts, unsigned CS.  
Reader: none beyond own assignments (month nav only).

## 7.6 ICS / Print

Generated from projection for Reader assigned ceremonies; not a second SOT.

---

# 8. Command Center

## 8.1 Definition

**“What needs Chester’s attention?”** Home surface = sorted AttentionItem list + counts. KPIs secondary.

## 8.2 AttentionItem shape

| Field | Required |
|---|---|
| id / key | yes (stable idempotency) |
| sourceType / sourceId | yes |
| severity | `blocker` \| `high` \| `medium` \| `low` |
| ownerUserId | yes (Admin) |
| reason | yes |
| createdAt | yes |
| dueAt | optional |
| actionLabel / actionHref | yes |
| resolutionState | `open` \| `snoozed` \| `resolved` \| `overridden` |

Implementation: primarily **open Tasks + unresolved Conflicts**; Notification is the push copy.

## 8.3 Attention rules (minimum)

| Rule | Severity | Action |
|---|---|---|
| Unstaffed confirmed/tentative Event | blocker | Open Event staffing |
| Reader Conflict double-book / unavailable | blocker | Resolve staffing |
| Offer awaiting response past SLA | high | Nudge / replace |
| Unacknowledged Call Sheet | high | Open assignments |
| Missing hotel/flight for assigned out-of-town | high | Travel panel |
| Missing name list within N days of ceremony | high | Documents |
| Missing/expired insurance | medium | University insurance |
| Missing/expired reader ID on assigned reader | high | Reader docs |
| Invoice overdue | high | Finance |
| Compensation pending approval | high | Approve pay |
| Expense submitted | medium | Review expense |
| Overdue Task | medium | Open Task |
| Event cancelled with open money | high | Finance cleanup |
| CS stale after schedule change | high | Reissue |

---

# 9. Reader experience

## 9.1 Journey

```
Invite → Set password → Home
  → Assignment offer (Review)
  → Accept / Decline
  → Call Sheet (issued) → Acknowledge
  → Travel (read) + Documents (name list)
  → Event weekend (packet on phone)
  → Expense draft → Submit
  → Debrief Submit
  → Compensation status (promised → paid → cashed)
```

## 9.2 Reader may see

Own profile (non-sensitive), own assignments, own Call Sheets, own Event documents marked visible, own expenses/receipts, own compensation timeline, assigned-only calendar, reader-visible CommunicationLog.

## 9.3 Reader must never see (server-enforced)

Other readers’ sensitive data or pay; university quotes/invoices/AR; Admin-only notes; Chester PersonalEvent; full Admin calendar; unassigned Events; Wave/Patriot internals; other readers’ expenses.

## 9.4 Enforcement

Every Reader query filters `readerId = session.readerId`. File downloads check assignment membership. UI hiding is not sufficient.

---

# 10. Document system

## 10.1 Storage

- Object store (R2/S3/compatible) or encrypted disk
- Application-level encryption for DL/passport
- No public URLs; signed short-lived download routes
- Not git; not Vercel ephemeral FS for production

## 10.2 Metadata

FileObject + typed join rows (EventDocument, ReaderDocument, Receipt.fileObjectId, WorkspaceDocument).

## 10.3 Categories

Event: university_instruction, name_list, other  
Reader: drivers_license, passport, nda, other  
Workspace: rate_sheet, operational, other  
Receipt: expense evidence

## 10.4 Versioning

- Replace EventDocument = new FileObject + prior archived (keep history)
- Call Sheets versioned separately as generated snapshots (not uploaded Word as SOT)

## 10.5 Access / audit / retention

Access matrix §15. Downloads audit-logged for sensitive kinds. Retention 4–7 years tax-oriented (OQ-14); archive flag, legal hold deferred.

---

# 11. Communication system

| Concept | Entity | Notes |
|---|---|---|
| Recorded communication | CommunicationLog | Human-entered record of email/phone/meeting/decision |
| Automated notification | Notification | System-generated; deliveryStatus |
| Preference | NotificationPreference | Only for real channels |
| Delivery state | Notification.deliveryStatus | `pending` \| `delivered` \| `failed` \| `read` |

**Forbidden:** Settings checkboxes that do not send.

Email provider is optional later; in-app is MVP-capable once auth exists.

---

# 12. Conflict engine

## 12.1 Derived conflicts (no manual duplicate list)

| Code | Detection |
|---|---|
| `reader_double_book` | Two live Assignments with overlapping Ceremony windows (± travel buffer) |
| `reader_unavailable` | AvailabilityBlock unavailable overlaps ceremony/travel |
| `personal_conflict` | Admin PersonalEvent overlaps Event when Chester flagged as on-site (optional rule) |
| `ceremony_overlap` | Same reader two ceremonies overlapping |
| `insufficient_travel_time` | Flight arrival vs callTime buffer (configurable hours) |
| `incomplete_assignment` | Confirmed Event without lead when policy requires lead |
| `missing_qualification` | Blocked onboarding / expired ID on assigned reader |
| `missing_travel` | Policy: assigned reader + distant geography without Hotel/Flight |
| `missing_name_list` | Ceremony within threshold without name_list document |

## 12.2 Override

`ConflictOverride(conflictKey, reason, actor)` suppresses attention but remains visible as overridden.

## 12.3 ExternalCommitment

Deferred; use PersonalEvent or Availability until Chester defines another source.

---

# 13. Task engine

## 13.1 Origins

Automation rules, deadlines (invoice due, insurance, ID), missing data, conflicts, manual Admin create.

## 13.2 Fields

ownerUserId, sourceType, sourceId, eventId?, priority, dueAt, status, resolutionNote, createdAt, completedAt, idempotencyKey.

## 13.3 Resolution

Completing a Task does not delete history. If underlying condition remains, engine may reopen with new key version after grace period.

---

# 14. Auditability

## 14.1 Must audit

Assignments (all transitions), Call Sheet issue/supersede/ack, Event cancel/postpone/confirm, compensation approve/pay/cash/void, expense approve/reject, university payment, document upload/download sensitive, permission/role changes, ConflictOverride, workAgain/eventReady.

## 14.2 Record shape

actor, timestamp, entity, action, previous (redacted), new (redacted), reason when money/cancel/void/override.

---

# 15. Security / authorization

## 15.1 Roles

| Role | Scope |
|---|---|
| `VTI_ADMIN` | All operational data; payment approval; sensitive reveal |
| `READER` | Own scoped data only |

Future: `SUB_ADMIN` deferred.

## 15.2 Auth

Invite-only. Session cookies. No public signup. No university login. No demo identity switcher in production.

## 15.3 Server-side checks

Middleware (route group) + every command/query/file handler. RLS optional defense-in-depth on Postgres later; application checks mandatory first.

## 15.4 Privacy classes

SENSITIVE reveal requires explicit Admin action + AuditLog.

---

# 16. API / service boundaries

Prefer Server Actions / application services. Route Handlers for auth callbacks, file upload/download, future webhooks.

| Service | Commands (examples) | Queries | Validation | Authz | Side effects |
|---|---|---|---|---|---|
| Universities | create/update/archive, contacts, insurance | list, dossier | unique name soft | Admin | insurance Tasks |
| Inquiries | stage transitions | board | terminal rules | Admin | Event on win |
| Events | §2.3 | control record, readiness, finance | invariants | Admin; Reader packet filtered | rules engine |
| Ceremonies | CRUD via Event | by event | times | Admin | conflicts |
| Readers | create/update onboarding, docs | list, profile | sensitive encrypt | Admin write; Reader read own | expiry Tasks |
| Availability | upsert blocks | month sidebar | — | Admin | conflicts |
| Assignments | offer/accept/decline/release/complete | by event/reader | conflicts | Admin / own Reader | R02–R04 |
| Travel | upsert flight/hotel/transfer/credit | by event | — | Admin | R07 |
| CallSheets | generate/issue | versions, packet | issue gates | Admin issue; Reader read/ack | R05–R06 |
| Expenses | draft/submit/approve/reject | by assignment | receipt required | Reader own; Admin review | R12–R13 |
| Financials | estimate/invoice/payment; compensation approve/pay/cash | AR/AP summaries | Wave label | Admin; Reader own pay | R11, R14–R16 |
| Documents | upload/replace/download | metadata | mime/size | policy | R08, audit |
| Tasks | create/complete/snooze | Command Center | — | Admin | — |
| Notifications | mark read | inbox | — | recipient | — |
| Conflicts | override | list open | reason | Admin | — |
| Audit | — | search | — | Admin | — |

---

# 17. Data migration (plan only)

| Source | Auto-migratable? | Human verification |
|---|---|---|
| Structured spreadsheet columns (university, dates, quotes, pay) | Partial mapping scripts | Row-by-row confirm money and names |
| Calendar colors / multi-day events | Partial if exportable | Density/notation meaning |
| Free-form calendar notes | **No** as structured | Chester triages into Travel / Task / CommunicationLog / drop |
| Historical invoices/checks | Partial amounts/dates | Wave reconcile |
| Documents on disk/email | Upload tooling | Access classification |
| Reader roster | Yes with field map | Tax ID handling / Patriot |

**Order:** Universities → Readers → Events/Ceremonies → Assignments → Money lines → Documents → Notes triage.

Do not implement migration in this phase.

---

# 18. Existing MVP impact

| Feature | Verdict | Why | Business impact | Technical impact | Dependencies | Migration risk |
|---|---|---|---|---|---|---|
| localStorage overlay | REPLACE | Not multi-user SOT | Enables real season use | New persistence layer | Postgres, auth | High — rebuild writes |
| Demo reader switcher | REPLACE | Privacy theater | Real identities | Auth.js invites | User/Reader link | Medium |
| Module nav | REBUILD | Event-centric IA | Less hopping | Shell + routes | Event control UI | Medium |
| Dashboard KPIs | REBUILD | Attention first | Fewer misses | Command Center | Tasks/Conflicts | Medium |
| University records | KEEP | Correct parent | Continuity | Minor field adds | — | Low |
| Onboarding wizard | MODIFY | First Event path | Less re-entry | Flow change | Event create | Medium |
| Inquiry board | MODIFY | Must create Event on win | Pipeline→ops | Transition hook | Event service | Low |
| Event screen | REBUILD | Control record | Spreadsheet replacement | Large UI+API | Aggregate | High |
| Ceremonies | KEEP | Correct | — | Keep | — | Low |
| Admin calendar | KEEP | Right surface | Ops speed | Become projection | Travel objects | Medium |
| CalendarNote SOT | REMOVE | Hides work | Forces structure | Delete write path | Tasks/Comms | Medium (note triage) |
| Reader calendar | KEEP | Right contract | Reader UX | Keep grid | Assignments | Low |
| Personal blocks | KEEP | Chester booking | — | Keep admin-only | — | Low |
| Matching final say | KEEP | Craft | Trust | Suggest-only helpers | Conflicts | Low |
| Assignment statuses | MODIFY | Need side effects | Fewer mistakes | State machine + history | Rules | Medium |
| Availability sidebar | REBUILD | Must derive busy | No double-book | Conflict engine | Availability+Assignments | Medium |
| Travel notes fields | REPLACE | Need objects | Calc + CS gen | New tables | Event aggregate | High |
| Call Sheet version/ack | KEEP | Legal packet | Continuity | Generation rebuild | Event graph | Medium |
| CS authoring | REBUILD | Generate then edit | Kill Word habit | Snapshot builder | Travel/Assignments | High |
| Reader packet IA | KEEP | Correct | — | Wire real files/notify | Auth/files | Medium |
| Expenses | MODIFY | Real receipts | Auditability | FileObject | Storage | Medium |
| Debrief | KEEP | History | — | Hook Tasks | Event | Low |
| Payments page | REBUILD | Ledger views | One money story | Financial service | Event | High |
| Estimate/Invoice track | MODIFY | Must roll up | AR clarity | Summaries | Payments | Medium |
| Compensation timeline | KEEP | Needed | — | Auto promised line | Assignments | Low |
| Insurance/ID reminders | MODIFY | Must notify | Sleep | Rules R17–R18 | Notifications | Medium |
| Filename documents | REPLACE | Real files | Packet truth | Storage | — | High |
| Search | KEEP | Find fast | — | Redact sensitive | — | Low |
| Fake notification settings | REPLACE | Honesty | Trust | Real Notification | Prefs | Low |
| Rate sheet access | KEEP | Reference | — | Real file later | Docs | Low |
| PWA | KEEP | Phone access | — | Keep | — | Low |
| Playwright golden path | KEEP | Acceptance spine | Quality | Rewrite fixtures | Auth/DB | Medium |
| Brand tokens | KEEP | Aligned | — | Keep | — | Low |
| Task/Conflict/Comms/Audit/Auth/Files | ADD | Blueprint core | Spreadsheet death | Greenfield modules | Spine | High |
| Wave/Patriot/Bank/Portal/Sync/Chat/AI | DEFER | After OS real | Honesty | Adapters only | External APIs | — |

---

# 19. Implementation phases

## Phase A — Production spine

| | |
|---|---|
| **Objective** | Durable multi-user foundation |
| **Scope** | Postgres schema (core), Auth invite, AuditLog, FileObject storage adapters, replace overlay writes for Universities/Readers/Events/Ceremonies |
| **Dependencies** | Hosting + DB + object store decisions |
| **DB** | users, readers, clients, contacts, events, ceremonies, audit_logs, file_objects |
| **API** | Auth + Event/University/Reader CRUD subset |
| **UI** | Minimal login; existing screens wired to API gradually |
| **Automations** | None yet |
| **Tests** | Authz denials; persistence across session |
| **Acceptance** | Two users; data survives refresh; reader cannot read admin routes |
| **Rollback** | Feature flag back to read-only demo catalog |

## Phase B — Event control record

| | |
|---|---|
| **Objective** | One page operates a weekend |
| **Scope** | Assignments + history, travel tables, documents upload, communication log; remove travel prose as SOT |
| **DB** | assignments, assignment_history, flights, hotel_stays, ground_transfers, travel_credits, event_documents, communication_logs |
| **API** | Event service commands §2.3 subset |
| **UI** | Rebuild Event page as control record |
| **Automations** | R03/R04/R07/R08 partial |
| **Tests** | Assignment transitions; travel missing task |
| **Acceptance** | Chester runs staffing+travel+docs without spreadsheet for one Event |
| **Rollback** | Hide new panels; keep old read views |

## Phase C — Calendar projection + conflicts

| | |
|---|---|
| **Objective** | Calendar stops being a note database |
| **Scope** | Projection queries; Conflict engine; remove CalendarNote writes; personal events |
| **DB** | availability_blocks, personal_events, conflict_overrides |
| **API** | calendarProjection, conflictList |
| **UI** | Admin/Reader calendars consume projection |
| **Automations** | R01, double-book |
| **Tests** | Shared Event admin/reader; privacy; conflict on overlap |
| **Acceptance** | Month updates from Event writes; notes cannot store logistics |
| **Rollback** | Projection-only flag |

## Phase D — Command Center + tasks + notifications

| | |
|---|---|
| **Objective** | Attention replaces memory |
| **Scope** | Task model, Notification, Attention rules, rebuild dashboard |
| **DB** | tasks, notifications, notification_preferences |
| **API** | tasks, notifications, attention feed |
| **UI** | Command Center home |
| **Automations** | R12, R16–R18, ack deadlines |
| **Tests** | Idempotent task creation; no sensitive notification bodies |
| **Acceptance** | Unsigned CS, overdue invoice, expiring ID appear with actions |
| **Rollback** | Fallback to old dashboard counts |

## Phase E — Call Sheet generation + reader packet hardening

| | |
|---|---|
| **Objective** | Generate packet from live graph |
| **Scope** | generate/issue/ack; real file downloads; reader notify |
| **DB** | call_sheets, acknowledgements |
| **API** | CallSheet service |
| **UI** | Issue flow + reader CS |
| **Automations** | R05, R06, R19 |
| **Tests** | Version supersede; issue blocked when unstaffed |
| **Acceptance** | Issue without retyping travel/schedule; reader ack works under auth |
| **Rollback** | Manual draft edit still available |

## Phase F — Financial ledger views

| | |
|---|---|
| **Objective** | Traceable AR/AP without Wave fiction |
| **Scope** | Estimates/invoices/payments; compensation lifecycle; expense approve→pay; Event/University financial summaries; rebuild payments UI |
| **DB** | estimates, invoices, university_payments, reader_compensations, expense_* |
| **API** | Financials service |
| **UI** | Event finance panel + university AR + reader pay |
| **Automations** | R11–R15 |
| **Tests** | Outstanding math; reader cannot see others’ pay; approval required |
| **Acceptance** | Quote→invoice→paid and promised→approved→paid→cashed without side workbook |
| **Rollback** | Tracking tables remain; hide margin projections |

## Phase G — Migration tooling + season hardening

| | |
|---|---|
| **Objective** | Import Chester’s structured history; harden |
| **Scope** | Import scripts, note triage UI, performance, backup |
| **DB** | import batches |
| **API** | admin import |
| **UI** | Import review |
| **Automations** | None new |
| **Tests** | Import dry-run |
| **Acceptance** | One prior season loaded with verified money samples |
| **Rollback** | Import batch delete |

## Phase H — Integrations (deferred gate)

Wave / Patriot / email delivery / bank — only after API validation. Adapters behind interfaces; syncDirection explicit.

---

# 20. Golden operational journey

| Step | User does | VTI does automatically | VTI prevents | VTI records |
|---|---|---|---|---|
| Inquiry | Admin logs interest | nextAction visible | — | Inquiry row + Audit |
| University | Confirm/create University | color, insurance shell Task | duplicate chaos (warn) | Client |
| Engagement | Advance stages | — | closed_won without client | stage history |
| Event | Win → open Event | create Event tentative/draft | orphan won inquiry | Event + Task ceremonies/quote |
| Ceremonies | Enter sessions | calendar projection | confirmed Event with zero ceremonies | Ceremony rows |
| Availability | Enter blocks | busy derivation | — | AvailabilityBlock |
| Recommendation | View eligible readers | filter sound/geo/vet/availability/conflicts | auto-assign | suggestion only |
| Chester decision | Offer assignment | R02 notify | assign through back door without service | Assignment offered + history |
| Reader notified | — | Notification | email with SSN | Notification |
| Accept | Reader accepts | R03 pay line, travel Tasks, staffing | accepting others’ jobs | status + Compensation promised |
| Call Sheet | Admin generate/issue | snapshot; R05 | issue if unstaffed/blocking conflict | CallSheet issued |
| Ack | Reader accepts version | R06 | treating unsigned as ready | Acknowledgement |
| Travel | Admin enters flights/hotel | clear missing_travel | encoding travel only in notes | Flight/Hotel rows |
| Event weekend | Execute | — | — | logisticsStatus optional |
| Expenses | Reader submits | R12 | submit without receipt file | ExpenseReport |
| Debrief | Reader submits | R20 Task work-again | — | Debrief |
| Invoice tracking | Admin send invoice | due watch | claiming Wave sync | Invoice |
| University payment | Admin records pay | R11 balances | — | UniversityPayment |
| Reader compensation | Admin approves | R14 | silent pay | Compensation approved |
| Check / Paid | Admin marks paid + check # | R15 notify | — | paidOn, checkNumber |
| Cashed | Admin marks cashed | — | inventing bank clear | cashedOn |
| History | Admin set workAgain/eventReady | prior-year fields available next Event | losing released assignment history | Event flags + Audit |
| Next-year reminder | — | Task from returningInterest/insurance/season | — | Task |

---

# Final architecture test

| Requirement | Supported by this spec? | Gap if any |
|---|---|---|
| No ops spreadsheet | Yes, if Phases A–F complete | Until F, money still dual |
| No calendar-note encoding | Yes (Remove CalendarNote SOT + travel objects + Tasks) | Migration triage of old notes |
| No duplicate entry | Yes via Event aggregate generation | Wave dual entry until integration |
| Auto calc / remind / conflict | Yes rules + engines | Needs Phase C–D |
| Traceable finance | Yes §6 | Wave remains external official |
| Reader privacy | Yes §9/§15 | Requires replacing demo auth |
| Production readiness | Yes path | Not true until A+auth+files |

**Verdict:** This architecture **can** support the success statement. The current MVP **cannot**. The gap is intentional and closed by Phases A→F in order.

---

## Open Chester decisions (do not block architecture)

1. Availability authorship (admin vs reader submit) — model supports both; MVP default admin.  
2. Click-accept vs drawn signature — Acknowledgement.method enum.  
3. Broader reader calendar — filter flag; default assigned-only.  
4. How cashed is known — manual until bank.  
5. Second payment approver — single Admin until asked.  
6. November without Wave/Patriot APIs — tracking-only is expected and labeled.

---

## Spec maintenance

Product authority: Operational Master Blueprint canvas.  
This document is the engineering authority until superseded by an approved revision.  
Implementation must not invent entities or integrations marked DEFERRED or REMOVE.
