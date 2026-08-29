"use client";

import { use } from "react";
import { FilterPills } from "@/components/data/filter-pills";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatMoney, formatShortDate } from "@/lib/format";

function AdminInquiriesPageBody({ status }: { status?: string }) {
  const { catalog } = useOperations();
  const rows = catalog.inquiries.filter((item) => (status ? item.stage === status : true));

  return (
    <div className="app-page">
      <PageHeader
        title="Inquiries"
        description="University interest through approval. Chester moves the stage."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Inquiries" },
        ]}
        actions={
          <ButtonLink href="/admin/inquiries/new" size="sm">
            Create inquiry
          </ButtonLink>
        }
      />
      <FilterPills
        basePath="/admin/inquiries"
        value={status}
        options={[
          { value: "initial_inquiry", label: "New" },
          { value: "needs_conversation", label: "Discovery" },
          { value: "pending_admin_approval", label: "Pending approval" },
          { value: "coordinator_logistics", label: "Coordinator logistics" },
          { value: "closed_won", label: "Won" },
        ]}
      />
      <AdminTable
        empty={
          <EmptyState
            title="No inquiries yet"
            description="Create an inquiry from a university record after onboarding."
            action={
              <ButtonLink href="/admin/inquiries/new" size="sm">
                Create inquiry
              </ButtonLink>
            }
          />
        }
        columns={[
          { key: "university", header: "University" },
          { key: "contact", header: "Contact" },
          { key: "stage", header: "Stage" },
          { key: "value", header: "Estimate" },
          { key: "next", header: "Next action" },
        ]}
        rows={rows.map((inquiry) => ({
          id: inquiry.id,
          href: `/admin/inquiries/${inquiry.id}`,
          title: inquiry.universityName,
          subtitle: inquiry.nextAction,
          trailing: <StatusBadge kind="inquiry" value={inquiry.stage} size="sm" />,
          cells: {
            university: (
              <>
                <TextLink href={`/admin/inquiries/${inquiry.id}`}>
                  {inquiry.universityName}
                </TextLink>
                <p className="text-ink-muted">{inquiry.eventType ?? inquiry.department}</p>
              </>
            ),
            contact: (
              <>
                {inquiry.contactName}
                <p className="text-ink-muted">{inquiry.ownerName ?? "Chester"}</p>
              </>
            ),
            stage: <StatusBadge kind="inquiry" value={inquiry.stage} size="sm" />,
            value: inquiry.estimatedValueCents ? formatMoney(inquiry.estimatedValueCents) : "—",
            next: (
              <>
                {inquiry.nextAction}
                {inquiry.nextActionAt ? (
                  <p className="text-ink-muted">{formatShortDate(inquiry.nextActionAt)}</p>
                ) : null}
              </>
            ),
          },
        }))}
      />
    </div>
  );
}

export default function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = use(searchParams);
  return <AdminInquiriesPageBody status={status} />;
}
