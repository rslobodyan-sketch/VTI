"use client";

import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  currentCallSheet,
  eventWindow,
  expensesForAssignment,
  upcomingAssignments,
} from "@/data/queries";
import { formatDate, formatMoney } from "@/lib/format";

export default function ReaderHomePage() {
  const { reader } = useDemoReader();
  const upcoming = upcomingAssignments(reader.id);
  const next = upcoming[0];

  if (!next) {
    return (
      <div className="grid gap-5">
        <PageHeader
          title={`Hello, ${reader.contractorName.split(" ")[0]}`}
          description="No upcoming assignment in this demo catalog."
        />
        <DemoBanner />
        <EmptyState
          title="Nothing on the books"
          description="Completed work remains under Jobs and Expenses."
        />
      </div>
    );
  }

  const window = eventWindow(next.eventId);
  const callSheet = currentCallSheet(next.eventId);
  const expenses = expensesForAssignment(next.id);
  const expense = expenses[0];

  return (
    <div className="grid gap-5">
      <PageHeader
        title={`Hello, ${reader.contractorName.split(" ")[0]}`}
        description="Your next assignment. Open the packet, check travel, and keep receipts with the job."
      />
      <DemoBanner>Viewing as {reader.contractorName}. This is not a signed-in session.</DemoBanner>

      <article className="border-y border-line py-4">
        <p className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">Next assignment</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">{next.event.name}</h2>
        <p className="text-ink-muted">{next.client.name}</p>
        <p className="mt-2 text-sm">{window ? formatDate(window.start) : ""}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge kind="assignment" value={next.status} />
          {callSheet ? <StatusBadge kind="callsheet" value={callSheet.status} /> : null}
        </div>
        <p className="mt-3 text-sm">
          Your compensation: {formatMoney(next.promisedPayCents)}
          {next.priorYearPayCents ? ` · last year ${formatMoney(next.priorYearPayCents)}` : ""}
        </p>
        <p className="text-sm text-ink-muted">{next.event.travelNotes}</p>
        <Link
          href={`/reader/assignments/${next.id}`}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-accent text-paper-raised"
        >
          Open assignment
        </Link>
      </article>

      <div>
        <TouchRow
          href={callSheet ? `/reader/call-sheets/${callSheet.id}` : undefined}
          title="Call Sheet"
          meta={
            next.acknowledged
              ? `v${callSheet?.version} accepted`
              : callSheet
                ? `v${callSheet.version} needs acknowledgement`
                : "Not issued yet"
          }
        />
        <TouchRow
          href="/reader/expenses"
          title="Expenses"
          meta={expense ? expense.status.replaceAll("_", " ") : "No report yet"}
        />
        <TouchRow href="/reader/debrief" title="Debrief" meta="After the last ceremony" />
      </div>
    </div>
  );
}
