import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { assignmentsForReader, documentsForReader } from "@/data/queries";

export default function AdminReadersPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Readers"
        description="Contractor talent pool. Sensitive tax IDs are masked. Document images are not shown. Veteran-first and sound notes support Chester’s judgment — they do not auto-assign."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>Reader</Th>
            <Th>Onboarding</Th>
            <Th>NDA</Th>
            <Th>Documents</Th>
            <Th>Next / last assignment</Th>
          </tr>
        </thead>
        <tbody>
          {catalog.readers.map((reader) => {
            const jobs = assignmentsForReader(reader.id);
            const next = jobs.find((item) => item.status !== "completed") ?? jobs[0];
            const docs = documentsForReader(reader.id);
            const docIssue = docs.find((item) => item.status !== "valid");
            const event = next ? catalog.events.find((item) => item.id === next.eventId) : undefined;
            return (
              <tr key={reader.id}>
                <Td>
                  <Link href={`/admin/readers/${reader.id}`} className="underline-offset-2 hover:underline">
                    {reader.contractorName}
                  </Link>
                  <p className="text-ink-muted">{reader.geographyNotes}</p>
                </Td>
                <Td>
                  <StatusBadge kind="onboarding" value={reader.onboardingStatus} />
                </Td>
                <Td>{reader.ndaSigned ? "Signed" : "Missing"}</Td>
                <Td>
                  {docIssue ? (
                    <StatusBadge kind="doc" value={docIssue.status} />
                  ) : (
                    <StatusBadge kind="doc" value="valid" />
                  )}
                </Td>
                <Td>
                  {event ? (
                    <Link href={`/admin/events/${event.id}`} className="underline-offset-2 hover:underline">
                      {event.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}
