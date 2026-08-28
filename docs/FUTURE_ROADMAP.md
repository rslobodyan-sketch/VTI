# VTI Operations Platform — Future Roadmap

This roadmap separates the **larger platform vision** from the **MVP**. Items appear only if the BRD, Discovery Summary, or Chester’s comments support them.

The MVP remains: a usable operations product for inquiry → calendar → assignment → Call Sheet → expenses → debrief → payment tracking → history, with a mobile reader path, under Chester’s control.

---

## After a successful November/December test

Chester’s timeline (OQ-19): test with the smaller November/December season, correct in January/February, full commencement rollout March through early August.

Post-test work is hardening, not a new product:

- Fix reader mobile friction found in live events
- Calendar readability under dense months
- Call Sheet versioning/acceptance issues
- Expense receipt quality
- Reminder accuracy (insurance, IDs)

---

## 1. Deeper automation (controlled)

Supported: AI-001, AI-004, OQ-18, Discovery “AI assistance — later / controlled.”

Possible later:

- Summaries of debriefs for Chester before a university call
- Reminders (insurance, expirations, unsigned Call Sheets, overdue invoices)
- Document extraction (e.g. receipt totals) as a **suggestion**
- Workflow recommendations (e.g. “this university is usually event-ready”)

Hard rules Chester already set:

- **Payments must be approved every time**
- Every other automated action needs **proofs** and the ability to **retract**
- AI must not silently take critical decisions (AI-002, AI-003)
- Chester’s strongest concern is loss of control

Not on the roadmap as a goal: autonomous season planning or auto-assignment of readers. Matching remains Chester’s judgment (sound, preference, veteran-first, final say).

---

## 2. Advanced scheduling

Supported: purpose-built calendar beyond MVP density; SCH-004 Google sync as optional; reader-editable calendar as a later option (OQ-08).

Possible later:

- Google Calendar synchronization (optional, not SOT)
- Reader-submitted availability if MVP starts admin-entered
- Conflict warnings when two events compete for the same reader
- Multi-month season planning view
- Reader-editable calendar (explicitly “this option should exist” later)

Not supported: continuous GPS tracking. EVT-005 is logistics status, not live tracking.

---

## 3. Reporting and analytics

Supported: REP-001–006; OQ-16 names the first KPIs; comment 13 billing timeline; last-year comparisons.

MVP already includes the operational dashboard (universities, events, readers, potential income, expenses) and last-year names/quote/pay on the calendar.

Later:

- Season-over-season reports
- Reader utilization and lead/shadow pipeline
- University profitability **only as operational tracking**, with Wave remaining the accounting system
- Debrief trend (“work again” rates)
- Exact additional KPIs if Chester later provides examples (REP-006 was OPEN; OQ-16 answered the first set)

Do not add decorative charts to the MVP dashboard.

---

## 4. Additional administrative roles

Supported: Discovery and BRD — sub-admin / super-admin is later / open; OQ-11 mentions a “business associate” who might finish compensation/reimbursement.

Later:

- Sub-admin with scoped permissions (no sensitive field access unless granted)
- Payment-finisher role if someone other than Chester queues Patriot payments

Not current committed scope.

---

## 5. Integrations

Supported: Wave SHOULD, Patriot SHOULD, email optional, Google Calendar optional, Wells Fargo asked in a comment.

| Integration | Future role |
|---|---|
| Wave | Live estimates/invoices/payment status; Wave stays ledger SOT (OQ-12) |
| Patriot | Master profile, NDA/financial docs, initiate pay/reimbursement (OQ-11, OQ-13) |
| Email | Log inquiries/communications automatically if valuable enough |
| Google Calendar | Optional personal sync; will not replace VTI calendar |
| Wells Fargo | Only if Chester still wants it after seeing payment tracking; not assumed |
| Insurance policy systems | Discovery: may eventually connect; workflow undefined |

BRD: validate APIs and licensing before committing to custom replacements. Replacement of Wave/Patriot is later and only if cost-effective.

---

## 6. Advanced communications

Supported: COM-001–005, OQ-10.

Later:

- Private and grouped reader messaging
- Reader–coordinator communication **if** universities ever receive accounts
- Doing more of university communication inside the platform (Chester wants the option)
- Email integration for inquiry capture

MVP uses event notes + email outside the app. In-app messaging is not critical if costly.

---

## 7. Financial automation

Supported: BIL-*, OQ-11, OQ-12, OQ-18, comments on estimates→invoices, reader pay ledger, balance sheet question.

Later:

- Wave API: estimate converts to invoice without double entry
- Patriot API: approved compensation/reimbursement queued or initiated
- “Check cashed” imported rather than typed
- University portal for payment/event history (OQ-09 expansion)

Not later-as-default:

- VTI becoming the general ledger (Chester asked how a balance sheet fits; answer remains Wave)
- Unattended payouts

---

## 8. AI assistance

Supported as later/controlled only.

Use cases named in the BRD: summaries, reminders, document extraction, workflow recommendations.

Do not roadmap:

- Auto-selecting readers
- Auto-approving pay
- Auto-sending university invoices without Chester
- Training public models on Call Sheets or IDs

---

## 9. Client / university access

OQ-09: universities have never needed login. VTI remains primary operator **now**. Leave open: universities checking payment history and past events.

That is a distinct post-MVP product surface with its own permissions, not a leftover admin screen.

---

## 10. Native mobile app

NFR-005 / Discovery: prove reader workflows on responsive web first.

OQ-20 minimum is already web-capable: Call Sheet, university instructions, receipt capture, expense report.

Native iOS/Android is post-MVP if readers still need home-screen install, offline Call Sheets, or better camera UX after the web test.

---

## 11. Reader self-service onboarding

OQ-07: not initially; available if VTI scales.

Later: reader updates contact/travel preferences/documents; still no unattended change to tax IDs without admin confirmation.

---

## 12. What is not a documented future idea

Do not treat these as roadmap items just because they are common SaaS features:

- Multi-tenant product for other agencies
- Marketplace of freelance readers
- Public website CMS
- HIPAA program
- Autonomous AI operations center
