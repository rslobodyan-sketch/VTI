"use client";

import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { FactGrid } from "@/components/ui/fact-grid";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { dayKey, formatMoney, formatShortDate } from "@/lib/format";
import type { ReaderCompensation } from "@/types/domain";

export default function AdminPaymentsPage() {
  const { catalog, queries } = useOperations();
  const pay = queries.allCompensationViews();
  const invoices = catalog.invoices.map((invoice) => ({
    invoice,
    client: queries.getClient(invoice.clientId),
    event: invoice.eventId ? queries.getEvent(invoice.eventId) : undefined,
    received: catalog.universityPayments.filter((item) => item.invoiceId === invoice.id),
  }));
  const compensation = pay.filter((item) => item.row.kind !== "reimbursement");
  const reimbursements = pay.filter((item) => item.row.kind === "reimbursement");
  const invoiceOutstanding = invoices.reduce((sum, item) => {
    const receivedCents = item.received.reduce((inner, row) => inner + row.amountCents, 0);
    return sum + Math.max(0, item.invoice.amountCents - receivedCents);
  }, 0);
  const payAwaitingApproval = compensation
    .filter((item) => item.row.status === "promised" || item.row.status === "pending_approval")
    .reduce((sum, item) => sum + item.row.amountCents, 0);
  const reimbAwaitingApproval = reimbursements
    .filter((item) => item.row.status === "promised" || item.row.status === "pending_approval")
    .reduce((sum, item) => sum + item.row.amountCents, 0);

  return (
    <div className="app-page">
      <PageHeader
        title="Payment tracking"
        description="Tracked in VTI — Wave is official for university invoices, estimates, and the general ledger. Patriot remains the intended reader pay initiator. Chester must approve every reader payment. Nothing is paid automatically."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Payments" },
        ]}
      />
      <FactGrid
        columns={3}
        items={[
          { label: "University outstanding (tracking)", value: formatMoney(invoiceOutstanding) },
          { label: "Compensation awaiting Chester", value: formatMoney(payAwaitingApproval) },
          { label: "Reimbursements awaiting Chester", value: formatMoney(reimbAwaitingApproval) },
        ]}
      />
      <p className="text-sm text-ink-muted">
        Three ledgers: what universities owe VTI, what VTI owes readers for assignments, and what VTI
        owes for receipts. Wave and Patriot are not connected — do not treat these totals as the
        official books.
      </p>

      <Section title="University receivables" description="Tracked in VTI — Wave is official.">
        <AdminTable
          columns={[
            { key: "university", header: "University" },
            { key: "event", header: "Event" },
            { key: "amount", header: "Invoice amount" },
            { key: "status", header: "Status" },
            { key: "issued", header: "Issued" },
            { key: "received", header: "Received / outstanding" },
          ]}
          rows={invoices.map((item) => {
            const receivedCents = item.received.reduce((sum, row) => sum + row.amountCents, 0);
            const outstanding = item.invoice.amountCents - receivedCents;
            return {
              id: item.invoice.id,
              href: item.event ? `/admin/events/${item.event.id}` : undefined,
              title: item.client?.name ?? "Invoice",
              subtitle: item.event?.name,
              trailing: <StatusBadge kind="invoice" value={item.invoice.status} size="sm" />,
              cells: {
                university: item.client?.name,
                event: item.event ? (
                  <TextLink href={`/admin/events/${item.event.id}`}>{item.event.name}</TextLink>
                ) : (
                  "—"
                ),
                amount: <span className="tabular-nums">{formatMoney(item.invoice.amountCents)}</span>,
                status: <StatusBadge kind="invoice" value={item.invoice.status} size="sm" />,
                issued: item.invoice.billedOn ? formatShortDate(item.invoice.billedOn) : "—",
                received: (
                  <span className="text-ink-muted">
                    {receivedCents
                      ? `${formatMoney(receivedCents)} received`
                      : "None received"}
                    {outstanding > 0 ? ` · ${formatMoney(outstanding)} outstanding` : ""}
                  </span>
                ),
              },
            };
          })}
        />
      </Section>

      <Section title="Reader payables — compensation" description="Patriot is the intended pay initiator. Approval is always Chester’s.">
        <AdminTable
          columns={[
            { key: "reader", header: "Reader" },
            { key: "event", header: "Event" },
            { key: "type", header: "Type" },
            { key: "amount", header: "Amount" },
            { key: "approval", header: "Approval" },
            { key: "status", header: "Payment status" },
            { key: "action", header: "Next" },
          ]}
          rows={compensation.map((item) => ({
            id: item.row.id,
            title: item.reader?.contractorName ?? "Reader",
            subtitle: item.event?.name,
            trailing: (
              <div className="grid justify-items-end gap-2">
                <StatusBadge kind="pay" value={item.row.status} size="sm" />
                <PayActions row={item.row} />
              </div>
            ),
            cells: {
              reader: item.reader?.contractorName,
              event: item.event && item.assignment ? (
                <TextLink href={`/admin/assignments/${item.assignment.id}`}>{item.event.name}</TextLink>
              ) : (
                "—"
              ),
              type: item.row.kind,
              amount: <span className="tabular-nums">{formatMoney(item.row.amountCents)}</span>,
              approval: item.row.approvedByName
                ? `${item.row.approvedByName}${item.row.approvedAt ? ` · ${formatShortDate(item.row.approvedAt)}` : ""}`
                : "Required before payout",
              status: (
                <span>
                  <StatusBadge kind="pay" value={item.row.status} size="sm" />
                  {item.row.checkNumber ? (
                    <span className="mt-1 block text-xs text-ink-muted">Check {item.row.checkNumber}</span>
                  ) : null}
                </span>
              ),
              action: <PayActions row={item.row} />,
            },
          }))}
        />
      </Section>

      <Section title="Reader payables — reimbursements">
        <AdminTable
          columns={[
            { key: "reader", header: "Reader" },
            { key: "event", header: "Event" },
            { key: "amount", header: "Amount" },
            { key: "approval", header: "Approval" },
            { key: "status", header: "Payment status" },
            { key: "action", header: "Next" },
          ]}
          rows={reimbursements.map((item) => ({
            id: item.row.id,
            title: item.reader?.contractorName ?? "Reader",
            subtitle: item.event?.name ?? "Reimbursement",
            trailing: (
              <div className="grid justify-items-end gap-2">
                <StatusBadge kind="pay" value={item.row.status} size="sm" />
                <PayActions row={item.row} />
              </div>
            ),
            cells: {
              reader: item.reader?.contractorName,
              event: item.event?.name ?? "—",
              amount: <span className="tabular-nums">{formatMoney(item.row.amountCents)}</span>,
              approval: item.row.approvedByName ?? "Required before payout",
              status: (
                <span>
                  <StatusBadge kind="pay" value={item.row.status} size="sm" />
                  {item.row.checkNumber ? (
                    <span className="mt-1 block text-xs text-ink-muted">Check {item.row.checkNumber}</span>
                  ) : null}
                </span>
              ),
              action: <PayActions row={item.row} />,
            },
          }))}
        />
        <p className="text-xs text-ink-muted">
          Compensation is assignment pay. Reimbursement is out-of-pocket expense recovery. They are
          approved separately. Marking paid or cashed is tracking only — Patriot and the bank are not
          connected. Tracked in VTI — Wave is official for the university side of the books.
        </p>
      </Section>
    </div>
  );
}

function PayActions({ row }: { row: ReaderCompensation }) {
  const { patchCompensation } = useOperations();
  const { notify } = useToast();
  const today = dayKey(new Date().toISOString());

  if (row.status === "void" || row.status === "cashed") {
    return <span className="text-xs text-ink-faint">No action</span>;
  }

  if (row.status === "promised" || row.status === "pending_approval") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            patchCompensation(row.id, {
              status: "approved",
              approvedByName: "Chester Tadeja",
              approvedAt: new Date().toISOString(),
            });
            notify({ title: "Chester approved this payment." });
          }}
        >
          Approve
        </Button>
        <VoidButton id={row.id} />
      </div>
    );
  }
  if (row.status === "approved") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            patchCompensation(row.id, { status: "queued" });
            notify({
              title: "Queued for payout (tracking only).",
              message: "Patriot is not connected. Nothing was sent to payroll.",
            });
          }}
        >
          Queue for payout
        </Button>
        <VoidButton id={row.id} />
      </div>
    );
  }
  if (row.status === "queued") {
    return (
      <div className="grid justify-items-end gap-2">
        <label className="sr-only" htmlFor={`check-${row.id}`}>
          Check number
        </label>
        <input
          id={`check-${row.id}`}
          className="w-28 rounded-[var(--radius-md)] border border-line bg-paper-raised px-2 py-1 text-sm"
          placeholder="Check #"
          defaultValue={row.checkNumber ?? ""}
          onBlur={(event) => {
            const value = event.target.value.trim();
            if (value !== (row.checkNumber ?? "")) {
              patchCompensation(row.id, { checkNumber: value || undefined });
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const input = document.getElementById(`check-${row.id}`) as HTMLInputElement | null;
              patchCompensation(row.id, {
                status: "paid",
                paidOn: today,
                checkNumber: input?.value.trim() || row.checkNumber,
              });
              notify({
                title: "Marked paid (tracking only).",
                message: "Patriot is not connected. Record the official payout there as usual.",
              });
            }}
          >
            Mark paid
          </Button>
          <VoidButton id={row.id} />
        </div>
      </div>
    );
  }
  if (row.status === "paid") {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          patchCompensation(row.id, { status: "cashed", cashedOn: today });
          notify({
            title: "Cashed date recorded.",
            message: "Bank feed is not connected. Enter the date you confirmed the check cleared.",
          });
        }}
      >
        Mark cashed
      </Button>
    );
  }
  return <span className="text-xs text-ink-faint">No action</span>;
}

function VoidButton({ id }: { id: string }) {
  const { patchCompensation } = useOperations();
  const { notify } = useToast();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        patchCompensation(id, { status: "void" });
        notify({
          title: "Payment voided (tracking only).",
          message: "No money was moved. Wave and Patriot are not connected.",
        });
      }}
    >
      Void
    </Button>
  );
}
