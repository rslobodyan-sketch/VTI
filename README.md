# VTI Operations MVP

Voice Talent International — browser-based operations MVP.

## Start locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Release QA

Run the complete release gate:

```powershell
npm run test:release
```

The gate runs type checking, linting, production build, client acceptance tests, responsive smoke tests and route smoke tests.

## Client demo

Use `docs/CHESTER_DEMO_RUNBOOK.md` for the recommended Chester walkthrough.

Before a demo, open **Account → Clear session changes** so the workspace starts from the clean seed story.

## MVP boundary

This is a **demo-ready MVP**, not a production-ready system. Wave, Patriot, bank feeds, authentication, production database/storage, university portal, live email and native applications are intentionally deferred. The UI does not claim those integrations are connected.

See `docs/VTI_MVP_FREEZE.md` for the release status and `docs/MVP_FINAL_COVERAGE_AUDIT.md` for detailed coverage.
