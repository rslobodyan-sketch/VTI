import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  allAssignmentViews,
  assignmentView,
  ceremoniesForEvent,
  compensationForAssignment,
  currentCallSheet,
  debriefsForEvent,
  expensesForAssignment,
  getAssignment,
} from "@/data/queries";
import { formatDateTime, formatMoney } from "@/lib/format";

export function generateStaticParams() {
  return catalog.assignments.map((item) => ({ id: item.id }));
}

export default async function AdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = getAssignment(id);
  if (!assignment) notFound();
  const view = assignmentView(assignment);
  if (!view) notFound();

  const ceremonies = ceremoniesForEvent(view.eventId);
  const pay = compensationForAssignment(view.id);
  const expenses = expensesForAssignment(view.id);
  const callSheet = currentCallSheet(view.eventId);
  const debrief = debriefsForEvent(view.eventId).find((item) => item.readerId === view.readerId);

  const pool = allAssignmentViews().filter((item) => item.eventId === view.eventId);
  const available = catalog.readers.filter(
    (reader) => !pool.some((item) => item.readerId === reader.id && item.status !== "released_to_pool"),
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        title={`${view.reader.contractorName} · ${view.event.name}`}
        description="Assignment hub: event, reader, Call Sheet, travel, expenses, compensation, and debrief."
      />
      <DemoBanner />

      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="assignment" value={view.status} />
        <span className="text-sm text-ink-muted capitalize">{view.role}</span>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint">University</dt>
          <dd>
            <Link href={`/admin/clients/${view.client.id}`} className="underline-offset-2 hover:underline">
              {view.client.name}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Event</dt>
          <dd>
            <Link href={`/admin/events/${view.event.id}`} className="underline-offset-2 hover:underline">
              {view.event.name}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Acceptance</dt>
          <dd>
            {view.status === "offered"
              ? "Offer outstanding"
              : view.status === "accepted" || view.status === "assigned"
                ? "Reader accepted the assignment"
                : view.status.replaceAll("_", " ")}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Call Sheet</dt>
          <dd>
            {callSheet ? (
              <Link href={`/admin/call-sheets/${callSheet.id}`} className="underline-offset-2 hover:underline">
                v{callSheet.version} {callSheet.status}
                {view.acknowledged ? " · acknowledged" : " · acknowledgement outstanding"}
              </Link>
            ) : (
              "Not issued"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Compensation</dt>
          <dd>
            Promised {formatMoney(view.promisedPayCents)}
            {view.priorYearPayCents ? ` · last year ${formatMoney(view.priorYearPayCents)}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Travel / logistics</dt>
          <dd>{view.logisticsStatus ?? view.event.travelNotes}</dd>
        </div>
      </dl>

      <Section title="Ceremony schedule">
        <ul className="grid gap-1 text-sm">
          {ceremonies.map((ceremony) => (
            <li key={ceremony.id}>
              {ceremony.name} · {formatDateTime(ceremony.startsAt)} · {ceremony.venueName}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="On this event">
        <ul className="grid gap-1 text-sm">
          {pool.map((item) => (
            <li key={item.id}>
              {item.reader.contractorName} · {item.role} · {item.status.replaceAll("_", " ")}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Available readers (picker support)"
        description="Sound, geography, and veteran notes are shown so Chester can decide. Nothing is auto-assigned."
      >
        {available.length ? (
          <ul className="grid gap-2 text-sm">
            {available.map((reader) => (
              <li key={reader.id}>
                <Link href={`/admin/readers/${reader.id}`} className="underline-offset-2 hover:underline">
                  {reader.contractorName}
                </Link>
                <span className="text-ink-muted">
                  {" "}
                  · {reader.geographyNotes} · {reader.soundNotes}
                  {reader.veteranStatus ? " · veteran" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">
            Remaining pool for this weekend is constrained by other assignments. Sam is unavailable in November.
          </p>
        )}
      </Section>

      <Section title="Pay tracking">
        <ul className="grid gap-2 text-sm">
          {pay.map((row) => (
            <li key={row.id}>
              {row.kind} {formatMoney(row.amountCents)}{" "}
              <StatusBadge kind="pay" value={row.status} />
              {row.approvedByName ? ` · approved by ${row.approvedByName}` : " · Chester approval required before payout"}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Expenses">
        {expenses.length ? (
          <ul className="grid gap-2 text-sm">
            {expenses.map((report) => (
              <li key={report.id}>
                <Link href={`/admin/expenses/${report.id}`} className="underline-offset-2 hover:underline">
                  Report {report.status}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No expense report on this assignment.</p>
        )}
      </Section>

      <Section title="Debrief">
        {debrief ? (
          <p className="text-sm">{debrief.thoughtsAboutEvent}</p>
        ) : (
          <p className="text-sm text-ink-muted">No debrief submitted.</p>
        )}
      </Section>
    </div>
  );
}
