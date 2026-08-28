# VTI Operations Platform — Build Plan

Implementation sequence for a usable November/December test, then January/February correction, then March–August commencement season (OQ-19).

This is a plan only. **Do not write application code, install packages, create a database, or connect APIs in the current phase.**

Principles:

- Vertical slice over disconnected screens
- Calendar, assignment, Call Sheet, and reader phone path are the heart of the demo
- Wave and Patriot stay sources of truth; adapters come after API validation
- Automation is reminders and pre-fill, never silent payment
- No university portal, no native app, no chat product in these phases

---

## PHASE 0 — Foundation

**Objective:** Make the existing Next.js 15 app a professional shell with roles, without real business data yet.

**Screens:** App frames for Admin and Reader (empty routes), login placeholder routing only when Phase 1 lands.

**Functionality:**

- Route groups `(admin)` and `(reader)`
- Design tokens (typography, spacing, color — VTI brand if provided, otherwise a restrained professional palette)
- No generic dashboard kit

**Dependencies:** Current starter app (`npm run build` already passing).

**Acceptance:**

- Role layouts exist as structure
- Starter marketing page is not the product
- Still no production database requirement until Phase 1

---

## PHASE 1 — Data + Authentication

**Objective:** Invite-only login and the schema needed for the lifecycle.

**Screens:** Sign in, invite/set password, reset password, sign out.

**Functionality:**

- PostgreSQL schema for MVP entities in `DATA_MODEL.md`
- Auth.js sessions
- Roles `VTI_ADMIN` and `READER`
- Encrypted file metadata table
- Audit log table
- Seed Chester as admin

**Dependencies:** Phase 0; hosting/secrets decision at deploy time.

**Acceptance:**

- Chester can sign in
- A reader can sign in only after invite
- Unauthenticated users cannot hit admin or reader routes
- Sensitive columns exist and are not logged in plaintext

---

## PHASE 2 — Universities + Inquiries + University record

**Objective:** Move inquiry knowledge out of Chester’s head.

**Screens:** University list, university record, inquiry form, inquiry pipeline, insurance panel (due dates).

**Functionality:**

- Log contact name, email, university, department, notes, stage
- Returning interest/commitment checkbox
- Contacts (initial vs commencement coordinator)
- Next action visible
- Annual insurance due date + status

**Dependencies:** Phase 1.

**Acceptance:**

- New inquiry can be captured and moved through OQ-01 stages
- Returning university can be marked interested/committed without a fake “new client” flow
- University record shows notes and insurance reminder fields

---

## PHASE 3 — Readers + Onboarding + Documents

**Objective:** Reader records Chester can actually assign from, with sensitive data protected.

**Screens:** Reader list, reader record (admin), read-only reader profile (mobile-capable), document upload, expiring-document queue, invite reader.

**Functionality:**

- Fields from OQ-05/06 (contractor vs legal name, tax category, EIN/SSN encrypted, addresses including previous, emergency contact, travel prefs, sound notes, NDA status, optional fields)
- DL/passport with expiration
- Readers cannot edit after onboarding
- Admin-only access to sensitive files

**Dependencies:** Phase 1.

**Acceptance:**

- Chester can onboard a reader to “ready”
- Reader can view a non-sensitive profile and cannot edit it
- SSN/DL are not shown in lists or notifications
- Expired/expiring IDs appear in a queue

---

## PHASE 4 — Events + Ceremonies + Operational Calendar

**Objective:** Chester’s real operating surface.

**Screens:** Event list/record, ceremony editor, logistics panel, **monthly operational calendar**, availability sidebar, personal events, calendar notes.

**Functionality:**

- Event statuses: tentative / confirmed / postponed / cancelled (OQ-02 rules)
- Multiple ceremonies; related group events
- Color by university; consecutive-day span
- This year vs last year names and quote
- Hotel / transport / airfare / costs / credits
- Dinners/functions in the same color
- Available vs unavailable readers sidebar
- Chester personal blocks
- Readable dense month (iterate with Chester’s sample if provided)

**Dependencies:** Phases 2–3 (university + readers). Availability model from Phase 3/4.

**Acceptance:**

- A month of real-shaped data is usable on a desktop monitor without squinting as the failure mode
- Clicking a calendar item opens the event
- Last-year snapshot is visible on the month view
- Readers cannot edit the calendar

---

## PHASE 5 — Assignments + Call Sheets + Packet files

**Objective:** The assignment becomes the hub; Call Sheet becomes the legal-operational artifact.

**Screens:** Assignment board, reader picker, assignment detail, Call Sheet editor, version history, event packet files, reader acceptance (wired in Phase 6 UI).

**Functionality:**

- Multiple readers; lead / reader / shadow
- Release back to pool
- Generate Call Sheet from structured data (CAL-002–005)
- Version on each issue
- Attach university documents / name lists for assigned readers
- Acknowledgement record per version

**Dependencies:** Phase 4.

**Acceptance:**

- Chester assigns a lead and a shadow without deleting history when releasing someone
- Issuing v2 does not destroy v1
- Packet files are only visible to assigned readers + admin
- Matching tools **inform** Chester; they do not auto-assign

---

## PHASE 6 — Reader Mobile Experience

**Objective:** OQ-20 minimum: Call Sheet, university instructions, receipts, expense report — excellent on a phone.

**Screens:** Reader home, assignments, assignment hub, mobile Call Sheet, files, receipt capture, expense form, filtered calendar view, my pay (stub ok until Phase 8).

**Functionality:**

- Mobile-first reader IA
- Accept/sign current Call Sheet version
- Camera/upload receipt
- Draft/submit expense report
- Permission-filtered calendar (per Chester’s answer to Q5)

**Dependencies:** Phase 5; expense tables may land here and be approved in Phase 7.

**Acceptance:**

- A reader can complete the event path on a phone-sized viewport without using admin screens
- Call Sheet and instructions are the first actions, not buried in a dashboard
- Profile remains read-only

---

## PHASE 7 — Expense Approval + Debriefs + History write-back

**Objective:** Close the post-event loop Chester uses when he talks to a university.

**Screens:** Admin expense inbox, expense detail, debrief form, event debrief rollup, work-again / event-ready on university and event.

**Functionality:**

- Approve/reject expenses; reimbursement status
- Debrief questions from OQ-17
- Recommendation to work again → event-ready
- History fields populated for next year’s calendar

**Dependencies:** Phase 6.

**Acceptance:**

- Submitted expenses appear in Chester’s queue
- A completed debrief is visible on the university record
- Event-ready is visible for subsequent planning

---

## PHASE 8 — Billing tracking + Reader pay ledger + 360 Dashboard

**Objective:** Money visibility without replacing Wave or Patriot.

**Screens:** Estimate/invoice tracking on university/event, billing timeline, reader compensation (promised/paid/cashed), payment approval, operational dashboard KPIs.

**Functionality:**

- Estimate (Stage 2) that can later become an invoice **tracking** record
- Billed / due / reminded / paid / amount
- Reader last-year pay, promised this year, paid, cashed (manual cashed if needed)
- Every pay/reimbursement requires admin approval
- Dashboard: universities served, events, readers utilized, potential income, expenses, plus operational queues

**Dependencies:** Phases 2–7 data.

**Acceptance:**

- Chester can see operational money status without opening a spreadsheet
- Wave is still where official invoices/GL live (manual entry acceptable)
- No payment is marked approved without an explicit admin action
- Dashboard is useful, not decorative

**Explicitly not this phase:** Wave API, Patriot API, Wells Fargo.

---

## PHASE 9 — Polish + QA

**Objective:** Professional product quality for the November test.

**Screens:** All MVP screens; empty, error, and dense-calendar states.

**Functionality:**

- Calendar readability pass
- Reader mobile pass (thumb reach, Call Sheet readability)
- Permission tests (reader cannot see other pay, SSN, full calendar)
- File download authorization tests
- Audit log spot-check
- Reminder notifications (insurance, ID expiry, unsigned Call Sheet)
- Print stylesheet for Call Sheet

**Dependencies:** Phases 1–8.

**Acceptance:**

- Walkthrough of `USER_FLOWS.md` demo path succeeds
- Sensitive values absent from notifications and reader UI
- `npm run build` and lint pass
- Phone and desktop both verified for the screens each role actually uses

---

## PHASE 10 — Deployment (November test)

**Objective:** Host the MVP for real readers on November/December events.

**Screens:** Production login.

**Functionality:**

- HTTPS production host
- Postgres backups
- Encrypted file store (not ephemeral disk)
- Invite real readers
- Chester operating calendar live
- Documented fallback: Wave and Patriot still used manually

**Dependencies:** Phase 9; Chester confirmation on Q8 (tracking-first).

**Acceptance:**

- Assigned readers open Call Sheets and submit expenses from their phones at a real event
- Chester runs the month from the operational calendar
- Issues are logged for January/February correction

---

## After Phase 10 (not MVP build)

Only if November test succeeds and Chester still wants them:

1. Wave adapter (if API/licensing acceptable)
2. Patriot adapter (if API/licensing acceptable)
3. University history portal (OQ-09 later)
4. In-app messaging if still desired and not costly
5. Native app if web is insufficient
6. Controlled AI summaries/reminders
7. Sub-admin role

---

## Suggested dependency order (summary)

```
0 Foundation
    → 1 Data + Auth
        → 2 Universities/Inquiries
        → 3 Readers/Documents
            → 4 Events + Calendar
                → 5 Assignments + Call Sheets
                    → 6 Reader mobile
                        → 7 Expenses approval + Debriefs
                            → 8 Billing tracking + Pay ledger + Dashboard
                                → 9 Polish/QA
                                    → 10 November deploy
```

Phases 2 and 3 can overlap after Phase 1. Phase 8 dashboard KPIs can be stubbed earlier but only become meaningful once events, pay, and expenses exist.

---

## What “done for MVP” means

Chester can:

1. See the business from the dashboard and the month calendar
2. Run a university from inquiry (or returning interest) to event-ready history
3. Assign readers without losing them from the pool forever
4. Issue a versioned Call Sheet
5. Have readers execute on a phone
6. Approve expenses and pay **himself**
7. Track invoices without pretending VTI is Wave

Readers can:

1. Open the current Call Sheet and university instructions
2. Accept that version
3. Capture receipts and submit expenses
4. Submit a debrief
5. See their own promised/paid history
