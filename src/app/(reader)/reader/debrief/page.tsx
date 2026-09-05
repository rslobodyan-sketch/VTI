"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";

export default function ReaderDebriefPage() {
  const { reader } = useDemoReader();
  const { catalog, queries, submitDebrief } = useOperations();
  const { notify } = useToast();
  const completed = queries
    .readerAssignmentViews(reader.id)
    .filter((item) => item.status === "completed");
  const pending = queries
    .readerAssignmentViews(reader.id)
    .filter((item) => ["assigned", "accepted"].includes(item.status));
  const mine = catalog.debriefs.filter((item) => item.readerId === reader.id);
  const target = pending[0] ?? completed[0];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Debrief"
        description="After the last ceremony: the event, other readers, university staff, problems, plan versus execution, and ratings. Work-again is marked by Chester on the event."
      />

      {mine.map((row) => {
        const event = queries.getEvent(row.eventId);
        return (
          <article key={row.id} className="border-y border-line py-4 text-sm">
            <h2 className="font-serif text-lg">{event?.name}</h2>
            <p className="text-ink-muted">{formatDateTime(row.submittedAt)}</p>
            <p className="mt-2">{row.thoughtsAboutEvent}</p>
            <p className="mt-1 text-ink-muted">Other readers: {row.thoughtsAboutOtherReaders}</p>
            <p className="text-ink-muted">Staff: {row.interactionWithUniversityStaff}</p>
            <p className="text-ink-muted">Problems: {row.problemsOrConflicts}</p>
            <p className="text-ink-muted">Plan vs execution: {row.planVersusExecution}</p>
            <p className="mt-2">
              Ratings 1–5: event {row.ratingEvent} · staff {row.ratingStaff} · operations{" "}
              {row.ratingOperations}
            </p>
            {event?.workAgainRecommendation ? (
              <p className="mt-1 text-ink-muted">
                Chester marked this university as work-again / event ready.
              </p>
            ) : null}
          </article>
        );
      })}

      {target && !mine.some((row) => row.assignmentId === target.id) ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            submitDebrief({
              assignmentId: target.id,
              eventId: target.eventId,
              readerId: reader.id,
              thoughtsAboutEvent: String(data.get("event") ?? ""),
              thoughtsAboutOtherReaders: String(data.get("readers") ?? ""),
              interactionWithUniversityStaff: String(data.get("staff") ?? ""),
              problemsOrConflicts: String(data.get("problems") ?? ""),
              planVersusExecution: String(data.get("plan") ?? ""),
              ratingEvent: Number(data.get("ratingEvent") || 4),
              ratingStaff: Number(data.get("ratingStaff") || 4),
              ratingOperations: Number(data.get("ratingOps") || 4),
            });
            notify({ title: "Debrief completed." });
          }}
        >
          <h2 className="font-serif text-lg">{target.event.name}</h2>
          <p className="text-sm text-ink-muted">
            Submit within 72 hours of the last ceremony.
          </p>
          <Field id="debrief-event" label="University experience / thoughts about the event">
            <Textarea id="debrief-event" name="event" required />
          </Field>
          <Field id="debrief-readers" label="Venue / other readers">
            <Textarea id="debrief-readers" name="readers" />
          </Field>
          <Field id="debrief-staff" label="Staff">
            <Textarea id="debrief-staff" name="staff" />
          </Field>
          <Field id="debrief-problems" label="Operational issues / problems">
            <Textarea id="debrief-problems" name="problems" />
          </Field>
          <Field id="debrief-plan" label="What went well / recommendations">
            <Textarea id="debrief-plan" name="plan" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field id="rating-event" label="Overall (1–5)">
              <input
                id="rating-event"
                name="ratingEvent"
                type="number"
                min={1}
                max={5}
                defaultValue={4}
                className="w-full min-h-11 rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              />
            </Field>
            <Field id="rating-staff" label="Staff (1–5)">
              <input
                id="rating-staff"
                name="ratingStaff"
                type="number"
                min={1}
                max={5}
                defaultValue={4}
                className="w-full min-h-11 rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              />
            </Field>
            <Field id="rating-ops" label="Sound / ops (1–5)">
              <input
                id="rating-ops"
                name="ratingOps"
                type="number"
                min={1}
                max={5}
                defaultValue={4}
                className="w-full min-h-11 rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              />
            </Field>
          </div>
          <Button type="submit" className="w-full min-h-12">
            Complete debrief
          </Button>
        </form>
      ) : null}

      {!mine.length && !pending.length && !completed.length ? (
        <EmptyState title="No debrief yet" description="This appears after you work an event." />
      ) : null}
    </div>
  );
}
