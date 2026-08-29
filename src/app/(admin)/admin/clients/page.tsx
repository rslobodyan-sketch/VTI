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
import { formatDate } from "@/lib/format";

function AdminClientsPageBody({ status }: { status?: string }) {
  const { catalog, queries, profileFor } = useOperations();
  const rows = catalog.clients.filter((item) => (status ? item.status === status : true));

  return (
    <div className="app-page">
      <PageHeader
        title="Universities"
        description="Operational client records. Onboard a university before the first inquiry."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Universities" },
        ]}
        actions={
          <ButtonLink href="/admin/clients/new" size="sm">
            Onboard university
          </ButtonLink>
        }
      />
      <FilterPills
        basePath="/admin/clients"
        value={status}
        options={[
          { value: "active", label: "Active" },
          { value: "prospect", label: "Prospect" },
        ]}
      />
      <AdminTable
        empty={
          <EmptyState
            title="No universities yet"
            description="Start with university onboarding."
            action={
              <ButtonLink href="/admin/clients/new" size="sm">
                Onboard university
              </ButtonLink>
            }
          />
        }
        columns={[
          { key: "university", header: "University" },
          { key: "status", header: "Status" },
          { key: "insurance", header: "Insurance" },
          { key: "event", header: "Next / last event" },
        ]}
        rows={rows.map((client) => {
          const events = queries.eventsForClient(client.id);
          const next = [...events].sort((a, b) => {
            const aStart = queries.eventWindow(a.id)?.start ?? "";
            const bStart = queries.eventWindow(b.id)?.start ?? "";
            return bStart.localeCompare(aStart);
          })[0];
          const insurance = queries.insuranceForClient(client.id)[0];
          const profile = profileFor(client.id);
          return {
            id: client.id,
            href:
              profile?.onboardingStatus === "in_progress"
                ? `/admin/clients/new?clientId=${client.id}`
                : `/admin/clients/${client.id}`,
            title: client.name,
            subtitle:
              profile?.onboardingStatus === "in_progress"
                ? "Onboarding in progress"
                : client.isReturning
                  ? "Returning"
                  : "Prospect",
            trailing: insurance ? (
              <StatusBadge kind="insurance" value={insurance.status} size="sm" />
            ) : undefined,
            cells: {
              university: (
                <>
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: client.calendarColor }}
                  />
                  <TextLink href={`/admin/clients/${client.id}`}>{client.name}</TextLink>
                  <p className="text-ink-muted">{client.isReturning ? "Returning" : "New"}</p>
                </>
              ),
              status: (
                <span className="flex flex-wrap items-center gap-1">
                  <StatusBadge kind="client" value={client.status} />
                  {profile && profile.onboardingStatus !== "complete" ? (
                    <StatusBadge kind="onboarding" value={profile.onboardingStatus} />
                  ) : null}
                </span>
              ),
              insurance: insurance ? (
                <StatusBadge kind="insurance" value={insurance.status} size="sm" />
              ) : (
                "—"
              ),
              event: next ? (
                <>
                  <TextLink href={`/admin/events/${next.id}`}>{next.name}</TextLink>
                  <p className="text-ink-muted">
                    {queries.eventWindow(next.id) ? formatDate(queries.eventWindow(next.id)!.start) : ""}
                  </p>
                </>
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

export default function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = use(searchParams);
  return <AdminClientsPageBody status={status} />;
}
