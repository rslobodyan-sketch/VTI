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

  return (
    <article className="border border-line bg-paper-raised px-5 py-6 sm:px-8">
      <p className="text-[0.7rem] tracking-[0.14em] text-ink-faint uppercase">
        Voice Talent International · Call Sheet
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">{event.name}</h2>
          <p className="text-sm text-ink-muted">{universityName}</p>
        </div>
        <div className="text-right text-sm">
          <StatusBadge kind="callsheet" value={callSheet.status} />
          <p className="mt-1 text-ink-muted">Version {callSheet.version}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 border-y border-line py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint">Talent</dt>
          <dd>{callSheet.talentSummary}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Contacts</dt>
          <dd>{callSheet.contactsSnapshot}</dd>
        </div>
      </dl>

      <section className="mt-5">
        <h3 className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
          Ceremony schedule
        </h3>
        <ul className="mt-2 grid gap-2 text-sm">
          {ceremonies.map((ceremony) => (
            <li key={`${ceremony.name}-${ceremony.startsAt}`}>
              <span className="font-medium">{ceremony.name}</span>
              <span className="text-ink-muted">
                {" "}
                · {formatDateTime(ceremony.startsAt)} · {ceremony.venueName}
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

      <section className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <p>
          <span className="block text-ink-faint">Travel</span>
          {callSheet.travelNotes}
        </p>
        <p>
          <span className="block text-ink-faint">Airfare</span>
          {callSheet.airfareNotes}
        </p>
        <p>
          <span className="block text-ink-faint">Lodging</span>
          {callSheet.accommodationNotes}
          {callSheet.hotelEstimateCents ? (
            <span className="block text-ink-muted">
              Hotel estimate {formatMoney(callSheet.hotelEstimateCents)}
            </span>
          ) : null}
        </p>
        <p>
          <span className="block text-ink-faint">Transfers / rideshare</span>
          {callSheet.transferRideshareNotes}
        </p>
        <p>
          <span className="block text-ink-faint">Per diem</span>
          {formatMoney(callSheet.perDiemCents)} per day
        </p>
        <p>
          <span className="block text-ink-faint">Parking</span>
          {callSheet.parkingNotes}
        </p>
      </section>

      <section className="mt-5 text-sm">
        <h3 className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
          Compensation
        </h3>
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
          </p>
        ) : (
          <ul className="mt-2 grid gap-1">
            {assignments.map((item) => (
              <li key={item.assignment.id}>
                <Link href={`/admin/readers/${item.reader.id}`} className="underline-offset-2 hover:underline">
                  {item.reader.contractorName}
                </Link>
                <span className="text-ink-muted"> · {item.assignment.role} · </span>
                {formatMoney(item.assignment.promisedPayCents)}
                <span className="text-ink-muted">
                  {item.acknowledged ? " · accepted v" + callSheet.version : " · acknowledgement outstanding"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5 grid gap-4 text-sm">
        <p>
          <span className="block text-ink-faint">Task instructions</span>
          {callSheet.taskInstructions}
        </p>
        <p>
          <span className="block text-ink-faint">Preparation</span>
          {callSheet.preparationRequirements}
        </p>
        <p>
          <span className="block text-ink-faint">Dress code</span>
          {callSheet.dressCode}
        </p>
        <p>
          <span className="block text-ink-faint">Error-rate expectations</span>
          {callSheet.errorRateExpectations}
        </p>
        <p>
          <span className="block text-ink-faint">Expense rules</span>
          {callSheet.expenseRules}
        </p>
        <p>
          <span className="block text-ink-faint">Debrief</span>
          {callSheet.debriefInstructions}
        </p>
        <p className="border-t border-line pt-4 text-ink-muted">
          <span className="block text-ink-faint">Confidentiality / acknowledgement</span>
          {callSheet.confidentialityLegalText}
        </p>
      </section>
    </article>
  );
}
