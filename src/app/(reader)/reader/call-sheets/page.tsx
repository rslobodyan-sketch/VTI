"use client";

import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { TouchRow } from "@/components/reader/touch-row";
import { StatusBadge } from "@/components/status/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { assignmentsForReader, callSheetsForEvent, currentCallSheet, getEvent } from "@/data/queries";

export default function ReaderCallSheetsPage() {
  const { reader } = useDemoReader();
  const eventIds = [...new Set(assignmentsForReader(reader.id).map((item) => item.eventId))];
  const sheets = eventIds.flatMap((eventId) => {
    const current = currentCallSheet(eventId);
    const event = getEvent(eventId);
    const versions = callSheetsForEvent(eventId);
    return current && event
      ? [{ event, current, versions }]
      : [];
  });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Call Sheets"
        description="Your assignment packet. Other readers’ pay is never shown here."
      />
      <DemoBanner />
      {sheets.length ? (
        <div>
          {sheets.map((item) => (
            <TouchRow
              key={item.current.id}
              href={`/reader/call-sheets/${item.current.id}`}
              title={item.event.name}
              meta={`Version ${item.current.version} · ${item.versions.length} on file`}
              trailing={<StatusBadge kind="callsheet" value={item.current.status} />}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No packet yet" description="A Call Sheet appears here after Chester issues one for your job." />
      )}
    </div>
  );
}
