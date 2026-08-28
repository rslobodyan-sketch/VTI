# VTI Operations Platform — Master Build Readiness

**Status:** Readiness review complete. Application code, packages, database, authentication, and UI have **not** been started.  
**Date:** 28 August 2026  
**Recommendation:** Phase 0 (foundation shell only) may begin after this document is accepted. Do **not** start Phase 1 schema/auth until the open product questions below are either answered or explicitly accepted as working assumptions.

This file does not replace the planning layer. It records whether that layer is faithful to the source documents, where it is not yet locked, and what “ready to build” actually means.

---

## Review method

1. Re-read `02_VTI_Business_Requirements_Document (1).docx` (body, requirement tables, Chester’s §13 answers, 21 Word comments).
2. Re-read `Chester_VTI_Milestone_1_Discovery_Summary_FINAL.docx` (including the transcript validation addendum).
3. Re-read every file in `docs/`.
4. Traced each MVP workflow to entities and screens.
5. Compared BRD MUST/SHOULD/LATER labels with planning MUST/SHOULD/POST-MVP labels.
6. Did **not** silently pick a side where Chester and the BRD tables still disagree, or where Chester’s answers leave two valid implementations.

---

## 1. Source-of-truth hierarchy

| Rank | Source | Use |
|---|---|---|
| 1 | Latest BRD: `02_VTI_Business_Requirements_Document (1).docx` including Chester’s Word comments and his answers in §13 | Product requirements |
| 2 | Planning layer in `docs/` (this file included) | Implementation interpretation of (1) |
| 3 | Discovery Summary: `Chester_VTI_Milestone_1_Discovery_Summary_FINAL.docx` | Context only; loses where it conflicts with (1) |

Rules:

- Do not invent requirements.
- Do not expand MVP.
- Do not drop future seams from the architecture because they are out of MVP.
- BRD evidence labels (FACT / ASSUMPTION / INFERENCE / OPEN) still matter. Chester’s later comments and §13 answers override OPEN rows in the original tables **when he actually answered them**.
- Where he did not answer, the item stays **NEEDS CHESTER CONFIRMATION**.

Planning files already created (do not treat as higher than the BRD):

- `docs/MVP_SCOPE.md`
- `docs/PRODUCT_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/USER_FLOWS.md`
- `docs/UI_SCREEN_MAP.md`
- `docs/SECURITY_PLAN.md`
- `docs/FUTURE_ROADMAP.md`
- `docs/CHESTER_CONFIRMATION_QUESTIONS.md`
- `docs/BUILD_PLAN.md`
- `docs/MASTER_BUILD_READINESS.md` (this file)

---

## 2. Confirmed MVP scope

A **single** Next.js operations platform for Voice Talent International. Not an accounting system. Not an HRIS. Not a university portal.

Lifecycle (must work as one product):

**Inquiry → event → calendar → availability → assignment → versioned Call Sheet → event execution → expenses → debrief → invoice/payment tracking → history**

Confirmed MUST capabilities (source: BRD §10 MUST list + Chester comments/§13 that raise or specify them):

| Capability | Source lock |
|---|---|
| Admin 360° dashboard (universities served, events, readers used, potential income, expenses, plus actionable queues) | REP-001/002, OQ-16, comment 20 |
| University inquiry + returning-year interest/commitment | UNI-001/002/005, OQ-01 |
| University + event records; multiple ceremonies; multiple readers | EVT-001/002, OQ-04 |
| Event statuses: tentative (interest **and** budget), cancelled (either side), postponed (weather/force majeure) | OQ-02 |
| Purpose-built operational calendar (not Google Calendar as SOT) | SCH-001/002, OQ-08, comments 7–9 |
| Last-year names and quote on the calendar; reader pay history recall | comment 8, comment 13, OQ-08 |
| Housing / transportation / airfare and related costs on/near the calendar | comment 7, OQ-08, CAL-003 |
| Color-coded university visibility across consecutive days; dinners/functions in the same color; notations; available/unavailable reader sidebar; Chester personal events | OQ-08 |
| Reader profiles, onboarding status, admin-operated matching (sound, gender/sound preference, availability, geography, veteran-first, lead/shadow); Chester has final say | RED-001/002, OQ-03 |
| Readers view profile only; no self-edit after onboarding | OQ-07 |
| Secure documents: SSN/EIN, DL/passport, NDA; VTI access only for sensitive files | RED-003/004, DOC-001/002, comment 4 |
| Assignments as the hub; return reader to pool | EVT-003/004, OQ-04 |
| University documents in the reader packet | comment 5, OQ-20 |
| Versioned Call Sheet generated from structured data; legal/confidential content; reader accept/sign | CAL-001–006, comment 6, OQ-06, OQ-20 |
| Reader mobile web: Call Sheet, university instructions, receipt capture, expense report | OQ-20, NFR-001/005 |
| Expense submit + approval/reimbursement **status** | EXP-001–003 |
| Estimate that can become an invoice; billing timeline (billed, due, reminded, paid, amount) | UNI-006/008, BIL-001, comments 2/13/17 |
| Reader pay visibility: last year, promised this year, paid, cashed | comment 11 |
| Human approval of every payment | OQ-18 |
| Debrief questions + work-again / event-ready | OQ-17, REP-003/004 |
| Annual university insurance **reminder** (not a policy system) | comment 3, OQ-15, UNI-007 elevated by Chester |
| DL/passport expiration tracking | OQ-06, OQ-15 |
| Role-based access, least privilege, audit of material changes | SEC-001–004 |
| Automation constraint: transparent, editable, no silent operational decisions; AI itself is not MVP | AI-002/003, OBJ-07 |

MVP tracking rule for money and HR:

- **Wave** remains source of truth for estimates, invoices, and the general ledger (OQ-12).
- **Patriot** remains source of truth for the reader master profile / NDA / financial compliance (OQ-13).
- If APIs are not available, VTI **tracks** status and Chester continues to enter official records in Wave/Patriot. The product must not pretend a live integration exists.

---

## 3. Explicit MVP exclusions

Do not build now (unless a later Chester decision changes the BRD):

- Native iOS app
- Native Android app
- AI features, AI chatbot, autonomous decisions
- University/client portal
- University login
- Full in-app messaging platform (private/group chat, reader–coordinator chat)
- Google Calendar as system of record or required sync
- Wells Fargo / business-bank connection
- Live Wave accounting API integration
- Live Patriot integration
- Automated payment initiation where the Patriot (or other) API is unavailable
- Replacing Wave as ledger or Patriot as reader master by assumption
- Continuous GPS tracking
- Public reader self-signup / marketplace
- Sub-admin / super-admin permission product
- Reader self-edit of profile/documents
- Reader-editable calendar
- Email ingestion of inquiries
- Full accounting / balance sheet inside VTI
- HIPAA, SOC 2, PCI, or other certifications not required by the sources
- Paid SaaS beyond what is required to host the app and store files
- Multi-tenant product for other companies

SHOULD items that must not block MVP: Wave/Patriot APIs, brand-color polish, richer multi-year dossier, GPS-free logistics status field, print/PDF Call Sheet, dedicated messaging.

---

## 4. Primary user roles

| Role | MVP | Notes |
|---|---|---|
| `VTI_ADMIN` (Chester) | Yes | Only committed admin role. Owns operations, sensitive data, approvals, full calendar, billing tracking. |
| `READER` | Yes | Invite-only. Mobile-first. View-only profile. Own assignments, Call Sheets, expenses, own pay, permission-filtered calendar (view). |
| University / client contact | No login | Real-world actor; Chester operates their records. |
| Sub-admin / super-admin | Future enum only | Not screens, not permissions product. |
| University user | Future enum only | OQ-09 left a later history portal open. |

Authentication: invite-only. No university registration. No social login.

---

## 5. Core workflows

### Admin / Chester

1. Log inquiry (manual; email form is the current source, not an integration).
2. Move stages: initial inquiry → needs conversation → pending admin approval → coordinator logistics.
3. Returning university: interest/commitment checkbox; budget approval may still apply.
4. Create estimate around Stage 2; store in VTI; official copy in Wave.
5. Create event + ceremonies when interested/available; set tentative when interest + budget exist.
6. Operate from the monthly calendar (color, last year vs this year, logistics, notes, reader sidebar, personal blocks).
7. Assess availability; assign lead/reader/shadow; release to pool if needed. System does not auto-pick.
8. Attach university files; issue Call Sheet v1; later changes issue v2+; track acknowledgement.
9. Watch execution; insurance and ID reminders.
10. Review expenses; approve pay/reimbursement (always human).
11. Track invoice billed/due/reminded/paid.
12. Review debriefs; mark work-again / event-ready; history is retrievable next year.

### Reader / subcontractor

1. Accept invite; land on a simple home.
2. Open assignment hub.
3. Read Call Sheet + university instructions/name lists.
4. Accept/sign the **current** Call Sheet version; re-ack if a new version is issued.
5. Capture receipts; submit expense report; see status.
6. Submit debrief.
7. View own last-year / promised / paid / cashed.
8. View permission-filtered calendar (exact filter still open).
9. Cannot edit profile or the calendar.

### University / client

No product login. Off-platform email and approvals. Chester records the outcome in VTI.

---

## 6. Required modules

| Module | MVP | Future seam |
|---|---|---|
| Auth + RBAC | Yes | `SUB_ADMIN`, `UNIVERSITY` enum values unused |
| Universities / contacts / inquiries | Yes | University portal later |
| Insurance reminders | Yes | Policy records later |
| Readers / onboarding / sensitive docs | Yes | Patriot adapter; reader self-edit |
| Availability | Yes | Reader-submitted vs admin-entered (open) |
| Events / ceremonies / logistics | Yes | — |
| Operational calendar | Yes | Optional Google sync later |
| Assignments | Yes | — |
| Call Sheets (versioned) + acknowledgement | Yes | — |
| Event packet files | Yes | — |
| Reader mobile execution | Yes | Native shell later |
| Expenses / receipts | Yes | Receipt OCR later |
| Debriefs / event-ready | Yes | Analytics later |
| Estimate / invoice / university payment **tracking** | Yes | Wave adapter |
| Reader compensation **tracking** + approval | Yes | Patriot initiation |
| Operational notes (lightweight, not chat) | Yes, thin | Message threads later |
| Notifications / reminder queues | Yes | Email fan-out later |
| Audit log | Yes | Automation audit later |
| Integration adapters | Interfaces only | Wave, Patriot, email, bank |

---

## 7. Required entities

From `docs/DATA_MODEL.md`, required for MVP workflows:

`User` · `ReaderProfile` · `ReaderAddress` · `EmergencyContact` · `Client` · `ClientContact` · `Inquiry` · `Event` · `Ceremony` · `Assignment` · `CallSheet` · `CallSheetAcknowledgement` · `EventDocument` · `ReaderDocument` · `FileObject` · `AvailabilityBlock` · `PersonalTimeBlock` · `CalendarNote` · `InsuranceRequirement` · `Estimate` · `Invoice` · `UniversityPayment` · `ReaderCompensation` · `ExpenseReport` · `ExpenseLine` · `Receipt` · `Debrief` · `OperationalNote` · `Notification` · `AuditLog`

Future entities (do not build now): `UniversityUser` · `SubAdminGrant` · `MessageThread` · `WaveSyncEvent` · `PatriotSyncEvent` · `BankTransaction` · `AiRecommendation` · `PolicyRecord`

### Workflow coverage check

| Workflow | Supported by entities? | Gap |
|---|---|---|
| Inquiry | Yes — `Inquiry`, `Client`, `ClientContact` | — |
| Qualification / estimate | Yes — `Estimate` + Wave as SOT | Live Wave not in MVP |
| Event / ceremonies | Yes — `Event`, `Ceremony` | See contradiction: Event vs Ceremony vs “separate events” |
| Calendar | Yes — event/ceremony + color + notes + personal blocks + availability | Visual sample still missing |
| Availability | Yes — `AvailabilityBlock` + assignment busy-ness | Who writes availability is open |
| Assignment | Yes — `Assignment` (event + reader, lead/shadow) | See contradiction: per-ceremony assignment |
| Call Sheet | Yes — versioned `CallSheet` + per-assignment ack | See contradiction: event vs assignment grain vs other readers’ pay |
| Event packet | Yes — `EventDocument` | Name-list format/size open |
| Expenses | Yes — report / line / receipt | — |
| Debrief / event-ready | Yes — `Debrief` + `Event.workAgainRecommendation` / `eventReady` | Rating scale wording not specified |
| Invoice/payment tracking | Yes — `Invoice`, `UniversityPayment` | Wave remains official |
| Reader pay ledger | Yes — `ReaderCompensation` | How `cashedOn` is known is open |
| Insurance reminder | Yes — `InsuranceRequirement` | — |
| Audit / auth | Yes — `User`, `AuditLog` | Admin audit **screen** missing from screen map |

### Data-model gaps (not silently filled)

1. `ReaderProfile` has `soundNotes` but no explicit gender / presented-voice field, though OQ-03 matching uses university preference for male/female/specific sound.
2. `CallSheet` is modeled at **event** grain; compensation also lives on `Assignment`. These can conflict (see §12).
3. `Assignment` is modeled at **event** grain, not ceremony grain.
4. `calendarColor` is on `Event`; OQ-08 is per university. Prefer university-level color in implementation so related events share a color — this is an implementation correction, not a new requirement.

---

## 8. Required screens

MVP screens that must exist (from `docs/UI_SCREEN_MAP.md`, plus gaps found in this review):

**Public / auth:** login, invite/set password, reset password.

**Admin:** operational dashboard · university list/record · inquiry form/pipeline · insurance panel · **reader list / reader record (missing as a named section in the screen map; required by RED-001 and Phase 3)** · event list/record · ceremony editor · logistics panel · monthly calendar + sidebar + popover + personal events · assignment board/picker/detail · Call Sheet editor + version history + unsigned queue · event packet files · expense inbox/detail · **compensation/payment approval queue (implied by OQ-18 and comment 11; not named as its own screen)** · estimate/invoice tracking on university/event · debrief rollup / event-ready · expiring documents queue · invite user · settings (university colors, reminder lead time) · **audit visibility (required by SEC-004 / this task; no admin audit screen listed)**

**Reader mobile:** home · assignments · assignment hub · Call Sheet · university files · receipt capture · expense report · debrief · my pay · read-only profile · filtered calendar.

**Not MVP screens:** university portal, chat, Wave/Patriot connect, Google sync, AI controls, native shells.

### Screen coverage check

| Workflow | Screen support | Gap |
|---|---|---|
| Inquiry → university | Yes | — |
| Calendar operations | Yes | Density depends on Chester’s sample |
| Assign readers | Yes | Admin reader directory not listed as its own inventory section |
| Issue/accept Call Sheet | Yes | Signature mechanism open |
| Reader execute on phone | Yes | — |
| Expenses | Yes | — |
| Approve pay | Partial | No dedicated admin pay-approval inbox in the screen map |
| Debrief / history | Yes | — |
| Invoice tracking | Yes (Phase 8) | — |
| Audit | Architecture yes | No screen |
| 360 dashboard | Yes | Intentionally late in build sequence (Phase 8) |

---

## 9. Security requirements

Represented in `docs/SECURITY_PLAN.md` and `docs/PRODUCT_ARCHITECTURE.md`. Must be implemented, not postponed to “hardening only”:

| Requirement | Architecture representation |
|---|---|
| Invite-only authentication | Auth.js, no public signup, no university login |
| Two-role RBAC | Middleware + Server Action + query checks |
| Least privilege | Reader sees own non-sensitive data only |
| Sensitive fields (SSN/EIN, DL/passport, DOB, KTN, addresses) | Encrypted at rest; masked in UI; reveal audit-logged |
| Sensitive values not in notifications/emails/exports | Notification body rule |
| Secure documents | Encrypted object store; no public URLs; auth’d downloads |
| Call Sheet confidential/legal content | Assigned readers only; versioned ack |
| Receipts | Encrypted; owner + admin only |
| Client data | Admin-only in MVP |
| Auditability | `AuditLog` for material and sensitive actions, including payment approval |
| Retention | 4–7 years per OQ-14; no auto-delete in MVP; exact per-type table still practical to confirm |
| No false compliance claims | No HIPAA/SOC2/PCI assertion |
| Payments | Status tracking only; no card vault; no bank feed |
| AI | Not in MVP; later must not ship IDs/Call Sheets to models without Chester’s approval |

Production files must not live on an ephemeral host disk (Vercel filesystem is not a document store).

---

## 10. External systems — what is / is not integrated in MVP

| System | Role | MVP |
|---|---|---|
| VTI platform | Operational SOT | **Build** |
| Wave | Estimates, invoices, GL SOT (OQ-12) | **Not integrated.** Tracking records + manual Wave entry. Nullable `waveExternalId`. |
| Patriot | Reader master / NDA / financial docs / pay initiation (OQ-13, OQ-11) | **Not integrated.** Operational copy + tracking. Nullable `patriotExternalId`. |
| Email | Inquiries and university communication today | **Not ingested.** Manual log + off-platform email. Invite may be a copied link if no free mail sender is available. |
| Google Calendar | Chester’s old tool | **Not SOT. Not synced.** |
| Wells Fargo | Asked in comment 1 | **Not integrated.** Confirm tracking-only (Chester Q10). |
| AI providers | Later assistance | **Not used.** |

Chester asked how large the gap is if Wave/Patriot are not connected (comments 18/19). Honest MVP answer: double entry for official invoices and reader master data; VTI still gives operational visibility. That gap is documented, not hidden.

---

## 11. Open questions requiring Chester

Existing list in `docs/CHESTER_CONFIRMATION_QUESTIONS.md` remains valid:

1. Calendar sample (busy month + light month).
2. Name lists: format, size, timing.
3. Call Sheet legal acceptance: click-to-accept, drawn signature, or both.
4. Who sets reader availability.
5. What readers see on the calendar.
6. Personal events hidden from readers? (Recommended: yes.)
7. How “check cashed” is known today.
8. November test with tracking-only Wave/Patriot.
9. Second payment approver in MVP, or Chester only.
10. Confirm no Wells Fargo in MVP.

### Additional questions found in this review (do not treat as answered)

These were **not** silently decided. They can change schema and screens before Phase 5.

**A. Call Sheet grain vs other readers’ pay**  
BRD: event-specific Call Sheet generated from assignment data, delivered to the assigned reader, includes compensation.  
Security / comment 11: a reader should see **their** pay, not other readers’ pay.  
If one event-level Call Sheet lists every reader’s compensation, assigned readers would see each other’s pay.  
**Ask:** Is the Call Sheet one shared event packet (with or without others’ pay), or one packet per reader/assignment?

**B. Assignment grain vs ceremonies**  
OQ-04: one event can contain multiple ceremonies and multiple readers. It does not say whether a reader is assigned to the whole event or to specific ceremonies.  
**Ask:** Can different readers be assigned to different ceremonies of the same event?

**C. “Confirmed” vs remaining tentative**  
OQ-02 defines tentative, cancelled, postponed. It does not define a separate **confirmed** state. Planning currently includes `confirmed`. That is an inference.  
**Ask:** After tentative (interest + budget), is there a later “confirmed” step, or does it stay tentative until it happens, cancels, or postpones?

**D. Separate related ceremonies vs separate events**  
OQ-04 also describes a cultural / honor-society / departmental ceremony as an additional **event** in the same timeframe. Planning allows `Ceremony.kind = related_group` **or** a second `Event`.  
**Ask:** Should those be child ceremonies of one engagement, or fully separate events that share a university color?

**E. Debrief rating scale**  
OQ-17 asks for a rating scale with “various metrics” but does not name the metrics.  
**Ask only if Chester wants specific scales before November.** Otherwise MVP can ship a small numeric scale plus the narrative questions he already listed, marked as a working assumption.

**F. Patriot onboarding field list**  
OQ-05 still contains `XXX` placeholders and points at Patriot’s HR module. Chester then listed many fields, which planning captured. The remaining gap is fields that exist in Patriot but were not listed.  
**Ask only if he wants a Patriot export/screenshot before we freeze the reader form.** Not a Phase 0 blocker.

---

## 12. Architecture risks

| Risk | Why it matters | Mitigation without inventing requirements |
|---|---|---|
| Calendar density | OQ-08 says it must remain readable; we do not have his sample | Phase 4 cannot be “done” until a sample or a live review with Chester |
| Wave/Patriot gap | Chester explicitly worried about SHOULD-HAVE integrations | Tracking-first; do not fake sync; keep external IDs |
| Dual ledgers | VTI tracking vs Wave official amounts will drift | UI copy must say “tracked in VTI — Wave is official” |
| Call Sheet grain / pay privacy | Event packet vs per-reader compensation | Do not implement Phase 5 until Q-A is answered or a written working assumption is accepted |
| Assignment vs ceremony | Possible rework of Assignment | Keep assignment at event+reader until Q-B is answered; expect possible join table later |
| Sensitive documents on cheap hosting | SSN, DL, receipts | Encrypted object storage; never ephemeral disk; least privilege |
| MVP too broad for November | Full lifecycle + calendar + mobile + money tracking | Follow `BUILD_PLAN.md`; do not add SHOULD integrations |
| Dashboard scheduled in Phase 8 | Chester’s success criterion is 360° visibility | Calendar in Phase 4 is the early visibility surface; dashboard consumes later data |
| Operational notes listed as SHOULD and as thin MVP | Internal planning inconsistency | Keep **thin event notes**, not a messenger (OQ-10 wants a platform option; COM-005 says chat is not critical if costly) |
| Insurance: BRD table SHOULD vs Chester “at the very least a reminder” | Label conflict | Reminder is MVP because Chester’s comment/§13 override the table; policy management stays out |
| University history: BRD UNI-009 SHOULD vs comment 8 “might be a MUST” on the calendar | Label conflict | Last-year snapshot on calendar/event is MVP; rich dossier stays SHOULD (comment 10: process first) |
| Email invites with $0 tooling | Readers must log in | Phase 1 can use copyable invite links; optional free transactional email later |
| “Confirmed” status inferred | May not match Chester’s language | Do not hard-wire business rules on `confirmed` until Q-C |
| Timezone | Not specified | Implementation assumption: store UTC, display a single US timezone — confirm at implementation, not a product invention |

---

## 13. Build sequence

From `docs/BUILD_PLAN.md`. This review finds it **logical** and low-rework **if** Phase 1 creates the full MVP schema (including Estimate, Invoice, ReaderCompensation, CallSheet versions) even when the UI arrives later.

```
0  Foundation (routes, tokens, admin/reader shells — no DB, no auth product)
1  Data + Authentication
2  Universities + Inquiries
3  Readers + Documents          (parallel with 2 after 1)
4  Events + Operational Calendar
5  Assignments + Call Sheets + packet files
6  Reader mobile experience
7  Expense approval + Debriefs
8  Billing/pay tracking + 360 dashboard
9  Polish + QA
10 November/December test deploy
```

Build-sequence notes (not a rewrite):

- Phases 2 and 3 may overlap after Phase 1.
- Calendar in Phase 4 will initially show events with empty reader slots; Phase 5 fills them. Acceptable.
- Do not delay schema for money objects until Phase 8 — only delay those **screens**.
- Dashboard in Phase 8 is correct as a **composed** view; the calendar is the earlier 360° working surface.
- Wave/Patriot adapters stay after Phase 10.
- Chester questions 1, 3, 4, 5, A, B block quality on Phases 4–6 more than they block Phase 0.

---

## 14. Definition of Done for MVP

The MVP is done when a real (or realistic) commencement engagement can be run end-to-end without spreadsheets as the operating system, and without claiming Wave/Patriot/bank integrations that do not exist.

**Chester can:**

- Sign in as the only admin
- See universities served, events, readers used, potential income, expenses, and work queues
- Run a new or returning university from inquiry through event-ready history
- Operate a dense month from the color-coded calendar, including last-year names/quote, logistics, notes, dinners, reader sidebar, and personal blocks
- Assign lead/reader/shadow and return a reader to the pool
- Issue Call Sheet v1 and v2 without destroying v1
- Attach university documents to the reader packet
- Approve expenses and compensation/reimbursement **explicitly**
- Track estimate → invoice billed/due/reminded/paid **as VTI tracking**, with Wave remaining official
- See insurance-due and ID-expiration reminders
- Retrieve last year’s names, pay, and quote when planning this year

**A reader can (phone):**

- Open the current Call Sheet and university instructions
- Accept/sign that version
- Capture receipts and submit an expense report
- Submit the debrief
- See own last-year / promised / paid / cashed
- View a permission-filtered calendar
- Not edit their profile, not see others’ sensitive data or others’ pay (unless Chester answers Q-A otherwise)

**The system:**

- Enforces two roles on every query and file download
- Encrypts and least-privileges SSN/DL/receipts
- Writes audit rows for sensitive views and payment approvals
- Does not auto-approve pay
- Does not include university login, native apps, AI, chat, Google Calendar SOT, Wave API, Patriot API, or Wells Fargo

---

## 15. Items explicitly deferred to post-MVP

- Native mobile apps
- University login / payment-and-history portal
- Reader profile self-edit; reader-editable calendar
- Sub-admin roles; business-associate pay-finisher as a product role (unless Chester answers Q9 that MVP needs a second admin)
- Full messaging; email ingestion
- Google Calendar sync
- Wave API; Patriot API; Wells Fargo
- Automated pay initiation
- AI summaries/extraction/recommendations (with proofs/retract; pay still always approved)
- Insurance policy-record integration
- Advanced analytics beyond the operational dashboard
- Replacing Wave or Patriot inside VTI
- GPS / live tracking
- Brand-perfect visual identity (non-priority)

Architecture seams that must remain, without building the features: role enum, `waveExternalId` / `patriotExternalId`, append-only Call Sheet versions, assignment-scoped files, notification table, adapter interfaces.

---

## Readiness verdict

| Question | Verdict |
|---|---|
| Planning faithful to sources? | **Yes**, with the contradictions and gaps listed above documented rather than hidden |
| MVP expanded beyond sources? | **No** |
| Future features removed from architecture? | **No** — seams only |
| Data model supports every MVP workflow? | **Yes, with open grain questions A/B** |
| Screen map supports every MVP workflow? | **Mostly yes; add named admin Reader directory, pay-approval queue, and audit visibility** |
| Build sequence minimizes rework? | **Yes**, if full schema lands in Phase 1 |
| Security represented? | **Yes** |
| Ready for Phase 0? | **Yes — foundation only** |
| Ready for Phase 1+ feature lock? | **Not fully.** Phase 1 may proceed with documented working assumptions, but Phase 4–6 should not be treated as locked until calendar sample, Call Sheet grain, assignment/ceremony grain, availability writer, reader calendar visibility, and signature method are answered or accepted in writing |

### Working assumptions allowed only if explicitly accepted (not treated as Chester’s words)

Use these solely so Phase 1 schema is not blocked. They remain tagged as assumptions:

1. Personal calendar events are admin-only.
2. MVP has a single payment approver (`VTI_ADMIN`).
3. No Wells Fargo.
4. November uses tracking-only Wave/Patriot.
5. Availability is admin-entered until readers are asked to submit it.
6. Reader calendar shows **assigned events only** until Chester chooses a broader filter.
7. Call Sheet acknowledgement can start as click-to-accept; drawn signature can be added without changing the acknowledgement table.
8. Do **not** assume event-level Call Sheets may display other readers’ pay.

Assumptions 5–8 are the ones most likely to be wrong. Prefer Chester’s answers.

---

## What to build first (when instructed)

**Phase 0 only:**

- Keep Next.js 15 / React 19 / TypeScript / App Router / Tailwind CSS 4
- Add `(admin)` and `(reader)` route groups and layout shells
- Establish typography/spacing/color tokens (restrained, not a generic dashboard kit)
- Do not add a database, Auth.js, npm dependencies beyond what Phase 0 truly needs, UI features, or sample business data presented as the product

Stop after Phase 0 until the next instruction. Do not auto-start Phase 1.
