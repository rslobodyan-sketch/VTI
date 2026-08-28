# VTI Operations Platform — MVP Scope

**Project:** Voice Talent International — VTI Operations Platform  
**Status:** Requirements analysis only. Not a build commitment until Chester validates this document.  
**Date:** August 2026

## Source priority

1. Latest Business Requirements Document, including Chester’s Word comments and his answers in §13: `02_VTI_Business_Requirements_Document (1).docx`
2. Earlier Discovery Summary: `Chester_VTI_Milestone_1_Discovery_Summary_FINAL.docx`

Where the two conflict, the BRD and Chester’s comments win. Nothing below is invented. Items that remain unresolved are labeled **NEEDS CHESTER CONFIRMATION**.

Labels used in the source BRD are preserved:

- **FACT** — stated in VTI materials
- **INFERENCE** — logically derived from the workflow; Chester should still validate
- **OPEN** — unresolved in the original BRD tables, even if Chester later commented

---

## What the MVP is

A single, usable operations product that lets Chester run a commencement season from inquiry through history, and lets assigned readers execute an event from a phone.

The MVP must feel like one operational system, not a set of disconnected screens. The backbone is the lifecycle Chester validated:

**Inquiry → Event → Calendar → Reader availability → Assignment → Call Sheet → Event execution → Expenses → Debrief → Invoice/payment tracking → Historical record**

The MVP is **not** the entire future VTI platform. It is the smallest product that:

- Moves operational knowledge out of Chester’s head into a visible system
- Gives Chester a 360° operational view
- Gives readers a simple mobile path for Call Sheets, university instructions, receipts, and expense reports
- Keeps automation transparent, editable, and under administrative control
- Can be tested with real readers during the November/December season

---

## 1. MVP — MUST HAVE

### 1.1 VTI Admin operational dashboard (360° view)

| | |
|---|---|
| **What** | A login home that shows how many universities are being served, how many events exist, how many readers are being used, and potential income vs. expenses, plus actionable work (upcoming events, blocked assignments, pending expenses, unpaid invoices, expiring documents, insurance due). |
| **Who** | VTI Admin / Chester |
| **Why** | OBJ-02 / REP-001 / REP-002. Chester’s comment: a dashboard should give this overview in a quick-to-read format. OQ-16 names the KPIs. |
| **MVP?** | MUST |
| **Dependencies** | Universities, events, readers, assignments, estimates/invoices, expenses |

### 1.2 University / client records and inquiry workflow

| | |
|---|---|
| **What** | Log incoming inquiries (contact name, email, university name, department, notes, status). Track new universities from inquiry → phone conversation / needs alignment → administrative approval wait → commencement-coordinator logistics. Track returning universities with interest/commitment for the following year, including the fact that budget approval may still be required. |
| **Who** | VTI Admin |
| **Why** | UNI-001, UNI-002, UNI-005, OQ-01 |
| **MVP?** | MUST |
| **Dependencies** | Client/university entity, contacts, status model |

### 1.3 Event records with ceremonies

| | |
|---|---|
| **What** | Create an event tied to a university. One event may contain multiple ceremonies (dates/times) and multiple readers. Support additional related events in the same timeframe (for example a cultural, honor-society, or departmental ceremony). Statuses: tentative (coordinator confirmed interest **and** budget is available), confirmed, postponed (weather / force majeure), cancelled (either side, any time). Chester uses “event” to mean commencement ceremonies. |
| **Who** | VTI Admin |
| **Why** | EVT-001, EVT-002, OQ-02, OQ-04 |
| **MVP?** | MUST |
| **Dependencies** | University record, calendar |

### 1.4 Purpose-built operational calendar

| | |
|---|---|
| **What** | A VTI-specific monthly calendar, not a Google Calendar clone. One-page monthly view of all events: university, assigned reader(s), ceremony dates/times, estimated graduate names to be called, quote for this year, last year’s name count and last year’s quote, lead reader if applicable, hotel / transportation / airfare (including estimated hotel cost, airfare paid in advance, refunds/credits used), color-coded by university across consecutive days, room for notations, team dinners/functions in the same university color, available vs. unavailable readers in a sidebar, and Chester’s own personal events so he can see when he is booked. Must remain readable when a month is dense. Readers may view a permission-filtered calendar; they cannot edit it in MVP. |
| **Who** | VTI Admin (full); Readers (permission-filtered view only) |
| **Why** | SCH-001, SCH-002. Chester comments: Google cannot match his color-coded system; calendar already shows transportation and housing; last-year university history on the calendar “might be a MUST.” OQ-08. |
| **MVP?** | MUST, including last-year snapshot fields on the month view |
| **Dependencies** | Events, ceremonies, assignments, travel/housing fields, reader availability, historical event stats |

**Not in this MUST:** Google Calendar sync (OPEN / optional; Chester prefers the purpose-built calendar).

### 1.5 Reader profiles, availability, and assignment matching (admin-operated)

| | |
|---|---|
| **What** | Maintain new and returning reader profiles. Chester selects readers using sound, university preference (male/female/specific sound), availability, geography, lead-reader experience, and veteran-first choice. Chester has final say. New readers may be assigned to shadow a lead. Assignments can be returned to the pool if the reader cannot do the job. Readers can **view** their profile; they cannot update it after onboarding in MVP. |
| **Who** | VTI Admin (create/edit/assign); Reader (view own profile) |
| **Why** | RED-001, RED-002, EVT-003, OQ-03, OQ-04, OQ-07 |
| **MVP?** | MUST |
| **Dependencies** | Reader entity, availability, assignment entity |

**NEEDS CHESTER CONFIRMATION:** whether readers submit their own availability, or Chester records it.

### 1.6 Reader onboarding and sensitive documents

| | |
|---|---|
| **What** | Track onboarding readiness. Capture contractor name vs. legal name, compensation category (non-employee / non-1099 / other), business type, EIN or SSN, contact information, secondary address, date of birth, shirt size, airline/seat preference, KTN, previous addresses, signed NDA status, emergency contact, sound notes, and optional fields (dietary restrictions, pronoun/nickname, hobbies, leadership assessment, work-style). Store driver’s license and/or passport with expiration/renewal tracking. Controlled access; only VTI access at this point. |
| **Who** | VTI Admin (enter and manage); Reader (view own non-sensitive summary; not a self-serve onboarding editor in MVP) |
| **Why** | RED-003, RED-004, RED-005, DOC-001, DOC-002, OQ-05, OQ-06, comment: “only VTI access” |
| **MVP?** | MUST for storage, status, expiration reminders, and NDA status. Patriot remains the intended master profile / compliance hub if/when integrated. |
| **Dependencies** | Encrypted storage, role-based access, audit log |

Patriot Software is the stated source of truth for the reader master profile. MVP must still store what the operational platform needs to run events if Patriot is not integrated yet.

### 1.7 Assignments as the operational hub

| | |
|---|---|
| **What** | Assign one or more readers to an event with status (offered / accepted / declined / assigned / released back to pool). Connect the assignment to schedule, logistics, Call Sheet, university documents the reader needs, expenses, and debrief. Support lead reader and shadow roles. |
| **Who** | VTI Admin; Reader sees own assignments |
| **Why** | EVT-003, EVT-004, Discovery: assignment is the central object. Chester comment: university documents the reader needs belong here. |
| **MVP?** | MUST |
| **Dependencies** | Event, reader, Call Sheet, documents, expenses, debrief |

### 1.8 Versioned Call Sheet / event packet

| | |
|---|---|
| **What** | Generate an event-specific Call Sheet from structured assignment data: talent, event, ceremony schedule, compensation, travel, accommodation, transfer/rideshare, expenses, task instructions, call times, sound-check, dress code, preparation, debrief instructions, confidentiality/legal content. Deliver securely to the assigned reader. Call Sheets remain versioned after issuance. Call Sheets act as a legal contract and require the reader to sign / accept. |
| **Who** | VTI Admin (create, version, issue); Reader (view, accept/sign) |
| **Why** | CAL-001 through CAL-006. CAL-007 was OPEN; Chester: “Call Sheets should remain versioned.” OQ-06: signature required. OQ-20: Call Sheet is the minimum mobile artifact. |
| **MVP?** | MUST, including versioning and reader acknowledgement |
| **Dependencies** | Assignment, event logistics, document delivery, signature/acceptance mechanism |

**NEEDS CHESTER CONFIRMATION:** click-to-accept vs. drawn signature vs. both.

### 1.9 Event logistics visible to admin and assigned readers

| | |
|---|---|
| **What** | Store and display travel, accommodation, transportation/rideshare, compensation, university instructions, and related files so they can be recalled from the calendar, the event, the Call Sheet, and the reader’s mobile assignment view. |
| **Who** | VTI Admin; assigned Reader |
| **Why** | CAL-002, CAL-003, CAL-004, Chester calendar comment on housing/transport, OQ-20 |
| **MVP?** | MUST |
| **Dependencies** | Event, Call Sheet, documents |

### 1.10 Reader mobile execution: Call Sheet, instructions, receipts, expenses

| | |
|---|---|
| **What** | A first-class phone experience (responsive web, not a native app). Readers open an assignment, read the current Call Sheet and university instructions, capture receipts, and complete an expense report. Simple, not an enterprise dashboard squeezed onto a phone. |
| **Who** | Reader / Subcontractor |
| **Why** | NFR-001, NFR-005, RED-006, OQ-20, EXP-001, EXP-002 |
| **MVP?** | MUST |
| **Dependencies** | Auth, assignment, Call Sheet, expenses, files |

### 1.11 Expense submission, approval, and reimbursement tracking

| | |
|---|---|
| **What** | Readers submit receipts and an expense report tied to an assignment. Chester tracks approval and reimbursement status. Associate receipts with reader and event. |
| **Who** | Reader (submit); VTI Admin (review/approve/track) |
| **Why** | EXP-001 through EXP-004 |
| **MVP?** | MUST for capture, submission, and status. Initiating the actual payout depends on Patriot (see 1.13). |
| **Dependencies** | Assignment, file storage, compensation/reimbursement records |

### 1.12 Estimates, invoices, and university payment tracking

| | |
|---|---|
| **What** | Generate/store an estimate associated with the university/event (Chester: estimates may be generated closer to Stage 2 / qualification). Track invoice and payment status, including when billed, when due, reminders if applicable, when paid, and amount. Wave must remain the accounting source of truth for invoices, estimates, and the general ledger. |
| **Who** | VTI Admin |
| **Why** | UNI-006, UNI-008, BIL-001, OQ-12, comments on estimates becoming invoices and billing history |
| **MVP?** | MUST to **track** estimates/invoices/payments in VTI. MUST NOT replace Wave. Live Wave API sync is SHOULD, not MUST. |
| **Dependencies** | University, event, Wave (later) |

### 1.13 Reader compensation visibility and payment approval

| | |
|---|---|
| **What** | Show what the reader was paid last year, what is promised this year, when they were paid, and when the check was cashed. Payments require Chester’s approval every time. If Patriot can be integrated, the platform should initiate compensation/reimbursement or queue it for Chester (or a business associate) to finish. If not, tracking amounts and status is the minimum. |
| **Who** | VTI Admin (full); Reader (own compensation history) |
| **Why** | Chester comment on reader pay history; OQ-11; OQ-18 |
| **MVP?** | MUST to **display and track** promised/paid/cashed status and require admin approval. Initiating payout via Patriot is SHOULD, fallback to tracking. |
| **Dependencies** | Assignment, compensation records, Patriot (later) |

### 1.14 Post-event reader debrief

| | |
|---|---|
| **What** | After the event, readers answer questions about the event, other readers, university staff, problems/conflicts, plan vs. execution, plus a rating scale. Chester can record a recommendation to work with the university again. That recommendation should feed an “event ready” indication for subsequent events. |
| **Who** | Reader (submit); VTI Admin (review, recommend, mark event-ready) |
| **Why** | REP-003, REP-004, OQ-17 |
| **MVP?** | MUST |
| **Dependencies** | Assignment, university history |

### 1.15 University / event history retrieval

| | |
|---|---|
| **What** | Retrieve what this university did last year, what they paid, how many names were called, reader pay, notes, and debrief outcome. Calendar month view must show last-year names and quote next to this year’s figures. Broader CRM-style history (full communication archive, multi-year analytics) can deepen later; streamlining the process is Chester’s higher concern, but last-year operational recall is required. |
| **Who** | VTI Admin |
| **Why** | UNI-009 (BRD SHOULD), comments 8 and 13 (calendar/history MUST for last-year figures and billing timeline), OBJ-04 |
| **MVP?** | MUST for last-year snapshot on calendar + event, billing timeline, and debrief notes. SHOULD for a richer multi-year university dossier. |
| **Dependencies** | Historical events, estimates/invoices, assignments, debriefs |

### 1.16 Insurance / compliance reminders (admin-tracked)

| | |
|---|---|
| **What** | Remind Chester when each university’s annual insurance requirements are due. Track university insurance annually. Track reader driver’s license and passport renewals. Chester is the person who tracks and verifies today. Insurance is mostly a formality and accepted annually unless a change is needed. |
| **Who** | VTI Admin |
| **Why** | UNI-007 (BRD SHOULD), DOC-003, OQ-15, comments 3 and 6 |
| **MVP?** | MUST for due-date reminders and status. Not a policy-management system. |
| **Dependencies** | University, reader documents, dashboard |

### 1.17 Role-based access, auditability, and sensitive-data protection

| | |
|---|---|
| **What** | Least-privilege roles (VTI Admin vs. Reader). Sensitive data (SSN, EIN, driver’s license, passport, DOB, KTN, addresses) is not shown in notifications or unnecessary screens. Material changes are auditable. Retention target is IRS/tax-oriented, typically 4–7 years depending on document type. |
| **Who** | All users; enforced by the platform |
| **Why** | SEC-001 through SEC-004, DOC-004, OQ-14 |
| **MVP?** | MUST |
| **Dependencies** | Auth, encryption, audit log |

### 1.18 Human control over automation

| | |
|---|---|
| **What** | Any automation in MVP is limited to reminders, status flags, and pre-filled Call Sheets from structured data. No silent operational decisions. Payments are never auto-approved. Anything automated must be visible and retractable. |
| **Who** | VTI Admin |
| **Why** | AI-002, AI-003, OBJ-07, OQ-18, Discovery product philosophy |
| **MVP?** | MUST as a **constraint**. AI features themselves are not MVP. |
| **Dependencies** | Approval points, audit log |

---

## 2. MVP — SHOULD HAVE

These improve the product if time allows before the November test. They must not block the MUST workflow.

| Feature | What | Who | Why | Dependencies |
|---|---|---|---|---|
| Wave integration | Push/pull estimates, invoices, payment status; Wave remains ledger SOT | Admin | BIL-002, OQ-12, Chester concern about the gap if Wave is not connected | Wave API validation, licensing |
| Patriot integration | Onboarding/master profile, NDA/financial docs, compensation/reimbursement initiation | Admin | BIL-003, OQ-11, OQ-13 | Patriot API validation |
| In-app operational notes between Chester and assigned readers | Event-scoped notes, not a full messenger | Admin, Reader | COM-001, COM-003; Discovery: messaging is not critical if costly | Assignment |
| University communication log | Log email/platform notes against the university/event so the option exists to work inside the platform later | Admin | OQ-10: email **and** platform | University, event |
| Filters/status views | Filter universities, readers, events by status | Admin | REP-005 | Core records |
| Richer university history dossier | Multi-year notes, prior events, payments beyond the last-year calendar snapshot | Admin | UNI-009, comment 10 (nice, but process-first) | History records |
| Visual assignment status | Upcoming / active / blocked / completed | Admin | EVT-006 | Assignments |
| Reader location/status as a simple logistics field | Manual status, **not** GPS | Admin | EVT-005 | Assignment |
| Brand color alignment | Interface closer to VTI colors | All | Comment 16: non-priority | Design tokens |
| Export/print Call Sheet | Print-ready / PDF of the current version | Admin, Reader | Call Sheet is the legal/operational artifact | Call Sheet |
| Document expiration queue | Dedicated list of DL/passport/insurance due | Admin | OQ-06, OQ-15 | Documents |

---

## 3. POST-MVP / FUTURE

Supported by the documents, explicitly later, or dependent on unvalidated integrations.

- Native reader mobile application (validate responsive web first)
- University / client login for payment and event history
- Reader self-edit of profile/documents after onboarding
- Reader-editable calendar (option should exist later; not MVP)
- Internal sub-admin / super-admin roles
- Full in-app private/group messaging and reader-to-university-coordinator chat
- Email ingestion of inquiries
- Google Calendar synchronization
- AI summaries, reminders, document extraction, workflow recommendations (with proofs and retractability; payments always approved by Chester)
- Absorbing Wave or Patriot capabilities into VTI if integration is not cost-effective
- Wells Fargo / business-bank connection for billing/payment
- Continuous GPS / live reader tracking
- Insurance policy-record integration
- Advanced reporting/analytics beyond the operational dashboard
- Autonomous AI decisions

---

## 4. OUT OF SCOPE

Do not design, promise, or build these unless Chester later changes the BRD.

- Replacing Chester’s judgment with autonomous AI
- A university self-service portal in version one
- A native iOS/Android app in version one
- Google Calendar as the system of record
- Replacing Wave as the accounting ledger
- Replacing Patriot as the reader master/compliance hub **by assumption**
- Continuous GPS tracking
- Public marketplace / reader self-signup
- HIPAA, SOC 2, PCI, or other certifications not required by the source documents
- Paid messaging, paid automation, or other paid SaaS beyond what is required to host the app and store files
- Multi-tenant SaaS for other companies
- Balance-sheet / full accounting inside VTI (Chester asked how a balance sheet fits; answer: Wave remains the general ledger. VTI tracks operational estimates, invoices, pay, and expenses.)

---

## 5. NEEDS CHESTER CONFIRMATION

Only items that still change implementation. Full question list: `docs/CHESTER_CONFIRMATION_QUESTIONS.md`.

1. Visual sample of Chester’s current color-coded calendar (he offered one).
2. How name lists are supplied and delivered to readers (file type, timing, size).
3. Call Sheet legal acceptance: click-to-accept, drawn signature, or both.
4. Who sets reader availability — Chester, the reader, or both.
5. Reader calendar: assigned events only, or a filtered subset of all events.
6. Visibility of Chester’s personal calendar events (admin-only assumed).
7. How “check cashed” is known today.
8. Whether November MVP may track Wave/Patriot data inside VTI if APIs are not ready.
9. Whether anyone besides Chester may approve payments in MVP.
10. Wells Fargo: confirm that MVP tracks payment status only (no bank connection).

---

## MVP realism check

In scope for a professional November test:

- Admin can run a university through the lifecycle
- Calendar is the daily operating surface
- Readers can be assigned and issued a versioned Call Sheet
- Readers can execute from a phone (Call Sheet, instructions, receipts, expense report, debrief)
- Chester can see money and work status without opening spreadsheets
- Sensitive reader data is protected
- Wave and Patriot are not silently replaced

Deferred without breaking the demo:

- Live Wave/Patriot APIs
- University login
- Native app
- Chat product
- AI
- Bank integration
- Extra admin roles
