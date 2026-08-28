import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  assignmentsForEvent,
  currentCallSheet,
  eventWindow,
  getClient,
  leadForEvent,
  operationalIssues,
} from "@/data/queries";
import { formatDate, formatMoney } from "@/lib/format";

export default function AdminEventsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Events"
        description="Each commencement engagement is the parent of ceremonies, assignments, Call Sheets, travel, and billing. Tentative remains walk-away until confirmed."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>Event</Th>
            <Th>University</Th>
            <Th>Dates</Th>
            <Th>Readers</Th>
            <Th>Call Sheet</Th>
            <Th>Quote</Th>
            <Th>Attention</Th>
          </tr>
        </thead>
        <tbody>
          {catalog.events.map((event) => {
            const client = getClient(event.clientId);
            const assigned = assignmentsForEvent(event.id).filter((item) =>
              ["offered", "accepted", "assigned", "completed"].includes(item.status),
            );
            const callSheet = currentCallSheet(event.id);
            const lead = leadForEvent(event.id);
            return (
              <tr key={event.id}>
                <Td>
                  <Link href={`/admin/events/${event.id}`} className="underline-offset-2 hover:underline">
                    {event.name}
                  </Link>
                  <p className="mt-1">
                    <StatusBadge kind="event" value={event.status} />
                  </p>
                </Td>
                <Td>{client?.name}</Td>
                <Td>{eventWindow(event.id) ? formatDate(eventWindow(event.id)!.start) : "—"}</Td>
                <Td>
                  {assigned.length} · {lead ? `lead ${lead.contractorName}` : "no lead"}
                </Td>
                <Td>
                  {callSheet ? (
                    <StatusBadge kind="callsheet" value={callSheet.status} />
                  ) : (
                    "None"
                  )}
                </Td>
                <Td className="tabular-nums">{formatMoney(event.quoteAmountCents)}</Td>
                <Td className="text-ink-muted">{operationalIssues(event.id)[0] ?? "—"}</Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}
