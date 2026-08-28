import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  contactsForClient,
  estimatesForEvent,
  eventsForClient,
  eventWindow,
  getClient,
  insuranceForClient,
  invoicesForEvent,
} from "@/data/queries";
import { catalog } from "@/data/catalog";
import { formatDate, formatMoney, formatShortDate } from "@/lib/format";

export function generateStaticParams() {
  return catalog.clients.map((item) => ({ id: item.id }));
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const contacts = contactsForClient(client.id);
  const events = eventsForClient(client.id);
  const insurance = insuranceForClient(client.id);
  const inquiries = catalog.inquiries.filter((item) => item.clientId === client.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={client.name}
        description={client.notes}
        actions={
          <span
            className="inline-block h-3 w-8 rounded-sm"
            style={{ background: client.calendarColor }}
            title="Calendar color"
          />
        }
      />
      <DemoBanner />

      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink-faint">Status</dt>
          <dd className="capitalize">{client.status}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Returning</dt>
          <dd>{client.isReturning ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Work-again / event-ready</dt>
          <dd>
            {events.some((item) => item.workAgainRecommendation)
              ? "Recommended"
              : "Not yet marked"}
            {events.some((item) => item.eventReady) ? " · event ready on file" : ""}
          </dd>
        </div>
      </dl>

      <Section title="Contacts">
        <ul className="grid gap-2 text-sm">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <span className="font-medium">{contact.name}</span>
              <span className="text-ink-muted">
                {" "}
                · {contact.roleTitle} · {contact.department} · {contact.email} · {contact.phone}
                {contact.isPrimary ? " · primary" : ""}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Inquiry status">
        {inquiries.length ? (
          <ul className="grid gap-2 text-sm">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id}>
                <StatusBadge kind="inquiry" value={inquiry.stage} />{" "}
                {inquiry.notes}
                {inquiry.returningInterest ? (
                  <span className="text-ink-muted"> · {inquiry.returningInterest}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No open inquiry on this record.</p>
        )}
      </Section>

      <Section title="Insurance / compliance reminders">
        <ul className="grid gap-2 text-sm">
          {insurance.map((item) => (
            <li key={item.id}>
              <StatusBadge kind="insurance" value={item.status} /> {item.year} due{" "}
              {formatShortDate(item.dueOn)}. {item.notes}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Events and history">
        <TableWrap>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>When</Th>
              <Th>Status</Th>
              <Th>Quote</Th>
              <Th>Invoice</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const estimate = estimatesForEvent(event.id)[0];
              const invoice = invoicesForEvent(event.id)[0];
              return (
                <tr key={event.id}>
                  <Td>
                    <Link href={`/admin/events/${event.id}`} className="underline-offset-2 hover:underline">
                      {event.name}
                    </Link>
                    {event.eventReady ? (
                      <p className="text-ink-muted">Event ready</p>
                    ) : null}
                  </Td>
                  <Td>{eventWindow(event.id) ? formatDate(eventWindow(event.id)!.start) : "—"}</Td>
                  <Td>
                    <StatusBadge kind="event" value={event.status} />
                  </Td>
                  <Td>
                    {formatMoney(event.quoteAmountCents)}
                    {estimate ? (
                      <p className="text-ink-muted">Estimate {estimate.status}</p>
                    ) : null}
                  </Td>
                  <Td>
                    {invoice ? (
                      <StatusBadge kind="invoice" value={invoice.status} />
                    ) : (
                      "No invoice yet"
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Section>
    </div>
  );
}
