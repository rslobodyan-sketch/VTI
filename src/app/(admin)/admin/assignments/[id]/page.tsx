"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AssignmentNoticePanel } from "@/components/operations/assignment-notice";
import { Section } from "@/components/data/section";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FactGrid } from "@/components/ui/fact-grid";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatMoney } from "@/lib/format";

export default function AdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { catalog, queries, confirmAssignment, setAssignmentStatus, ready } = useOperations();
  const { notify } = useToast();
  const assignment = queries.getAssignment(id);
  if (!assignment) {
    if (!ready) return <RecordPending />;
    notFound();
  }
  const view = queries.assignmentView(assignment);
  if (!view) notFound();

  const ceremonies = queries.ceremoniesForEvent(view.eventId);
  const pay = queries.compensationForAssignment(view.id);
  const expenses = queries.expensesForAssignment(view.id);
  const callSheet = queries.currentCallSheet(view.eventId);
  const debrief = queries.debriefsForEvent(view.eventId).find((item) => item.readerId === view.readerId);

  const pool = queries.allAssignmentViews().filter((item) => item.eventId === view.eventId);
  const available = catalog.readers.filter(
    (reader) =>
      !pool.some(
        (item) =>
          item.readerId === reader.id &&
          item.status !== "released_to_pool" &&
          item.status !== "declined",
      ),
  );

  return (
    <div className="app-page">
      <PageHeader
        title={`${view.reader.contractorName} · ${view.event.name}`}
        description="Assignment hub: event, reader, Call Sheet, travel, expenses, compensation, and debrief."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/assignments", label: "Assignments" },
          { label: view.reader.contractorName },
        ]}
        actions={
          callSheet ? (
            <ButtonLink href={`/admin/call-sheets/${callSheet.id}`}>
              Open Call Sheet v{callSheet.version}
            </ButtonLink>
          ) : (
            <ButtonLink href={`/admin/events/${view.event.id}`} variant="secondary">
              Open event
            </ButtonLink>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="assignment" value={view.status} />
        <span className="text-sm capitalize text-ink-muted">{view.role}</span>
        {view.status === "accepted" ? (
          <Button
            size="sm"
            onClick={() => {
              confirmAssignment(view.id);
              notify({ title: "Assignment confirmed." });
            }}
          >
            Confirm assignment
          </Button>
        ) : null}
        {view.status === "offered" || view.status === "accepted" ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAssignmentStatus(view.id, "declined");
              notify({ title: "Assignment declined." });
            }}
          >
            Decline offer
          </Button>
        ) : null}
        {view.status === "assigned" ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAssignmentStatus(view.id, "completed");
              notify({ title: "Assignment marked completed." });
            }}
          >
            Mark completed
          </Button>
        ) : null}
        {view.status === "offered" || view.status === "accepted" || view.status === "assigned" ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAssignmentStatus(view.id, "released_to_pool");
              notify({
                title: "Released to the reader pool.",
                message: "The assignment is no longer active for this reader.",
              });
            }}
          >
            Release to pool
          </Button>
        ) : null}
      </div>

      <AssignmentNoticePanel view={view} />

      <FactGrid
        columns={2}
        items={[
          {
            label: "University",
            value: (
              <TextLink href={`/admin/clients/${view.client.id}`}>{view.client.name}</TextLink>
            ),
          },
          {
            label: "Event",
            value: <TextLink href={`/admin/events/${view.event.id}`}>{view.event.name}</TextLink>,
          },
          {
            label: "Acceptance",
            value:
              view.status === "offered"
                ? "Offer outstanding"
                : view.status === "accepted" || view.status === "assigned"
                  ? "Reader accepted the assignment"
                  : view.status.replaceAll("_", " "),
          },
          {
            label: "Call Sheet",
            value: callSheet ? (
              <TextLink href={`/admin/call-sheets/${callSheet.id}`}>
                v{callSheet.version} {callSheet.status}
                {view.acknowledged ? " · acknowledged" : " · acknowledgement outstanding"}
              </TextLink>
            ) : (
              "Not issued"
            ),
          },
          {
            label: "Compensation",
            value: (
              <>
                Promised {formatMoney(view.promisedPayCents)}
                {view.priorYearPayCents ? ` · last year ${formatMoney(view.priorYearPayCents)}` : ""}
              </>
            ),
          },
          {
            label: "Travel / logistics",
            value: view.logisticsStatus ?? view.event.travelNotes,
          },
        ]}
      />

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
              <TextLink href={`/admin/assignments/${item.id}`}>{item.reader.contractorName}</TextLink>
              <span className="text-ink-muted">
                {" "}
                · {item.role} · {item.status.replaceAll("_", " ")}
              </span>
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
                <TextLink href={`/admin/readers/${reader.id}`}>{reader.contractorName}</TextLink>
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
            Remaining pool for this weekend is constrained by other assignments. Sam is unavailable
            in November.
          </p>
        )}
      </Section>

      <Section title="Pay tracking">
        <ul className="grid gap-2 text-sm">
          {pay.map((row) => (
            <li key={row.id}>
              {row.kind} {formatMoney(row.amountCents)}{" "}
              <StatusBadge kind="pay" value={row.status} />
              {row.approvedByName
                ? ` · approved by ${row.approvedByName}`
                : " · Chester approval required before payout"}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Expenses">
        {expenses.length ? (
          <ul className="grid gap-2 text-sm">
            {expenses.map((report) => (
              <li key={report.id}>
                <TextLink href={`/admin/expenses/${report.id}`}>Report {report.status}</TextLink>
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
