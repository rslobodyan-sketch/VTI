"use client";

import { useParams } from "next/navigation";
import { CallSheetDocument } from "@/components/call-sheet/call-sheet-document";
import { PrintCallSheetButton } from "@/components/call-sheet/print-call-sheet-button";
import { AcknowledgeButton } from "@/components/demo/demo-action";
import { useDemoReader } from "@/components/demo/demo-reader";
import { useDemoSession } from "@/components/demo/demo-session";
import { useOperations } from "@/components/operations/operations-store";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function ReaderCallSheetDetailPage() {
  const params = useParams<{ id: string }>();
  const { reader } = useDemoReader();
  const { isAcknowledged } = useDemoSession();
  const { catalog, queries } = useOperations();
  const callSheet = catalog.callSheets.find((item) => item.id === params.id);
  const event = callSheet ? queries.getEvent(callSheet.eventId) : undefined;
  const client = event ? queries.getClient(event.clientId) : undefined;
  const own = event
    ? queries
        .assignmentsForEvent(event.id)
        .map(queries.assignmentView)
        .find((item) => item?.readerId === reader.id)
    : undefined;


  if (!callSheet || !event || !client || !own) {
    return (
      <div className="grid gap-5">
        <PageHeader
          title="Call Sheet"
          description="This packet is not assigned to the current reader."
        />
        <EmptyState title="Packet not available" description="Switch reader or open Jobs." />
        <ButtonLink href="/reader/call-sheets" variant="secondary" className="w-full">
          Back to Call Sheets
        </ButtonLink>
      </div>
    );
  }

  const catalogAck = Boolean(queries.acknowledgementFor(callSheet.id, reader.id));
  const acknowledged = isAcknowledged(callSheet.id, reader.id, catalogAck);
  const ceremonies = queries.ceremoniesForEvent(event.id);
  const needsAck = !acknowledged && callSheet.status === "issued";

  return (
    <div className="grid gap-5 pb-4">
      <PageHeader
        title={`Call Sheet v${callSheet.version}`}
        description={`${event.name}. Confidential assignment packet.`}
      />

      {acknowledged ? (
        <p className="text-sm text-success">You accepted this Call Sheet version.</p>
      ) : null}

      <div className="no-print">
        <PrintCallSheetButton />
      </div>

      <CallSheetDocument
        event={event}
        callSheet={callSheet}
        universityName={client.name}
        ceremonies={ceremonies}
        assignments={[
          {
            assignment: own,
            reader: own.reader,
            acknowledged,
          },
        ]}
        viewer="reader"
        viewerReaderId={reader.id}
      />

      {needsAck ? (
        <div className="sticky bottom-[calc(var(--bottom-nav-h)+0.35rem+env(safe-area-inset-bottom))] z-10 border border-line bg-paper-raised p-3 shadow-[var(--shadow-md)] md:bottom-4">
          <p className="mb-2 text-sm text-ink-muted">
            Click-to-accept records acknowledgement of this Call Sheet version.
          </p>
          <AcknowledgeButton
            callSheetId={callSheet.id}
            readerId={reader.id}
            catalogAcknowledged={catalogAck}
          />
        </div>
      ) : null}
    </div>
  );
}
