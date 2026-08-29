"use client";

import { TextLink } from "@/components/ui/text-link";
import { Section } from "@/components/data/section";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useOperations } from "@/components/operations/operations-store";
import { formatDateTime } from "@/lib/format";

export default function AdminDebriefsPage() {
  const { catalog, queries } = useOperations();
  const eventsWithDebriefs = catalog.events.filter((event) =>
    catalog.debriefs.some((row) => row.eventId === event.id),
  );

  return (
    <div className="app-page">
      <PageHeader
        title="Debriefs"
        description="Reader reports feed university follow-up. Work-again and event-ready are admin marks on the event."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Debriefs" },
        ]}
      />

      {eventsWithDebriefs.map((event) => {
        const rows = catalog.debriefs.filter((item) => item.eventId === event.id);
        return (
          <Section
            key={event.id}
            title={event.name}
            action={
              <TextLink href={`/admin/events/${event.id}`}>Event record</TextLink>
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
                    {queries.getReader(row.readerId)?.contractorName} · {formatDateTime(row.submittedAt)}
                  </p>
                  <p className="mt-1">Event: {row.thoughtsAboutEvent}</p>
                  <p>Other readers: {row.thoughtsAboutOtherReaders}</p>
                  <p>University staff: {row.interactionWithUniversityStaff}</p>
                  <p>Problems / conflicts: {row.problemsOrConflicts}</p>
                  <p>Plan vs execution: {row.planVersusExecution}</p>
                  <p className="mt-1 text-ink-muted">
                    Ratings (1–5): event {row.ratingEvent} · staff {row.ratingStaff} · operations{" "}
                    {row.ratingOperations}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      {!eventsWithDebriefs.length ? (
        <EmptyState title="No debriefs" description="Readers submit after the last ceremony." />
      ) : null}
    </div>
  );
}
