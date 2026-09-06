"use client";

import { useState, type ReactNode } from "react";
import { notFound, useRouter } from "next/navigation";
import { AssignmentNoticePanel } from "@/components/operations/assignment-notice";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { openMvpFile, saveMvpFile } from "@/lib/mvp-file-storage";
import {
  addHoursIso,
  chicagoWallToIso,
  formatDate,
  formatDateTime,
  formatMoney,
  formatShortDate,
} from "@/lib/format";
import type { AssignmentRole, ReadinessLevel } from "@/types/domain";

function readinessLabel(level: ReadinessLevel) {
  if (level === "ready") return "Ready";
  if (level === "attention") return "Attention";
  return "Missing";
}

function readinessRowClass(level: ReadinessLevel) {
  if (level === "missing") return "border-l-[3px] border-l-danger bg-danger-soft/35";
  if (level === "attention") return "border-l-[3px] border-l-warning bg-warning-soft/30";
  return "border-l-[3px] border-l-success/70";
}

function readinessStatusClass(level: ReadinessLevel) {
  if (level === "missing") return "text-danger";
  if (level === "attention") return "text-warning";
  return "text-success";
}

function OpsSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-[1.35rem]">
            {title}
          </h2>
          {description ? <p className="mt-1 max-w-3xl text-[0.95rem] text-ink-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function MoneyFact({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className={cn(emphasize && "sm:col-span-1")}>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 tabular-nums tracking-tight text-ink",
          emphasize ? "text-xl font-semibold sm:text-2xl" : "text-lg font-medium",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function EventDetailView({ id }: { id: string }) {
  const router = useRouter();
  const {
    catalog,
    queries,
    createInvoice,
    offerAssignment,
    issueCallSheet,
    addCeremony,
    patchEvent,
    assignmentNotice,
    setTaskStatus,
    createTask,
    addFlight,
    addHotelStay,
    addGroundTransfer,
    addEventDocument,
    patchFlight,
    patchHotelStay,
    patchGroundTransfer,
    addCalendarNote,
    ready,
  } = useOperations();
  const { notify } = useToast();
  const [readerId, setReaderId] = useState("");
  const [role, setRole] = useState<AssignmentRole>("reader");
  const [payDollars, setPayDollars] = useState("1800");
  const [cerName, setCerName] = useState("");
  const [cerDate, setCerDate] = useState("");
  const [cerTime, setCerTime] = useState("14:00");
  const [cerVenue, setCerVenue] = useState("");
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);
  const [flightAirline, setFlightAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDepartsAt, setFlightDepartsAt] = useState("");
  const [flightArrivesAt, setFlightArrivesAt] = useState("");
  const [flightReaderId, setFlightReaderId] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [hotelCheckIn, setHotelCheckIn] = useState("");
  const [hotelCheckOut, setHotelCheckOut] = useState("");
  const [hotelReaderId, setHotelReaderId] = useState("");
  const [transferProvider, setTransferProvider] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferReaderId, setTransferReaderId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [documentKind, setDocumentKind] = useState<"university_instruction" | "name_list" | "other">("other");
  const [documentReaderVisible, setDocumentReaderVisible] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const event = queries.getEvent(id);
  if (!event) {
    if (!ready) return <RecordPending />;
    notFound();
  }
  const client = queries.getClient(event.clientId);
  if (!client) notFound();

  const ceremonies = queries.ceremoniesForEvent(event.id);
  const window = queries.eventWindow(event.id);
  const assignments = queries
    .assignmentsForEvent(event.id)
    .map(queries.assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const activeAssignments = assignments.filter((item) =>
    ["offered", "accepted", "assigned"].includes(item.status),
  );
  const callSheet = queries.currentCallSheet(event.id);
  const versions = queries.callSheetsForEvent(event.id);
  const estimate = queries.estimatesForEvent(event.id)[0];
  const invoice = queries.invoicesForEvent(event.id)[0];
  const debriefs = queries.debriefsForEvent(event.id);
  const ops = queries.eventOperationalSummary(event.id);
  const readiness = queries.eventReadiness(event.id);
  const flights = queries.flightsForEvent(event.id);
  const hotels = queries.hotelStaysForEvent(event.id);
  const transfers = queries.groundTransfersForEvent(event.id);
  const eventTasks = queries.openTasksForEvent(event.id);
  const eventActivity = queries.activityLogForEvent(event.id, 8);
  const documents = queries.documentsForEvent(event.id);
  const lead = queries.leadForEvent(event.id);
  const conflicts = readiness.conflicts;
  const offered = activeAssignments.filter((item) => item.status === "offered");
  const unsigned = activeAssignments.filter((item) => callSheet && !item.acknowledged);
  const candidates = queries.readerCandidatesForEvent(event.id);
  const available = candidates.filter((item) => item.eligible).map((item) => item.reader);
  const conflictedCandidates = candidates.filter((item) => !item.eligible && !item.alreadyAssigned);
  const eventCompensation = activeAssignments.flatMap((item) =>
    queries.compensationForAssignment(item.id).filter((row) => row.kind === "compensation"),
  );
  const eventExpenses = activeAssignments.flatMap((item) => queries.expensesForAssignment(item.id));
  const whenLabel = window
    ? `${formatDate(window.start)}${
        daySpan(window.start, window.end) > 1 ? ` – ${formatDate(window.end)}` : ""
      }`
    : "Dates TBD";
  const locationLabel = ceremonies[0]
    ? `${ceremonies[0].venueName}${ceremonies[0].venueAddress ? ` · ${ceremonies[0].venueAddress}` : ""}`
    : "Location TBD";
  const needsAttention = readiness.overall !== "ready";

  return (
    <div className="app-page !gap-8 sm:!gap-10">
      <header className="border-b border-line pb-6">
        <Breadcrumbs
          items={[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/events", label: "Events" },
            { label: event.name },
          ]}
        />
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="text-base text-ink-muted">
              <TextLink href={`/admin/clients/${client.id}`} className="font-medium text-ink">
                {client.name}
              </TextLink>
            </p>
            <h1 className="mt-1 font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.15rem]">
              {event.name}
            </h1>
            <p className="mt-2 text-[0.95rem] text-ink-muted">
              Event control center — operational state and what needs attention next.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.95rem] text-ink">
              <StatusBadge kind="event" value={event.status} />
              <StatusBadge kind="readiness" value={readiness.overall} />
              {event.eventReady ? (
                <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-success-soft px-2 py-0.5 text-sm font-medium text-success">
                  Event ready flag
                </span>
              ) : null}
              <span className="text-ink-muted">{whenLabel}</span>
              <span className="hidden text-ink-faint sm:inline" aria-hidden>
                ·
              </span>
              <span className="text-ink-muted">{locationLabel}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 lg:pt-1">
            <Button size="sm" variant="secondary" onClick={() => { patchEvent(event.id, { status: "confirmed" }); notify({ title: "Event confirmed." }); }} disabled={event.status === "confirmed"}>Confirm</Button>
            <Button size="sm" variant="ghost" onClick={() => { patchEvent(event.id, { status: "postponed" }); notify({ title: "Event marked postponed." }); }} disabled={event.status === "postponed"}>Postpone</Button>
            <Button size="sm" variant="ghost" onClick={() => { patchEvent(event.id, { status: "cancelled" }); notify({ title: "Event marked cancelled." }); }} disabled={event.status === "cancelled"}>Cancel</Button>
            {callSheet ? (
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
            )}
            <ButtonLink href="/admin/calendar" variant="secondary">
              Calendar
            </ButtonLink>
          </div>
        </div>
      </header>

      <OpsSection
        title="Readiness"
        description="Scan the six operational areas first. Anything Attention or Missing needs Chester next."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)] xl:items-start">
          <ul id="event-readiness" className="grid gap-2 sm:grid-cols-2">
            {readiness.areas.map((area) => (
              <li
                key={area.key}
                className={cn(
                  "flex min-h-[4.5rem] flex-col justify-center gap-1 rounded-[var(--radius-md)] px-4 py-3",
                  readinessRowClass(area.level),
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.8rem] font-semibold tracking-[0.04em] text-ink uppercase">
                    {area.label}
                  </p>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold tracking-wide uppercase",
                      readinessStatusClass(area.level),
                    )}
                  >
                    {readinessLabel(area.level)}
                  </p>
                </div>
                <p className="text-[0.95rem] leading-snug text-ink">{area.summary}</p>
              </li>
            ))}
          </ul>

          <aside
            className={cn(
              "rounded-[var(--radius-md)] border px-4 py-4 sm:px-5",
              needsAttention ? "border-warning/50 bg-warning-soft/25" : "border-line bg-paper-inset/40",
            )}
          >
            <p className="font-serif text-lg font-semibold text-ink">Next</p>
            {readiness.nextActions.length ? (
              <ol className="mt-3 grid list-decimal gap-3 pl-5 text-[0.98rem] leading-snug text-ink">
                {readiness.nextActions.map((action) => (
                  <li key={action} className="pl-1 marker:font-semibold marker:text-warning">
                    {action}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-[0.98rem] text-success">
                No open attention items on this event.
              </p>
            )}
          </aside>
        </div>
      </OpsSection>

      <OpsSection title="Event overview">
        <dl className="grid gap-5 border-y border-line py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-ink-muted">University</dt>
            <dd className="mt-1 text-base font-medium">
              <TextLink href={`/admin/clients/${client.id}`}>{client.name}</TextLink>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">When</dt>
            <dd className="mt-1 text-base font-medium">{whenLabel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-ink-muted">Location</dt>
            <dd className="mt-1 text-base font-medium">{locationLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge kind="event" value={event.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Overall readiness</dt>
            <dd className={cn("mt-1 text-base font-semibold", readinessStatusClass(readiness.overall))}>
              {readinessLabel(readiness.overall)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Names this year</dt>
            <dd className="mt-1 text-base font-medium tabular-nums">
              {event.estimatedGraduateCount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Last year</dt>
            <dd className="mt-1 text-base font-medium tabular-nums">
              {event.priorYearGraduateCount?.toLocaleString() ?? "—"}
            </dd>
          </div>
        </dl>
        {event.tentativeReason ? (
          <p className="text-[0.95rem] text-ink-muted">Tentative: {event.tentativeReason}</p>
        ) : null}
      </OpsSection>

      <OpsSection title="Ceremonies" action={<span className="text-sm text-ink-muted">Add below</span>}>
        {conflictedCandidates.length ? (
          <details className="border border-warning/40 bg-warning-soft/20 px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium">{conflictedCandidates.length} reader(s) need attention before assignment</summary>
            <ul className="mt-3 grid gap-2">{conflictedCandidates.map((item) => <li key={item.reader.id} className="flex flex-wrap justify-between gap-2"><span>{item.reader.contractorName}</span><span className="text-warning">{item.reason}</span></li>)}</ul>
          </details>
        ) : null}
        <AdminTable
          empty={
            <EmptyState
              title="No ceremonies yet"
              description="Add the first session so the event window and Call Sheet have something to schedule against."
            />
          }
          columns={[
            { key: "session", header: "Session" },
            { key: "when", header: "When" },
            { key: "venue", header: "Venue" },
            { key: "staffing", header: "Readers" },
          ]}
          rows={ceremonies.map((ceremony) => ({
            id: ceremony.id,
            title: ceremony.name,
            subtitle: formatDateTime(ceremony.startsAt),
            trailing: ceremony.kind.replaceAll("_", " "),
            cells: {
              session: (
                <>
                  <span className="font-medium">{ceremony.name}</span>
                  <p className="text-ink-muted">{ceremony.kind.replaceAll("_", " ")}</p>
                </>
              ),
              when: (
                <>
                  <span className="font-medium">{formatDateTime(ceremony.startsAt)}</span>
                  {ceremony.callTime ? (
                    <p className="text-ink-muted">Call {formatDateTime(ceremony.callTime)}</p>
                  ) : null}
                </>
              ),
              venue: (
                <>
                  <span className="font-medium">{ceremony.venueName}</span>
                  <p className="text-ink-muted">{ceremony.venueAddress}</p>
                </>
              ),
              staffing: (
                <>
                  <span className={cn(!activeAssignments.length && "font-medium text-warning")}>
                    {activeAssignments.length
                      ? `${activeAssignments.length} on event${lead ? ` · lead ${lead.contractorName}` : ""}`
                      : "Unstaffed"}
                  </span>
                  {ceremony.estimatedNames ? (
                    <p className="text-ink-muted">
                      ~{ceremony.estimatedNames.toLocaleString()} names
                    </p>
                  ) : null}
                </>
              ),
            },
          }))}
        />
        <form
          className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-5"
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
      </OpsSection>

      <OpsSection
        title="Staffing"
        description="Chester assigns. The system does not auto-pick. Shadow is a training role."
      >
        {(offered.length > 0 || conflicts.length > 0 || !activeAssignments.length) && (
          <div className="grid gap-2 rounded-[var(--radius-md)] border border-warning/40 bg-warning-soft/20 px-4 py-3 text-[0.95rem] text-warning">
            {!activeAssignments.length ? (
              <p className="font-medium">Missing staffing — no active reader on this event.</p>
            ) : null}
            {offered.length ? (
              <p>
                Offers awaiting response:{" "}
                <span className="font-medium text-ink">
                  {offered.map((item) => item.reader.contractorName).join(", ")}
                </span>
              </p>
            ) : null}
            {conflicts.length ? (
              <p>
                Reader conflicts:{" "}
                <span className="font-medium text-ink">
                  {conflicts.map((item) => `${item.readerName} (${item.detail})`).join("; ")}
                </span>
              </p>
            ) : null}
          </div>
        )}
        <AdminTable
          empty={
            <EmptyState
              title="No readers assigned"
              description="Offer a reader from the pool below to staff this event."
              action={
                available.length ? (
                  <span className="text-sm text-ink-muted">Use Assign reader under this section.</span>
                ) : undefined
              }
            />
          }
          columns={[
            { key: "reader", header: "Reader" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "promised", header: "Compensation" },
            { key: "notice", header: "Notification" },
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
                <TextLink href={`/admin/assignments/${item.id}`} className="font-medium">
                  {item.reader.contractorName}
                </TextLink>
              ),
              role: (
                <span className="capitalize">
                  {item.role}
                  {item.role === "lead" ? " · Lead" : ""}
                </span>
              ),
              status: <StatusBadge kind="assignment" value={item.status} />,
              promised: (
                <span className="text-base font-medium tabular-nums">
                  {formatMoney(item.promisedPayCents)}
                </span>
              ),
              notice: (
                <span className={assignmentNotice(item.id) ? "text-ink" : "text-ink-muted"}>
                  {assignmentNotice(item.id) ? "Prepared" : "Not prepared"}
                </span>
              ),
              travel: <span className="text-ink-muted">{item.logisticsStatus ?? "See travel"}</span>,
            },
          }))}
        />
        {available.length ? (
          <form
            className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4"
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
            <div key={`notice-${item.id}`} className="mt-1">
              <AssignmentNoticePanel view={item} />
            </div>
          ))}
      </OpsSection>

      <OpsSection title="Travel" description="Record the travel plan here so readiness reflects what is actually booked.">
        <div className="grid gap-7 lg:grid-cols-3">
          <TravelBlock title="Flight">
            {flights.length ? (
              <ul className="grid gap-0 divide-y divide-line border-y border-line">
                {flights.map((flight) => {
                  const reader = flight.readerId ? catalog.readers.find((item) => item.id === flight.readerId) : undefined;
                  return (
                    <li key={flight.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-medium">{flight.airline}{flight.flightNumber ? ` ${flight.flightNumber}` : ""}</p>
                          <p className="text-[0.9rem] text-ink-muted">{reader?.contractorName ?? "Event travel"} · arrives {formatDateTime(flight.arrivesAt)}</p>
                          {flight.confirmation ? <p className="mt-1 text-sm text-ink-muted">Confirmation: {flight.confirmation}</p> : null}
                        </div>
                        <div className="flex items-center gap-2"><StatusBadge kind="travel" value={flight.status} /><Button type="button" size="sm" variant="secondary" onClick={() => { setEditingFlightId(flight.id); setFlightAirline(flight.airline); setFlightNumber(flight.flightNumber ?? ""); setFlightDepartsAt(toDateTimeLocal(flight.departsAt)); setFlightArrivesAt(toDateTimeLocal(flight.arrivesAt)); setFlightReaderId(flight.readerId ?? ""); }}>Edit</Button></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="text-[0.95rem] text-ink-muted">No flight recorded.</p>}
            <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!flightAirline || !flightDepartsAt || !flightArrivesAt) return; if (editingFlightId) { patchFlight(editingFlightId, { airline: flightAirline, flightNumber: flightNumber || undefined, departsAt: new Date(flightDepartsAt).toISOString(), arrivesAt: new Date(flightArrivesAt).toISOString(), readerId: flightReaderId || undefined }); notify({ title: "Flight updated." }); } else { addFlight({ eventId: event.id, readerId: flightReaderId || undefined, airline: flightAirline, flightNumber: flightNumber || undefined, departsAt: new Date(flightDepartsAt).toISOString(), arrivesAt: new Date(flightArrivesAt).toISOString(), paidBy: "vti", status: "confirmed" }); notify({ title: "Flight recorded." }); } setEditingFlightId(null); setFlightAirline(""); setFlightNumber(""); setFlightDepartsAt(""); setFlightArrivesAt(""); setFlightReaderId(""); }}>
              <Field id="flight-airline" label="Airline" required><Input id="flight-airline" required value={flightAirline} onChange={(e) => setFlightAirline(e.target.value)} placeholder="United" /></Field>
              <div className="grid gap-3 sm:grid-cols-3"><Field id="flight-number" label="Flight"><Input id="flight-number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="UA 123" /></Field><Field id="flight-departs" label="Departure" required><Input id="flight-departs" required type="datetime-local" value={flightDepartsAt} onChange={(e) => setFlightDepartsAt(e.target.value)} /></Field><Field id="flight-arrives" label="Arrival" required><Input id="flight-arrives" required type="datetime-local" value={flightArrivesAt} onChange={(e) => setFlightArrivesAt(e.target.value)} /></Field></div>
              <Field id="flight-reader" label="Reader (optional)"><Select id="flight-reader" value={flightReaderId} onChange={(e) => setFlightReaderId(e.target.value)} options={[{ value: "", label: "Event travel" }, ...catalog.readers.map((r) => ({ value: r.id, label: r.contractorName }))]} /></Field>
              <Button type="submit" size="sm" variant="secondary">{editingFlightId ? "Save flight" : "Add flight"}</Button>
            </form>
          </TravelBlock>
          <TravelBlock title="Hotel">
            {hotels.length ? <ul className="grid gap-0 divide-y divide-line border-y border-line">{hotels.map((stay) => <li key={stay.id} className="py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-medium">{stay.propertyName}</p><p className="text-[0.9rem] text-ink-muted">{formatShortDate(stay.checkInDate)} – {formatShortDate(stay.checkOutDate)}</p>{stay.confirmation ? <p className="mt-1 text-sm text-ink-muted">Confirmation: {stay.confirmation}</p> : null}</div><div className="flex items-center gap-2"><StatusBadge kind="travel" value={stay.status} /><Button type="button" size="sm" variant="secondary" onClick={() => { setEditingHotelId(stay.id); setHotelName(stay.propertyName); setHotelCheckIn(stay.checkInDate); setHotelCheckOut(stay.checkOutDate); setHotelReaderId(stay.readerId ?? ""); }}>Edit</Button></div></div></li>)}</ul> : <p className="text-[0.95rem] text-ink-muted">No hotel stay recorded.</p>}
            <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!hotelName || !hotelCheckIn || !hotelCheckOut) return; if (editingHotelId) { patchHotelStay(editingHotelId, { propertyName: hotelName, checkInDate: hotelCheckIn, checkOutDate: hotelCheckOut, readerId: hotelReaderId || undefined }); notify({ title: "Hotel stay updated." }); } else { addHotelStay({ eventId: event.id, readerId: hotelReaderId || undefined, propertyName: hotelName, checkInDate: hotelCheckIn, checkOutDate: hotelCheckOut, status: "confirmed" }); notify({ title: "Hotel stay recorded." }); } setEditingHotelId(null); setHotelName(""); setHotelCheckIn(""); setHotelCheckOut(""); setHotelReaderId(""); }}>
              <Field id="hotel-name" label="Property" required><Input id="hotel-name" required value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Marriott Downtown" /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field id="hotel-checkin" label="Check in" required><Input id="hotel-checkin" required type="date" value={hotelCheckIn} onChange={(e) => setHotelCheckIn(e.target.value)} /></Field><Field id="hotel-checkout" label="Check out" required><Input id="hotel-checkout" required type="date" value={hotelCheckOut} onChange={(e) => setHotelCheckOut(e.target.value)} /></Field></div>
              <Field id="hotel-reader" label="Reader (optional)"><Select id="hotel-reader" value={hotelReaderId} onChange={(e) => setHotelReaderId(e.target.value)} options={[{ value: "", label: "Event lodging" }, ...catalog.readers.map((r) => ({ value: r.id, label: r.contractorName }))]} /></Field>
              <Button type="submit" size="sm" variant="secondary">{editingHotelId ? "Save hotel" : "Add hotel"}</Button>
            </form>
          </TravelBlock>
          <TravelBlock title="Ground transfer">
            {transfers.length ? <ul className="grid gap-0 divide-y divide-line border-y border-line">{transfers.map((row) => <li key={row.id} className="py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-medium">{row.provider || "Transfer"}</p><p className="text-[0.9rem] text-ink-muted">{row.notes}</p></div><div className="flex items-center gap-2"><StatusBadge kind="travel" value={row.status} /><Button type="button" size="sm" variant="secondary" onClick={() => { setEditingTransferId(row.id); setTransferProvider(row.provider ?? ""); setTransferNotes(row.notes); setTransferReaderId(row.readerId ?? ""); }}>Edit</Button></div></div></li>)}</ul> : <p className="text-[0.95rem] text-ink-muted">No ground transfer recorded.</p>}
            <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!transferNotes) return; if (editingTransferId) { patchGroundTransfer(editingTransferId, { provider: transferProvider || undefined, notes: transferNotes, readerId: transferReaderId || undefined }); notify({ title: "Ground transfer updated." }); } else { addGroundTransfer({ eventId: event.id, readerId: transferReaderId || undefined, provider: transferProvider || undefined, notes: transferNotes, status: "confirmed" }); notify({ title: "Ground transfer recorded." }); } setEditingTransferId(null); setTransferProvider(""); setTransferNotes(""); setTransferReaderId(""); }}>
              <Field id="transfer-provider" label="Provider"><Input id="transfer-provider" value={transferProvider} onChange={(e) => setTransferProvider(e.target.value)} placeholder="Hotel shuttle / Uber / rental" /></Field>
              <Field id="transfer-notes" label="Details" required><Input id="transfer-notes" required value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} placeholder="Pickup at 7:30 AM" /></Field>
              <Field id="transfer-reader" label="Reader (optional)"><Select id="transfer-reader" value={transferReaderId} onChange={(e) => setTransferReaderId(e.target.value)} options={[{ value: "", label: "Event transfer" }, ...catalog.readers.map((r) => ({ value: r.id, label: r.contractorName }))]} /></Field>
              <Button type="submit" size="sm" variant="secondary">{editingTransferId ? "Save transfer" : "Add transfer"}</Button>
            </form>
          </TravelBlock>
        </div>
      </OpsSection>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <OpsSection
          title="Call Sheet"
          action={
            callSheet ? (
              <TextLink href={`/admin/call-sheets/${callSheet.id}`} className="text-[0.95rem]">
                Open v{callSheet.version}
              </TextLink>
            ) : null
          }
        >
          {callSheet ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-end justify-between gap-4 border-y border-line py-4">
                <div>
                  <p className="text-sm text-ink-muted">Current version</p>
                  <p className="mt-1 font-serif text-2xl font-semibold tracking-tight">
                    v{callSheet.version}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Status</p>
                  <div className="mt-1">
                    <StatusBadge kind="callsheet" value={callSheet.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Issued</p>
                  <p className="mt-1 text-base font-medium">
                    {callSheet.issuedAt ? formatDateTime(callSheet.issuedAt) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Acknowledgements</p>
                  <p
                    className={cn(
                      "mt-1 text-base font-semibold",
                      unsigned.length ? "text-warning" : "text-success",
                    )}
                  >
                    {unsigned.length
                      ? `${unsigned.length} outstanding`
                      : activeAssignments.length
                        ? "All in"
                        : "No active readers"}
                  </p>
                </div>
              </div>
              {unsigned.length ? (
                <p className="rounded-[var(--radius-md)] border border-warning/40 bg-warning-soft/20 px-3 py-2 text-[0.95rem] text-warning">
                  Awaiting: {unsigned.map((item) => item.reader.contractorName).join(", ")}
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyState
              title="No Call Sheet issued"
              description="Issue a Call Sheet when staffing and travel are far enough along for readers to acknowledge."
              action={
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
              }
            />
          )}
          {versions.length ? (
            <ul className="grid gap-0 border-y border-line text-[0.95rem]">
              {versions
                .slice()
                .sort((a, b) => b.version - a.version)
                .map((sheet) => (
                  <li
                    key={sheet.id}
                    className="flex min-h-12 items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
                  >
                    <TextLink href={`/admin/call-sheets/${sheet.id}`} className="font-medium">
                      Call Sheet v{sheet.version}
                    </TextLink>
                    <StatusBadge kind="callsheet" value={sheet.status} />
                  </li>
                ))}
            </ul>
          ) : null}
          {callSheet ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const nextVersion = Math.max(0, ...versions.map((item) => item.version)) + 1;
                  const sheetId = issueCallSheet(event.id);
                  notify({
                    title: `Call Sheet v${nextVersion} issued. Prior issued version is superseded.`,
                  });
                  router.push(`/admin/call-sheets/${sheetId}`);
                }}
              >
                Issue new Call Sheet version
              </Button>
            </div>
          ) : null}
        </OpsSection>

        <OpsSection title="Documents" description="Files are stored locally in this MVP browser and linked to the event record.">
          {documents.length ? <ul className="grid gap-0 border-y border-line text-[0.95rem]">{documents.map((doc) => <li key={doc.id} className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"><div><p className="font-medium">{doc.originalFilename}</p><p className="text-ink-muted">{doc.kind.replaceAll("_", " ")}{doc.sizeBytes ? ` · ${(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ""}</p></div>{doc.fileKey ? <Button type="button" size="sm" variant="secondary" onClick={() => openMvpFile(doc.fileKey!, doc.originalFilename).catch(() => notify({ title: "File is unavailable in this browser.", tone: "warning" }))}>Open file</Button> : null}</li>)}</ul> : <EmptyState title="No documents on file" description="Upload a name list, university instruction, or other event document below." />}
          <form className="mt-4 grid gap-3 border-t border-line pt-4" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const input = form.elements.namedItem("event-document") as HTMLInputElement | null; const file = input?.files?.[0]; if (!file) return; setUploadingDocument(true); try { const fileKey = `event/${event.id}/${uidForFile(file.name)}`; await saveMvpFile(fileKey, file); addEventDocument({ eventId: event.id, kind: documentKind, originalFilename: file.name, statusNote: "On file", visibleToAssignedReaders: documentReaderVisible, fileKey, mimeType: file.type || "application/octet-stream", sizeBytes: file.size }); notify({ title: `${file.name} uploaded.` }); form.reset(); setDocumentReaderVisible(false); } catch { notify({ title: "Upload failed.", tone: "warning" }); } finally { setUploadingDocument(false); } }}>
            <Field id="event-document" label="Choose file"><Input id="event-document" name="event-document" type="file" /></Field>
            <div className="grid gap-3 sm:grid-cols-2"><Field id="document-kind" label="Document type"><Select id="document-kind" value={documentKind} onChange={(e) => setDocumentKind(e.target.value as typeof documentKind)} options={[{ value: "name_list", label: "Name list" }, { value: "university_instruction", label: "University instruction" }, { value: "other", label: "Other" }]} /></Field><label className="flex items-center gap-2 self-end pb-2 text-sm text-ink"><input type="checkbox" checked={documentReaderVisible} onChange={(e) => setDocumentReaderVisible(e.target.checked)} /> Visible to assigned readers</label></div>
            <Button type="submit" size="sm" variant="secondary" disabled={uploadingDocument}>{uploadingDocument ? "Uploading…" : "Upload document"}</Button>
          </form>
        </OpsSection>
      </div>

      <OpsSection
        title="Financial summary"
        description="Operational totals for this event. Not an official VTI GRCD report. Tracked in VTI — Wave is official."
      >
        {!invoice ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
            <div>
              <p className="font-medium">Invoice not created</p>
              <p className="text-sm text-ink-muted">Create a draft tracking invoice here. Sending and accounting remain in Wave.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const estimateId = estimate?.id;
                createInvoice({
                  clientId: client.id,
                  eventId: event.id,
                  estimateId,
                  amountCents: event.quoteAmountCents,
                  status: "draft",
                });
                notify({ title: "Invoice draft created." });
              }}
            >
              Create invoice draft
            </Button>
          </div>
        ) : null}
        <div id="event-operational-totals" className="grid gap-6">
          <dl className="grid gap-5 border-y border-line py-5 sm:grid-cols-2 lg:grid-cols-4">
            <MoneyFact
              label="Quote"
              emphasize
              value={
                <TextLink href={`/admin/clients/${client.id}`}>{formatMoney(ops.quoteCents)}</TextLink>
              }
            />
            <MoneyFact
              label="Invoice"
              emphasize
              value={
                invoice ? (
                  <TextLink href="/admin/payments">
                    {formatMoney(invoice.amountCents)}
                    <span className="ml-2 text-sm font-normal text-ink-muted">{invoice.status}</span>
                  </TextLink>
                ) : (
                  "Not billed"
                )
              }
            />
            <MoneyFact
              label="University payments"
              emphasize
              value={
                ops.payments.length ? (
                  <TextLink href="/admin/payments">{formatMoney(ops.universityPaidCents)}</TextLink>
                ) : (
                  "None recorded"
                )
              }
            />
            <MoneyFact
              label="Outstanding"
              emphasize
              value={
                <TextLink
                  href="/admin/payments"
                  className={ops.outstandingInvoiceCents > 0 ? "text-warning" : undefined}
                >
                  {formatMoney(ops.outstandingInvoiceCents)}
                </TextLink>
              }
            />
            <MoneyFact
              label="Reader professional fees"
              value={<TextLink href="/admin/payments">{formatMoney(ops.compensationCents)}</TextLink>}
            />
            <MoneyFact
              label="Reader expenses"
              value={
                eventExpenses[0] ? (
                  <TextLink href={`/admin/expenses/${eventExpenses[0].id}`}>
                    {formatMoney(ops.expenseCents)}
                  </TextLink>
                ) : (
                  formatMoney(ops.expenseCents)
                )
              }
            />
            <MoneyFact label="Estimated margin" value={formatMoney(ops.marginCents)} />
            <MoneyFact
              label="Estimate"
              value={
                estimate ? (
                  <TextLink href={`/admin/clients/${client.id}`}>
                    {formatMoney(estimate.amountCents)} · {estimate.status}
                  </TextLink>
                ) : (
                  "None"
                )
              }
            />
          </dl>
          <dl className="grid gap-4 text-[0.95rem] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-ink-muted">Graduates (estimated)</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{ops.graduates.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Readers</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{ops.readers}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Ceremonies</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{ops.ceremonies}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Days</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{ops.days}</dd>
            </div>
            {ops.priorYearGraduates ? (
              <div>
                <dt className="text-sm text-ink-muted">Last year names</dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {ops.priorYearGraduates.toLocaleString()}
                </dd>
              </div>
            ) : null}
            {ops.priorYearQuoteCents ? (
              <div>
                <dt className="text-sm text-ink-muted">Last year quote</dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {formatMoney(ops.priorYearQuoteCents)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        {eventCompensation.length ? (
          <ul className="grid gap-0 border-y border-line text-[0.95rem]">
            {eventCompensation.map((row) => {
              const reader = catalog.readers.find((item) => item.id === row.readerId);
              return (
                <li
                  key={row.id}
                  className="flex min-h-11 items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
                >
                  <TextLink href="/admin/payments">
                    {reader?.contractorName ?? "Reader"} · fee
                  </TextLink>
                  <span className="tabular-nums font-medium">
                    {formatMoney(row.amountCents)} · {row.status}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="text-sm text-ink-muted">
          Reader pay initiation is intended for Patriot. Neither Wave nor Patriot is connected in this
          demo.
        </p>
      </OpsSection>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <OpsSection title="Tasks" description="Open work tied to this event.">
          {eventTasks.length ? <ul className="grid gap-0 border-y border-line">{eventTasks.map((task, index) => <li key={task.id} className={cn("flex min-h-14 flex-wrap items-center justify-between gap-3 py-3", index < eventTasks.length - 1 ? "border-b border-line" : "")}><div className="min-w-0 flex-1"><p className="text-base font-medium leading-snug">{task.title}</p><p className="mt-1 text-[0.95rem] text-ink-muted">{task.priority} · {task.status}{task.dueAt ? ` · due ${formatShortDate(task.dueAt)}` : ""}</p></div><Button type="button" size="sm" variant="secondary" onClick={() => { setTaskStatus(task.id, "done"); notify({ title: "Task completed." }); }}>Mark done</Button></li>)}</ul> : <EmptyState title="No open tasks" description="Create the next operational action for this event below." />}
          <form className="mt-4 grid gap-3 border-t border-line pt-4" onSubmit={(e) => { e.preventDefault(); if (!taskTitle) return; createTask({ title: taskTitle, description: taskTitle, status: "open", priority: taskPriority, dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : undefined, eventId: event.id, clientId: client.id, assigneeName: "Chester Tadeja" }); notify({ title: "Task created." }); setTaskTitle(""); setTaskDueAt(""); }}>
            <Field id="event-task-title" label="Task"><Input id="event-task-title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Confirm reader travel" /></Field>
            <div className="grid gap-3 sm:grid-cols-2"><Field id="event-task-due" label="Due"><Input id="event-task-due" type="datetime-local" value={taskDueAt} onChange={(e) => setTaskDueAt(e.target.value)} /></Field><Field id="event-task-priority" label="Priority"><Select id="event-task-priority" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as typeof taskPriority)} options={[{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} /></Field></div>
            <Button type="submit" size="sm" variant="secondary">Create task</Button>
          </form>
        </OpsSection>

        <OpsSection title="Activity" description="Recent operational history for this event.">
          {eventActivity.length ? (
            <ul className="grid gap-0 border-y border-line">
              {eventActivity.map((entry, index) => (
                <li
                  key={entry.id}
                  className={cn(
                    "grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-4",
                    index < eventActivity.length - 1 ? "border-b border-line" : "",
                  )}
                >
                  <div className="min-w-0">
                    {entry.href ? (
                      <TextLink href={entry.href} className="text-base font-medium">
                        {entry.title}
                      </TextLink>
                    ) : (
                      <p className="text-base font-medium">{entry.title}</p>
                    )}
                    <p className="mt-0.5 text-[0.95rem] text-ink-muted">
                      {entry.actorName}
                      {entry.detail ? ` · ${entry.detail}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-ink-faint">
                    {formatShortDate(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No activity yet"
              description="Offers, Call Sheets, expenses, and other actions on this event will appear here."
            />
          )}
        </OpsSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <OpsSection title="Event notes">
          <p className="text-base leading-relaxed text-ink">
            {event.notes || "No operational notes yet."}
          </p>
          {queries.notesForEvent(event.id).length ? (
            <ul className="mt-1 grid gap-2 border-t border-line pt-3 text-[0.95rem] text-ink-muted">
              {queries.notesForEvent(event.id).map((note) => (
                <li key={note.id}>
                  <span className="font-medium text-ink">{note.authorName}</span>: {note.body}
                </li>
              ))}
            </ul>
          ) : null}
          <form className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3" onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.elements.namedItem("calendar-note") as HTMLInputElement; if (!input.value.trim()) return; addCalendarNote({ eventId: event.id, note: input.value.trim(), pinnedToCalendar: true }); input.value = ""; notify({ title: "Calendar note added." }); }}>
            <input name="calendar-note" className="min-h-9 min-w-[16rem] flex-1 rounded-[var(--radius-md)] border border-line bg-paper-raised px-2 text-sm" placeholder="Add a calendar reminder for this event" />
            <Button type="submit" variant="secondary" size="sm">Pin to calendar</Button>
          </form>
          <div className="mt-1 flex flex-wrap gap-2">
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
          </div>
        </OpsSection>

        <OpsSection title="Debrief">
          {debriefs.length ? (
            <ul className="grid gap-0 border-y border-line text-[0.95rem]">
              {debriefs.map((row) => (
                <li
                  key={row.id}
                  className="flex min-h-12 flex-wrap items-baseline justify-between gap-2 border-b border-line py-3 last:border-b-0"
                >
                  <TextLink href={`/admin/debriefs#${row.id}`} className="text-base font-medium">
                    {queries.getReader(row.readerId)?.contractorName}
                  </TextLink>
                  <span className="text-ink-muted">
                    event {row.ratingEvent}/5 · staff {row.ratingStaff}/5 · ops {row.ratingOperations}
                    /5
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No debriefs yet"
              description="Reader debriefs show up here after the event weekend."
              action={
                <ButtonLink href="/admin/debriefs" variant="secondary" size="sm">
                  Open debriefs
                </ButtonLink>
              }
            />
          )}
        </OpsSection>
      </div>
    </div>
  );
}

function TravelBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function uidForFile(name: string) {
  return `${Date.now().toString(36)}-${name.replace(/[^a-z0-9._-]/gi, "-").slice(0, 80)}`;
}

function daySpan(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
