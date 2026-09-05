"use client";

import { use } from "react";
import { FilterPills } from "@/components/data/filter-pills";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatMoney, formatShortDate } from "@/lib/format";

function AdminExpensesPageBody({ status }: { status?: string }) {
  const { queries } = useOperations();
  const rows = queries.allExpenseReportViews().filter((item) =>
    status ? item.report.status === status : true,
  );

  return (
    <div className="app-page">
      <PageHeader
        title="Expenses"
        description="Reader reimbursements — distinct from assignment compensation. Chester reviews before payment tracking is updated."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Expenses" },
        ]}
      />
      <FilterPills
        basePath="/admin/expenses"
        value={status}
        options={[
          { value: "draft", label: "Draft" },
          { value: "submitted", label: "Under review" },
          { value: "approved", label: "Approved" },
          { value: "reimbursed", label: "Paid" },
        ]}
      />
      <AdminTable
        empty={<EmptyState title="No reader expenses submitted" description="Readers submit reports from the assignment hub." />}
        columns={[
          { key: "reader", header: "Reader" },
          { key: "event", header: "Event" },
          { key: "status", header: "Status" },
          { key: "total", header: "Total" },
          { key: "reviewer", header: "Reviewer" },
          { key: "reimb", header: "Reimbursement" },
        ]}
        rows={rows.map((item) => ({
          id: item.report.id,
          href: `/admin/expenses/${item.report.id}`,
          title: item.reader?.contractorName ?? "Reader",
          subtitle: `${item.event?.name ?? ""} · ${formatMoney(item.totalCents)}`,
          trailing: <StatusBadge kind="expense" value={item.report.status} size="sm" />,
          cells: {
            reader: item.reader?.contractorName,
            event: (
              <TextLink href={`/admin/expenses/${item.report.id}`}>{item.event?.name}</TextLink>
            ),
            status: <StatusBadge kind="expense" value={item.report.status} size="sm" />,
            total: <span className="tabular-nums">{formatMoney(item.totalCents)}</span>,
            reviewer: (
              <span className="text-ink-muted">
                {item.report.reviewedByName ??
                  (item.report.status === "submitted" ? "Awaiting Chester" : "—")}
              </span>
            ),
            reimb: item.reimbursement ? (
              <StatusBadge kind="pay" value={item.reimbursement.status} size="sm" />
            ) : (
              "—"
            ),
          },
        }))}
      />
      <p className="text-xs text-ink-muted">
        {rows.filter((item) => item.report.status === "submitted").length} under review
        {rows.find((item) => item.report.submittedAt)
          ? ` · last ${formatShortDate(rows.find((item) => item.report.submittedAt)!.report.submittedAt!)}`
          : ""}
        . Reimbursement payout is approved separately on Payments. Receipts are filenames only.
      </p>
    </div>
  );
}

export default function AdminExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = use(searchParams);
  return <AdminExpensesPageBody status={status} />;
}
