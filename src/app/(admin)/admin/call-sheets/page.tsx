import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { acknowledgementFor, assignmentsForEvent, getClient, getEvent, getReader } from "@/data/queries";
import { formatShortDate } from "@/lib/format";

export default function AdminCallSheetsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Call Sheets"
        description="Versioned operational packets. A later issue supersedes execution but prior versions stay on file. Acknowledgement is required; drawn legal signature is not implemented yet."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>Event</Th>
            <Th>Version</Th>
            <Th>Status</Th>
            <Th>Issued</Th>
            <Th>Acknowledgements</Th>
          </tr>
        </thead>
        <tbody>
          {catalog.callSheets.map((sheet) => {
            const event = getEvent(sheet.eventId);
            const client = event ? getClient(event.clientId) : undefined;
            const assigned = assignmentsForEvent(sheet.eventId).filter((item) =>
              ["offered", "accepted", "assigned", "completed"].includes(item.status),
            );
            const acks = assigned.filter((item) => acknowledgementFor(sheet.id, item.readerId));
            return (
              <tr key={sheet.id}>
                <Td>
                  <Link href={`/admin/call-sheets/${sheet.id}`} className="underline-offset-2 hover:underline">
                    {event?.name}
                  </Link>
                  <p className="text-ink-muted">{client?.name}</p>
                </Td>
                <Td>v{sheet.version}</Td>
                <Td>
                  <StatusBadge kind="callsheet" value={sheet.status} />
                </Td>
                <Td>{sheet.issuedAt ? formatShortDate(sheet.issuedAt) : "—"}</Td>
                <Td>
                  {sheet.status === "superseded"
                    ? "Superseded"
                    : `${acks.length}/${assigned.length} accepted`}
                  {sheet.status === "issued"
                    ? assigned
                        .filter((item) => !acknowledgementFor(sheet.id, item.readerId))
                        .map((item) => getReader(item.readerId)?.contractorName)
                        .filter(Boolean)
                        .map((name) => (
                          <p key={name} className="text-warning">
                            Outstanding: {name}
                          </p>
                        ))
                    : null}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}
