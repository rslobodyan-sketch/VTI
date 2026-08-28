# VTI Operations Platform — UI / Screen Map

Screens are an inventory for later design/build. **Do not build UI in this phase.**

Priority key: **MVP** · **POST-MVP** · **CONFIRMATION** (depends on a Chester question)

Reader mobile screens are a separate information architecture, not the admin desktop squeezed onto a phone.

---

## PUBLIC

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Login / invite landing | Admin, Reader | Enter the operations platform | MVP | Sign in; accept invite; set password | VTI identity, no marketing clutter |
| Public marketing site | Anonymous | Not required to operate VTI | OUT OF SCOPE unless Chester later asks | — | — |

---

## AUTHENTICATION

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Sign in | All | Session | MVP | Email + password | Error states only |
| Set password from invite | Reader (and any new admin) | First access | MVP | Set password | Invite validity |
| Reset password | All | Account recovery | MVP | Request / set | — |
| Sign out | All | End session | MVP | Sign out | — |

No social login. No university registration.

---

## VTI ADMIN

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Operational dashboard | Chester | 360° / 35,000-ft view | MVP | Jump to event, expense, invoice, insurance due, expiring ID | Universities served; events total; readers utilized; potential income; expenses; queues (upcoming, blocked, pending expenses, unpaid, reminders) |
| Admin home empty/error states | Chester | Honest operational states | MVP | Create inquiry / event | No decorative widgets |
| Global search | Chester | Find university, reader, event | SHOULD | Search | Restricted: no SSN in results |

---

## CLIENT / UNIVERSITY

MVP is **admin-operated**. There is no university portal.

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| University list | Admin | All clients | MVP | Filter active/prospect; open | Status, returning flag, next event |
| University record | Admin | 360° of one university | MVP | Edit notes; add contact; create inquiry/event; view history | Contacts, pipeline, events, last-year names/pay/quote, insurance, billing timeline, event-ready, work-again recommendation |
| New university / inquiry form | Admin | Log email-form interest | MVP | Save; set stage; set next action | Contact name, email, university, department, notes, status (OQ-01) |
| Inquiry board / pipeline | Admin | Movement through stages | MVP | Change stage | initial → conversation → admin approval → coordinator logistics → closed |
| Returning-year interest | Admin | Checkbox interest/commitment | MVP | Toggle; note budget-approval still required | OQ-01 |
| University history dossier | Admin | Multi-year depth | SHOULD | Browse prior events | Comment 10: nice; process-first. Last-year snapshot still lives on calendar/event (MUST) |
| University login: payments & past events | University | Self-service history | POST-MVP | View | OQ-09 left this open |
| University insurance panel | Admin | Annual requirement | MVP | Set due date; mark accepted/change needed | Reminder date, year, status |

---

## READER / MOBILE

First-class phone experience. Large tap targets. One assignment at a time on the home surface.

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Reader home | Reader | Today / next job | MVP | Open assignment | Next ceremony time, Call Sheet status, expense status |
| My assignments | Reader | List | MVP | Open | Date, university, role (lead/shadow), status |
| Assignment hub | Reader | Single place to execute | MVP | Open Call Sheet; files; expenses; debrief | Schedule, venue, lead, version status |
| Call Sheet (mobile) | Reader | Execute the job | MVP | View; accept/sign; switch versions | Instructions, times, travel, hotel, pay, legal |
| University instructions / files | Reader | Name list and university docs | MVP | Open/download | Current files only |
| Capture receipt | Reader | Camera/upload | MVP | Take photo; attach to line | Amount later on report |
| Expense report (mobile) | Reader | Submit costs | MVP | Add lines; submit; see status | Assignment-scoped |
| Debrief form (mobile) | Reader | Post-event report | MVP | Answer questions; rate; submit | Event, other readers, staff, problems, plan vs execution |
| My pay | Reader | Compensation visibility | MVP | View | Last year paid; promised this year; paid date; check cashed |
| My profile (read-only) | Reader | See own record | MVP | View only | Non-sensitive fields; no SSN/DL images |
| Reader calendar (view) | Reader | Permission-filtered month | MVP | View; open own assignment | **CONFIRMATION:** exact visibility rules |
| In-app chat | Reader | Private/group messaging | POST-MVP / SHOULD if cheap later | — | COM-005: not critical if costly |
| Edit my profile / documents | Reader | Self-update | POST-MVP | — | OQ-07: not initially |
| Native app shells | Reader | iOS/Android | POST-MVP | — | Prove web first |

---

## CALENDAR

This is Chester’s primary operating surface (OQ-08). Designed for a computer monitor; must remain readable when a month is dense. Not a Google Calendar clone.

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Monthly operational calendar | Admin | One-page month | MVP | Open event; add note; add personal block; assign | University, readers, ceremony times, names this year vs last year, quote this year vs last year, lead reader, hotel/transport/airfare and costs/credits, notations, dinners/functions in university color |
| Reader availability sidebar | Admin | Who can still be used | MVP | Open reader | Available vs unavailable |
| Calendar event popover | Admin | Dense details without leaving month | MVP | Edit logistics; open full event | Same fields as month cell, expanded |
| Personal events | Admin | Show Chester booked/available | MVP | Add/edit personal block | **CONFIRMATION:** hidden from readers |
| Reader month view | Reader | Filtered, read-only | MVP | Open own assignment | No edit (option later) |
| Google Calendar sync settings | Admin | Optional sync | POST-MVP | — | SCH-004; Chester prefers purpose-built |

---

## EVENTS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Event list | Admin | All engagements | MVP | Filter status; open | Tentative/confirmed/postponed/cancelled |
| Event record | Admin | Hub for one commencement engagement | MVP | Edit; add ceremony; assign; issue Call Sheet; attach files | University, status rules (OQ-02), names, quote, last year, logistics, readers, billing, debrief |
| Ceremony editor | Admin | Multiple sessions | MVP | Add date/time/venue/call time/sound-check | Related group ceremonies allowed |
| Event status change | Admin | Tentative / confirm / postpone / cancel | MVP | Change with reason | Walk-away anytime; postpone = weather/force majeure |
| Logistics panel | Admin | Travel, hotel, rideshare | MVP | Edit; amounts | Surfaces on calendar and Call Sheet |

---

## ASSIGNMENTS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Assignment board for an event | Admin | Who is on the job | MVP | Assign; set lead/shadow; release to pool | Sound/geography/veteran notes to support Chester’s judgment — system does not auto-pick |
| Offer / assignment status | Admin | Track acceptance | MVP | Mark offered/accepted/released | Mutual retract; return to pool (OQ-04) |
| Reader picker | Admin | Matching support | MVP | Filter available; choose | Availability, geography, sound notes, veteran-first; **Chester decides** |
| Assignment detail | Admin | Connection point | MVP | Open Call Sheet, expenses, debrief, docs | Central object (Discovery) |
| Logistics status | Admin | Simple reader status | SHOULD | Set status | Not GPS |

---

## CALL SHEETS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Call Sheet editor | Admin | Structured packet | MVP | Generate from event data; edit; issue version | Talent, schedule, compensation, travel, hotel, transfer, instructions, legal |
| Call Sheet version history | Admin | Auditable versions | MVP | View prior; issue new | Chester: remain versioned |
| Call Sheet preview / print | Admin, Reader | Legal-operational document | SHOULD | Print | Same content as issued version |
| Reader acceptance | Reader | Contract acknowledgement | MVP | Accept / sign | **CONFIRMATION:** click vs drawn signature |
| Call Sheet list | Admin | Issued packets | MVP | Filter unsigned | Version, event, reader ack state |

---

## EXPENSES

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Expense inbox | Admin | Review submissions | MVP | Approve / reject / request change | Reader, event, total, receipts |
| Expense report detail | Admin, Reader | One report | MVP | Review images; set status | Lines, receipts, reimbursement status |
| Receipt lightbox | Admin, Reader | Verify image | MVP | Next/prev | No sharing to email |
| Reimbursement status | Admin, Reader | Track payout | MVP | Admin: mark paid/cashed | Tied to ReaderCompensation |

---

## COMMUNICATIONS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Event notes | Admin, assigned Reader | Operational context | MVP (lightweight) | Add note; set visibility | Not a messenger |
| University communication log | Admin | Email + platform option | SHOULD | Log email summary | OQ-10 |
| Private/group messaging | Admin, Reader | Chat | POST-MVP | — | Not critical if costly |
| Reader ↔ coordinator chat | Reader, University | Direct | POST-MVP | — | Requires policy; university has no login now |

---

## DEBRIEFS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Debrief form | Reader | Post-event questions | MVP | Submit | Event, other readers, staff, problems, plan vs execution, ratings (OQ-17) |
| Event debrief rollup | Admin | Prepare university follow-up | MVP | Mark work-again; event ready | Combined reader reports |
| “Event ready” indicator | Admin | Subsequent-year planning | MVP | Auto from recommendation + visible on university/calendar | OQ-17 |

---

## DOCUMENTS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Reader documents (admin) | Admin | DL, passport, NDA | MVP | Upload; set expiry; mark NDA signed | Expiry, status; SSN not displayed as a file |
| Expiring documents queue | Admin | Renewals | MVP | Open reader | DL/passport |
| Event packet files | Admin | University docs / name lists | MVP | Upload; share with assigned readers | Comment 5 |
| Secure file download | Admin, assigned Reader | Least-privilege fetch | MVP | Download | Audit view/download |
| Reader self-upload of IDs | Reader | Self-serve onboarding files | POST-MVP | — | OQ-07 |

---

## SETTINGS

| Screen | Primary user | Purpose | Priority | Major actions | Important information |
|---|---|---|---|---|---|
| Admin settings | Admin | University colors, reminder defaults | MVP | Set color per university; insurance lead time | Calendar readability |
| Invite user | Admin | Create reader login | MVP | Send invite | Email, role |
| Brand / color scheme | Admin | Match VTI | SHOULD / low | Tokens | Comment 16: non-priority |
| Wave connection | Admin | Ledger sync | POST-MVP / SHOULD after API validation | Connect | Wave remains SOT |
| Patriot connection | Admin | HR/pay sync | POST-MVP / SHOULD after API validation | Connect | Patriot remains SOT |
| Sub-admin roles | Admin | Extra operators | POST-MVP | — | Not current scope |
| AI automation controls | Admin | What may auto-run | POST-MVP | Enable/retract | Payments always manual |
| Retention policy | Admin | 4–7 year document rules | CONFIRMATION at implementation | — | OQ-14: follow IRS/privacy; exact per-type table still practical to confirm |

---

## Admin vs reader: same objects, different screens

| Object | Admin screen | Reader screen |
|---|---|---|
| Calendar | Dense month + sidebar | Filtered read-only |
| Assignment | Board + matching | Hub on phone |
| Call Sheet | Editor + versions | Readable contract |
| Expenses | Inbox + approval | Camera + form |
| Pay | Approve / track all | Own history |
| Profile | Full onboarding including sensitive | Read-only non-sensitive |
| University | Full CRM | Not visible as CRM; only packet info for assigned job |
