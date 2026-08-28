# VTI Operations Platform — User Flows

Source priority: latest BRD (including Chester’s §13 answers and Word comments), then Discovery Summary.

Universities do **not** log into the MVP (OQ-09). Their “workflow” is operated by Chester. A future university login for payment/event history is left open.

---

## Lifecycle backbone

```
Inquiry
  → Qualification / interest (estimate may appear here — Chester: closer to Stage 2)
    → Event + ceremonies on the operational calendar
      → Reader availability
        → Assignment (lead / reader / shadow; veteran-first; Chester final say)
          → Call Sheet issued (versioned; reader accepts/signs)
            → Travel / event execution
              → Expenses + receipts
                → Debrief
                  → Invoice / payment tracking (Wave is ledger SOT)
                    → Historical record + “event ready”
```

Not every stage is a university-facing screen. Most stages are admin + reader.

---

## A. VTI Admin / Chester

Chester is the primary daily user. He owns universities, readers, assignments, financial tracking, and oversight.

### A1. Capture a new university inquiry

1. Interest arrives (today: email interest form).
2. Chester logs: contact name, email, university name, department, notes, status.
3. Stage: **initial inquiry**.
4. Next action is visible on the dashboard (follow up / schedule call).

**MVP:** Manual entry. Email ingestion is optional/future.

### A2. Qualify and align needs

1. Longer phone conversation: needs identified, goals aligned.
2. Stage: **needs conversation**.
3. Major movement after this is usually dictated by university administration approvals.
4. Stage: **pending admin approval**.
5. Contact may remain the same person or move to the commencement coordinator.
6. Stage: **coordinator logistics**.
7. Estimate may be generated here (Stage 2), stored in VTI, and entered in Wave (SOT).

**Event status:** remains unconfirmed until the coordinator confirms interest **and** a budget is available → **tentative**.

### A3. Returning university

1. Chester records interest and/or commitment for the following year (checkbox).
2. Budget approval may still be required.
3. Repeatable workflow: calendar, readers, Call Sheet, billing, history — not a blank inquiry.

### A4. Place the event on the calendar

1. If VTI is interested/available, create Event + Ceremony(s).
2. Month view shows university color across consecutive days.
3. Enter this year’s estimated names and quote; last year’s names and quote if known.
4. Enter hotel, transportation, airfare, costs, refunds/credits as they become known.
5. Add notations and team dinners/functions in the same color.
6. Sidebar shows available vs unavailable readers.
7. Chester adds personal events so he can see his own booked times.

Google Calendar is not the operating surface.

### A5. Assess availability and assign readers

1. Matching criteria: sound, university preference (male/female/specific sound), availability, geography.
2. Experience determines lead reader.
3. Veteran readers usually get first choice.
4. New readers may shadow a lead so they can become the reader for that university later.
5. Chester has final say.
6. Multiple readers and multiple ceremonies are allowed.
7. If a reader cannot do the job, Chester releases them back to the pool.

### A6. Prepare assignment packet

1. Attach university documents the reader needs (instructions, name lists when available).
2. Generate Call Sheet from structured event/assignment/logistics data.
3. Issue version 1 securely to assigned readers.
4. Later changes create version 2+; prior versions remain.
5. Track reader acknowledgement/signature.

### A7. Watch execution

1. Dashboard / calendar show upcoming, active, blocked, completed work.
2. Logistics status is a simple field if useful (not GPS).
3. Operational notes can be recorded on the event.
4. Insurance due dates and document expirations appear as reminders.

### A8. Expenses and reader pay

1. Reader submits receipts + expense report.
2. Chester reviews/approves/rejects.
3. Reimbursement and compensation appear as promised / pending approval / paid / cashed.
4. **Every payment requires Chester’s approval.**
5. If Patriot is integrated later, approve-and-queue can initiate pay; if not, tracking is enough.

### A9. Bill the university

1. Estimate already exists (possibly from Stage 2).
2. Convert/track invoice: billed date, due date, reminder, paid date, amount.
3. Wave remains where the invoice and general ledger reside.
4. VTI dashboard shows operational money status (potential income and expenses).

### A10. Debrief and history

1. Readers submit debrief answers and ratings.
2. Chester records whether to work with the university again.
3. System marks the university/event **event ready** for subsequent events when appropriate.
4. Next year, calendar and university record still show last year’s names, pay, and quote.

### A11. Annual compliance

1. University insurance: annual reminder; Chester verifies; usually accepted unless a change is needed.
2. Reader DL/passport expirations: reminders.

---

## B. Reader / Subcontractor

Readers should not learn a complicated enterprise system. Mobile-first. They cannot edit their profile after onboarding (OQ-07).

### B1. Access

1. Chester (or Patriot-informed admin process) creates the reader record and invite.
2. Reader sets a password and lands on a simple home: next assignment, outstanding Call Sheet, draft expenses.

Self-serve public signup is out of scope.

### B2. View profile (read-only)

1. Reader can see a non-sensitive summary (name, contact, assignment history, own pay history).
2. Reader cannot change onboarding fields, SSN, addresses, or documents in MVP.
3. Pay history: last year paid, promised this year, when paid, when check cashed (Chester comment 11).

### B3. See schedule

1. Permission-filtered calendar, view only.
2. Cannot see the entire admin calendar.
3. **NEEDS CHESTER CONFIRMATION:** exact filter (assigned events only vs. limited fields on more events).
4. Calendar not editable by readers (option later).

### B4. Receive assignment and Call Sheet (minimum mobile experience)

1. Assignment appears.
2. Reader opens Call Sheet: talent, schedule, compensation, travel, hotel, rideshare, call times, sound-check, dress, preparation, expense rules, legal/confidentiality, debrief instructions.
3. Reader opens university instructions / name list files.
4. Reader accepts/signs the Call Sheet version.
5. If a new version is issued, reader is notified and must view/accept the new version.

This is OQ-20: Call Sheet + critical university information + how to execute the task.

### B5. Execute the event

1. Use Call Sheet and instructions on the phone during travel and on site.
2. Optional logistics check-in is not GPS tracking.

### B6. Capture expenses

1. Photograph receipts.
2. Fill expense report against the assignment.
3. Submit.
4. See approval / reimbursement status.

### B7. Debrief

1. After the event, answer: thoughts on the event, other readers, university staff, problems/conflicts, plan vs execution, ratings.
2. Submit. Chester uses this for the university debrief and “event ready.”

### B8. Communications

1. MVP: read Call Sheet, documents, and any event notes Chester makes visible.
2. Full private/group chat is SHOULD and not required if costly.
3. University coordinator chat is not a university-login feature in MVP; Chester remains operator.

---

## C. University / Client

**MVP: no login.** Chester operates this side (OQ-09, comment 4: only VTI access at this point).

What the university experiences in the real world, as recorded in the BRD:

1. Sends interest (email form).
2. Phone conversation on needs/goals.
3. Internal administrative approvals (often slow; this is the main stage gate).
4. Hands off to commencement coordinator for logistics.
5. Confirms interest and budget → event becomes tentative.
6. May walk away at any time (cancel).
7. Weather/force majeure may postpone.
8. Receives estimate / invoice via current practice (Wave).
9. Provides documents/instructions readers need (Chester attaches them).
10. Event occurs.
11. Chester uses reader debriefs and history in follow-up.

**Future (explicitly left open):** university login to check payment history and past events.

**Communication:** remains email, with VTI also able to log the same thread on the university/event so a later in-platform option exists (OQ-10).

---

## Stage-by-stage: MVP vs later

| Stage | In MVP? | Primary actor |
|---|---|---|
| 1. Inquiry logged | MUST | Admin |
| 2. Qualification / estimate | MUST (estimate tracking; Wave entry may still be manual) | Admin |
| 3. Event planning + calendar | MUST | Admin |
| 4. Reader matching | MUST | Admin |
| 5. Call Sheet + packet | MUST | Admin issues; Reader accepts |
| 6. Travel & event | MUST (visibility + reader access to packet) | Admin + Reader |
| 7. Expenses | MUST | Reader submit; Admin approve |
| 8. Billing/payment | MUST tracking; Wave SOT; live sync SHOULD | Admin |
| 9. Debrief | MUST | Reader + Admin |
| 10. History | MUST last-year snapshot + notes | Admin |
| University self-service | POST-MVP | — |
| Native app | POST-MVP | — |
| In-app messenger | SHOULD / later | — |
| AI recommendations | POST-MVP (constraint: never silent pay) | — |

---

## Flow that must work as one product (demo path)

A professional MVP demo is this single story, not isolated screens:

1. Returning or new university inquiry appears in the pipeline.
2. Chester opens the month calendar and sees last year vs this year on the same event.
3. Sidebar shows who is free; he assigns a lead and a shadow.
4. He issues Call Sheet v1 with travel/hotel and university instructions.
5. The reader, on a phone, opens it, accepts it, later photographs a receipt, submits expenses, and files a debrief.
6. Chester approves reimbursement (human approval), marks invoice paid (tracked; Wave remains ledger), and sees the university as event-ready.
7. Dashboard totals universities, events, readers, potential income, and expenses.
