"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { InstallHint } from "@/components/pwa/install-hint";
import { formatDate, formatMoney } from "@/lib/format";

export default function ReaderHomePage() {
  const { reader } = useDemoReader();
  const { isAcknowledged, expenseStatus } = useDemoSession();
  const { queries, ready } = useOperations();
  const upcoming = queries.upcomingAssignments(reader.id);

  if (!ready) return <RecordPending />;
  const next = upcoming[0];

  if (!next) {
    return (
      <div className="grid gap-5">
        <PageHeader
          title={`Hello, ${reader.contractorName.split(" ")[0]}`}
          description="No upcoming assignment on your calendar."
        />
        <EmptyState
          title="Nothing on the books"
          description="Completed work remains under Jobs and Expenses."
        />
        <ButtonLink href="/reader/assignments" variant="secondary" className="w-full min-h-12">
          Open jobs
        </ButtonLink>
        <InstallHint />
      </div>
    );
  }

  const window = queries.eventWindow(next.eventId);
  const callSheet = queries.currentCallSheet(next.eventId);
  const expenses = queries.expensesForAssignment(next.id);
  const expense = expenses[0];
  const acked = callSheet
    ? isAcknowledged(callSheet.id, reader.id, next.acknowledged)
    : false;
  const liveExpense = expense ? expenseStatus(expense.id, expense.status) : null;

  return (
    <div className="grid gap-5">
      <PageHeader
        title={`Hello, ${reader.contractorName.split(" ")[0]}`}
        description="Your next assignment. Open the packet, check travel, and keep receipts with the job."
      />

      <article className="border-y border-line py-4">
        <p className="app-kicker">Next assignment</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">{next.event.name}</h2>
        <p className="text-ink-muted">{next.client.name}</p>
        <p className="mt-2 text-sm">{window ? formatDate(window.start) : ""}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge kind="assignment" value={next.status} />
          {callSheet ? <StatusBadge kind="callsheet" value={callSheet.status} /> : null}
        </div>
        <p className="mt-3 text-sm">
          Your compensation for this assignment: {formatMoney(next.promisedPayCents)}
        </p>
        <p className="text-sm text-ink-muted">{next.event.travelNotes}</p>
        <ButtonLink href={`/reader/assignments/${next.id}`} className="mt-4 w-full min-h-12">
          Open assignment
        </ButtonLink>
      </article>

      <div>
        <TouchRow
          href={callSheet ? `/reader/call-sheets/${callSheet.id}` : undefined}
          title="Call Sheet"
          meta={
            acked
              ? `v${callSheet?.version} accepted`
              : callSheet
                ? `v${callSheet.version} needs acknowledgement`
                : "Not issued yet"
          }
        />
        <TouchRow
          href="/reader/expenses"
          title="Expenses"
          meta={
            liveExpense
              ? liveExpense.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : "No report yet"
          }
        />
        <TouchRow href="/reader/debrief" title="Debrief" meta="After the last ceremony" />
        <TouchRow href="/reader/calendar" title="Your calendar" meta="Assigned events only" />
      </div>
      <InstallHint />
    </div>
  );
}
