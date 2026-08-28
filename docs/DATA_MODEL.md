# VTI Operations Platform — Data Model

**Status:** Logical model only. No database will be created in this phase.

Entities below are included only if the BRD, Chester’s comments, or a clearly necessary implementation of a documented requirement supports them.

Money: integer cents. Timestamps: UTC. Sensitive fields: encrypted at rest; omitted from logs.

---

## Role of this model vs. Wave / Patriot

| Data | Lives in VTI | Source of truth |
|---|---|---|
| Inquiries, events, calendar, assignments, Call Sheets, expenses, debriefs, operational notes | Yes | VTI |
| Estimates, invoices, GL | Tracking copy in VTI | **Wave** (OQ-12) |
| Reader master profile, NDA/financial compliance, payroll/subcontractor records | Operational copy in VTI | **Patriot** (OQ-13) |

---

## MVP entities

### User

**Purpose:** Login identity and role.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id | |
| email | Unique, login |
| passwordHash | Or magic-link token store |
| role | `VTI_ADMIN` \| `READER` |
| displayName | |
| isActive | |
| invitedAt / lastLoginAt | |
| createdAt / updatedAt | |

**Relationships:** 0..1 ReaderProfile; created audit rows; notifications.

---

### ReaderProfile

**Purpose:** Subcontractor / talent record used for matching, onboarding, logistics, and pay.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, userId | User is view-only for this data (OQ-07) |
| contractorName | How they work with VTI |
| legalName | Legal / LLC name |
| compensationCategory | Non-employee compensation / non-1099 / other income (OQ-06) |
| businessType | Mandatory (OQ-06) |
| taxIdType | EIN or SSN |
| taxIdEncrypted | Mandatory identification number |
| dateOfBirthEncrypted | |
| primaryPhone, email | Contact mandatory |
| shirtSize | |
| airlinePreference, seatPreference, ktnEncrypted | Travel |
| soundNotes | Type of sound; matching criterion (OQ-03, OQ-06) |
| geographyNotes | Matching |
| veteranStatus / firstChoiceEligible | Veteran readers usually get first choice (OQ-03) |
| leadershipAssessment, workStylePreference | Optional |
| dietaryRestrictions, pronounOrNickname, hobbies | Optional |
| onboardingStatus | Not started / in progress / ready / blocked |
| ndaSigned, ndaSignedAt | |
| patriotExternalId | Nullable |
| notes | Chester’s onboarding notes |
| createdAt / updatedAt | |

**Relationships:** User; addresses; emergency contacts; documents; assignments; availability; compensation records.

---

### ReaderAddress

**Purpose:** Current, secondary, and previous addresses (OQ-06: look up previous addresses quickly).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, readerId | |
| kind | primary / secondary / previous |
| line1, line2, city, region, postalCode, country | |
| validFrom / validTo | Optional |

---

### EmergencyContact

**Purpose:** Required onboarding field (OQ-06).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, readerId | |
| name, relationship, phone, email | |

---

### Client (University)

**Purpose:** University / client organization.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id | |
| name | |
| kind | University or other client if needed; VTI materials are university-centric |
| status | prospect / active / inactive |
| isReturning | |
| notes | |
| createdAt / updatedAt | |

**Relationships:** contacts; inquiries; events; insurance requirements; estimates/invoices.

---

### ClientContact

**Purpose:** People Chester actually talks to (inquiry contact vs. later commencement coordinator).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, clientId | |
| name, email, phone | |
| department | OQ-01 |
| roleTitle | e.g. initial contact, commencement coordinator |
| isPrimary | |

---

### Inquiry

**Purpose:** Incoming interest, including returning-year interest/commitment.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, clientId | Client may be created from the inquiry |
| source | Email interest form / other (OQ-01) |
| contactName, email, universityName, department | OQ-01 |
| stage | initial_inquiry → needs_conversation → pending_admin_approval → coordinator_logistics → closed_won / closed_lost |
| returningInterest | checkbox: interested / committed for following year (OQ-01) |
| notes | |
| nextAction / nextActionAt | Visibility (lifecycle stage 1) |

**Relationships:** Client; optionally converted Event.

---

### Event

**Purpose:** A commencement (or related) engagement with a university. Chester uses “event” for commencement ceremonies; one Event record may still group multiple Ceremony rows.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, clientId | |
| name | |
| status | tentative / confirmed / postponed / cancelled (OQ-02) |
| tentativeReason | Interest + budget available |
| calendarColor | Per-university color for month view |
| estimatedGraduateCount | This year |
| priorYearGraduateCount | Last year (calendar MUST) |
| quoteAmountCents | This year |
| priorYearQuoteAmountCents | Last year |
| workAgainRecommendation | From debrief (OQ-17) |
| eventReady | For subsequent events (OQ-17) |
| notes | Critical notations also shown on calendar |
| createdAt / updatedAt | |

**Relationships:** ceremonies; assignments; documents; estimates; invoices; insurance; debriefs; calendar notes.

---

### Ceremony

**Purpose:** One scheduled session inside an event (date/time). Multiple ceremonies per event (OQ-04).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, eventId | |
| name | e.g. morning undergraduate, honor society |
| startsAt / endsAt | |
| venueName, venueAddress | Call Sheet |
| estimatedNames | If it differs from event total |
| soundCheckAt / callTime | CAL-004 |
| kind | commencement / related_group / team_dinner / function (dinners use same university color) |

---

### Assignment

**Purpose:** Central operational object connecting university, event, reader, Call Sheet, logistics, expenses, and debrief.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id | |
| eventId, readerId | |
| role | lead / reader / shadow (OQ-03) |
| status | offered / accepted / declined / assigned / released_to_pool / completed |
| logisticsStatus | Simple manual field; not GPS (EVT-005) |
| promisedPayCents | This year promised (Chester comment) |
| priorYearPayCents | What they were paid last year for this university/event if known |
| createdAt / updatedAt | |

**Relationships:** Call Sheets; expenses; debrief; documents; compensation payments.

Returning a reader to the pool is a status change, not a hard delete (OQ-04).

---

### CallSheet

**Purpose:** Event packet / legal-operational document generated from structured data.  
**MVP:** Yes  
**Versioned:** Yes (Chester: Call Sheets should remain versioned)

| Field | Notes |
|---|---|
| id, eventId | One current packet per event, many versions |
| version | Integer, append-only |
| status | draft / issued / superseded |
| issuedAt, issuedByUserId | |
| talentSummary | |
| compensationText / compensationCents | |
| perDiemCents | Discovery Call Sheet implication |
| parkingNotes | |
| travelNotes, airfareNotes, airfarePaidCents, creditsRefundsCents | Calendar + Call Sheet |
| accommodationNotes, hotelEstimateCents | |
| transferRideshareNotes | |
| contactsSnapshot | Coordinator and VTI contacts |
| taskInstructions | |
| preparationRequirements | |
| dressCode | |
| errorRateExpectations | Discovery |
| expenseRules | |
| confidentialityLegalText | CAL-005; contract language |
| debriefInstructions | |
| createdAt | |

**Relationships:** assignment acknowledgements; related event documents.

A printable view is generated from this record. Prior versions remain readable.

---

### CallSheetAcknowledgement

**Purpose:** Reader signs / accepts a specific Call Sheet version (OQ-06: legal contract).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, callSheetId, readerId, assignmentId | |
| acceptedAt | |
| method | click_accept / drawn_signature / both — **NEEDS CHESTER CONFIRMATION** |
| signatureFileId | Nullable |
| ip / userAgent | Audit support |

---

### EventDocument

**Purpose:** University files the reader needs (Chester comment on EVT-004), including name lists (Discovery).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, eventId, ceremonyId? | |
| kind | university_instruction / name_list / other |
| fileId, originalFilename | |
| visibleToAssignedReaders | Default true |

---

### ReaderDocument

**Purpose:** Controlled onboarding documents.  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, readerId | |
| kind | drivers_license / passport / nda / other |
| fileId | Encrypted |
| expiresOn | DL and passport renewals (OQ-06, OQ-15) |
| status | valid / expiring / expired / missing |

Admin-only access in MVP (comment: only VTI access).

---

### FileObject

**Purpose:** Permissioned binary storage metadata.  
**MVP:** Yes (necessary to implement documents and receipts)

| Field | Notes |
|---|---|
| id | |
| storageKey | |
| mimeType, byteSize | |
| checksum | |
| encryption | app-level flag |
| uploadedByUserId, createdAt | |

---

### AvailabilityBlock

**Purpose:** Who can still be assigned this month (calendar sidebar).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, readerId | |
| startsAt / endsAt | |
| kind | available / unavailable |
| notes | |
| source | admin_entered / reader_submitted — **NEEDS CHESTER CONFIRMATION** who writes this |

Busy-ness from confirmed assignments should also drive the sidebar so Chester does not double-book.

---

### PersonalTimeBlock

**Purpose:** Chester’s personal events on the operational calendar (OQ-08).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, userId | Admin user |
| startsAt / endsAt, title, notes | |
| showOnOperationalCalendar | |

**NEEDS CHESTER CONFIRMATION:** hidden from all readers (recommended).

---

### CalendarNote

**Purpose:** Notations universities provide that must still appear on the month view (OQ-08).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, eventId | |
| note, pinnedToCalendar | |
| createdAt | |

---

### InsuranceRequirement

**Purpose:** Annual university insurance tracking and reminder (UNI-007, OQ-03 comment, OQ-15).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, clientId, eventId? | |
| year | |
| status | not_started / submitted / accepted / change_needed |
| dueOn | Reminder date |
| notes | Chester verifies |

Not a full insurance-policy system. Insurance is mostly an annual formality.

---

### Estimate

**Purpose:** Quote that may later become an invoice (Chester comments; UNI-006). May be created around Stage 2.  
**MVP:** Yes (tracking)

| Field | Notes |
|---|---|
| id, clientId, eventId | |
| amountCents, status | draft / sent / accepted / converted / void |
| issuedOn | |
| waveExternalId | Nullable |
| notes | |

Wave remains ledger SOT.

---

### Invoice

**Purpose:** Track university billing timeline (comment 13; UNI-008; BIL-001).  
**MVP:** Yes (tracking)

| Field | Notes |
|---|---|
| id, clientId, eventId, estimateId? | |
| amountCents | |
| status | draft / sent / due / reminded / paid / void |
| billedOn, dueOn, lastRemindedOn, paidOn | |
| waveExternalId | |

---

### UniversityPayment

**Purpose:** Payment received against an invoice.  
**MVP:** Yes (tracking)

| Field | Notes |
|---|---|
| id, invoiceId | |
| amountCents, paidOn, method | |
| notes | |

No bank feed in MVP.

---

### ReaderCompensation

**Purpose:** Promised vs paid vs cashed for a reader/assignment (Chester comment 11).  
**MVP:** Yes (tracking; initiation later via Patriot)

| Field | Notes |
|---|---|
| id, assignmentId, readerId | |
| kind | compensation / reimbursement |
| amountCents | |
| status | promised / pending_approval / approved / queued / paid / cashed / void |
| approvedByUserId, approvedAt | Required; never silent (OQ-18) |
| paidOn, cashedOn | How cashedOn is known: **NEEDS CHESTER CONFIRMATION** |
| patriotExternalId | |

---

### ExpenseReport

**Purpose:** Reader expense report for an assignment (EXP-002).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, assignmentId, readerId | |
| status | draft / submitted / approved / rejected / reimbursed |
| submittedAt, reviewedAt, reviewedByUserId | |
| notes | |

---

### ExpenseLine

**Purpose:** Line items on an expense report (EXP-004).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, expenseReportId | |
| category | Per Call Sheet expense rules; keep flexible |
| amountCents, incurredOn, description | |

---

### Receipt

**Purpose:** Captured receipt image/PDF (EXP-001, OQ-20).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, expenseLineId, fileId | |
| capturedAt | |

---

### Debrief

**Purpose:** Post-event reader report feeding university history (OQ-17).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, assignmentId, eventId, readerId | |
| thoughtsAboutEvent | |
| thoughtsAboutOtherReaders | |
| interactionWithUniversityStaff | |
| problemsOrConflicts | |
| planVersusExecution | |
| ratingsJson | Rating scale / various metrics — exact scale **can be drafted, confirm wording later if needed** |
| submittedAt | |

Admin recommendation to work again is stored on Event (`workAgainRecommendation`, `eventReady`), not duplicated as a second source of truth.

---

### OperationalNote

**Purpose:** Platform-side communication log (OQ-10: email and within the platform). Not a chat product.  
**MVP:** SHOULD / lightweight MUST if needed to keep event context

| Field | Notes |
|---|---|
| id, clientId?, eventId?, assignmentId? | |
| authorUserId | |
| visibility | admin_only / admin_and_assigned_readers |
| body, createdAt | |

Full private/group messaging is SHOULD / later (COM-001, COM-005).

---

### Notification

**Purpose:** In-app reminders and queues (insurance due, Call Sheet issued, expense submitted).  
**MVP:** Yes (necessary for reminders Chester asked for)

| Field | Notes |
|---|---|
| id, userId | |
| kind | |
| title, body | No sensitive values (SEC-002) |
| href | Deep link |
| readAt, createdAt | |

---

### AuditLog

**Purpose:** Material changes to sensitive and operational records (SEC-004, AI-003).  
**MVP:** Yes

| Field | Notes |
|---|---|
| id, actorUserId | |
| entityType, entityId | |
| action | create / update / status_change / view_sensitive / download / issue_call_sheet / approve_payment |
| metadataJson | No raw SSN/DL |
| createdAt | |

---

## Future entities (not MVP)

| Entity | Why later |
|---|---|
| MessageThread / Message | In-app messaging is non-critical if costly |
| UniversityUser | OQ-09: no university login now |
| SubAdminGrant | Additional roles later |
| WaveSyncEvent / PatriotSyncEvent | After API validation |
| BankTransaction | Wells Fargo asked; not approved |
| AiRecommendation | AI is SHOULD / later; payments always human-approved |
| PolicyRecord | Insurance policy integration not defined |

---

## Relationship sketch (MVP)

```
User 1──0..1 ReaderProfile
ReaderProfile 1──* ReaderAddress
ReaderProfile 1──* EmergencyContact
ReaderProfile 1──* ReaderDocument
ReaderProfile 1──* AvailabilityBlock
ReaderProfile 1──* Assignment
ReaderProfile 1──* ReaderCompensation

Client 1──* ClientContact
Client 1──* Inquiry
Client 1──* Event
Client 1──* InsuranceRequirement
Client 1──* Estimate
Client 1──* Invoice

Event 1──* Ceremony
Event 1──* Assignment
Event 1──* CallSheet (versions)
Event 1──* EventDocument
Event 1──* CalendarNote
Event 1──* Debrief
Event 1──0..* Estimate / Invoice

Assignment 1──* CallSheetAcknowledgement
Assignment 1──0..1 ExpenseReport
Assignment 1──* ReaderCompensation
Assignment 1──0..1 Debrief

ExpenseReport 1──* ExpenseLine 1──* Receipt
Invoice 1──* UniversityPayment
FileObject ← ReaderDocument, EventDocument, Receipt, signature
```

---

## MVP vs future (quick list)

| Entity | MVP | Future |
|---|---|---|
| User, ReaderProfile, ReaderAddress, EmergencyContact | Yes | |
| Client, ClientContact, Inquiry | Yes | UniversityUser |
| Event, Ceremony, Assignment | Yes | |
| CallSheet, CallSheetAcknowledgement | Yes | |
| EventDocument, ReaderDocument, FileObject | Yes | |
| AvailabilityBlock, PersonalTimeBlock, CalendarNote | Yes | Google Calendar sync objects |
| InsuranceRequirement | Yes | PolicyRecord |
| Estimate, Invoice, UniversityPayment | Tracking yes | Wave live objects |
| ReaderCompensation | Tracking yes | Patriot-initiated pay |
| ExpenseReport, ExpenseLine, Receipt | Yes | |
| Debrief | Yes | |
| OperationalNote, Notification, AuditLog | Yes | MessageThread |
| | | AiRecommendation, BankTransaction, SubAdminGrant |
