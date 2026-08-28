import Link from "next/link";
import { notFound } from "next/navigation";
import { CallSheetDocument } from "@/components/call-sheet/call-sheet-document";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  assignmentView,
  assignmentsForEvent,
  callSheetsForEvent,
  ceremoniesForEvent,
  currentCallSheet,
  debriefsForEvent,
  documentsForEvent,
  estimatesForEvent,
  getClient,
  getEvent,
  getReader,
  invoicesForEvent,
  notesForEvent,
  operationalIssues,
} from "@/data/queries";
import { formatDateTime, formatMoney } from "@/lib/format";

export function generateStaticParams() {
  return catalog.events.map((item) => ({ id: item.id }));
}

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();
  const client = getClient(event.clientId);
  if (!client) notFound();

  const ceremonies = ceremoniesForEvent(event.id);
  const assignments = assignmentsForEvent(event.id)
    .map(assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const callSheet = currentCallSheet(event.id);
  const versions = callSheetsForEvent(event.id);
  const issues = operationalIssues(event.id);
  const estimate = estimatesForEvent(event.id)[0];
  const invoice = invoicesForEvent(event.id)[0];
  const debriefs = debriefsForEvent(event.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={event.name}
        description={`${client.name} · assignment is the operational hub for readers, Call Sheet, travel, expenses, and debrief.`}
      />
      <DemoBanner />

      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="event" value={event.status} />
        {event.eventReady ? (
          <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-success-soft px-2 py-0.5 text-xs font-medium tracking-[0.02em] text-success uppercase">
            Event ready
          </span>
        ) : null}
        {issues.map((issue) => (
          <span key={issue} className="text-sm text-warning">
            {issue}
          </span>
        ))}
      </div>
      {event.tentativeReason ? (
        <p className="text-sm text-ink-muted">Tentative: {event.tentativeReason}</p>
      ) : null}

      <dl className="grid gap-4 border-y border-line py-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-ink-faint">Names this year</dt>
          <dd>{event.estimatedGraduateCount.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Last year</dt>
          <dd>{event.priorYearGraduateCount?.toLocaleString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Quote</dt>
          <dd>{formatMoney(event.quoteAmountCents)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Last-year quote</dt>
          <dd>
            {event.priorYearQuoteAmountCents
              ? formatMoney(event.priorYearQuoteAmountCents)
              : "—"}
          </dd>
        </div>
      </dl>

      <Section title="Ceremonies">
        <TableWrap>
          <thead>
            <tr>
              <Th>Session</Th>
              <Th>When</Th>
              <Th>Venue</Th>
              <Th>Call / sound</Th>
            </tr>
          </thead>
          <tbody>
            {ceremonies.map((ceremony) => (
              <tr key={ceremony.id}>
                <Td>
                  {ceremony.name}
                  <p className="text-ink-muted">{ceremony.kind.replaceAll("_", " ")}</p>
                </Td>
                <Td>{formatDateTime(ceremony.startsAt)}</Td>
                <Td>
                  {ceremony.venueName}
                  <p className="text-ink-muted">{ceremony.venueAddress}</p>
                </Td>
                <Td>
                  {ceremony.callTime ? `Call ${formatDateTime(ceremony.callTime)}` : "—"}
                  {ceremony.soundCheckAt ? (
                    <p className="text-ink-muted">
                      Sound {formatDateTime(ceremony.soundCheckAt)}
                    </p>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Travel and lodging">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-faint">Travel</dt>
            <dd>{event.travelNotes}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Airfare</dt>
            <dd>
              {event.airfareNotes}
              {event.airfarePaidCents ? ` · ${formatMoney(event.airfarePaidCents)} paid` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Accommodation</dt>
            <dd>
              {event.accommodationNotes}
              {event.hotelEstimateCents ? ` · ${formatMoney(event.hotelEstimateCents)}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Transfers</dt>
            <dd>{event.transferNotes}</dd>
          </div>
        </dl>
      </Section>

      <Section
        title="Assigned readers"
        description="Chester assigns. The system does not auto-pick. Shadow is a training role."
      >
        <TableWrap>
          <thead>
            <tr>
              <Th>Reader</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Promised</Th>
              <Th>Logistics</Th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item) => (
              <tr key={item.id}>
                <Td>
                  <Link href={`/admin/assignments/${item.id}`} className="underline-offset-2 hover:underline">
                    {item.reader.contractorName}
                  </Link>
                </Td>
                <Td>{item.role}</Td>
                <Td>
                  <StatusBadge kind="assignment" value={item.status} />
                </Td>
                <Td className="tabular-nums">{formatMoney(item.promisedPayCents)}</Td>
                <Td className="text-ink-muted">{item.logisticsStatus ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Notes and documents">
        <ul className="grid gap-2 text-sm">
          {notesForEvent(event.id).map((note) => (
            <li key={note.id} className="text-ink-muted">
              {note.authorName}: {note.body}
            </li>
          ))}
          {documentsForEvent(event.id).map((doc) => (
            <li key={doc.id}>
              {doc.originalFilename} · {doc.statusNote}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm">{event.notes}</p>
      </Section>

      <Section title="Estimate / invoice tracking">
        <p className="text-sm">
          Estimate: {estimate ? `${formatMoney(estimate.amountCents)} · ${estimate.status}` : "None"}
          {" · "}
          Invoice:{" "}
          {invoice ? (
            <StatusBadge kind="invoice" value={invoice.status} />
          ) : (
            "not billed"
          )}
        </p>
        <p className="text-xs text-ink-muted">
          Tracking copy only. Wave remains the ledger for official estimates and invoices.
        </p>
      </Section>

      <Section title="Debrief / event-ready">
        {debriefs.length ? (
          <ul className="grid gap-3 text-sm">
            {debriefs.map((row) => (
              <li key={row.id}>
                <Link href={`/admin/debriefs#${row.id}`} className="font-medium underline-offset-2 hover:underline">
                  {getReader(row.readerId)?.contractorName}
                </Link>
                <span className="text-ink-muted">
                  {" "}
                  · event {row.ratingEvent}/5 · staff {row.ratingStaff}/5 · ops {row.ratingOperations}/5
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No reader debriefs submitted yet.</p>
        )}
        <p className="mt-2 text-sm">
          Admin work-again:{" "}
          {event.workAgainRecommendation === true
            ? "Yes"
            : event.workAgainRecommendation === false
              ? "No"
              : "Not marked"}
          {event.eventReady ? " · event ready" : ""}
        </p>
      </Section>

      {callSheet ? (
        <Section
          title="Current Call Sheet"
          action={
            <Link href={`/admin/call-sheets/${callSheet.id}`} className="text-sm underline-offset-2 hover:underline">
              Open v{callSheet.version}
            </Link>
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
