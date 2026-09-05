"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatShortDate } from "@/lib/format";

export default function ReaderProfilePage() {
  const { reader } = useDemoReader();
  const queries = useLiveQueries();
  const docs = queries.readerProfileDocuments(reader.id);

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
