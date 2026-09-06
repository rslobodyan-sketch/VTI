# VTI MVP — Functional Freeze

**Date:** 7 September 2026
**Status:** GREEN — demo-ready MVP

## Release gate

The Windows validation run completed successfully with:

- TypeScript: PASS
- ESLint: PASS
- Production build: PASS
- Client acceptance: 9/9 PASS
- Responsive smoke: 5/5 PASS
- Route smoke: 3/3 PASS

Total automated checks in the release command: **17/17 PASS**.

## Scope

The MVP demonstrates the operational lifecycle from university/inquiry through event operations, reader assignment, Call Sheet acknowledgement, expenses, payment tracking, calendar visibility, financial tracking, debrief and browser persistence.

## Intentional MVP boundaries

The following are not represented as live integrations:

- Wave
- Patriot
- Bank/Wells Fargo feeds
- Production authentication
- Production database
- Production encrypted document storage
- University portal
- Native mobile applications
- Live email delivery

The browser/session storage layer is a deliberate MVP mechanism for proving the workflow.

## Demo hygiene

Before a client walkthrough:

- Clear session changes.
- Start from the clean seed story.
- Do not leave ad-hoc test universities, events or debrief text in the browser.
- Use the Chester Demo Runbook for the walkthrough.

## Change policy

The functional build is frozen. Any future change should rerun:

```powershell
npm run test:release
```

A change is not considered release-ready unless the full gate remains green.
