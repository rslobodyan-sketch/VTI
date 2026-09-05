"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { ButtonLink } from "@/components/ui/button-link";
import { FactGrid } from "@/components/ui/fact-grid";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function AdminReaderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { catalog, queries, ready } = useOperations();
  const reader = queries.getReader(id);
  if (!reader) {
    if (!ready) return <RecordPending />;
    notFound();
  }

  const jobs = queries
    .assignmentsForReader(reader.id)
    .map(queries.assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const docs = queries.documentsForReader(reader.id);
  const pay = queries.compensationForReader(reader.id);
  const address = catalog.addresses.find((item) => item.readerId === reader.id && item.kind === "primary");
  const emergency = catalog.emergencyContacts.find((item) => item.readerId === reader.id);
  const block = catalog.availability.find((item) => item.readerId === reader.id);
  const nextJob = jobs[0];
  const finance = queries.readerAdminFinancialSummary(reader.id);

  return (
    <div className="app-page">
      <PageHeader
        title={reader.contractorName}
        description={`${reader.notes} Legal entity and masked tax ID are visible to admin. Raw SSN, driver-license images, and bank numbers are not in this catalog.`}
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/readers", label: "Readers" },
          { label: reader.contractorName },
        ]}
        actions={
          nextJob ? (
            <ButtonLink href={`/admin/assignments/${nextJob.id}`}>Open assignment</ButtonLink>
          ) : undefined
        }
      />

      <FactGrid
        items={[
          {
            label: "Onboarding",
            value: <StatusBadge kind="onboarding" value={reader.onboardingStatus} />,
          },
          {
            label: "NDA",
            value: reader.ndaSigned
              ? `Signed ${reader.ndaSignedAt ? formatShortDate(reader.ndaSignedAt) : ""}`
              : "Not signed",
          },
          {
            label: "First-choice / veteran",
            value: (
              <>
                {reader.firstChoiceEligible ? "First-choice eligible" : "Building tenure"}
                {reader.veteranStatus ? " · veteran" : ""}
              </>
            ),
          },
          {
            label: "Entity",
            value: `${reader.legalName} · ${reader.businessType} · ${reader.taxIdType} ${reader.taxIdMasked}`,
          },
          {
            label: "Contact",
            value: (
              <>
                {reader.email}
                <br />
                {reader.primaryPhone}
              </>
            ),
          },
          {
            label: "Travel prefs",
            value: `${reader.airlinePreference} · ${reader.seatPreference} · shirt ${reader.shirtSize}`,
          },
        ]}
      />

      <Section title="Sound and geography (assignment support)">
        <p className="text-sm">{reader.soundNotes}</p>
        <p className="mt-2 text-sm text-ink-muted">{reader.geographyNotes}</p>
        {reader.leadershipAssessment ? (
          <p className="mt-2 text-sm">{reader.leadershipAssessment}</p>
        ) : null}
      </Section>

      <Section title="Availability">
        {block ? (
          <p className="text-sm">
            Unavailable {formatShortDate(block.startsAt)} – {formatShortDate(block.endsAt)}.{" "}
            {block.notes}
          </p>
        ) : (
          <p className="text-sm text-ink-muted">
            No unavailable block on file. Availability is admin-entered until Chester confirms otherwise.
          </p>
        )}
      </Section>

      <Section title="Documents">
        <ul className="grid gap-2 text-sm">
          {docs.map((doc) => (
            <li key={doc.id}>
              <StatusBadge kind="doc" value={doc.status} /> {doc.kind.replaceAll("_", " ")}
              {doc.expiresOn ? ` · expires ${formatShortDate(doc.expiresOn)}` : ""}
            </li>
          ))}
        </ul>
      </Section>

      {address || emergency ? (
        <Section title="Admin-only contact detail">
          {address ? (
            <p className="text-sm">
              {address.line1}, {address.city}, {address.region} {address.postalCode}
            </p>
          ) : null}
          {emergency ? (
            <p className="text-sm text-ink-muted">
              Emergency: {emergency.name} ({emergency.relationship}) {emergency.phone}
            </p>
          ) : null}
        </Section>
      ) : null}

      <Section
        title="Admin financial summary"
        description="This reader only. Prior-year pay is shown only when recorded on an assignment. Not visible on the reader packet."
      >
        <div id="reader-admin-financial-summary">
          <FactGrid
            columns={3}
            items={[
              { label: "Assignments", value: String(finance.assignments) },
              { label: "Completed assignments", value: String(finance.completedAssignments) },
              { label: "Reader compensation", value: formatMoney(finance.currentCompensationCents) },
              { label: "Reader expenses", value: formatMoney(finance.expenseCents) },
              { label: "Paid / cashed", value: formatMoney(finance.paidCompensationCents) },
              ...(finance.priorYearPayCents
                ? [{ label: "Prior-year pay (recorded)", value: formatMoney(finance.priorYearPayCents) }]
                : []),
            ]}
          />
        </div>
      </Section>

      <Section title="Assignments">
        <AdminTable
          columns={[
            { key: "event", header: "Event" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "promised", header: "Promised" },
          ]}
          rows={jobs.map((item) => ({
            id: item.id,
            href: `/admin/assignments/${item.id}`,
            title: item.event.name,
            subtitle: item.role,
            trailing: <StatusBadge kind="assignment" value={item.status} />,
            cells: {
              event: (
                <TextLink href={`/admin/assignments/${item.id}`}>{item.event.name}</TextLink>
              ),
              role: item.role,
              status: <StatusBadge kind="assignment" value={item.status} />,
              promised: <span className="tabular-nums">{formatMoney(item.promisedPayCents)}</span>,
            },
          }))}
        />
      </Section>

      <Section title="Compensation (this reader only)">
        {pay.length ? (
          <ul className="grid gap-2 text-sm">
            {pay.map((row) => {
              const event = queries.getEvent(
                catalog.assignments.find((item) => item.id === row.assignmentId)?.eventId ?? "",
              );
              return (
                <li key={row.id} className="flex justify-between gap-3">
                  <span>
                    {event?.name} · {row.kind}
                  </span>
                  <span>
                    {formatMoney(row.amountCents)} <StatusBadge kind="pay" value={row.status} />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No compensation rows on this reader.</p>
        )}
      </Section>
    </div>
  );
}
