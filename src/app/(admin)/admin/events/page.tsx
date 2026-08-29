"use client";

import { use } from "react";
import { FilterPills } from "@/components/data/filter-pills";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatDate, formatMoney } from "@/lib/format";

function AdminEventsPageBody({ status }: { status?: string }) {
  const { catalog, queries } = useOperations();
  const rows = catalog.events.filter((item) => (status ? item.status === status : true));

  return (
    <div className="app-page">
      <PageHeader
        title="Events"
        description="Each commencement engagement is the parent of ceremonies, assignments, Call Sheets, travel, and billing."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Events" },
        ]}
        actions={
          <ButtonLink href="/admin/events/new" size="sm">
            Create event
          </ButtonLink>
        }
      />
      <FilterPills
        basePath="/admin/events"
        value={status}
        options={[
          { value: "tentative", label: "Tentative" },
          { value: "confirmed", label: "Confirmed" },
        ]}
      />
      <AdminTable
        empty={
          <EmptyState
            title="No events yet"
            description="Create an event after an inquiry is won."
            action={
              <ButtonLink href="/admin/events/new" size="sm">
                Create event
              </ButtonLink>
            }
          />
        }
        columns={[
          { key: "event", header: "Event" },
          { key: "university", header: "University" },
          { key: "dates", header: "Dates" },
          { key: "readers", header: "Readers" },
          { key: "callsheet", header: "Call Sheet" },
          { key: "quote", header: "Quote" },
          { key: "attention", header: "Attention" },
        ]}
        rows={rows.map((event) => {
          const client = queries.getClient(event.clientId);
          const assigned = queries.assignmentsForEvent(event.id).filter((item) =>
            ["offered", "accepted", "assigned", "completed"].includes(item.status),
          );
          const callSheet = queries.currentCallSheet(event.id);
          const lead = queries.leadForEvent(event.id);
          const issue = queries.operationalIssues(event.id)[0];
          return {
            id: event.id,
            href: `/admin/events/${event.id}`,
            title: event.name,
            subtitle: `${client?.name ?? ""} · ${issue ?? "On track"}`,
            trailing: <StatusBadge kind="event" value={event.status} size="sm" />,
            cells: {
              event: (
                <>
                  <TextLink href={`/admin/events/${event.id}`}>{event.name}</TextLink>
                  <p className="mt-1">
                    <StatusBadge kind="event" value={event.status} size="sm" />
                  </p>
                </>
              ),
              university: client?.name,
              dates: queries.eventWindow(event.id)
                ? formatDate(queries.eventWindow(event.id)!.start)
                : "—",
              readers: `${assigned.length} · ${lead ? `lead ${lead.contractorName}` : "no lead"}`,
              callsheet: callSheet ? (
                <StatusBadge kind="callsheet" value={callSheet.status} size="sm" />
              ) : (
                "None"
              ),
              quote: <span className="tabular-nums">{formatMoney(event.quoteAmountCents)}</span>,
              attention: <span className="text-ink-muted">{issue ?? "—"}</span>,
            },
          };
        })}
      />
    </div>
  );
}

export default function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = use(searchParams);
  return <AdminEventsPageBody status={status} />;
}
