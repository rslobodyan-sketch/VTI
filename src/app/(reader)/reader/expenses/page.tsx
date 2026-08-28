"use client";

import { DemoAction } from "@/components/demo/demo-action";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { allExpenseReportViews, compensationForReader, getEvent } from "@/data/queries";
import { catalog } from "@/data/catalog";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function ReaderExpensesPage() {
  const { reader } = useDemoReader();
  const reports = allExpenseReportViews().filter((item) => item.report.readerId === reader.id);
  const pay = compensationForReader(reader.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Expenses"
        description="Photograph receipts and submit the report for the assignment. Reimbursement still needs Chester’s approval."
      />
      <DemoBanner />

      {reports.length ? (
        reports.map((item) => (
          <article key={item.report.id} className="border-y border-line py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg">{item.event?.name}</h2>
              <StatusBadge kind="expense" value={item.report.status} />
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
          </article>
        ))
      ) : (
        <EmptyState title="No expense reports" description="Add receipts after travel." />
      )}

      <DemoAction
        variant="secondary"
        label="Add a receipt (camera later)"
        title="Receipt capture is not connected"
        message="The camera/upload path arrives with file storage. This prototype keeps receipt labels only."
      />

      <section>
        <h2 className="font-serif text-lg">Your pay</h2>
        <ul className="mt-2 grid gap-2 text-sm">
          {pay.map((row) => {
            const event = getEvent(
              catalog.assignments.find((item) => item.id === row.assignmentId)?.eventId ?? "",
            );
            return (
              <li key={row.id} className="flex justify-between gap-3 border-b border-line py-2">
                <span>
                  {event?.name} · {row.kind}
                </span>
                <span>
                  {formatMoney(row.amountCents)}{" "}
                  <StatusBadge kind="pay" value={row.status} />
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
