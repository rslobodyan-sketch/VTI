# VTI MVP — Chester Demo Runbook

## Purpose

This is the client walkthrough for the VTI Operations MVP. The goal is to show how VTI's operational work moves through one connected lifecycle and how the system gives Chester a single place to see what needs attention.

**Positioning:** demo-ready operational MVP. It is not presented as a production-integrated system.

## Before Chester joins

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Open **Account** and choose **Clear session changes**.
4. Confirm the seed/demo workspace is restored.
5. Do not create new test records before the meeting.
6. Keep the browser at a normal desktop width.

## The 12-minute walkthrough

### 1. Dashboard — the control center

Open **Dashboard**.

Say:
> "This is the operational view of the business. Instead of remembering what is outstanding across spreadsheets, email and calendars, the first screen is built around what needs attention."

Show:
- Needs attention
- Open tasks
- Recent activity
- Upcoming events
- Assignments requiring attention
- Inquiry pipeline
- Reader availability
- Payment tracking

### 2. Calendar — operational projection

Open **Calendar**.

Say:
> "The calendar is the operational projection. The event record remains the source of truth, while the calendar gives you the visual schedule and conflicts in one place."

Show:
- University color coding
- Confirmed / tentative / personal indicators
- Ceremony timing
- Reader availability and conflicts
- Personal/external commitments

### 3. University → inquiry → event

Open **Inquiries** and show a university moving through its lifecycle.

Say:
> "A university starts as an inquiry and can move through qualification to a won relationship. From there, the event is created against that university rather than recreating the information."

If you want to demonstrate the flow, use the existing demo workflow rather than inventing a new story during the meeting.

### 4. Event Control Center — the operational hub

Open a representative event.

Say:
> "The event is the center of the operation. Staffing, ceremonies, travel, the Call Sheet, documents, financial tracking, tasks and activity all meet here."

Show the readiness area first, then:
- Ceremonies
- Staffing
- Travel
- Call Sheet
- Documents
- Financial summary
- Tasks
- Activity
- Debrief

### 5. Reader experience

Switch to the Reader view.

Say:
> "The reader sees only what they need for their assignments. They don't get the administrative financial history or other readers' information."

Show:
- Assignment
- Compensation for the current assignment
- Call Sheet
- Calendar
- Expenses
- Debrief
- Profile

### 6. Call Sheet

Open the Call Sheet.

Say:
> "The Call Sheet is generated from the event and assignment information rather than being a separate manual packet. The reader can acknowledge the issued version, and the current version is visible to operations."

### 7. Expenses and payments

Show Reader → Expenses, then Admin → Payments / Financial.

Say:
> "Readers can submit expenses against a job. Chester reviews and approves them, and the MVP tracks the payment lifecycle."

Be explicit if asked:
> "The MVP tracks this workflow locally. Wave, Patriot and bank feeds are intentionally not connected yet."

## If Chester asks about integrations

Use this exact framing:

> "The workflow is designed around the future production systems of record. This MVP proves the operational workflow first. Wave, Patriot, authentication, production storage and bank connectivity are the next production layer rather than being faked inside the demo."

## If Chester asks about security

Use:

> "The MVP demonstrates the permission model and keeps sensitive reader information out of the reader packet. Production deployment will add authenticated accounts, encrypted storage, database controls and audit infrastructure."

## If Chester asks what is still undecided

Ask only the questions that affect the workflow:

1. How should reader availability be maintained?
2. How should Call Sheet acknowledgement work — click-to-accept, signature, or both?
3. How should name lists be delivered and tracked?
4. What is the exact calendar density/hierarchy Chester wants?
5. How is a check considered cashed today?
6. Who is the second payment approver, if anyone?
7. How should November Wave/Patriot information be represented before live integrations?
8. What Wells Fargo information should be tracked or eventually connected?

Do not invent answers during the demo.

## Do not demo

Do not spend time on:
- Settings internals
- Development tooling
- Future AI features
- Live accounting claims
- Live bank claims
- Production security claims
- Native mobile app claims

## Closing question

End with:

> "If this were your Monday-morning operations screen, what is the first thing you would want to change or add?"

That turns the meeting into product validation rather than a feature checklist.

## Reset after the demo

Use **Account → Clear session changes** to return the workspace to the clean seed/demo story.
