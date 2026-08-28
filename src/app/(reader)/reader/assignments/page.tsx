"use client";

import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { assignmentView, assignmentsForReader, eventWindow } from "@/data/queries";
import { formatDate } from "@/lib/format";

export default function ReaderAssignmentsPage() {
  const { reader } = useDemoReader();
  const rows = assignmentsForReader(reader.id)
    .map(assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => (eventWindow(b.eventId)?.start ?? "").localeCompare(eventWindow(a.eventId)?.start ?? ""));

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Assignments"
        description="Jobs assigned to you. Compensation shown is yours only."
      />
      <DemoBanner />
      {rows.length ? (
        <div>
          {rows.map((item) => {
            const window = eventWindow(item.eventId);
            return (
              <TouchRow
                key={item.id}
                href={`/reader/assignments/${item.id}`}
                title={item.event.name}
                meta={
                  <>
                    {item.client.name}
                    {window ? ` · ${formatDate(window.start)}` : ""} · {item.role}
                  </>
                }
                trailing={<StatusBadge kind="assignment" value={item.status} />}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState title="No assignments" description="Nothing in this demo catalog for this reader." />
      )}
    </div>
  );
}
