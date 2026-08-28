"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DemoAction } from "@/components/demo/demo-action";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  assignmentView,
  ceremoniesForEvent,
  currentCallSheet,
  documentsForEvent,
  expensesForAssignment,
  getAssignment,
  notesForEvent,
} from "@/data/queries";
import { formatDateTime, formatMoney } from "@/lib/format";

export default function ReaderAssignmentHubPage() {
  const params = useParams<{ id: string }>();
  const { reader } = useDemoReader();
  const assignment = getAssignment(params.id);
  const view = assignment ? assignmentView(assignment) : null;

  if (!view || view.readerId !== reader.id) {
    return (
      <div className="grid gap-5">
        <PageHeader title="Assignment" description="This job is not on the current demo reader." />
        <EmptyState
          title="Not your assignment"
          description="Switch the demo reader in the header, or go back to Jobs."
        />
      </div>
    );
  }

  const ceremonies = ceremoniesForEvent(view.eventId);
  const callSheet = currentCallSheet(view.eventId);
  const files = documentsForEvent(view.eventId).filter((item) => item.visibleToAssignedReaders);
  const notes = notesForEvent(view.eventId).filter(
    (item) => item.visibility === "admin_and_assigned_readers",
  );
  const expense = expensesForAssignment(view.id)[0];

  return (
    <div className="grid gap-5">
      <PageHeader title={view.event.name} description={view.client.name} />
      <DemoBanner />
      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="assignment" value={view.status} />
        <span className="text-sm capitalize text-ink-muted">{view.role}</span>
      </div>

      <section className="grid gap-2 text-sm">
        {ceremonies.map((ceremony) => (
          <p key={ceremony.id}>
            <span className="font-medium">{ceremony.name}</span>
            <span className="block text-ink-muted">
              {formatDateTime(ceremony.startsAt)} · {ceremony.venueName}
            </span>
          </p>
        ))}
      </section>

      <section className="grid gap-1 border-y border-line py-4 text-sm">
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
        <Link
          href={`/reader/call-sheets/${callSheet.id}`}
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-accent px-3 text-paper-raised"
        >
          {view.acknowledged ? `Open Call Sheet v${callSheet.version}` : `Review and accept Call Sheet v${callSheet.version}`}
        </Link>
      ) : (
        <p className="text-sm text-ink-muted">Call Sheet has not been issued.</p>
      )}

      <section>
        <h2 className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">University instructions</h2>
        <ul className="mt-2 grid gap-2 text-sm">
          {files.map((doc) => (
            <li key={doc.id}>
              {doc.originalFilename}
              <span className="block text-ink-muted">{doc.statusNote}</span>
            </li>
          ))}
          {notes.map((note) => (
            <li key={note.id} className="text-ink-muted">
              {note.body}
            </li>
          ))}
        </ul>
      </section>

      <Link href="/reader/expenses" className="text-sm underline-offset-2 hover:underline">
        Expenses {expense ? `· ${expense.status.replaceAll("_", " ")}` : "· start a report"}
      </Link>
      <Link href="/reader/debrief" className="text-sm underline-offset-2 hover:underline">
        Debrief
      </Link>

      {view.status === "offered" ? (
        <DemoAction
          label="Accept assignment"
          title="Acceptance is not saved"
          message="Click-to-accept will persist after authentication is added."
        />
      ) : null}
    </div>
  );
}
