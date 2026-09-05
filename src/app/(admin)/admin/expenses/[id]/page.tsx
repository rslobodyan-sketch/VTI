"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FactGrid } from "@/components/ui/fact-grid";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function AdminExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { catalog, queries, reviewExpense, ready } = useOperations();
  const { notify } = useToast();
  const report = catalog.expenseReports.find((item) => item.id === id);
  if (!report) {
    if (!ready) return <RecordPending />;
    notFound();
  }
  const view = queries.expenseReportView(report);

  return (
    <div className="app-page">
      <PageHeader
        title="Expense report"
        description={`${view.reader?.contractorName ?? "Reader"} · ${view.event?.name ?? "Assignment"}. Reimbursement is separate from assignment compensation.`}
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/expenses", label: "Expenses" },
          { label: "Report" },
        ]}
        actions={
          view.assignment ? (
            <ButtonLink href={`/admin/assignments/${view.assignment.id}`}>Open assignment</ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="expense" value={view.report.status} />
        {view.reimbursement ? <StatusBadge kind="pay" value={view.reimbursement.status} /> : null}
      </div>
      <p className="text-sm text-ink-muted">{view.report.notes}</p>
      <p className="text-sm">
        {view.report.submittedAt ? `Submitted ${formatShortDate(view.report.submittedAt)}` : "Draft"}
        {view.report.reviewedByName
          ? ` · reviewed by ${view.report.reviewedByName}`
          : view.report.status === "submitted"
            ? " · awaiting Chester"
            : ""}
      </p>

      <div id="expense-associations">
        <FactGrid
          columns={3}
          items={[
            {
              label: "University",
              value: view.client ? (
                <TextLink href={`/admin/clients/${view.client.id}`}>{view.client.name}</TextLink>
              ) : (
                "—"
              ),
            },
            {
              label: "Event",
              value: view.event ? (
                <TextLink href={`/admin/events/${view.event.id}`}>{view.event.name}</TextLink>
              ) : (
                "—"
              ),
            },
            {
              label: "Assignment",
              value: view.assignment ? (
                <TextLink href={`/admin/assignments/${view.assignment.id}`}>
                  {view.reader?.contractorName ?? "Assignment"}
                </TextLink>
              ) : (
                "—"
              ),
            },
            { label: "Amount", value: formatMoney(view.totalCents) },
            { label: "Lines", value: String(view.lines.length) },
          ]}
        />
      </div>

      <Section title="Lines">
        <AdminTable
          columns={[
            { key: "date", header: "Date" },
            { key: "category", header: "Category" },
            { key: "description", header: "Description" },
            { key: "receipt", header: "Receipt" },
            { key: "amount", header: "Amount" },
          ]}
          rows={view.lines.map((line) => ({
            id: line.id,
            title: line.description,
            subtitle: `${formatShortDate(line.incurredOn)} · ${line.category}`,
            trailing: formatMoney(line.amountCents),
            cells: {
              date: formatShortDate(line.incurredOn),
              category: line.category,
              description: line.description,
              receipt: line.receiptLabel ?? "On file with the reader",
              amount: <span className="tabular-nums">{formatMoney(line.amountCents)}</span>,
            },
          }))}
        />
        <p className="mt-3 text-sm font-medium">Total {formatMoney(view.totalCents)}</p>
        <p className="mt-1 text-xs text-ink-muted">
          Receipt column is the filename. Image bytes are not stored in this demo.
        </p>
      </Section>

      {view.report.status === "submitted" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              reviewExpense(view.report.id, "approved");
              notify({
                title: "Expense approved.",
                message: "Reimbursement still needs Chester’s payment approval on Payments.",
              });
            }}
          >
            Approve expense
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              reviewExpense(view.report.id, "rejected");
              notify({ title: "Expense returned." });
            }}
          >
            Return to reader
          </Button>
        </div>
      ) : null}
    </div>
  );
}
