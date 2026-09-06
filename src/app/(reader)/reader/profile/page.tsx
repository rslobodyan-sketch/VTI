"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function ReaderProfilePage() {
  const { reader } = useDemoReader();
  const queries = useLiveQueries();
  const docs = queries.readerProfileDocuments(reader.id);
  const payments = queries.readerPaymentHistory(reader.id);
  const priorYearPayCents = queries.assignmentsForReader(reader.id).reduce(
    (sum, assignment) => sum + (assignment.priorYearPayCents ?? 0),
    0,
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        title={reader.contractorName}
        description="Read-only. Contact and travel preferences from onboarding. Identity documents and tax IDs are not shown here — Patriot remains the intended master record."
      />
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-ink-faint">Email / phone</dt>
          <dd>
            {reader.email}
            <br />
            {reader.primaryPhone}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Onboarding / NDA</dt>
          <dd>
            <StatusBadge kind="onboarding" value={reader.onboardingStatus} />{" "}
            {reader.ndaSigned ? "NDA signed" : "NDA missing"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Travel</dt>
          <dd>
            {reader.airlinePreference} · {reader.seatPreference} · shirt {reader.shirtSize}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Sound notes</dt>
          <dd>{reader.soundNotes}</dd>
        </div>
      </dl>

      <section>
        <h2 className="app-kicker">Your payment history</h2>
        <p className="mt-1 text-sm text-ink-muted">Only your own compensation and reimbursement records are shown here.</p>
        {priorYearPayCents ? (
          <p className="mt-2 text-sm">Prior-year recorded pay: <span className="font-medium tabular-nums">{formatMoney(priorYearPayCents)}</span></p>
        ) : null}
        <ul className="mt-2 grid gap-0 border-y border-line text-sm">
          {payments.length ? (
            payments.map(({ row, event }) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <span>
                  <span className="block font-medium">{event?.name ?? "Assignment"}</span>
                  <span className="text-ink-muted">{row.kind === "compensation" ? "Professional fee" : "Reimbursement"}</span>
                </span>
                <span className="text-right">
                  <span className="block font-medium tabular-nums">{formatMoney(row.amountCents)}</span>
                  <StatusBadge kind="pay" value={row.status} size="sm" />
                  {row.paidOn ? <span className="block text-xs text-ink-muted">Paid {formatShortDate(row.paidOn)}</span> : null}
                  {row.cashedOn ? <span className="block text-xs text-ink-muted">Cashed {formatShortDate(row.cashedOn)}</span> : null}
                </span>
              </li>
            ))
          ) : (
            <li className="py-3 text-ink-muted">No payment history recorded yet.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="app-kicker">On-file with VTI</h2>
        <ul className="mt-2 grid gap-2 text-sm">
          {docs.length ? (
            docs.map((doc) => (
              <li key={doc.id}>
                <StatusBadge kind="doc" value={doc.status} /> {doc.kind.replaceAll("_", " ")}
                {doc.expiresOn && doc.kind === "nda" ? ` · ${formatShortDate(doc.expiresOn)}` : ""}
              </li>
            ))
          ) : (
            <li className="text-ink-muted">
              Driver’s license, passport, and tax records are not displayed on the reader packet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
