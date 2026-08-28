"use client";

import { useParams } from "next/navigation";
import { CallSheetDocument } from "@/components/call-sheet/call-sheet-document";
import { DemoAction } from "@/components/demo/demo-action";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoReader } from "@/components/demo/demo-reader";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  acknowledgementFor,
  assignmentView,
  assignmentsForEvent,
  ceremoniesForEvent,
  getClient,
  getEvent,
} from "@/data/queries";

export default function ReaderCallSheetDetailPage() {
  const params = useParams<{ id: string }>();
  const { reader } = useDemoReader();
  const callSheet = catalog.callSheets.find((item) => item.id === params.id);
  const event = callSheet ? getEvent(callSheet.eventId) : undefined;
  const client = event ? getClient(event.clientId) : undefined;
  const own = event
    ? assignmentsForEvent(event.id)
        .map(assignmentView)
        .find((item) => item?.readerId === reader.id)
    : undefined;

  if (!callSheet || !event || !client || !own) {
    return (
      <div className="grid gap-5">
        <PageHeader title="Call Sheet" description="This packet is not on the current demo reader." />
        <EmptyState title="Packet not available" description="Switch reader or open Jobs." />
      </div>
    );
  }

  const acknowledged = Boolean(acknowledgementFor(callSheet.id, reader.id));
  const ceremonies = ceremoniesForEvent(event.id);

  return (
    <div className="grid gap-5">
      <PageHeader
        title={`Call Sheet v${callSheet.version}`}
        description={`${event.name}. Confidential assignment packet.`}
      />
      <DemoBanner />
      {!acknowledged && callSheet.status === "issued" ? (
        <DemoAction
          label="I accept this Call Sheet version"
          title="Acknowledgement is not saved"
          message="Click-to-accept is the working assumption until Chester confirms drawn signatures."
        />
      ) : acknowledged ? (
        <p className="text-sm text-success">You accepted this version in the demo catalog.</p>
      ) : null}
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
    </div>
  );
}
