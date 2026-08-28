# Questions that need Chester’s confirmation

Only questions that are still unclear **after** the latest BRD, Chester’s §13 answers, and his Word comments. If we can reasonably decide from those sources, it is not listed.

These are the items that can still change MVP scope, workflow, permissions, calendar, assignments, Call Sheets, expenses, payments, communications, client access, or authentication.

---

## 1. Calendar sample

You offered a sample of your current color-coded monthly calendar.

**Please send it (or screenshots of a busy month and a light month).**

We will use it to judge density, color, and what sits in bold vs. unbolded lines. Without it we can still build the fields you listed, but we may get the visual hierarchy wrong.

---

## 2. Name lists

Discovery says readers need name lists before events. The two source documents do not say how those files arrive today.

**How are name lists delivered now (PDF, spreadsheet, portal download), roughly how large are they, and when do they usually arrive relative to the ceremony?**

This affects the reader mobile packet and file size/security design.

---

## 3. Call Sheet signature

You said Call Sheets are a legal contract and need a place to sign. That is enough to require acknowledgement. The mechanism is not specified.

**For MVP, is click-to-accept (“I agree to this Call Sheet version”) enough, do you need a drawn signature on the phone, or both?**

---

## 4. Who sets reader availability

The calendar sidebar must show available vs. unavailable readers. Readers cannot edit their profile after onboarding, but availability is not clearly part of “profile.”

**Do you record availability yourself, should readers submit “I’m unavailable these dates,” or both?**

---

## 5. What readers see on the calendar

You said the calendar must be viewable for readers but **not** the entire calendar, permission-driven, and not editable.

**Should a reader see only events they are assigned to, or a broader month with only limited fields (for example university name and that they are not assigned), never pay/quote/last-year financials?**

---

## 6. Personal events on the operational calendar

You need to add personal events so you can see when you are booked.

**Should those personal events be invisible to every reader? (Recommended: yes.)**

---

## 7. “Check cashed”

You want readers (and yourself) to see when a check was cashed.

**How do you know that today — Patriot, Wells Fargo, the reader telling you, or manual tracking?**

If it is only knowable from the bank, MVP will need a manual “cashed” date until any bank/Patriot connection exists.

---

## 8. November test without Wave/Patriot APIs

Wave must remain the source of truth for invoices/estimates/GL. Patriot for the reader master profile. Both integrations are SHOULD and unvalidated. You also asked how large the gap is if they are not connected.

**For the November/December test, is it acceptable that VTI tracks estimates, invoices, pay, and reimbursement status inside the platform while you continue to enter the official records in Wave and Patriot by hand?**

Live API sync would follow once we confirm each product’s API, licensing, and cost (those APIs may not be free).

---

## 9. Who may approve payments in MVP

Payments require your approval every time. You also mentioned a business associate who might finish compensation/reimbursement later.

**For MVP, are you the only person who can approve pay/reimbursement, or should we already allow a second admin login?**

A second role is later in the BRD unless you want it for November.

---

## 10. Wells Fargo

You asked whether business banking can be integrated. That is a separate, likely costly connection and is not in the MUST list.

**Please confirm MVP should track payment status only, with no Wells Fargo connection.**

---

## Not asking (already answered or decidable)

| Topic | Why we are not asking |
|---|---|
| University login | You said VTI is the operator; never needed university login; keep history portal for later |
| Google Calendar as SOT | You prefer a purpose-built color-coded calendar |
| Readers editing profiles | You said no, not initially |
| Call Sheet versioning | You said they should remain versioned |
| Dashboard KPIs | You named universities, events, readers, potential income, expenses |
| Debrief topics | You listed them in OQ-17 |
| AI and payments | Payments always approved; other automation needs proofs/retract |
| Native app | Minimum mobile experience is Call Sheet + instructions + receipts/expenses |
| Timeline | Nov/Dec test, Jan/Feb corrections, March–August rollout |
| Onboarding fields | You listed them in OQ-05/06 |
| Event statuses | Tentative / cancelled / postponed rules are defined |
| Brand colors | You marked as non-priority; we will ask when designing UI, not before architecture |

If you want to send brand colors or the calendar sample together, that helps design later but does not block this documentation phase.
