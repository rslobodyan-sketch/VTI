import Link from "next/link";
import { StatusBadge } from "@/components/status/status-badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Assignment, CallSheet, EventRecord, ReaderProfile } from "@/types/domain";

type CallSheetDocumentProps = {
  event: EventRecord;
  callSheet: CallSheet;
  universityName: string;
  assignments: Array<{
    assignment: Assignment;
    reader: ReaderProfile;
    acknowledged: boolean;
  }>;
  ceremonies: Array<{
    name: string;
    startsAt: string;
    venueName: string;
    callTime?: string;
    soundCheckAt?: string;
    kind: string;
  }>;
  viewer?: "admin" | "reader";
  viewerReaderId?: string;
};

export function CallSheetDocument({
  event,
  callSheet,
  universityName,
  assignments,
  ceremonies,
  viewer = "admin",
  viewerReaderId,
}: CallSheetDocumentProps) {
  const own = assignments.find((item) => item.reader.id === viewerReaderId);
  const first = ceremonies[0];
  const last = ceremonies[ceremonies.length - 1];
  const outstanding = assignments.filter((item) => !item.acknowledged);
  const issued = callSheet.status === "issued";

  return (
    <article className="call-sheet-doc border border-line bg-paper-raised px-5 py-6 sm:px-8">
      <header className="border-b border-line pb-4">
        <p className="app-kicker">Voice Talent International · Assignment packet</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">{event.name}</h2>
            <p className="text-sm text-ink-muted">{universityName}</p>
          </div>
          <div className="text-right text-sm">
            <StatusBadge kind="callsheet" value={callSheet.status} />
            <p className="mt-1 font-medium tabular-nums">Version {callSheet.version}</p>
            {callSheet.issuedAt ? (
              <p className="text-ink-muted">Issued {formatDateTime(callSheet.issuedAt)}</p>
            ) : (
              <p className="text-ink-muted">Not issued</p>
            )}
          </div>
        </div>
      </header>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt>Event</dt>
          <dd>{event.name}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>
            {first ? formatDateTime(first.startsAt) : "—"}
            {last && first && last.startsAt !== first.startsAt ? (
              <span className="block text-ink-muted">through {formatDateTime(last.startsAt)}</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{first?.venueName ?? "See schedule"}</dd>
        </div>
      </dl>

      <section className="mt-6">
        <h3 className="app-kicker">Schedule</h3>
        <ul className="mt-2 grid gap-3 text-sm">
          {ceremonies.map((ceremony) => (
            <li key={`${ceremony.name}-${ceremony.startsAt}`} className="border-l-2 border-line pl-3">
              <span className="font-medium">{ceremony.name}</span>
              <span className="block text-ink-muted">
                {formatDateTime(ceremony.startsAt)} · {ceremony.venueName}
              </span>
              {ceremony.callTime ? (
                <span className="block text-ink-muted">
                  Call {formatDateTime(ceremony.callTime)}
                  {ceremony.soundCheckAt
                    ? ` · sound check ${formatDateTime(ceremony.soundCheckAt)}`
                    : ""}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 text-sm">
        <h3 className="app-kicker">Reader assignment</h3>
        {viewer === "reader" && own ? (
          <p className="mt-2">
            <span className="font-medium">{own.reader.contractorName}</span>
            <span className="text-ink-muted"> · {own.assignment.role}</span>
            <span className="block text-ink-muted">
              {own.acknowledged
                ? `Acknowledged version ${callSheet.version}`
                : issued
                  ? "Acknowledgement outstanding"
                  : "No acknowledgement required on this version"}
            </span>
          </p>
        ) : (
          <ul className="mt-2 grid gap-1.5">
            {assignments.map((item) => (
              <li key={item.assignment.id}>
                <Link href={`/admin/readers/${item.reader.id}`} className="app-link">
                  {item.reader.contractorName}
                </Link>
                <span className="text-ink-muted"> · {item.assignment.role}</span>
                <span className="text-ink-muted">
                  {item.acknowledged
                    ? ` · acknowledged v${callSheet.version}`
                    : issued
                      ? " · acknowledgement outstanding"
                      : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-ink-muted">{callSheet.talentSummary}</p>
        <p className="mt-1 text-ink-muted">{callSheet.contactsSnapshot}</p>
      </section>

      <section className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Travel</span>
          {callSheet.travelNotes}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Airfare</span>
          {callSheet.airfareNotes}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Lodging</span>
          {callSheet.accommodationNotes}
          {callSheet.hotelEstimateCents ? (
            <span className="block text-ink-muted">
              Hotel estimate {formatMoney(callSheet.hotelEstimateCents)}
            </span>
          ) : null}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">
            Transfers / rideshare
          </span>
          {callSheet.transferRideshareNotes}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Per diem</span>
          {formatMoney(callSheet.perDiemCents)} per day
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Parking</span>
          {callSheet.parkingNotes}
        </p>
      </section>

      <section className="mt-6 text-sm">
        <h3 className="app-kicker">Compensation</h3>
        {viewer === "reader" && own ? (
          <p className="mt-2">
            Promised for this assignment:{" "}
            <span className="font-medium">{formatMoney(own.assignment.promisedPayCents)}</span>
            {own.assignment.priorYearPayCents ? (
              <span className="text-ink-muted">
                {" "}
                · last year {formatMoney(own.assignment.priorYearPayCents)}
              </span>
            ) : null}
            <span className="mt-1 block text-xs text-ink-faint">
              Other readers’ compensation is never shown on this packet.
            </span>
          </p>
        ) : (
          <ul className="mt-2 grid gap-1">
            {assignments.map((item) => (
              <li key={item.assignment.id}>
                {item.reader.contractorName}
                <span className="text-ink-muted"> · {item.assignment.role} · </span>
                {formatMoney(item.assignment.promisedPayCents)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 grid gap-4 text-sm">
        <h3 className="app-kicker">Instructions</h3>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">
            Task instructions
          </span>
          {callSheet.taskInstructions}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">
            University materials / preparation
          </span>
          {callSheet.preparationRequirements}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Dress code</span>
          {callSheet.dressCode}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">
            Error-rate expectations
          </span>
          {callSheet.errorRateExpectations}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Expense rules</span>
          {callSheet.expenseRules}
        </p>
        <p>
          <span className="block text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">Debrief</span>
          {callSheet.debriefInstructions}
        </p>
      </section>

      <footer className="mt-6 border-t border-line pt-4 text-sm">
        <h3 className="app-kicker">Confidentiality and acknowledgement</h3>
        <p className="mt-2 text-ink-muted">{callSheet.confidentialityLegalText}</p>
        {viewer === "admin" ? (
          <p className="mt-3">
            Acknowledgement:{" "}
            {issued
              ? outstanding.length
                ? `${outstanding.length} outstanding on v${callSheet.version}`
                : `All assigned readers acknowledged v${callSheet.version}`
              : "Not required on a superseded or unissued version"}
          </p>
        ) : own ? (
          <p className="mt-3">
            Your acknowledgement:{" "}
            {own.acknowledged
              ? `accepted version ${callSheet.version}`
              : issued
                ? "not yet accepted"
                : "n/a on this version"}
          </p>
        ) : null}
      </footer>
    </article>
  );
}
