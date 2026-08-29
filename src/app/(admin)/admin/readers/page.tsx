"use client";

import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";

export default function AdminReadersPage() {
  const { catalog, queries } = useOperations();

  return (
    <div className="app-page">
      <PageHeader
        title="Readers"
        description="Contractor talent pool. Tax IDs are masked. The system does not auto-assign."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Readers" },
        ]}
      />
      <AdminTable
        columns={[
          { key: "reader", header: "Reader" },
          { key: "onboarding", header: "Onboarding" },
          { key: "nda", header: "NDA" },
          { key: "docs", header: "Documents" },
          { key: "next", header: "Next / last assignment" },
        ]}
        rows={catalog.readers.map((reader) => {
          const jobs = queries.assignmentsForReader(reader.id);
          const next = jobs.find((item) => item.status !== "completed") ?? jobs[0];
          const docs = queries.documentsForReader(reader.id);
          const docIssue = docs.find((item) => item.status !== "valid");
          const event = next ? catalog.events.find((item) => item.id === next.eventId) : undefined;
          return {
            id: reader.id,
            href: `/admin/readers/${reader.id}`,
            title: reader.contractorName,
            subtitle: reader.geographyNotes,
            trailing: <StatusBadge kind="onboarding" value={reader.onboardingStatus} size="sm" />,
            cells: {
              reader: (
                <>
                  <TextLink href={`/admin/readers/${reader.id}`}>{reader.contractorName}</TextLink>
                  <p className="text-ink-muted">{reader.geographyNotes}</p>
                </>
              ),
              onboarding: <StatusBadge kind="onboarding" value={reader.onboardingStatus} size="sm" />,
              nda: reader.ndaSigned ? "Signed" : "Missing",
              docs: (
                <StatusBadge kind="doc" value={docIssue?.status ?? "valid"} size="sm" />
              ),
              next: event ? (
                <TextLink href={`/admin/events/${event.id}`}>{event.name}</TextLink>
              ) : (
                "—"
              ),
            },
          };
        })}
      />
    </div>
  );
}
