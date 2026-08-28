# Phase 0 completion — application foundation

**Date:** 28 August 2026  
**Status:** Complete. Phase 1 has **not** been started.

Phase 0 delivered a professional operations-platform **shell** only. No database, authentication, calendar product, Call Sheets, reader workflows, payments, or integrations were implemented.

---

## What was created

- Global design tokens and typography (IBM Plex Sans / Source Serif 4 / IBM Plex Mono)
- Admin desktop shell: left navigation, header, main content, account/alerts placeholders
- Reader mobile-first shell: compact header, bottom navigation, distinct from the admin dashboard
- Placeholder routes for every requested admin and reader area
- Reusable UI primitives with no new npm packages
- Toast, dialog, select, and dropdown foundations without third-party UI libraries
- Entry page at `/` that chooses Admin or Reader workspace (auth is not connected)

The Next.js starter marketing page was replaced. That is intentional: the starter is not the product (`docs/BUILD_PLAN.md` Phase 0).

---

## Routes created

All return HTTP 200 unless noted.

| Route | Role | State |
|---|---|---|
| `/` | Public entry | Foundation chooser |
| `/admin` | Admin | Overview placeholder |
| `/admin/calendar` | Admin | Placeholder |
| `/admin/inquiries` | Admin | Placeholder |
| `/admin/clients` | Admin | Universities placeholder |
| `/admin/events` | Admin | Placeholder |
| `/admin/readers` | Admin | Placeholder |
| `/admin/assignments` | Admin | Placeholder |
| `/admin/call-sheets` | Admin | Placeholder |
| `/admin/expenses` | Admin | Placeholder |
| `/admin/debriefs` | Admin | Placeholder |
| `/admin/payments` | Admin | Placeholder |
| `/admin/settings` | Admin | Design-system verification controls only |
| `/reader` | Reader | Home placeholder |
| `/reader/assignments` | Reader | Placeholder |
| `/reader/call-sheets` | Reader | Placeholder |
| `/reader/expenses` | Reader | Placeholder |
| `/reader/debrief` | Reader | Placeholder |
| `/reader/profile` | Reader | Placeholder |
| unknown routes | — | Branded 404 |

Unknown path `/this-route-does-not-exist` returns **404**.

---

## Reusable components created

| Component | Path |
|---|---|
| `Button` | `src/components/ui/button.tsx` |
| `Input` / `Textarea` | `src/components/ui/input.tsx` |
| `Label` / `Field` | `src/components/ui/field.tsx` |
| `Panel` | `src/components/ui/panel.tsx` |
| `Badge` | `src/components/ui/badge.tsx` |
| `Select` | `src/components/ui/select.tsx` |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` |
| `Dialog` | `src/components/ui/dialog.tsx` |
| `ToastProvider` / `useToast` | `src/components/ui/toast.tsx` |
| `Skeleton` / `SkeletonBlock` | `src/components/ui/skeleton.tsx` |
| `EmptyState` | `src/components/ui/empty-state.tsx` |
| `ErrorState` | `src/components/ui/error-state.tsx` |
| `PageHeader` | `src/components/ui/page-header.tsx` |
| `PlaceholderPage` | `src/components/foundation/placeholder-page.tsx` |
| `FoundationControls` | `src/components/foundation/foundation-controls.tsx` |
| `AdminShell` | `src/components/layout/admin-shell.tsx` |
| `ReaderShell` | `src/components/layout/reader-shell.tsx` |
| `AppProviders` | `src/components/providers.tsx` |

Navigation config: `src/lib/navigation.ts`. Class helper: `src/lib/cn.ts` (no `clsx` / `tailwind-merge`).

---

## Design system decisions

Interim palette (Chester’s brand colors were marked non-priority; these are **not** claimed as official VTI identity):

- Warm paper surfaces (`#f3efe6` / `#fbf9f4`) for long operational sessions
- Ink text (`#1b1814`) for contrast
- Deep pine accent (`#1e3b34`) instead of generic SaaS purple
- Borders over heavy shadows so a future dense calendar can stay readable
- Small radii (4 / 6 / 10px)
- 4px spacing scale
- Light theme only (dark `prefers-color-scheme` from the starter was removed so a printed-style month view will not invert later)
- Admin is desktop-first; reader is phone-first with a five-item bottom bar (Home, Jobs, Packet, Expenses, Profile). Debrief is available from **More** on small screens and from the header nav on `md+`

Settings includes labeled **interface foundation** controls (toast, dialog, fields, badges, skeleton, error). They do not save data.

---

## Dependencies added

**None.** `package.json` still contains only the original Next.js 15 / React 19 / Tailwind CSS 4 / ESLint stack.

Fonts are loaded with `next/font/google` (already available through Next.js). No paid services.

---

## Build result

```
npm run lint   → pass
npm run build  → pass (Next.js 15.5.24 Turbopack)
```

Production build listed all admin and reader routes as static.

Browser checks:

- Home, admin overview, calendar, settings, and reader home loaded
- Admin desktop: sidebar groups, header, empty overview (no fake KPIs)
- Admin phone: hamburger; drawer closed until opened; nav not tabbable while closed
- Reader phone: compact header, **More**, bottom bar (Jobs / Packet), no admin sidebar
- Settings: toast (“Foundation toast”) and dialog open/close with focus return
- No real university, reader, SSN, license, or bank data in the UI

---

## Remaining limitations

- No authentication (Phase 1)
- No database (Phase 1)
- Placeholder pages only; no business records
- Call Sheet grain, calendar density, availability rules, and other Chester questions remain **unanswered** and were not invented here
- Brand colors are interim
- In-app links were verified by direct navigation and HTTP status; client-side click-through in the automated browser did not always fire Next.js `<Link>` (full page loads work)
- Invite email, file storage, and Wave/Patriot are out of this phase

---

## Confirmation: no business functionality

Phase 0 did **not** implement:

- Inquiry capture or pipeline movement
- University/client records
- Events, ceremonies, or the operational calendar
- Reader onboarding or documents
- Assignments or matching
- Call Sheet generation, versioning, or signature
- Expenses, receipts, debriefs
- Estimates, invoices, payments, or approvals
- Wave, Patriot, Google Calendar, Wells Fargo, email ingestion, or AI
- University login

Open Chester questions were not resolved.

**Next:** wait for instruction before Phase 1 (data + authentication).
