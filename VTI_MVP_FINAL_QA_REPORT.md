# VTI Operations MVP — Final QA Report

**Product:** Voice Talent International (VTI) **Operations** platform  
**Not:** the public marketing website (`vtiweb` was not accessed or modified by this finishing pass)  
**Report date:** 5 September 2026  
**Language:** Demo-ready MVP. Not production-ready.

---

## 1. Executive Summary

This finishing pass resolved remaining **demo-scope** gaps that the prior report marked PARTIAL, without implementing production architecture or inventing business rules.

Admin now has:

- a university **operational totals** rollup (graduates, readers, ceremonies, days, quote, invoiced, compensation, expenses, estimated margin, last-year fields only where seeded)
- the same operational totals on the event screen
- an **admin-only** reader financial summary (assignments, completed, compensation, expenses, paid/cashed, prior-year pay only when recorded)
- a filename-only **operational document** library (Rate Sheet / Operational / Other)
- expense association to university / event / assignment
- neutral returning-university note empty copy

Reader calendar **Print** is wired to `window.print()`. **Export .ics** contents were verified for Marcus / Walden. Paper print and third-party calendar import remain uncertified.

**31 / 31** Playwright tests passed. Typecheck, lint, and production build passed.

---

## 2. Final Status

**DEMO READY**

**PRODUCTION READY: NO**

Demo-scope requirements that can be satisfied from the existing model are satisfied. Remaining items are FUTURE production work or OPEN Chester decisions — they are not treated as demo defects.

Handoff hygiene (not status conditions):

- Hand Chester the **current dirty working tree**, not `origin/master` (`d22f7b5`).
- Say out loud: no auth, no email, no Wave/Patriot/bank, filename-only files, overlay in `localStorage`.
- Clear session before the live walkthrough so seed universities are the starting point.

---

## 3. Environment

| Item | Value |
|---|---|
| OS | Windows 10 (win32 10.0.26200) |
| Node | v24.16.0 |
| npm | 11.13.0 |
| Next.js | 15.5.24 (Turbopack) |
| React | 19.1.0 |
| TypeScript | 5 |
| Browser automation | Playwright (`@playwright/test`) Chromium, `http://127.0.0.1:3011` |
| Test date | 5 September 2026 |
| Git HEAD | `d22f7b5` — Finalize VTI MVP client demo |
| Working tree | Dirty (correction pass + QA pass + finishing pass). Seed `src/data/catalog.ts` unmodified. |
| Missing script | `npm run validate:schema` — **does not exist** |

---

## 4. Automated Test Summary

| Check | Result |
|---|---|
| TypeScript | **PASS** (`npx tsc --noEmit`, exit 0) |
| Lint | **PASS** (`npm run lint`, exit 0) |
| Build | **PASS** (`npm run build`, 32/32 routes) |
| Route Smoke | **PASS** |
| Golden Journey | **PASS** |
| Reader Privacy | **PASS** |
| Persistence | **PASS** |
| Calendar | **PASS** (includes print wiring + `.ics` contents) |
| Call Sheets | **PASS** |
| Assignments | **PASS** |
| Expenses | **PASS** |
| Debrief | **PASS** (inside Golden Journey) |
| Payments | **PASS** (inside Golden Journey) |
| Responsive | **PASS** (1440 / 1280 / 1024 / 768 / 390) |
| Runtime Errors | **PASS** |
| Accessibility smoke | **PASS** |
| Failure paths | **PASS** |
| Finishing pass (operational / notes / documents) | **PASS** |
| Playwright suite | **31 passed / 0 failed** |

---

## 5. Detailed Test Results

| ID | Description | Result | Evidence | Notes |
|---|---|---|---|---|
| T-TS | `npx tsc --noEmit` | **PASS** | Exit 0 | |
| T-LINT | `npm run lint` | **PASS** | Exit 0 | |
| T-BUILD | `npm run build` | **PASS** | 32 App Router routes | |
| E2E-GJ-01 | Golden Journey Admin→Sam→Admin pay tracking | **PASS** | `tests/e2e/golden-journey.spec.ts` | Notice toast: “No email was sent.” Pay: Approve → Queue → Paid → Cashed |
| E2E-PR-01 | Sam cannot open Elena/Marcus assignments | **PASS** | `privacy.spec.ts` | UI isolation only — not production auth |
| E2E-PR-02 | Sam expenses/profile hide others’ pay and ID/tax | **PASS** | `privacy.spec.ts` | Switcher still lists other names (demo identity) |
| E2E-PR-03 | Reader nav stays in `/reader` | **PASS** | `privacy.spec.ts` | |
| E2E-PR-04 | Clean overlay: Sam has no upcoming job | **PASS** | `privacy.spec.ts` | Seed Eastbridge is `released_to_pool` |
| E2E-ST-01 | Admin write → Reader tab → refresh → Clear session | **PASS** | `persistence.spec.ts` | `localStorage` + `storage` event |
| E2E-CAL-01 | Admin Previous/Next/Today; no Nov 2026 button | **PASS** | `calendar.spec.ts` | Today = demo as-of **August 2026** |
| E2E-CAL-02 | Admin November shows Walden | **PASS** | `calendar.spec.ts` | Default month = nearest upcoming from as-of |
| E2E-CAL-03 | Reader assigned-only, nav, print/.ics controls | **PASS** | `calendar.spec.ts` | |
| E2E-CAL-04 | Reader print stub + Walden `.ics` contents | **PASS** | `calendar.spec.ts` | `window.print()` stub; ICS has Walden `DTSTART:20261113T160000Z`; no pay |
| E2E-CS-01 | Issue v1, issue v2, supersede, Sam ack, Elena isolated | **PASS** | `operations.spec.ts` | Click-to-accept; no drawn signature |
| E2E-AS-01 | Decline and release-to-pool | **PASS** | `operations.spec.ts` | Reader returns to picker |
| E2E-EX-01 | Submit, reject, Marcus cannot see Sam receipt | **PASS** | `operations.spec.ts` | |
| E2E-RT-01 | All Admin/Reader routes + PWA assets | **PASS** | `routes.spec.ts` | |
| E2E-RT-02 | Unknown path 404 | **PASS** | `routes.spec.ts` | |
| E2E-RT-03 | Invalid IDs hydrate then empty/404 | **PASS** | `routes.spec.ts` | Overlay architecture |
| E2E-RS-01 | Overflow check at 5 viewports × 15 screens | **PASS** | `responsive.spec.ts` | Automated scrollWidth only |
| E2E-AX-01 | Labels/headings on key forms; no page errors | **PASS** | `a11y-runtime.spec.ts` | Not an axe audit |
| E2E-FP-01 | Onboarding required fields | **PASS** | `failure-paths.spec.ts` | |
| E2E-FP-02 | Receipt without amount | **PASS** | `failure-paths.spec.ts` | |
| E2E-FP-03 | No “Send Assignment Notice” | **PASS** | `failure-paths.spec.ts` | Prepare + honest copy |
| E2E-FN-01 | Walden university operational totals | **PASS** | `finishing.spec.ts` | Seed numbers only (1,840 / $24,200.00 / $6,100.00 / $17,624.00) |
| E2E-FN-02 | Walden event operational totals | **PASS** | `finishing.spec.ts` | Same rollup |
| E2E-FN-03 | Admin Marcus financial; hidden on Reader profile | **PASS** | `finishing.spec.ts` | Prior-year $5,000.00 admin-only |
| E2E-FN-04 | Neutral notes empty state | **PASS** | `finishing.spec.ts` | “No operational notes yet.” |
| E2E-FN-05 | Filename-only document library | **PASS** | `finishing.spec.ts` | Rate Sheet filename recorded; no bytes |
| E2E-FN-06 | Expense university/event/assignment links | **PASS** | `finishing.spec.ts` | `exp-walden-marcus` |

---

## 6. Chester Feedback Coverage

| Chester item | Status |
|---|---|
| Assignment notification capability | **PARTIAL** — prepare/record only; email **FUTURE** |
| Actual Reader calendar | **PASS** — assigned-only month grid |
| Connection to Admin operational calendar | **PARTIAL** — same ceremony dates/timezone; not a shared live cursor |
| Reader calendar print / export | **PASS** — `window.print()` wiring and Walden `.ics` contents verified. Physical paper / third-party import **not** certified |
| Historical reader pay on Admin only | **PASS** |
| University financial / operational overview | **PASS** — admin rollup from existing events/invoices/assignments |
| GRCD-style graduates / readers / ceremonies / days | **PASS** — compact operational totals. **Not** labeled as an official VTI GRCD report |
| Assignment / completion / income / expense / prior-year | **PASS** — Admin reader financial summary; prior-year only from seeded `priorYearPayCents` |
| Invoiced / payouts / expenses / margin | **PASS** — quote − compensation − expenses; invoiced from tracked invoices |
| Returning-university notes / negotiation reminders | **PASS** — admin-entered notes; empty copy is “No operational notes yet.” |
| Wave estimates/invoices | **FUTURE** — tracking + honest copy only |
| Rate Sheet / central operational documents | **PASS** (demo) — filename/category/description library. Bytes **NOT IMPLEMENTED** (correct) |
| Receipt / document organization | **PASS** — associated to event / assignment / university; filename + amount + category |
| Historical data import | **FUTURE** |
| Expense explanation with receipts | **PASS** |
| Check number on Admin pay | **PASS** — tracking field when queued/paid |
| Bank / projected incoming money | **FUTURE** |
| Website inquiry → platform | **FUTURE** |
| Call Sheet checkmark + initials | **OPEN** — click-to-accept remains the documented working assumption |

---

## 7. BRD / MVP Scope Coverage

| MUST (`MVP_SCOPE.md`) | Status |
|---|---|
| 1.1 Admin 360° dashboard | **PASS** |
| 1.2 University + inquiry | **PASS** |
| 1.3 Events + ceremonies | **PASS** |
| 1.4 Purpose-built calendar | **PASS** (Admin + Reader). Density vs Chester sample is **OPEN** |
| 1.5 Reader profiles / matching | **PASS** (Admin decide; no auto-assign) |
| 1.6 Sensitive docs / onboarding fields | **PARTIAL** — Admin masks; Reader hides DL/passport/tax. No encrypted store (**FUTURE**) |
| 1.7 Assignments as hub | **PASS** — offered / accepted / declined / assigned / released / completed |
| 1.8 Versioned Call Sheet + ack | **PASS** — issue new version supersedes |
| 1.9 Logistics | **PASS** — airfare $ / hotel estimate admin-only on Reader CS |
| 1.10 Reader mobile packet | **PASS** (responsive web) |
| 1.11 Expenses | **PASS** (filename-only) |
| 1.12 Estimate/invoice tracking | **PASS** (tracking). Wave API **SHOULD / FUTURE** |
| 1.13 Compensation + Chester approval | **PASS** (tracking). Patriot initiate **SHOULD / FUTURE** |
| 1.14 Debrief + work-again | **PASS** |
| 1.15 Last-year on Admin calendar/event | **PASS** |
| 1.16 Insurance / DL reminders | **PASS** (dashboard queues) |
| 1.17 RBAC / audit / encryption | **PARTIAL** — UI helpers only. Production **FUTURE** |
| 1.18 No silent pay | **PASS** |

SHOULD items not built as live APIs (Wave, Patriot, bank) remain **NOT IMPLEMENTED (correct)**.

---

## 8. Known Demo Limitations

- No authentication. Anyone can open `/admin` or `/reader`. Reader switcher is demo identity (`sessionStorage` `vti-demo-reader`).
- Data = seed catalog + `localStorage` overlay `vti-operations-overlay` (sessionStorage mirrored).
- Email is not connected. Notice is **Prepare assignment notice**.
- Wave / Patriot / bank are not connected. Payments are manual tracking.
- Files/receipts/Rate Sheet records store **filename + amount/category + description** only.
- Call Sheet print and Reader calendar print are `window.print()`, not generated PDF products.
- Entire seed catalog (including masked tax IDs) ships in the client bundle.
- Overlay-only URLs return HTTP 200, then client 404 after hydrate.
- Next.js dev overlay can intercept clicks in `next dev` (not a product defect).
- `npm run validate:schema` does not exist.

---

## 9. Production Gaps

Explicitly **outside this demo freeze** (not implemented, correctly):

- Production authentication / Auth.js
- Postgres
- RLS
- Private encrypted object storage
- Production audit service
- Real Wave integration
- Real Patriot integration
- Bank integration
- Real email delivery
- Production document pipeline / retention
- Final legal Call Sheet signature (initials / drawn)
- Production PWA install validation
- Production secrets / infrastructure
- University login
- Reader self-signup
- Continuous GPS
- Autonomous AI / auto-approve pay

---

## 10. Files Changed

### This finishing pass (demo-scope rollups + tests)

| File | Why |
|---|---|
| `src/data/queries.ts` | University / event / admin-reader operational summaries from existing data |
| `src/types/domain.ts` | Filename-only `WorkspaceDocument` type |
| `src/components/operations/operations-store.tsx` | Overlay `workspaceDocuments` + `addWorkspaceDocument` |
| `src/components/operations/university-profile.tsx` | Operational totals; `DEMO_AS_OF` upcoming/past; neutral notes copy |
| `src/components/operations/event-detail.tsx` | Event operational totals (same helper) |
| `src/app/(admin)/admin/readers/[id]/page.tsx` | Admin-only financial summary |
| `src/app/(admin)/admin/settings/page.tsx` | Filename-only operational document library |
| `src/app/(admin)/admin/expenses/[id]/page.tsx` | University / event / assignment association |
| `tests/e2e/finishing.spec.ts` | Targeted finishing coverage |
| `tests/e2e/calendar.spec.ts` | Print wiring + `.ics` contents |
| `VTI_MVP_FINAL_QA_REPORT.md` | Status update |

### Already dirty from earlier correction + QA passes (preserved)

Assignment notice honesty, Admin calendar as-of behavior, overlay `localStorage`, Reader privacy helpers, payment queue/check/void, Call Sheet re-issue, Playwright suite, etc.

Seed `src/data/catalog.ts` was **not** modified.

`vtiweb` was **not** edited by this finishing pass.

---

## 11. Automated Test Files

- `playwright.config.ts`
- `tests/e2e/helpers.ts`
- `tests/e2e/golden-journey.spec.ts`
- `tests/e2e/privacy.spec.ts`
- `tests/e2e/persistence.spec.ts`
- `tests/e2e/calendar.spec.ts`
- `tests/e2e/operations.spec.ts`
- `tests/e2e/routes.spec.ts`
- `tests/e2e/responsive.spec.ts`
- `tests/e2e/a11y-runtime.spec.ts`
- `tests/e2e/failure-paths.spec.ts`
- `tests/e2e/finishing.spec.ts`

Run: `npm run test:e2e`

---

## 12. Final Recommendation

The Operations MVP can be **frozen for Chester demo review** from the current working tree.

Do **not** present it as production software. Do **not** push or deploy from this pass. Commit when you are ready so the demo matches git.

Suggested spoken line:

> This is the operations demo: inquiry through Call Sheet, Reader packet, expenses, debrief, and payment **tracking**. Wave, Patriot, email, and the bank are not connected. Nothing is paid automatically. University and reader totals are operational rollups from the demo records — not Wave and not an official GRCD extract.

---

## Admin financial metric classification

| Metric | Classification |
|---|---|
| Event quote | **IMPLEMENTED AND CALCULATED** (entered cents) |
| Invoice status / amount | **IMPLEMENTED BUT DEMO DATA ONLY** (seed invoices; no Wave push) |
| Graduate / expected names | **IMPLEMENTED AND CALCULATED** (event field) |
| Readers on event | **IMPLEMENTED AND CALCULATED** |
| Ceremonies / days | **IMPLEMENTED AND CALCULATED** (Chicago `dayKey`) |
| Reader compensation total | **IMPLEMENTED AND CALCULATED** |
| Expense total | **IMPLEMENTED AND CALCULATED** |
| Estimated margin (quote − pay − expenses) | **IMPLEMENTED AND CALCULATED** |
| University operational rollup | **IMPLEMENTED AND CALCULATED** |
| Admin reader current / completed / expenses | **IMPLEMENTED AND CALCULATED** |
| Prior-year names / quote / pay | **IMPLEMENTED BUT DEMO DATA ONLY** on Admin; omitted when not seeded |
| Check number | **IMPLEMENTED** (tracking) |
| Bank / projected incoming | **FUTURE PRODUCTION REQUIREMENT** |
| Wave live sync | **FUTURE PRODUCTION REQUIREMENT** |

---

## Remaining OPEN Chester decisions

1. Admin calendar density vs Chester sample layout
2. Name-list delivery method
3. Click-to-accept vs drawn signature / initials
4. Who sets reader availability
5. Reader calendar grain
6. Personal events visibility on Admin calendar
7. How cashed is known without the bank
8. November tracking without Wave / Patriot
9. Second payment approver
10. Wells Fargo / bank product

---

Nothing was committed, pushed, or deployed.
