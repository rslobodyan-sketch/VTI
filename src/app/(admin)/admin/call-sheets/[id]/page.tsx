import { notFound } from "next/navigation";
import { CallSheetDocument } from "@/components/call-sheet/call-sheet-document";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  acknowledgementFor,
  assignmentView,
  assignmentsForEvent,
  callSheetsForEvent,
  ceremoniesForEvent,
  getClient,
  getEvent,
} from "@/data/queries";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";

export function generateStaticParams() {
  return catalog.callSheets.map((item) => ({ id: item.id }));
}

export default async function AdminCallSheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const callSheet = catalog.callSheets.find((item) => item.id === id);
  if (!callSheet) notFound();
  const event = getEvent(callSheet.eventId);
  if (!event) notFound();
  const client = getClient(event.clientId);
  if (!client) notFound();

  const assignments = assignmentsForEvent(event.id)
    .map(assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const versions = callSheetsForEvent(event.id);
  const ceremonies = ceremoniesForEvent(event.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Call Sheet v${callSheet.version}`}
        description={`${event.name} · ${client.name}. Versioned operational document. Acknowledgement is click-to-accept in this prototype.`}
      />
      <DemoBanner />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge kind="callsheet" value={callSheet.status} />
        {callSheet.issuedAt ? <span>Issued {formatDateTime(callSheet.issuedAt)}</span> : null}
      </div>
      <Section title="Version history">
        <ul className="flex flex-wrap gap-3 text-sm">
          {versions.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/call-sheets/${item.id}`} className="underline-offset-2 hover:underline">
                v{item.version} {item.status}
              </Link>
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
                    ? `accepted ${formatDateTime(ack.acceptedAt)} (${ack.method.replaceAll("_", " ")})`
                    : callSheet.status === "issued"
                      ? "outstanding"
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
