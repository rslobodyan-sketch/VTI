"use client";

import { use } from "react";
import { FilterPills } from "@/components/data/filter-pills";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatMoney } from "@/lib/format";

function AdminAssignmentsPageBody({ status }: { status?: string }) {
  const { queries } = useOperations();
  const rows = queries.allAssignmentViews().filter((item) => (status ? item.status === status : true));

  return (
    <div className="app-page">
      <PageHeader
        title="Assignments"
        description="University, event, reader, role, Call Sheet, travel, compensation, expenses, and payment status."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Assignments" },
        ]}
      />
      <FilterPills
        basePath="/admin/assignments"
        value={status}
        options={[
          { value: "offered", label: "Offered" },
          { value: "accepted", label: "Accepted" },
          { value: "assigned", label: "Assigned" },
          { value: "completed", label: "Completed" },
        ]}
      />
      <AdminTable
        empty={<EmptyState title="No assignments" description="Offer a reader from an event record." />}
        columns={[
          { key: "reader", header: "Reader" },
          { key: "event", header: "Event" },
          { key: "role", header: "Role" },
          { key: "status", header: "Assignment" },
          { key: "callsheet", header: "Call Sheet" },
          { key: "pay", header: "Promised" },
        ]}
        rows={rows.map((item) => ({
          id: item.id,
          href: `/admin/assignments/${item.id}`,
          title: item.reader.contractorName,
          subtitle: `${item.event.name} · ${item.role}`,
          trailing: <StatusBadge kind="assignment" value={item.status} size="sm" />,
          cells: {
            reader: (
              <TextLink href={`/admin/readers/${item.reader.id}`}>{item.reader.contractorName}</TextLink>
            ),
            event: (
              <>
                <TextLink href={`/admin/assignments/${item.id}`}>{item.event.name}</TextLink>
                <p className="text-ink-muted">{item.client.name}</p>
              </>
            ),
            role: item.role,
            status: <StatusBadge kind="assignment" value={item.status} size="sm" />,
            callsheet: item.callSheet
              ? item.acknowledged
                ? `v${item.callSheet.version} accepted`
                : `v${item.callSheet.version} outstanding`
              : "Not issued",
            pay: <span className="tabular-nums">{formatMoney(item.promisedPayCents)}</span>,
          },
        }))}
      />
    </div>
  );
}

export default function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = use(searchParams);
  return <AdminAssignmentsPageBody status={status} />;
}
