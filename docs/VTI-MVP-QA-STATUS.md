# VTI MVP QA Status

## Current acceptance gate

Run:

```powershell
npm install
npm run test:acceptance
```

The client acceptance suite runs sequentially (`--workers=1`) and covers the core MVP lifecycle:

- University inquiry → qualification → event
- Reader profile → availability/conflicts → privacy
- Assignment → notice preview → Call Sheet → reader acceptance
- Reader expense → admin approval → compensation/check tracking
- Calendar + Financial Command Center overview
- Event travel + document + task operations
- Event Control Center readiness and operational sections
- Reader financial privacy
- Browser persistence after refresh
- Reader can add a new expense even when an earlier report is already approved or paid.
- Reader can view their own payment history without seeing other readers’ financial information.
- New event records create a tracking estimate draft; event financials can create a tracking invoice draft without claiming a Wave sync.

## MVP boundary

A passing acceptance suite validates the browser-based MVP workflow. It does not claim production readiness, production authentication/authorization, encrypted production document storage, live Wave/Patriot synchronization, live email delivery, or a production database.
