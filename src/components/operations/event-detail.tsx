"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { AssignmentNoticePanel } from "@/components/operations/assignment-notice";
import { CallSheetDocument } from "@/components/call-sheet/call-sheet-document";
import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { FactGrid } from "@/components/ui/fact-grid";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { addHoursIso, chicagoWallToIso, formatDateTime, formatMoney } from "@/lib/format";
import type { AssignmentRole } from "@/types/domain";

export function EventDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { catalog, queries, offerAssignment, issueCallSheet, addCeremony, patchEvent, assignmentNotice, ready } =
    useOperations();
  const { notify } = useToast();
  const [readerId, setReaderId] = useState("");
  const [role, setRole] = useState<AssignmentRole>("reader");
  const [payDollars, setPayDollars] = useState("1800");
  const [cerName, setCerName] = useState("");
  const [cerDate, setCerDate] = useState("");
  const [cerTime, setCerTime] = useState("14:00");
  const [cerVenue, setCerVenue] = useState("");

  const event = queries.getEvent(id);
  if (!event) {
    if (!ready) return <RecordPending />;
    notFound();
  }
  const client = queries.getClient(event.clientId);
  if (!client) notFound();

  const ceremonies = queries.ceremoniesForEvent(event.id);
  const assignments = queries
    .assignmentsForEvent(event.id)
    .map(queries.assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const callSheet = queries.currentCallSheet(event.id);
  const versions = queries.callSheetsForEvent(event.id);
  const issues = queries.operationalIssues(event.id);
  const estimate = queries.estimatesForEvent(event.id)[0];
  const invoice = queries.invoicesForEvent(event.id)[0];
  const debriefs = queries.debriefsForEvent(event.id);
  const ops = queries.eventOperationalSummary(event.id);
  const assignedIds = new Set(
    assignments
      .filter((item) => item.status !== "declined" && item.status !== "released_to_pool")
      .map((item) => item.readerId),
  );
  const available = catalog.readers.filter((reader) => !assignedIds.has(reader.id));
  const unsigned = assignments.filter((item) => callSheet && !item.acknowledged);

  return (
    <div className="app-page">
      <PageHeader
        title={event.name}
        description={`${client.name}. Assignment is the operational hub for readers, Call Sheet, travel, expenses, and debrief.`}
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/events", label: "Events" },
          { label: event.name },
        ]}
        actions={
          callSheet ? (
            <ButtonLink href={`/admin/call-sheets/${callSheet.id}`}>
              Open Call Sheet v{callSheet.version}
            </ButtonLink>
          ) : (
            <Button
              onClick={() => {
                const nextVersion = Math.max(0, ...versions.map((item) => item.version)) + 1;
                const sheetId = issueCallSheet(event.id);
                notify({ title: `Call Sheet v${nextVersion} issued.` });
                router.push(`/admin/call-sheets/${sheetId}`);
              }}
            >
              Issue Call Sheet
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="event" value={event.status} />
        {event.eventReady ? (
          <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
            Event ready
          </span>
        ) : null}
        {issues.map((issue) => (
          <span key={issue} className="text-sm text-warning">
            {issue}
          </span>
        ))}
      </div>
      {unsigned.length && callSheet ? (
        <p className="text-sm text-warning">
          Outstanding acknowledgements: {unsigned.map((item) => item.reader.contractorName).join(", ")}
        </p>
      ) : null}

      <FactGrid
        columns={4}
        items={[
          { label: "University", value: <TextLink href={`/admin/clients/${client.id}`}>{client.name}</TextLink> },
          { label: "Names this year", value: event.estimatedGraduateCount.toLocaleString() },
          { label: "Last year", value: event.priorYearGraduateCount?.toLocaleString() ?? "—" },
          { label: "Quote", value: formatMoney(event.quoteAmountCents) },
        ]}
      />

      <Section
        title="Ceremonies"
        action={
          <span className="text-xs text-ink-muted">Add another session below</span>
        }
      >
        <AdminTable
          empty={<EmptyState title="No ceremonies" description="Add the first session." />}
          columns={[
            { key: "session", header: "Session" },
            { key: "when", header: "When" },
            { key: "venue", header: "Venue" },
            { key: "call", header: "Call / sound" },
          ]}
          rows={ceremonies.map((ceremony) => ({
            id: ceremony.id,
            title: ceremony.name,
            subtitle: formatDateTime(ceremony.startsAt),
            trailing: ceremony.kind.replaceAll("_", " "),
            cells: {
              session: (
                <>
                  {ceremony.name}
                  <p className="text-ink-muted">{ceremony.kind.replaceAll("_", " ")}</p>
                </>
              ),
              when: formatDateTime(ceremony.startsAt),
              venue: (
                <>
                  {ceremony.venueName}
                  <p className="text-ink-muted">{ceremony.venueAddress}</p>
                </>
              ),
              call: (
                <>
                  {ceremony.callTime ? `Call ${formatDateTime(ceremony.callTime)}` : "—"}
                  {ceremony.soundCheckAt ? (
                    <p className="text-ink-muted">Sound {formatDateTime(ceremony.soundCheckAt)}</p>
                  ) : null}
                </>
              ),
            },
          }))}
        />
        <form
          className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            if (!cerName || !cerDate) return;
            const startsAt = chicagoWallToIso(cerDate, cerTime);
            addCeremony(event.id, {
              name: cerName,
              startsAt,
              endsAt: addHoursIso(startsAt, 2),
              venueName: cerVenue || "TBD",
              venueAddress: "",
              kind: "commencement",
            });
            notify({ title: "Ceremony added." });
            setCerName("");
          }}
        >
          <Field id="add-cer-name" label="Ceremony name">
            <Input id="add-cer-name" value={cerName} onChange={(e) => setCerName(e.target.value)} />
          </Field>
          <Field id="add-cer-date" label="Date">
            <Input id="add-cer-date" type="date" value={cerDate} onChange={(e) => setCerDate(e.target.value)} />
          </Field>
          <Field id="add-cer-time" label="Start" hint="America/Chicago">
            <Input id="add-cer-time" type="time" value={cerTime} onChange={(e) => setCerTime(e.target.value)} />
          </Field>
          <Field id="add-cer-venue" label="Venue">
            <Input id="add-cer-venue" value={cerVenue} onChange={(e) => setCerVenue(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" variant="secondary">
              Add ceremony
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Travel, lodging, transfers, parking">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-faint">Travel</dt>
            <dd>{event.travelNotes || "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Airfare</dt>
            <dd>
              {event.airfareNotes}
              {event.airfarePaidCents ? ` · ${formatMoney(event.airfarePaidCents)} paid` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Hotel</dt>
            <dd>
              {event.accommodationNotes}
              {event.hotelEstimateCents ? ` · ${formatMoney(event.hotelEstimateCents)}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Transfers / parking</dt>
            <dd>{event.transferNotes || "—"}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Reader team" description="Chester assigns. The system does not auto-pick. Shadow is a training role.">
        <AdminTable
          empty={<EmptyState title="No assignments" description="Offer a reader from the pool below." />}
          columns={[
            { key: "reader", header: "Reader" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "promised", header: "Compensation" },
            { key: "notice", header: "Notice" },
            { key: "travel", header: "Travel" },
          ]}
          rows={assignments.map((item) => ({
            id: item.id,
            href: `/admin/assignments/${item.id}`,
            title: item.reader.contractorName,
            subtitle: item.role,
            trailing: <StatusBadge kind="assignment" value={item.status} />,
            cells: {
              reader: (
                <TextLink href={`/admin/assignments/${item.id}`}>
                  {item.reader.contractorName}
                </TextLink>
              ),
              role: item.role,
              status: <StatusBadge kind="assignment" value={item.status} />,
              promised: <span className="tabular-nums">{formatMoney(item.promisedPayCents)}</span>,
              notice: assignmentNotice(item.id)
                ? "Notification prepared"
                : "Not prepared",
              travel: item.logisticsStatus ?? "See event travel",
            },
          }))}
        />
        {available.length ? (
          <form
            className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-4"
            onSubmit={(formEvent) => {
              formEvent.preventDefault();
              const assignedReader = readerId || available[0]?.id;
              if (!assignedReader) return;
              const cents = Math.round(Number(payDollars) * 100) || 0;
              const assignmentId = offerAssignment(event.id, assignedReader, role, cents);
              const reader = catalog.readers.find((item) => item.id === assignedReader);
              notify({
                title: `Assignment offered to ${reader?.contractorName ?? "reader"}.`,
              });
              router.push(`/admin/assignments/${assignmentId}`);
            }}
          >
            <Field id="asg-reader" label="Reader">
              <Select
                id="asg-reader"
                value={readerId || available[0]?.id || ""}
                onChange={(e) => setReaderId(e.target.value)}
                options={available.map((item) => ({
                  value: item.id,
                  label: item.contractorName,
                }))}
              />
            </Field>
            <Field id="asg-role" label="Role">
              <Select
                id="asg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AssignmentRole)}
                options={[
                  { value: "lead", label: "Lead" },
                  { value: "reader", label: "Reader" },
                  { value: "shadow", label: "Shadow" },
                ]}
              />
            </Field>
            <Field id="asg-pay" label="Promised compensation (USD)">
              <Input
                id="asg-pay"
                inputMode="decimal"
                value={payDollars}
                onChange={(e) => setPayDollars(e.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit">Assign reader</Button>
            </div>
          </form>
        ) : null}
        {assignments
          .filter((item) => item.status === "offered" || item.status === "accepted")
          .map((item) => (
            <div key={`notice-${item.id}`} className="mt-3">
              <AssignmentNoticePanel view={item} />
            </div>
          ))}
      </Section>

      <Section title="Operational documents">
        <ul className="grid gap-2 text-sm">
          {callSheet ? (
            <li>
              Call Sheet{" "}
              <TextLink href={`/admin/call-sheets/${callSheet.id}`}>v{callSheet.version}</TextLink>
            </li>
          ) : (
            <li className="text-ink-muted">Call Sheet not issued</li>
          )}
          {queries.documentsForEvent(event.id).map((doc) => (
            <li key={doc.id}>
              {doc.originalFilename} · {doc.statusNote}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Event financials"
        description="Operational totals for this event. Not an official VTI GRCD report. Tracked in VTI — Wave is official."
      >
        <div id="event-operational-totals">
          <FactGrid
            columns={4}
            items={[
              { label: "Graduates (estimated)", value: ops.graduates.toLocaleString() },
              { label: "Readers", value: String(ops.readers) },
              { label: "Ceremonies", value: String(ops.ceremonies) },
              { label: "Days", value: String(ops.days) },
              { label: "Quote", value: formatMoney(ops.quoteCents) },
              {
                label: "Invoice",
                value: invoice ? <StatusBadge kind="invoice" value={invoice.status} /> : "Not billed",
              },
              { label: "Reader compensation", value: formatMoney(ops.compensationCents) },
              { label: "Reimbursements / expenses", value: formatMoney(ops.expenseCents) },
              { label: "Estimated margin", value: formatMoney(ops.marginCents) },
              {
                label: "Estimate",
                value: estimate ? `${formatMoney(estimate.amountCents)} · ${estimate.status}` : "None",
              },
              ...(ops.priorYearGraduates
                ? [{ label: "Last year names", value: ops.priorYearGraduates.toLocaleString() }]
                : []),
              ...(ops.priorYearQuoteCents
                ? [{ label: "Last year quote", value: formatMoney(ops.priorYearQuoteCents) }]
                : []),
            ]}
          />
        </div>
        <p className="text-xs text-ink-muted">
          Reader pay initiation is intended for Patriot. Neither Wave nor Patriot is connected in this
          demo.
        </p>
      </Section>

      <Section title="Event notes">
        <p className="text-sm">{event.notes || "No operational notes yet."}</p>
        <ul className="mt-2 grid gap-2 text-sm">
          {queries.notesForEvent(event.id).map((note) => (
            <li key={note.id} className="text-ink-muted">
              {note.authorName}: {note.body}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              patchEvent(event.id, { workAgainRecommendation: true, eventReady: true });
              notify({ title: "Marked work-again / event-ready." });
            }}
          >
            Mark work-again / event-ready
          </Button>
          {callSheet ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const nextVersion = Math.max(0, ...versions.map((item) => item.version)) + 1;
                const sheetId = issueCallSheet(event.id);
                notify({ title: `Call Sheet v${nextVersion} issued. Prior issued version is superseded.` });
                router.push(`/admin/call-sheets/${sheetId}`);
              }}
            >
              Issue new Call Sheet version
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                const nextVersion = Math.max(0, ...versions.map((item) => item.version)) + 1;
                const sheetId = issueCallSheet(event.id);
                notify({ title: `Call Sheet v${nextVersion} issued.` });
                router.push(`/admin/call-sheets/${sheetId}`);
              }}
            >
              Issue Call Sheet
            </Button>
          )}
        </div>
      </Section>

      <Section title="Debrief">
        {debriefs.length ? (
          <ul className="grid gap-3 text-sm">
            {debriefs.map((row) => (
              <li key={row.id}>
                <TextLink href={`/admin/debriefs#${row.id}`} className="font-medium">
                  {queries.getReader(row.readerId)?.contractorName}
                </TextLink>
                <span className="text-ink-muted">
                  {" "}
                  · event {row.ratingEvent}/5 · staff {row.ratingStaff}/5 · ops {row.ratingOperations}
                  /5
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No reader debriefs submitted yet.</p>
        )}
      </Section>

      {callSheet ? (
        <Section
          title="Current Call Sheet"
          action={
            <TextLink href={`/admin/call-sheets/${callSheet.id}`}>Open v{callSheet.version}</TextLink>
          }
        >
          <p className="text-sm text-ink-muted">
            Versions: {versions.map((item) => `v${item.version} (${item.status})`).join(" · ")}
          </p>
          <CallSheetDocument
            event={event}
            callSheet={callSheet}
            universityName={client.name}
            ceremonies={ceremonies}
            assignments={assignments.map((item) => ({
              assignment: item,
              reader: item.reader,
              acknowledged: item.acknowledged,
            }))}
            viewer="admin"
          />
        </Section>
      ) : null}
    </div>
  );
}
