import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { allCompensationViews, getClient, getEvent } from "@/data/queries";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function AdminPaymentsPage() {
  const pay = allCompensationViews();
  const invoices = catalog.invoices.map((invoice) => ({
    invoice,
    client: getClient(invoice.clientId),
    event: invoice.eventId ? getEvent(invoice.eventId) : undefined,
    received: catalog.universityPayments.filter((item) => item.invoiceId === invoice.id),
  }));

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Payment tracking"
        description="Tracking only. This screen does not process payments, talk to Wave, or talk to Patriot. Chester must approve every reader payment before it can be marked paid."
      />
      <DemoBanner>
        Wave remains the ledger for university estimates and invoices. Patriot remains the reader-pay initiation source of truth when connected later.
      </DemoBanner>

      <Section title="University invoices">
        <TableWrap>
          <thead>
            <tr>
              <Th>University</Th>
              <Th>Event</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Received</Th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((item) => (
              <tr key={item.invoice.id}>
                <Td>{item.client?.name}</Td>
                <Td>
                  {item.event ? (
                    <Link href={`/admin/events/${item.event.id}`} className="underline-offset-2 hover:underline">
                      {item.event.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="tabular-nums">{formatMoney(item.invoice.amountCents)}</Td>
                <Td>
                  <StatusBadge kind="invoice" value={item.invoice.status} />
                </Td>
                <Td>
                  {item.received.length
                    ? item.received
                        .map((row) => `${formatMoney(row.amountCents)} ${row.method} ${formatShortDate(row.paidOn)}`)
                        .join(" · ")
                    : "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Reader compensation and reimbursements">
        <TableWrap>
          <thead>
            <tr>
              <Th>Reader</Th>
              <Th>Event</Th>
              <Th>Kind</Th>
              <Th>Promised</Th>
              <Th>Status</Th>
              <Th>Chester approval</Th>
              <Th>Paid / cashed</Th>
            </tr>
          </thead>
          <tbody>
            {pay.map((item) => (
              <tr key={item.row.id}>
                <Td>{item.reader?.contractorName}</Td>
                <Td>
                  {item.event ? (
                    <Link href={`/admin/assignments/${item.assignment?.id}`} className="underline-offset-2 hover:underline">
                      {item.event.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>{item.row.kind}</Td>
                <Td className="tabular-nums">{formatMoney(item.row.amountCents)}</Td>
                <Td>
                  <StatusBadge kind="pay" value={item.row.status} />
                </Td>
                <Td>
                  {item.row.approvedByName
                    ? `${item.row.approvedByName}${item.row.approvedAt ? ` · ${formatShortDate(item.row.approvedAt)}` : ""}`
                    : "Required before payout"}
                </Td>
                <Td className="text-ink-muted">
                  {item.row.paidOn ? `Paid ${formatShortDate(item.row.paidOn)}` : "Not paid"}
                  {item.row.cashedOn ? ` · cashed ${formatShortDate(item.row.cashedOn)}` : ""}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <p className="text-xs text-ink-muted">
          How “check cashed” is known in production is still an open Chester question. This catalog uses a manual cashed date.
        </p>
      </Section>
    </div>
  );
}
