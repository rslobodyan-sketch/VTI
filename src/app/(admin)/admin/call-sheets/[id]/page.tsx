"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { CallSheetDocument } from "@/components/call-sheet/call-sheet-document";
import { PrintCallSheetButton } from "@/components/call-sheet/print-call-sheet-button";
import { Section } from "@/components/data/section";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatDateTime } from "@/lib/format";

export default function AdminCallSheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { catalog, queries, ready } = useOperations();
  const callSheet = catalog.callSheets.find((item) => item.id === id);
  if (!callSheet) {
    if (!ready) return <RecordPending />;
    notFound();
  }
  const event = queries.getEvent(callSheet.eventId);
  if (!event) notFound();
  const client = queries.getClient(event.clientId);
  if (!client) notFound();

  const assignments = queries
    .assignmentsForEvent(event.id)
    .map(queries.assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const versions = queries.callSheetsForEvent(event.id);
  const ceremonies = queries.ceremoniesForEvent(event.id);
  const acknowledgementFor = queries.acknowledgementFor;

  return (
    <div className="app-page">
      <PageHeader
        title={`Call Sheet v${callSheet.version}`}
        description={`${event.name} · ${client.name}. Versioned operational document. Acknowledgement is click-to-accept.`}
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/call-sheets", label: "Call Sheets" },
          { label: `v${callSheet.version}` },
        ]}
        actions={
          <div className="flex flex-wrap gap-2 no-print">
            <ButtonLink href={`/admin/events/${event.id}`} variant="secondary" size="sm">
              Open event
            </ButtonLink>
            <PrintCallSheetButton />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge kind="callsheet" value={callSheet.status} />
        {callSheet.issuedAt ? <span>Issued {formatDateTime(callSheet.issuedAt)}</span> : null}
      </div>

      <Section title="Version history">
        <ul className="flex flex-wrap gap-3 text-sm">
          {versions.map((item) => (
            <li key={item.id}>
              <TextLink href={`/admin/call-sheets/${item.id}`}>
                v{item.version} {item.status}
              </TextLink>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Acknowledgements">
        <ul className="grid gap-1 text-sm">
          {assignments
            .filter((item) => ["offered", "accepted", "assigned", "completed"].includes(item.status))
            .map((item) => {
              const ack = acknowledgementFor(callSheet.id, item.readerId);
              return (
                <li key={item.id}>
                  {item.reader.contractorName}:{" "}
                  {ack
                    ? `Accepted ${formatDateTime(ack.acceptedAt)}`
                    : callSheet.status === "issued"
                      ? "Outstanding"
                      : "n/a on this version"}
                </li>
              );
            })}
        </ul>
      </Section>

      <CallSheetDocument
        event={event}
        callSheet={callSheet}
        universityName={client.name}
        ceremonies={ceremonies}
        assignments={assignments.map((item) => ({
          assignment: item,
          reader: item.reader,
          acknowledged: Boolean(acknowledgementFor(callSheet.id, item.readerId)),
        }))}
        viewer="admin"
      />
    </div>
  );
}
