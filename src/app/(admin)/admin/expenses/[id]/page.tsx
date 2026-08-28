import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { expenseReportView } from "@/data/queries";
import { formatMoney, formatShortDate } from "@/lib/format";

export function generateStaticParams() {
  return catalog.expenseReports.map((item) => ({ id: item.id }));
}

export default async function AdminExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = catalog.expenseReports.find((item) => item.id === id);
  if (!report) notFound();
  const view = expenseReportView(report);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Expense report"
        description={`${view.reader?.contractorName ?? "Reader"} · ${view.event?.name ?? "Assignment"}`}
      />
      <DemoBanner>Receipt images are represented by labels only. No files are stored in this prototype.</DemoBanner>
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
      <Section title="Lines">
        <TableWrap>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Category</Th>
              <Th>Description</Th>
              <Th>Receipt</Th>
              <Th>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {view.lines.map((line) => (
              <tr key={line.id}>
                <Td>{formatShortDate(line.incurredOn)}</Td>
                <Td>{line.category}</Td>
                <Td>{line.description}</Td>
                <Td className="text-ink-muted">{line.receiptLabel ?? "No image in demo"}</Td>
                <Td className="tabular-nums">{formatMoney(line.amountCents)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <p className="mt-3 text-sm font-medium">Total {formatMoney(view.totalCents)}</p>
      </Section>
      {view.assignment ? (
        <p className="text-sm">
          <Link href={`/admin/assignments/${view.assignment.id}`} className="underline-offset-2 hover:underline">
            Open assignment
          </Link>
        </p>
      ) : null}
    </div>
  );
}
