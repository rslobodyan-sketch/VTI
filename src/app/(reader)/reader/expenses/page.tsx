"use client";

import { useMemo, useState } from "react";
import { SubmitExpenseButton } from "@/components/demo/demo-action";
import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { ReceiptCapture } from "@/components/reader/receipt-capture";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function ReaderExpensesPage() {
  const { reader } = useDemoReader();
  const { expenseStatus } = useDemoSession();
  const queries = useLiveQueries();
  const reports = queries.readerExpenseReportViews(reader.id);
  const jobs = useMemo(
    () =>
      queries
        .assignmentsForReader(reader.id)
        .filter((item) => ["offered", "accepted", "assigned", "completed"].includes(item.status))
        .map(queries.assignmentView)
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [queries, reader.id],
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const defaultAssignmentId = selectedAssignmentId || jobs[0]?.id || "";
  const selectedAssignment = jobs.find((item) => item.id === defaultAssignmentId);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Expenses"
        description="Add receipts to a job, submit the report, and see its review or reimbursement status. Chester reviews before reimbursement is tracked. Receipt images are not stored in this demo."
      />

      {jobs.length ? (
        <section className="border-y border-line py-4">
          <div className="grid gap-2">
            <div>
              <h2 className="font-serif text-lg">Add an expense</h2>
              <p className="text-sm text-ink-muted">
                Keep every receipt tied to the assignment it belongs to. If a previous report is already approved or paid, a new draft report is created for additional receipts.
              </p>
            </div>
            <Select
              id="expense-assignment"
              aria-label="Job"
              value={defaultAssignmentId}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              options={jobs.map((item) => ({
                value: item.id,
                label: `${item.event.name} · ${queries.eventWindow(item.eventId) ? formatShortDate(queries.eventWindow(item.eventId)!.start) : "date TBD"}`,
              }))}
            />
            {selectedAssignment ? (
              <ReceiptCapture
                readerId={reader.id}
                assignmentId={selectedAssignment.id}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {reports.length ? (
        reports.map((item) => {
          const status = expenseStatus(item.report.id, item.report.status);
          return (
            <article key={item.report.id} className="border-y border-line py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-lg">{item.event?.name}</h2>
                  <p className="text-sm text-ink-muted">{item.reader?.contractorName}</p>
                </div>
                <StatusBadge kind="expense" value={status} />
              </div>
              <p className="text-sm text-ink-muted">{item.report.notes}</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {item.lines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-3">
                    <span>
                      {formatShortDate(line.incurredOn)} · {line.category}
                      <span className="block text-ink-muted">
                        {line.receiptLabel ?? "Receipt"} · {line.description}
                      </span>
                    </span>
                    <span className="tabular-nums">{formatMoney(line.amountCents)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-medium">Total {formatMoney(item.totalCents)}</p>
              {item.reimbursement ? (
                <p className="mt-1 text-sm">
                  Reimbursement <StatusBadge kind="pay" value={item.reimbursement.status} />
                </p>
              ) : null}
              <div className="mt-3">
                <SubmitExpenseButton reportId={item.report.id} catalogStatus={item.report.status} />
              </div>
              {status === "draft" || status === "submitted" || status === "rejected" ? (
                <ReceiptCapture
                  readerId={reader.id}
                  assignmentId={item.report.assignmentId}
                  reportId={item.report.id}
                />
              ) : null}
            </article>
          );
        })
      ) : !jobs.length ? (
        <EmptyState title="No expense jobs" description="Expenses become available when you have an assignment." />
      ) : null}
    </div>
  );
}
