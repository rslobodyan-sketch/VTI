import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { allExpenseReportViews } from "@/data/queries";
import { formatMoney, formatShortDate } from "@/lib/format";

export default function AdminExpensesPage() {
  const rows = allExpenseReportViews();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Expenses"
        description="Reader expense reports tied to an assignment. Review, then reimbursement still requires Chester’s payment approval."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>Reader</Th>
            <Th>Event</Th>
            <Th>Status</Th>
            <Th>Total</Th>
            <Th>Reviewer</Th>
            <Th>Reimbursement</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.report.id}>
              <Td>{item.reader?.contractorName}</Td>
              <Td>
                <Link href={`/admin/expenses/${item.report.id}`} className="underline-offset-2 hover:underline">
                  {item.event?.name}
                </Link>
              </Td>
              <Td>
                <StatusBadge kind="expense" value={item.report.status} />
              </Td>
              <Td className="tabular-nums">{formatMoney(item.totalCents)}</Td>
              <Td className="text-ink-muted">
                {item.report.reviewedByName ?? (item.report.status === "submitted" ? "Awaiting Chester" : "—")}
              </Td>
              <Td>
                {item.reimbursement ? (
                  <StatusBadge kind="pay" value={item.reimbursement.status} />
                ) : (
                  "—"
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <p className="text-xs text-ink-muted">
        Submitted {rows.filter((item) => item.report.status === "submitted").length} report
        {rows.some((item) => item.report.submittedAt)
          ? ` · last ${formatShortDate(
              rows.find((item) => item.report.submittedAt)?.report.submittedAt ?? "2026-08-22",
            )}`
          : ""}
      </p>
    </div>
  );
}
