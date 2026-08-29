"use client";

import { notFound, useRouter } from "next/navigation";
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
import { formatMoney, formatShortDate } from "@/lib/format";
import type { InquiryStage } from "@/types/domain";
import { INQUIRY_STAGE_LABELS, INQUIRY_STAGE_ORDER } from "@/types/operations";

const NEXT_ACTION: Partial<Record<InquiryStage, string>> = {
  needs_conversation: "Hold discovery conversation",
  pending_admin_approval: "Await university administration",
  coordinator_logistics: "Collect venue and name-list details",
  closed_won: "Create the event record",
  closed_lost: "Archive and keep the university relationship",
};

export function InquiryDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { catalog, setInquiryStage, ready, profileFor } = useOperations();
  const { notify } = useToast();
  const inquiry = catalog.inquiries.find((item) => item.id === id);
  if (!inquiry) {
    if (!ready) return <RecordPending />;
    notFound();
  }

  const index = INQUIRY_STAGE_ORDER.indexOf(inquiry.stage);
  const nextStage = index >= 0 ? INQUIRY_STAGE_ORDER[index + 1] : undefined;
  const open = inquiry.stage !== "closed_won" && inquiry.stage !== "closed_lost";

  const onboarding = profileFor(inquiry.clientId);

  return (
    <div className="app-page">
      <PageHeader
        title={inquiry.universityName}
        description={`${inquiry.eventType ?? inquiry.source}. Chester moves the stage; universities do not log in.`}
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/inquiries", label: "Inquiries" },
          { label: inquiry.universityName },
        ]}
        actions={
          inquiry.stage === "closed_won" ? (
            <ButtonLink href={`/admin/events/new?clientId=${inquiry.clientId}&inquiryId=${inquiry.id}`}>
              Create event
            </ButtonLink>
          ) : onboarding?.onboardingStatus === "in_progress" ? (
            <ButtonLink href={`/admin/clients/new?clientId=${inquiry.clientId}`}>
              Complete onboarding
            </ButtonLink>
          ) : (
            <ButtonLink href={`/admin/clients/${inquiry.clientId}`} variant="secondary">
              Open university
            </ButtonLink>
          )
        }
      />

      <StatusBadge kind="inquiry" value={inquiry.stage} />
      {onboarding?.onboardingStatus === "in_progress" ? (
        <p className="text-sm text-ink-muted">
          University onboarding is still in progress. Complete intake before the inquiry is won.
        </p>
      ) : null}

      <FactGrid
        columns={3}
        items={[
          {
            label: "University",
            value: (
              <TextLink href={`/admin/clients/${inquiry.clientId}`}>{inquiry.universityName}</TextLink>
            ),
          },
          { label: "Primary contact", value: `${inquiry.contactName} · ${inquiry.email}` },
          { label: "Event type", value: inquiry.eventType ?? inquiry.source },
          {
            label: "Expected date",
            value: inquiry.expectedEventDate ? formatShortDate(inquiry.expectedEventDate) : "—",
          },
          {
            label: "Estimated readers",
            value: inquiry.estimatedReaderCount?.toString() ?? "—",
          },
          {
            label: "Estimated value",
            value: inquiry.estimatedValueCents ? formatMoney(inquiry.estimatedValueCents) : "—",
          },
          { label: "Owner", value: inquiry.ownerName ?? "Chester" },
          { label: "Next action", value: inquiry.nextAction },
          {
            label: "Last activity",
            value: inquiry.lastActivityAt ? formatShortDate(inquiry.lastActivityAt) : "—",
          },
        ]}
      />

      <Section title="Notes">
        <p className="text-sm">{inquiry.notes}</p>
      </Section>

      {open ? (
        <Section title="Progress stage" description="Canonical pipeline. Do not skip university administration when it is required.">
          <div className="flex flex-wrap gap-2">
            {nextStage ? (
              <Button
                onClick={() => {
                  setInquiryStage(id, nextStage, NEXT_ACTION[nextStage]);
                  notify({
                    title: `Moved to ${INQUIRY_STAGE_LABELS[nextStage]}.`,
                  });
                }}
              >
                Move to {INQUIRY_STAGE_LABELS[nextStage]}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => {
                setInquiryStage(id, "closed_lost", NEXT_ACTION.closed_lost);
                notify({ title: "Inquiry marked lost." });
              }}
            >
              Mark lost
            </Button>
          </div>
        </Section>
      ) : inquiry.stage === "closed_won" ? (
        <p className="text-sm text-ink-muted">
          Won. Create the event to continue reader assignment, Call Sheet, and travel.
        </p>
      ) : (
        <p className="text-sm text-ink-muted">Closed lost. The university record remains for future relationship work.</p>
      )}

      <Button variant="ghost" size="sm" onClick={() => router.push("/admin/inquiries")}>
        Back to pipeline
      </Button>
    </div>
  );
}
