"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { formatDate, formatMoney } from "@/lib/format";

export default function ReaderAssignmentsPage() {
  const { reader } = useDemoReader();
  const { assignmentStatus } = useDemoSession();
  const { queries, ready } = useOperations();
  if (!ready) return <RecordPending />;
  const rows = queries
    .readerAssignmentViews(reader.id)
    .sort((a, b) =>
      (queries.eventWindow(b.eventId)?.start ?? "").localeCompare(
        queries.eventWindow(a.eventId)?.start ?? "",
      ),
    );

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Assignments"
        description="Jobs assigned to you. Pay for this job is on the assignment — not a historical ledger."
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
                    {window ? ` · ${formatDate(window.start)}` : ""} · {item.role} ·{" "}
                    {formatMoney(item.promisedPayCents)}
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
