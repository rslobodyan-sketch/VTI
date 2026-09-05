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
        <p className="text-sm text-success">Assignment notification prepared.</p>
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
