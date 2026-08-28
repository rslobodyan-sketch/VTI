"use client";

import { DemoAction } from "@/components/demo/demo-action";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { assignmentView, assignmentsForReader, getEvent } from "@/data/queries";
import { formatDateTime } from "@/lib/format";

export default function ReaderDebriefPage() {
  const { reader } = useDemoReader();
  const completed = assignmentsForReader(reader.id)
    .map(assignmentView)
    .filter((item): item is NonNullable<typeof item> => item !== null && item.status === "completed");
  const pending = assignmentsForReader(reader.id)
    .map(assignmentView)
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null && ["assigned", "accepted"].includes(item.status),
    );
  const mine = catalog.debriefs.filter((item) => item.readerId === reader.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Debrief"
        description="After the last ceremony: the event, other readers, university staff, problems, plan versus execution, and ratings. Work-again is marked by Chester on the event."
      />
      <DemoBanner />

      {mine.map((row) => {
        const event = getEvent(row.eventId);
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
              Ratings 1–5: event {row.ratingEvent} · staff {row.ratingStaff} · operations {row.ratingOperations}
            </p>
            {event?.workAgainRecommendation ? (
              <p className="mt-1 text-ink-muted">Chester marked this university as work-again / event ready.</p>
            ) : null}
          </article>
        );
      })}

      {pending.length ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <h2 className="font-serif text-lg">Upcoming: {pending[0].event.name}</h2>
          <p className="text-sm text-ink-muted">
            Submit within 72 hours of the last ceremony. This form does not save in the prototype.
          </p>
          <Field id="debrief-event" label="Thoughts about the event">
            <textarea
              id="debrief-event"
              className="min-h-24 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              name="event"
            />
          </Field>
          <Field id="debrief-readers" label="Other readers">
            <textarea
              id="debrief-readers"
              className="min-h-20 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              name="readers"
            />
          </Field>
          <Field id="debrief-staff" label="University staff interaction">
            <textarea
              id="debrief-staff"
              className="min-h-20 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              name="staff"
            />
          </Field>
          <Field id="debrief-problems" label="Problems or conflicts">
            <textarea
              id="debrief-problems"
              className="min-h-20 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              name="problems"
            />
          </Field>
          <Field id="debrief-plan" label="Plan versus execution">
            <textarea
              id="debrief-plan"
              className="min-h-20 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              name="plan"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              Event
              <input
                name="ratingEvent"
                type="number"
                min={1}
                max={5}
                defaultValue={4}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Staff
              <input
                name="ratingStaff"
                type="number"
                min={1}
                max={5}
                defaultValue={4}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Operations
              <input
                name="ratingOps"
                type="number"
                min={1}
                max={5}
                defaultValue={4}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 py-2"
              />
            </label>
          </div>
          <p className="text-xs text-ink-muted">
            1–5 draft scale. Exact wording can still be confirmed with Chester.
          </p>
          <DemoAction label="Submit debrief" title="Debrief is not saved" />
        </form>
      ) : null}

      {!mine.length && !pending.length && !completed.length ? (
        <EmptyState title="No debrief yet" description="This appears after you work an event." />
      ) : null}
    </div>
  );
}
