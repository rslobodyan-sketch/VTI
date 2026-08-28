import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { getReader } from "@/data/queries";
import { formatDateTime } from "@/lib/format";

export default function AdminDebriefsPage() {
  const eventsWithDebriefs = catalog.events.filter((event) =>
    catalog.debriefs.some((row) => row.eventId === event.id),
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Debriefs"
        description="Reader reports feed the university follow-up. Work-again and event-ready are admin marks on the event, not a second source of truth. Rating wording can still be confirmed with Chester."
      />
      <DemoBanner />

      {eventsWithDebriefs.map((event) => {
        const rows = catalog.debriefs.filter((item) => item.eventId === event.id);
        return (
          <Section
            key={event.id}
            title={event.name}
            action={
              <Link href={`/admin/events/${event.id}`} className="text-sm underline-offset-2 hover:underline">
                Event record
              </Link>
            }
          >
            <p className="text-sm text-ink-muted">
              Work again: {event.workAgainRecommendation ? "Yes" : "Not marked"} ·{" "}
              {event.eventReady ? "Event ready" : "Not event-ready"}
            </p>
            <ul className="mt-3 grid gap-4">
              {rows.map((row) => (
                <li key={row.id} id={row.id} className="border-l-2 border-line pl-3 text-sm">
                  <p className="font-medium">
                    {getReader(row.readerId)?.contractorName} · {formatDateTime(row.submittedAt)}
                  </p>
                  <p className="mt-1">Event: {row.thoughtsAboutEvent}</p>
                  <p>Other readers: {row.thoughtsAboutOtherReaders}</p>
                  <p>University staff: {row.interactionWithUniversityStaff}</p>
                  <p>Problems / conflicts: {row.problemsOrConflicts}</p>
                  <p>Plan vs execution: {row.planVersusExecution}</p>
                  <p className="mt-1 text-ink-muted">
                    Ratings (1–5 draft scale): event {row.ratingEvent} · staff {row.ratingStaff} · operations{" "}
                    {row.ratingOperations}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      {!eventsWithDebriefs.length ? (
        <p className="text-sm text-ink-muted">No debriefs in the catalog.</p>
      ) : null}

      <p className="text-sm text-ink-muted">
        Walden Fall 2026 has not been executed yet, so there is no debrief rollup for that event.
      </p>
    </div>
  );
}
