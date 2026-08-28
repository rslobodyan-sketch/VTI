import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { eventsForClient, eventWindow, insuranceForClient } from "@/data/queries";
import { formatDate } from "@/lib/format";

export default function AdminClientsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Universities"
        description="Admin-operated client records. No university portal in this MVP. Insurance reminders are annual formalities."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>University</Th>
            <Th>Status</Th>
            <Th>Insurance</Th>
            <Th>Next / last event</Th>
          </tr>
        </thead>
        <tbody>
          {catalog.clients.map((client) => {
            const events = eventsForClient(client.id);
            const next = [...events].sort((a, b) => {
              const aStart = eventWindow(a.id)?.start ?? "";
              const bStart = eventWindow(b.id)?.start ?? "";
              return bStart.localeCompare(aStart);
            })[0];
            const insurance = insuranceForClient(client.id)[0];
            return (
              <tr key={client.id}>
                <Td>
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: client.calendarColor }}
                  />
                  <Link href={`/admin/clients/${client.id}`} className="underline-offset-2 hover:underline">
                    {client.name}
                  </Link>
                  <p className="text-ink-muted">
                    {client.isReturning ? "Returning" : "Prospect"}
                  </p>
                </Td>
                <Td className="capitalize">{client.status}</Td>
                <Td>
                  {insurance ? (
                    <StatusBadge kind="insurance" value={insurance.status} />
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>
                  {next ? (
                    <>
                      <Link href={`/admin/events/${next.id}`} className="underline-offset-2 hover:underline">
                        {next.name}
                      </Link>
                      <p className="text-ink-muted">
                        {eventWindow(next.id) ? formatDate(eventWindow(next.id)!.start) : ""}
                      </p>
                    </>
                  ) : (
                    "—"
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}
