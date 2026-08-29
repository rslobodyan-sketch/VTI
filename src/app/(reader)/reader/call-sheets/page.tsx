"use client";

import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useLiveQueries } from "@/components/operations/operations-store";

export default function ReaderCallSheetsPage() {
  const { reader } = useDemoReader();
  const { isAcknowledged } = useDemoSession();
  const queries = useLiveQueries();
  const eventIds = [...new Set(queries.assignmentsForReader(reader.id).map((item) => item.eventId))];
  const sheets = eventIds.flatMap((eventId) => {
    const current = queries.currentCallSheet(eventId);
    const event = queries.getEvent(eventId);
    const versions = queries.callSheetsForEvent(eventId);
    return current && event ? [{ event, current, versions }] : [];
  });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Call Sheets"
        description="Your assignment packet. Other readers’ pay is never shown here."
      />
      {sheets.length ? (
        <div>
          {sheets.map((item) => {
            const catalogAck = Boolean(queries.acknowledgementFor(item.current.id, reader.id));
            const acked = isAcknowledged(item.current.id, reader.id, catalogAck);
            return (
              <TouchRow
                key={item.current.id}
                href={`/reader/call-sheets/${item.current.id}`}
                title={item.event.name}
                meta={`Version ${item.current.version} · ${acked ? "acknowledged" : "needs acknowledgement"}`}
                trailing={<StatusBadge kind="callsheet" value={item.current.status} />}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No packet yet"
          description="A Call Sheet appears here after Chester issues one for your job."
        />
      )}
    </div>
  );
}
