"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export function InquiryCreateView({ clientId: requestedClientId }: { clientId?: string }) {
  const router = useRouter();
  const requested = requestedClientId ?? "";
  const { catalog, createInquiry, queries, ready } = useOperations();
  const { notify } = useToast();
  const resolvedRequested = catalog.clients.some((item) => item.id === requested) ? requested : "";
  const fallback = catalog.clients[0]?.id || "";
  const [manualClientId, setManualClientId] = useState<string | null>(null);
  const clientId =
    manualClientId && catalog.clients.some((item) => item.id === manualClientId)
      ? manualClientId
      : resolvedRequested || fallback;
  const client = queries.getClient(clientId);
  const primary = client ? queries.contactsForClient(client.id).find((item) => item.isPrimary) : undefined;
  const [eventType, setEventType] = useState("Commencement");
  const [expectedEventDate, setExpectedEventDate] = useState("");
  const [estimatedReaderCount, setEstimatedReaderCount] = useState("2");
  const [estimatedValue, setEstimatedValue] = useState("8500");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("Schedule discovery call");

  if (!ready) return <RecordPending />;

  return (
    <div className="app-page">
      <PageHeader
        title="New inquiry"
        description="Log university interest. Chester owns the stage until the inquiry is won or lost."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/inquiries", label: "Inquiries" },
          { label: "New" },
        ]}
      />
      <form
        className="grid max-w-2xl gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!client) return;
          const id = createInquiry({
            clientId: client.id,
            source: "University intake",
            contactName: primary?.name ?? client.name,
            email: primary?.email ?? "",
            universityName: client.name,
            department: primary?.department ?? "Commencement",
            stage: "initial_inquiry",
            notes: notes || `${eventType} interest`,
            nextAction,
            ownerName: "Chester",
            eventType,
            expectedEventDate: expectedEventDate || undefined,
            estimatedReaderCount: Number(estimatedReaderCount) || undefined,
            estimatedValueCents: Math.round(Number(estimatedValue) * 100) || undefined,
          });
          notify({ title: "Inquiry created." });
          router.push(`/admin/inquiries/${id}`);
        }}
      >
        <Field id="inq-uni" label="University" required>
          <Select
            id="inq-uni"
            value={clientId}
            onChange={(event) => setManualClientId(event.target.value)}
            options={catalog.clients.map((item) => ({ value: item.id, label: item.name }))}
          />
        </Field>
        <Field id="inq-type" label="Event type">
          <Input id="inq-type" value={eventType} onChange={(e) => setEventType(e.target.value)} />
        </Field>
        <Field id="inq-date" label="Expected event date">
          <Input
            id="inq-date"
            type="date"
            value={expectedEventDate}
            onChange={(e) => setExpectedEventDate(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="inq-readers" label="Estimated reader count">
            <Input
              id="inq-readers"
              type="number"
              min={1}
              value={estimatedReaderCount}
              onChange={(e) => setEstimatedReaderCount(e.target.value)}
            />
          </Field>
          <Field id="inq-value" label="Estimated value (USD)">
            <Input
              id="inq-value"
              type="number"
              min={0}
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
            />
          </Field>
        </div>
        <Field id="inq-next" label="Next action">
          <Input id="inq-next" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
        </Field>
        <Field id="inq-notes" label="Notes">
          <Textarea id="inq-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <p className="text-sm text-ink-muted">
          Primary contact: {primary ? `${primary.name} · ${primary.email}` : "Add a contact on the university record."}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create inquiry</Button>
        </div>
      </form>
    </div>
  );
}
