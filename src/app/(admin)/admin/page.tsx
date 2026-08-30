"use client";

import { AdminTable } from "@/components/data/table";
import { Metric } from "@/components/data/metric";
import { Section } from "@/components/data/section";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { formatDate, formatMoney, formatShortDate } from "@/lib/format";

export default function AdminOverviewPage() {
  const { catalog, queries, profiles } = useOperations();
  const metrics = queries.dashboardMetrics();
  const incompleteOnboarding = profiles.filter((item) => item.onboardingStatus === "in_progress");
  const upcoming = catalog.events
    .filter((event) => event.status !== "cancelled")
    .map((event) => ({
      event,
      client: queries.getClient(event.clientId),
      window: queries.eventWindow(event.id),
      issues: queries.operationalIssues(event.id),
      callSheet: queries.currentCallSheet(event.id),
    }))
    .filter((item) => item.window && item.window.start >= "2026-08-28")
    .sort((a, b) => (a.window?.start ?? "").localeCompare(b.window?.start ?? ""));
  const openInquiries = catalog.inquiries.filter(
    (item) => item.stage !== "closed_won" && item.stage !== "closed_lost",
  );
  const availabilityIssues = catalog.availability.filter((item) => item.kind === "unavailable");
  const attention = [
    ...metrics.offeredAssignments,
    ...metrics.unsignedCallSheets,
  ].filter((item, index, list) => list.findIndex((row) => row.id === item.id) === index);

  return (
    <div className="app-page">
      <PageHeader
        title="Dashboard"
        description="What needs attention before the next commencement weekend."
        actions={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/clients/new" size="sm">
              Onboard university
            </ButtonLink>
            <ButtonLink href="/admin/calendar" variant="secondary" size="sm">
              Open calendar
            </ButtonLink>
          </div>
        }
      />

      <Section title="Needs attention" description="Open a queue to work the list.">
        <ul className="grid gap-0 border-y border-line">
          {[
            {
              href: incompleteOnboarding[0]
                ? `/admin/clients/new?clientId=${incompleteOnboarding[0].clientId}`
                : "/admin/clients/new",
              label: "University onboarding incomplete",
              count: incompleteOnboarding.length,
              always: true,
            },
            {
              href: "/admin/call-sheets",
              label: "Call Sheets awaiting acknowledgement",
              count: metrics.unsignedCallSheets.length,
            },
            {
              href: "/admin/assignments?status=offered",
              label: "Assignment offers outstanding",
              count: metrics.offeredAssignments.length,
            },
            {
              href: "/admin/expenses?status=submitted",
              label: "Expenses submitted for review",
              count: metrics.expensesNeedingReview.length,
            },
            {
              href: "/admin/payments",
              label: "Pay lines awaiting approval",
              count: metrics.payNeedingApproval.length,
            },
            {
              href: "/admin/clients",
              label: "University insurance reminders",
              count: metrics.insuranceDue.length,
            },
            {
              href: "/admin/readers",
              label: "Reader documents expiring",
              count: metrics.expiringDocs.length,
            },
          ]
            .filter((item) => item.count > 0 || item.always)
            .map((item, index, list) => (
            <li key={item.href}>
              <TextLink
                href={item.href}
                className={`flex min-h-12 items-center justify-between gap-3 py-2 no-underline hover:bg-paper-inset ${
                  index < list.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <span>{item.label}</span>
                <span className="tabular-nums text-warning">{item.count}</span>
              </TextLink>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-6 border-y border-line py-4 sm:grid-cols-3 lg:grid-cols-5">
        <Metric label="Active universities" value={String(metrics.activeUniversities)} hint="On the books" />
        <Metric label="Open events" value={String(metrics.openEvents)} hint="Including tentative" />
        <Metric label="Readers utilized" value={String(metrics.utilizedReaders)} hint="On an assignment" />
        <Metric
          label="Potential income"
          value={formatMoney(metrics.potentialIncome)}
          hint="Open estimates, tracking only"
        />
        <Metric
          label="Projected costs"
          value={formatMoney(metrics.projectedExpenses)}
          hint="Promised pay + open receipts"
        />
      </div>

      <Section title="Upcoming events">
        <AdminTable
          empty={<EmptyState title="No upcoming events" description="Won inquiries become events." />}
          columns={[
            { key: "university", header: "University" },
            { key: "event", header: "Event" },
            { key: "when", header: "When" },
            { key: "status", header: "Status" },
            { key: "attention", header: "Attention" },
          ]}
          rows={upcoming.map((item) => ({
            id: item.event.id,
            href: `/admin/events/${item.event.id}`,
            title: item.event.name,
            subtitle: `${item.client?.name ?? ""} · ${item.issues[0] ?? "On track"}`,
            trailing: <StatusBadge kind="event" value={item.event.status} size="sm" />,
            cells: {
              university: (
                <span>
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ background: item.client?.calendarColor }}
                  />
                  {item.client?.name}
                </span>
              ),
              event: (
                <TextLink href={`/admin/events/${item.event.id}`}>{item.event.name}</TextLink>
              ),
              when: item.window ? formatDate(item.window.start) : "—",
              status: <StatusBadge kind="event" value={item.event.status} size="sm" />,
              attention: <span className="text-ink-muted">{item.issues[0] ?? "On track"}</span>,
            },
          }))}
        />
      </Section>

      <Section title="Assignments requiring attention">
        <AdminTable
          empty={<EmptyState title="No assignment attention" description="Offers and unsigned packets appear here." />}
          columns={[
            { key: "reader", header: "Reader" },
            { key: "event", header: "Event" },
            { key: "status", header: "Status" },
            { key: "callsheet", header: "Call Sheet" },
          ]}
          rows={attention.map((item) => ({
            id: item.id,
            href: `/admin/assignments/${item.id}`,
            title: item.reader.contractorName,
            subtitle: item.event.name,
            trailing: <StatusBadge kind="assignment" value={item.status} size="sm" />,
            cells: {
              reader: item.reader.contractorName,
              event: (
                <TextLink href={`/admin/assignments/${item.id}`}>{item.event.name}</TextLink>
              ),
              status: <StatusBadge kind="assignment" value={item.status} size="sm" />,
              callsheet: item.acknowledged
                ? "Accepted"
                : item.callSheet
                  ? "Awaiting acknowledgement"
                  : "Not issued",
            },
          }))}
        />
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Inquiry pipeline" action={<TextLink href="/admin/inquiries">All inquiries</TextLink>}>
          {openInquiries.length ? (
            <ul className="grid gap-0 border-y border-line text-sm">
              {openInquiries.map((inquiry) => (
                <li key={inquiry.id} className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
                  <div>
                    <TextLink href={`/admin/inquiries/${inquiry.id}`}>{inquiry.universityName}</TextLink>
                    <p className="text-ink-muted">{inquiry.nextAction}</p>
                  </div>
                  <StatusBadge kind="inquiry" value={inquiry.stage} size="sm" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No open inquiries" description="Onboard a university, then create an inquiry." />
          )}
        </Section>
        <Section title="Reader availability">
          <ul className="grid gap-2 text-sm">
            {availabilityIssues.map((block) => {
              const reader = catalog.readers.find((item) => item.id === block.readerId);
              return (
                <li key={block.id} className="border-b border-line py-2">
                  <TextLink href={`/admin/readers/${block.readerId}`}>
                    {reader?.contractorName}
                  </TextLink>
                  <p className="text-ink-muted">{block.notes}</p>
                </li>
              );
            })}
            {metrics.expiringDocs.slice(0, 3).map((doc) => {
              const reader = catalog.readers.find((item) => item.id === doc.readerId);
              return (
                <li key={doc.id} className="border-b border-line py-2">
                  <TextLink href={`/admin/readers/${doc.readerId}`}>
                    {reader?.contractorName}
                  </TextLink>
                  <p className="text-ink-muted">
                    {doc.kind.replaceAll("_", " ")} {doc.status}
                    {doc.expiresOn ? ` · ${formatShortDate(doc.expiresOn)}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Expenses requiring review">
          {metrics.expensesNeedingReview.length ? (
            <ul className="grid gap-2 text-sm">
              {metrics.expensesNeedingReview.map((report) => {
                const reader = catalog.readers.find((item) => item.id === report.readerId);
                return (
                  <li key={report.id}>
                    <TextLink href={`/admin/expenses/${report.id}`}>
                      {reader?.contractorName} · submitted{" "}
                      {report.submittedAt ? formatShortDate(report.submittedAt) : ""}
                    </TextLink>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">No expense reports waiting on review.</p>
          )}
        </Section>
        <Section title="Payment tracking">
          <ul className="grid gap-2 text-sm">
            {metrics.payNeedingApproval.map((row) => {
              const reader = catalog.readers.find((item) => item.id === row.readerId);
              return (
                <li key={row.id} className="flex justify-between gap-2">
                  <TextLink href="/admin/payments">
                    {reader?.contractorName} · {row.kind}
                  </TextLink>
                  <span className="tabular-nums">{formatMoney(row.amountCents)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Tracking only — payment processing is not connected.
          </p>
        </Section>
      </div>
    </div>
  );
}
