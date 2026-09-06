# VTI Client Acceptance Gate

This is the automated release gate for the MVP against Chester's supplied business requirements and operational workflow.

## Run

```bash
npm run test:acceptance
```

## Requirement coverage

The acceptance suite exercises the critical operational lifecycle:

- University inquiry → qualification → event
- Reader profile / onboarding / NDA visibility / availability
- Reader assignment and sound-match assignment notice
- Assignment acceptance
- Call Sheet issue and reader acknowledgement
- Event readiness and operational control center
- Structured travel visibility
- Event documents surface
- Event tasks and activity
- Reader expense receipt → submission → admin approval
- Reader compensation → approval → queue → paid → cashed
- Admin calendar and reader availability/conflicts
- Financial Command Center
- Reader privacy boundaries
- Browser persistence

## Source requirements represented

The suite is grounded in the supplied Business Requirements Document, Chester's discovery summary, the representative VTI workflow, the calendar, and Checks/Payouts operating materials.

A passing suite means the tested workflows work in the current MVP. It does **not** claim production security, real Wave/Patriot synchronization, production email, database persistence, or other deferred integrations.

## Release rule

Do not push to Git as client-ready until:

1. `npm run test:acceptance` passes.
2. `npx tsc --noEmit` passes.
3. `npm run lint` passes.
4. `npm run test:e2e` passes.
5. `npm run build` passes.
6. Any remaining BRD requirement that cannot be automated is explicitly reviewed and marked PASS / PARTIAL / OPEN / DEFERRED.
