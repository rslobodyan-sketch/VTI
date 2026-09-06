"use client";

import { useState } from "react";
import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { FactGrid } from "@/components/ui/fact-grid";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { dayKey, formatMoney, formatShortDate } from "@/lib/format";

export default function FinancialCommandCenterPage() {
  const { queries, recordUniversityPayment, patchInvoice } = useOperations();
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const { notify } = useToast();
  const finance = queries.financialCommandCenter();
  const today = dayKey(new Date().toISOString());
  const overdue = finance.invoices.filter((row) => row.outstandingCents > 0 && row.invoice.dueOn && row.invoice.dueOn < today);

  return (
    <div className="app-page">
      <PageHeader
        title="Financial Command Center"
        description="One operational view of university receivables, reader commitments, expenses, and margin. Wave remains the official accounting source of truth."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Financial" }]}
      />

      <FactGrid columns={3} items={[
        { label: "University receivables", value: formatMoney(finance.outstandingReceivablesCents) },
        { label: "Reader commitments", value: formatMoney(finance.readerPayCommittedCents) },
        { label: "Approved / queued pay", value: formatMoney(finance.approvedOrQueuedCents) },
        { label: "Submitted expenses", value: formatMoney(finance.submittedExpenseCents) },
        { label: "Tracked billed", value: formatMoney(finance.billedCents) },
        { label: "Net known pipeline", value: formatMoney(finance.netKnownPipelineCents) },
      ]} />

      <p className="text-sm text-ink-muted">
        Net known pipeline is tracked receivables less reader commitments and submitted/approved expenses. It is an operational planning figure, not cash-on-hand or an accounting balance.
      </p>

      <Section title="University receivables" description="What has been billed, what has been received, and what Chester still needs to collect.">
        <AdminTable
          columns={[
            { key: "university", header: "University" },
            { key: "event", header: "Event" },
            { key: "invoice", header: "Invoice" },
            { key: "received", header: "Received" },
            { key: "outstanding", header: "Outstanding" },
            { key: "next", header: "Next" },
          ]}
          rows={finance.invoices.map((row) => ({
            id: row.invoice.id,
            title: row.client?.name ?? "University",
            subtitle: row.event?.name,
            cells: {
              university: row.client?.name ?? "—",
              event: row.event ? <TextLink href={`/admin/events/${row.event.id}`}>{row.event.name}</TextLink> : "—",
              invoice: <><StatusBadge kind="invoice" value={row.invoice.status} size="sm" /><span className="ml-2 tabular-nums">{formatMoney(row.invoice.amountCents)}</span></>,
              received: formatMoney(row.receivedCents),
              outstanding: <span className={row.outstandingCents ? "font-medium text-warning" : "text-success"}>{formatMoney(row.outstandingCents)}</span>,
              next: row.outstandingCents ? (
                <div className="flex flex-wrap gap-2">
                  {row.invoice.status === "draft" ? <Button size="sm" onClick={() => { patchInvoice(row.invoice.id, { status: "sent", billedOn: today }); notify({ title: "Invoice marked sent." }); }}>Mark sent</Button> : null}
                  {row.invoice.status !== "paid" && row.invoice.status !== "draft" ? <Button size="sm" variant="secondary" onClick={() => { setPaymentInvoiceId(row.invoice.id); setPaymentAmount((row.outstandingCents / 100).toFixed(2)); }}>Record payment</Button> : null}
                  {row.invoice.status !== "paid" && row.invoice.status !== "reminded" ? <Button size="sm" variant="ghost" onClick={() => { patchInvoice(row.invoice.id, { status: "reminded", lastRemindedOn: today }); notify({ title: "Invoice reminder recorded." }); }}>Record reminder</Button> : null}
                </div>
              ) : <span className="text-success">Collected</span>,
            },
          }))}
        />
      </Section>

      <Section title="Attention: overdue / open receivables">
        {overdue.length ? <ul className="grid gap-0 border-y border-line">{overdue.map((row) => <li key={row.invoice.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"><div><p className="font-medium">{row.client?.name}</p><p className="text-sm text-ink-muted">Due {formatShortDate(row.invoice.dueOn!)} · {row.event?.name ?? "Invoice"}</p></div><span className="font-medium tabular-nums text-warning">{formatMoney(row.outstandingCents)}</span></li>)}</ul> : <p className="text-sm text-ink-muted">No overdue tracked invoices.</p>}
      </Section>

      <Section title="Reader financial overview" description="Admin-only operational reporting. Readers never see other readers or historical financial information.">
        <AdminTable
          columns={[
            { key: "reader", header: "Reader" },
            { key: "assignments", header: "Assignments" },
            { key: "completed", header: "Completed" },
            { key: "current", header: "Current promised" },
            { key: "paid", header: "Paid / cashed" },
            { key: "expenses", header: "Expenses" },
            { key: "prior", header: "Prior year" },
          ]}
          rows={finance.readerRows.map((row) => ({
            id: row.reader.id,
            href: `/admin/readers/${row.reader.id}`,
            title: row.reader.contractorName,
            cells: {
              reader: <TextLink href={`/admin/readers/${row.reader.id}`}>{row.reader.contractorName}</TextLink>,
              assignments: row.assignments,
              completed: row.completedAssignments,
              current: formatMoney(row.currentCompensationCents),
              paid: formatMoney(row.totalPaidCents),
              expenses: formatMoney(row.expenseCents),
              prior: row.priorYearPayCents ? formatMoney(row.priorYearPayCents) : "—",
            },
          }))}
        />
      </Section>

      <Section title="University performance" description="This is the operational view Chester described from the Payouts workbook: quoted, billed, collected, reader cost, expenses, and margin.">
        <AdminTable
          columns={[
            { key: "university", header: "University" },
            { key: "events", header: "Events" },
            { key: "quoted", header: "Quoted" },
            { key: "billed", header: "Billed" },
            { key: "received", header: "Received" },
            { key: "reader", header: "Reader pay" },
            { key: "expenses", header: "Expenses" },
            { key: "margin", header: "Margin" },
          ]}
          rows={finance.universityRows.map((row) => ({
            id: row.client.id,
            href: `/admin/clients/${row.client.id}`,
            title: row.client.name,
            cells: {
              university: <TextLink href={`/admin/clients/${row.client.id}`}>{row.client.name}</TextLink>,
              events: row.events,
              quoted: formatMoney(row.quoteCents),
              billed: formatMoney(row.billedCents),
              received: formatMoney(row.receivedCents),
              reader: formatMoney(row.compensationCents),
              expenses: formatMoney(row.expenseCents),
              margin: <span className={row.marginCents >= 0 ? "text-success" : "text-danger"}>{formatMoney(row.marginCents)}</span>,
            },
          }))}
        />
      </Section>

      <Dialog open={Boolean(paymentInvoiceId)} title="Record university payment" onClose={() => setPaymentInvoiceId(null)}>
        {paymentInvoiceId ? (() => {
          const row = finance.invoices.find((item) => item.invoice.id === paymentInvoiceId);
          if (!row) return null;
          return (
            <form className="grid gap-4" onSubmit={(e) => {
              e.preventDefault();
              const amount = Math.round(Number(paymentAmount) * 100);
              if (!Number.isFinite(amount) || amount <= 0) return;
              recordUniversityPayment({ invoiceId: row.invoice.id, amountCents: Math.min(amount, row.outstandingCents), paidOn: today, method: "Manual tracking — Wave official" });
              notify({ title: "University payment recorded." });
              setPaymentInvoiceId(null);
            }}>
              <p className="text-sm text-ink-muted">{row.client?.name} · {row.event?.name ?? "Invoice"} · {formatMoney(row.outstandingCents)} outstanding.</p>
              <Field id="payment-amount" label="Amount received (USD)"><Input id="payment-amount" inputMode="decimal" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} /></Field>
              <Button type="submit">Record payment</Button>
            </form>
          );
        })() : null}
      </Dialog>
    </div>
  );
}
