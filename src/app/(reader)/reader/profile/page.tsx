"use client";

import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { documentsForReader } from "@/data/queries";
import { formatShortDate } from "@/lib/format";

export default function ReaderProfilePage() {
  const { reader } = useDemoReader();
  const docs = documentsForReader(reader.id);

  return (
    <div className="grid gap-5">
      <PageHeader
        title={reader.contractorName}
        description="Read-only profile. You cannot edit this after onboarding in the current plan. Tax ID is masked. License images are not shown."
      />
      <DemoBanner />
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
        <h2 className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">Documents</h2>
        <ul className="mt-2 grid gap-2 text-sm">
          {docs.map((doc) => (
            <li key={doc.id}>
              <StatusBadge kind="doc" value={doc.status} /> {doc.kind.replaceAll("_", " ")}
              {doc.expiresOn ? ` · expires ${formatShortDate(doc.expiresOn)}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
