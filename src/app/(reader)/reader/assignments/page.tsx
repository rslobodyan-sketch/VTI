"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useLiveQueries } from "@/components/operations/operations-store";
import { formatDate } from "@/lib/format";

export default function ReaderAssignmentsPage() {
  const { reader } = useDemoReader();
  const { assignmentStatus } = useDemoSession();
  const queries = useLiveQueries();
  const rows = queries
    .assignmentsForReader(reader.id)
    .map(queries.assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) =>
      (queries.eventWindow(b.eventId)?.start ?? "").localeCompare(
        queries.eventWindow(a.eventId)?.start ?? "",
      ),
    );

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Assignments"
        description="Jobs assigned to you. Compensation shown is yours only."
      />
      {rows.length ? (
        <div>
          {rows.map((item) => {
            const window = queries.eventWindow(item.eventId);
            const status = assignmentStatus(item.id, item.status);
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
                trailing={<StatusBadge kind="assignment" value={status} />}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No assignments"
          description="When you are assigned, the job will appear here."
        />
      )}
    </div>
  );
}
