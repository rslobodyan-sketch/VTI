"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { TouchRow } from "@/components/reader/touch-row";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatDate, formatDateTime } from "@/lib/format";

export default function ReaderCalendarPage() {
  const { reader } = useDemoReader();
  const queries = useLiveQueries();
  const rows = queries
    .assignmentsForReader(reader.id)
    .map(queries.assignmentView)
    .filter((item): item is NonNullable<typeof item> => {
      if (!item) return false;
      return ["offered", "accepted", "assigned", "completed"].includes(item.status);
    })
    .map((item) => ({
      item,
      window: queries.eventWindow(item.eventId),
      ceremonies: queries.ceremoniesForEvent(item.eventId),
    }))
    .sort((a, b) => (a.window?.start ?? "").localeCompare(b.window?.start ?? ""));

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Your calendar"
        description="Assigned events only. University quotes and other readers’ pay are not shown."
      />
      {rows.length ? (
        <div>
          {rows.map(({ item, window, ceremonies }) => (
            <TouchRow
              key={item.id}
              href={`/reader/assignments/${item.id}`}
              title={item.event.name}
              meta={
                <>
                  {item.client.name}
                  {ceremonies[0]
                    ? ` · ${formatDateTime(ceremonies[0].startsAt)}`
                    : window
                      ? ` · ${formatDate(window.start)}`
                      : ""}
                </>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No assigned events"
          description="When Chester assigns you, those ceremonies appear here."
        />
      )}
    </div>
  );
}
