"use client";

import { useParams } from "next/navigation";
import { AcceptAssignmentButton } from "@/components/demo/demo-action";
import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { StatusBadge } from "@/components/status/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TouchRow } from "@/components/reader/touch-row";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatDateTime, formatMoney } from "@/lib/format";

export default function ReaderAssignmentHubPage() {
  const params = useParams<{ id: string }>();
  const { reader } = useDemoReader();
  const { isAcknowledged, assignmentStatus, expenseStatus } = useDemoSession();
  const queries = useLiveQueries();
  const assignment = queries.getAssignment(params.id);
  const view = assignment ? queries.assignmentView(assignment) : null;

  if (!view || view.readerId !== reader.id) {
    return (
      <div className="grid gap-5">
        <PageHeader
          title="Assignment"
          description="This job is not assigned to the reader currently signed in."
        />
        <EmptyState
          title="Not your assignment"
          description="Switch reader in the header, or go back to Jobs."
        />
        <ButtonLink href="/reader/assignments" variant="secondary" className="w-full">
          Back to jobs
        </ButtonLink>
      </div>
    );
  }

  const ceremonies = queries.ceremoniesForEvent(view.eventId);
  const callSheet = queries.currentCallSheet(view.eventId);
  const files = queries.documentsForEvent(view.eventId).filter((item) => item.visibleToAssignedReaders);
  const notes = queries.notesForEvent(view.eventId).filter(
    (item) => item.visibility === "admin_and_assigned_readers",
  );
  const expense = queries.expensesForAssignment(view.id)[0];
  const liveStatus = assignmentStatus(view.id, view.status);
  const acked = callSheet
    ? isAcknowledged(callSheet.id, reader.id, view.acknowledged)
    : false;
  const liveExpense = expense ? expenseStatus(expense.id, expense.status) : null;

  return (
    <div className="grid gap-5">
      <PageHeader title={view.event.name} description={view.client.name} />
      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="assignment" value={liveStatus} />
        <span className="text-sm capitalize text-ink-muted">{view.role}</span>
      </div>

      <section className="grid gap-3 text-sm">
        {ceremonies.map((ceremony) => (
          <p key={ceremony.id}>
            <span className="font-medium">{ceremony.name}</span>
            <span className="block text-ink-muted">
              {formatDateTime(ceremony.startsAt)} · {ceremony.venueName}
            </span>
          </p>
        ))}
      </section>

      <section className="grid gap-1.5 border-y border-line py-4 text-sm">
        <p>
          <span className="text-ink-faint">Your pay </span>
          {formatMoney(view.promisedPayCents)}
          {view.priorYearPayCents ? ` · last year ${formatMoney(view.priorYearPayCents)}` : ""}
        </p>
        <p>
          <span className="text-ink-faint">Travel </span>
          {view.event.travelNotes}
        </p>
        <p>
          <span className="text-ink-faint">Lodging </span>
          {view.event.accommodationNotes}
        </p>
        <p>
          <span className="text-ink-faint">Transfers </span>
          {view.event.transferNotes}
        </p>
      </section>

      {callSheet ? (
        <ButtonLink href={`/reader/call-sheets/${callSheet.id}`} className="w-full min-h-12">
          {acked
            ? `Open Call Sheet v${callSheet.version}`
            : `Review and accept Call Sheet v${callSheet.version}`}
        </ButtonLink>
      ) : (
        <p className="text-sm text-ink-muted">Call Sheet has not been issued.</p>
      )}

      {liveStatus === "offered" ? (
        <AcceptAssignmentButton assignmentId={view.id} catalogStatus={view.status} />
      ) : null}

      <section>
        <h2 className="app-kicker">University files and instructions</h2>
        <div className="mt-1">
          {files.map((doc) => (
            <TouchRow
              key={doc.id}
              title={doc.originalFilename}
              meta={doc.statusNote}
            />
          ))}
          {notes.map((note) => (
            <TouchRow key={note.id} title="University instruction" meta={note.body} />
          ))}
          {!files.length && !notes.length ? (
            <p className="py-3 text-sm text-ink-muted">No files on this assignment yet.</p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-2">
        <ButtonLink href="/reader/expenses" variant="secondary" className="w-full min-h-12">
          Expenses {liveExpense ? `· ${liveExpense.replaceAll("_", " ")}` : "· add receipts"}
        </ButtonLink>
        <ButtonLink href="/reader/debrief" variant="secondary" className="w-full min-h-12">
          Debrief
        </ButtonLink>
      </div>
    </div>
  );
}
