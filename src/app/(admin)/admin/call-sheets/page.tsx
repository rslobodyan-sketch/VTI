"use client";

import { use } from "react";
import { FilterPills } from "@/components/data/filter-pills";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatShortDate } from "@/lib/format";

function AdminCallSheetsPageBody({ status }: { status?: string }) {
  const { catalog, queries } = useOperations();
  const rows = catalog.callSheets.filter((item) => (status ? item.status === status : true));

  return (
    <div className="app-page">
      <PageHeader
        title="Call Sheets"
        description="Versioned operational packets. Acknowledgement is required; drawn legal signature is not in use."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Call Sheets" },
        ]}
      />
      <FilterPills
        basePath="/admin/call-sheets"
        value={status}
        options={[
          { value: "issued", label: "Issued" },
          { value: "superseded", label: "Superseded" },
        ]}
      />
      <AdminTable
        empty={<EmptyState title="No Call Sheets" description="Issue a packet from the event record." />}
        columns={[
          { key: "event", header: "Event" },
          { key: "version", header: "Version" },
          { key: "status", header: "Status" },
          { key: "issued", header: "Issued" },
          { key: "acks", header: "Acknowledgements" },
        ]}
        rows={rows.map((sheet) => {
          const event = queries.getEvent(sheet.eventId);
          const client = event ? queries.getClient(event.clientId) : undefined;
          const assigned = queries.assignmentsForEvent(sheet.eventId).filter((item) =>
            ["offered", "accepted", "assigned", "completed"].includes(item.status),
          );
          const acks = assigned.filter((item) => queries.acknowledgementFor(sheet.id, item.readerId));
          const outstanding = assigned
            .filter((item) => !queries.acknowledgementFor(sheet.id, item.readerId))
            .map((item) => queries.getReader(item.readerId)?.contractorName)
            .filter(Boolean);
          return {
            id: sheet.id,
            href: `/admin/call-sheets/${sheet.id}`,
            title: event?.name ?? "Call Sheet",
            subtitle:
              sheet.status === "superseded"
                ? "Superseded"
                : outstanding.length
                  ? `Outstanding: ${outstanding.join(", ")}`
                  : `${acks.length}/${assigned.length} accepted`,
            trailing: <StatusBadge kind="callsheet" value={sheet.status} size="sm" />,
            cells: {
              event: (
                <>
                  <TextLink href={`/admin/call-sheets/${sheet.id}`}>{event?.name}</TextLink>
                  <p className="text-ink-muted">{client?.name}</p>
                </>
              ),
              version: `v${sheet.version}`,
              status: <StatusBadge kind="callsheet" value={sheet.status} size="sm" />,
              issued: sheet.issuedAt ? formatShortDate(sheet.issuedAt) : "—",
              acks:
                sheet.status === "superseded" ? (
                  "Superseded"
                ) : (
                  <>
                    {acks.length}/{assigned.length} accepted
                    {outstanding.map((name) => (
                      <p key={name} className="text-warning">
                        Outstanding: {name}
                      </p>
                    ))}
                  </>
                ),
            },
          };
        })}
      />
    </div>
  );
}

export default function AdminCallSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = use(searchParams);
  return <AdminCallSheetsPageBody status={status} />;
}
