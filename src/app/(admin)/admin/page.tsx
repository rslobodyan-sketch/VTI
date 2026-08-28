import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Metric } from "@/components/data/metric";
import { Section } from "@/components/data/section";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  allAssignmentViews,
  currentCallSheet,
  dashboardMetrics,
  eventWindow,
  getClient,
  operationalIssues,
} from "@/data/queries";
import { formatDate, formatMoney, formatShortDate } from "@/lib/format";

function upcomingEvents() {
  return catalog.events
    .filter((event) => event.status !== "cancelled")
    .map((event) => ({
      event,
      client: getClient(event.clientId),
      window: eventWindow(event.id),
      issues: operationalIssues(event.id),
      callSheet: currentCallSheet(event.id),
    }))
    .filter((item) => item.window && item.window.start >= "2026-08-28")
    .sort((a, b) => (a.window?.start ?? "").localeCompare(b.window?.start ?? ""));
}

export default function AdminOverviewPage() {
  const metrics = dashboardMetrics();
  const upcoming = upcomingEvents();
  const activeClients = catalog.clients.filter((item) => item.status === "active");

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Operational overview"
        description="360-degree view of Voice Talent International: universities, the event/assignment hub, Call Sheets, expenses, and payment tracking. Figures are a demo catalog as of 28 Aug 2026."
      />
      <DemoBanner />

      <p className="text-sm text-ink-muted">
        Inquiry → Event → Ceremony → Assignment → Call Sheet → Execution → Expenses → Debrief → Payment tracking → History
      </p>

      <div className="grid gap-6 border-y border-line py-5 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Active universities" value={String(metrics.activeUniversities)} hint="Served this catalog" />
        <Metric label="Open events" value={String(metrics.openEvents)} hint="Including tentative" />
        <Metric label="Readers utilized" value={String(metrics.utilizedReaders)} hint="On an assignment" />
        <Metric
          label="Potential income"
          value={formatMoney(metrics.potentialIncome)}
          hint="Estimates, tracking only"
        />
        <Metric
          label="Projected costs"
          value={formatMoney(metrics.projectedExpenses)}
          hint="Promised pay + receipts"
        />
      </div>

      <Section
        title="Operational alerts"
        description="Items that need Chester before the next commencement weekend."
      >
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li className="border-l-2 border-warning pl-3">
            {metrics.unsignedCallSheets.length === 1
              ? "1 Call Sheet acknowledgement outstanding"
              : `${metrics.unsignedCallSheets.length} Call Sheet acknowledgements outstanding`}
          </li>
          <li className="border-l-2 border-warning pl-3">
            {metrics.offeredAssignments.length === 1
              ? "1 assignment offer awaiting acceptance"
              : `${metrics.offeredAssignments.length} assignment offers awaiting acceptance`}
          </li>
          <li className="border-l-2 border-warning pl-3">
            {metrics.expensesNeedingReview.length === 1
              ? "1 expense report submitted for review"
              : `${metrics.expensesNeedingReview.length} expense reports submitted for review`}
          </li>
          <li className="border-l-2 border-warning pl-3">
            {metrics.payNeedingApproval.length === 1
              ? "1 pay line promised or pending Chester approval"
              : `${metrics.payNeedingApproval.length} pay lines promised or pending Chester approval`}
          </li>
          <li className="border-l-2 border-warning pl-3">
            {metrics.insuranceDue.length === 1
              ? "1 university insurance reminder not accepted"
              : `${metrics.insuranceDue.length} university insurance reminders not accepted`}
          </li>
          <li className="border-l-2 border-warning pl-3">
            {metrics.expiringDocs.length === 1
              ? "1 reader document expiring"
              : `${metrics.expiringDocs.length} reader documents expiring`}
          </li>
        </ul>
      </Section>

      <Section title="Upcoming events" action={<Link href="/admin/calendar" className="text-sm underline-offset-2 hover:underline">Open calendar</Link>}>
        <TableWrap>
          <thead>
            <tr>
              <Th>University</Th>
              <Th>Event</Th>
              <Th>When</Th>
              <Th>Status</Th>
              <Th>Attention</Th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((item) => (
              <tr key={item.event.id}>
                <Td>
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ background: item.client?.calendarColor }}
                  />
                  {item.client?.name}
                </Td>
                <Td>
                  <Link href={`/admin/events/${item.event.id}`} className="underline-offset-2 hover:underline">
                    {item.event.name}
                  </Link>
                </Td>
                <Td>{item.window ? formatDate(item.window.start) : "—"}</Td>
                <Td>
                  <StatusBadge kind="event" value={item.event.status} />
                </Td>
                <Td className="text-ink-muted">{item.issues[0] ?? "On track"}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Active universities">
          <ul className="grid gap-2 text-sm">
            {activeClients.map((client) => (
              <li key={client.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <Link href={`/admin/clients/${client.id}`} className="underline-offset-2 hover:underline">
                  {client.name}
                </Link>
                <span className="text-ink-muted">{client.isReturning ? "Returning" : "New"}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Reader utilization">
          <ul className="grid gap-2 text-sm">
            {catalog.readers.map((reader) => {
              const jobs = allAssignmentViews().filter(
                (item) =>
                  item.readerId === reader.id &&
                  ["offered", "accepted", "assigned", "completed"].includes(item.status),
              );
              const next = jobs.find((item) => item.status !== "completed");
              return (
                <li key={reader.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                  <Link href={`/admin/readers/${reader.id}`} className="underline-offset-2 hover:underline">
                    {reader.contractorName}
                  </Link>
                  <span className="text-ink-muted">
                    {next ? next.client.name : jobs.length ? "Idle · history on file" : "Idle"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      <Section title="Assignments requiring attention">
        <TableWrap>
          <thead>
            <tr>
              <Th>Reader</Th>
              <Th>Event</Th>
              <Th>Status</Th>
              <Th>Call Sheet</Th>
            </tr>
          </thead>
          <tbody>
            {[...metrics.offeredAssignments, ...metrics.unsignedCallSheets]
              .filter((item, index, list) => list.findIndex((row) => row.id === item.id) === index)
              .map((item) => (
                <tr key={item.id}>
                  <Td>{item.reader.contractorName}</Td>
                  <Td>
                    <Link href={`/admin/assignments/${item.id}`} className="underline-offset-2 hover:underline">
                      {item.event.name}
                    </Link>
                  </Td>
                  <Td>
                    <StatusBadge kind="assignment" value={item.status} />
                  </Td>
                  <Td>
                    {item.acknowledged ? "Accepted" : item.callSheet ? "Awaiting acknowledgement" : "Not issued"}
                  </Td>
                </tr>
              ))}
          </tbody>
        </TableWrap>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Expenses requiring review">
          <ul className="grid gap-2 text-sm">
            {metrics.expensesNeedingReview.map((report) => {
              const reader = catalog.readers.find((item) => item.id === report.readerId);
              return (
                <li key={report.id}>
                  <Link href={`/admin/expenses/${report.id}`} className="underline-offset-2 hover:underline">
                    {reader?.contractorName} · submitted {report.submittedAt ? formatShortDate(report.submittedAt) : ""}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
        <Section title="Payment tracking">
          <ul className="grid gap-2 text-sm">
            {metrics.payNeedingApproval.map((row) => {
              const reader = catalog.readers.find((item) => item.id === row.readerId);
              return (
                <li key={row.id} className="flex justify-between gap-2">
                  <Link href="/admin/payments" className="underline-offset-2 hover:underline">
                    {reader?.contractorName} · {row.kind}
                  </Link>
                  <span className="tabular-nums">{formatMoney(row.amountCents)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Tracking only. Wave remains the ledger. Every reader payment still requires Chester’s approval.
          </p>
        </Section>
      </div>
    </div>
  );
}
