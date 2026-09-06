"use client";

import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatMoney, formatShortDate } from "@/lib/format";
import type { AssignmentView } from "@/data/queries";

export function AssignmentNoticePanel({ view }: { view: AssignmentView }) {
  const { prepareAssignmentNotice, assignmentNotice, queries } = useOperations();
  const { notify } = useToast();
  const notice = assignmentNotice(view.id);
  const ceremonies = queries.ceremoniesForEvent(view.eventId);
  const first = ceremonies[0];

  return (
    <section className="grid gap-3 border border-line bg-paper-raised px-4 py-4">
      <div>
        <p className="app-kicker">Assignment notice</p>
        <p className="mt-1 text-sm text-ink-muted">
          Email is not connected. Preparing a notice records the assignment for Chester’s usual
          send — it does not transmit mail from this demo.
        </p>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint">Reader selected</dt>
          <dd className="font-medium">{view.reader.contractorName}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">University</dt>
          <dd>{view.client.name}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Event</dt>
          <dd>{view.event.name}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Date / time</dt>
          <dd>{first ? formatDateTime(first.startsAt) : "Ceremony time not set"}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Role</dt>
          <dd className="capitalize">{view.role}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Compensation</dt>
          <dd className="tabular-nums">{formatMoney(view.promisedPayCents)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Assignment status</dt>
          <dd>
            <StatusBadge kind="assignment" value={view.status} />
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Notice</dt>
          <dd>
            {notice ? (
              <span className="text-success">
                Assignment notification prepared
                {notice.preparedAt ? ` · ${formatShortDate(notice.preparedAt)}` : ""}
              </span>
            ) : (
              <span className="text-ink-muted">Not prepared</span>
            )}
          </dd>
        </div>
      </dl>
      {notice ? (
        <div className="grid gap-2 border-t border-line pt-3 text-sm">
          <p className="font-medium text-success">Assignment notification prepared — ready for Chester&apos;s usual email send.</p>
          <div className="rounded-[var(--radius-md)] bg-paper-inset p-3">
            <p><span className="text-ink-muted">To:</span> {view.reader.email}</p>
            <p><span className="text-ink-muted">Subject:</span> VTI selected you for {view.client.name}</p>
            <p className="mt-2 leading-relaxed">Hi {view.reader.contractorName.split(" ")[0]}, you have been selected for {view.client.name} because your sound is a strong match for this event. The assignment details and Call Sheet are ready in VTI.</p>
            <p className="mt-2 text-ink-muted">Attach the current Call Sheet when sending. No email is transmitted by this MVP.</p>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => {
            prepareAssignmentNotice(view.id);
            notify({
              title: "Assignment notification prepared.",
              message:
                "No email was sent. Attach the Call Sheet in your usual mail until delivery is connected.",
            });
          }}
        >
          Prepare assignment notice
        </Button>
      )}
    </section>
  );
}
