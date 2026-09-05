"use client";

import { SubmitExpenseButton } from "@/components/demo/demo-action";
import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { ReceiptCapture } from "@/components/reader/receipt-capture";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function ReaderExpensesPage() {
  const { reader } = useDemoReader();
  const { expenseStatus } = useDemoSession();
  const queries = useLiveQueries();
  const reports = queries.readerExpenseReportViews(reader.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Expenses"
        description="Photograph a receipt (filename only in this demo), enter amount, category, and description, then submit. Chester reviews; reimbursement is approved separately on Payments. Receipt images are not stored."
      />
      {reports.length ? (
        reports.map((item) => {
          const status = expenseStatus(item.report.id, item.report.status);
          return (
            <article key={item.report.id} className="border-y border-line py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-lg">{item.event?.name}</h2>
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
      ) : (
        <EmptyState title="No expense reports" description="Add a receipt from your next assignment." />
      )}

      {!reports.length ? (
        <OpenReceiptForNextJob readerId={reader.id} />
      ) : null}
    </div>
  );
}

function OpenReceiptForNextJob({ readerId }: { readerId: string }) {
  const queries = useLiveQueries();
  const next = queries.upcomingAssignments(readerId)[0];
  if (!next) return null;
  return (
    <article className="border-y border-line py-4">
      <h2 className="font-serif text-lg">{next.event.name}</h2>
      <p className="text-sm text-ink-muted">Start the expense report from a receipt on this job.</p>
      <ReceiptCapture readerId={readerId} assignmentId={next.id} />
    </article>
  );
}
