"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FactGrid } from "@/components/ui/fact-grid";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatMoney, formatShortDate } from "@/lib/format";
import { labelize } from "@/lib/status";

export function UniversityProfileView({ id }: { id: string }) {
  const {
    queries,
    profileFor,
    activityFor,
    patchClient,
    patchEvent,
    addContact,
    ready,
  } = useOperations();
  const { notify } = useToast();
  const client = queries.getClient(id);
  const [contactOpen, setContactOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<"prospect" | "active" | "inactive">("prospect");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  if (!client) {
    if (!ready) return <RecordPending />;
    notFound();
  }

  const profile = profileFor(client.id);
  const contacts = queries.contactsForClient(client.id);
  const events = queries.eventsForClient(client.id);
  const insurance = queries.insuranceForClient(client.id);
  const inquiries = queries.inquiriesForClient(client.id);
  const activity = activityFor(client.id);
  const primary = contacts.find((item) => item.isPrimary) ?? contacts[0];

  const dated = events.map((event) => ({
    event,
    window: queries.eventWindow(event.id),
  }));
  const upcoming = dated
    .filter((item) => (item.window?.start ?? "") >= "2026-08-28")
    .sort((a, b) => (a.window?.start ?? "").localeCompare(b.window?.start ?? ""));
  const past = dated
    .filter((item) => (item.window?.start ?? "") < "2026-08-28")
    .sort((a, b) => (b.window?.start ?? "").localeCompare(a.window?.start ?? ""));
  const lastEvent = past[0]?.event ?? dated.sort((a, b) => (b.window?.start ?? "").localeCompare(a.window?.start ?? ""))[0]?.event;
  const nextEvent = upcoming[0]?.event;

  const revenue = events.reduce((sum, event) => {
    const invoices = queries.invoicesForEvent(event.id);
    return sum + invoices.reduce((inner, invoice) => inner + invoice.amountCents, 0);
  }, 0);
  const firstEngagement = dated
    .map((item) => item.window?.start)
    .filter(Boolean)
    .sort()[0];

  const currentInquiry = inquiries.find(
    (item) => item.stage !== "closed_won" && item.stage !== "closed_lost",
  ) ?? inquiries[0];

  const workAgain = events.some((item) => item.workAgainRecommendation);
  const eventReady = events.some((item) => item.eventReady);

  return (
    <div className="app-page">
      <PageHeader
        title={client.name}
        description={
          profile
            ? `${profile.institutionType}${profile.city ? ` · ${profile.city}, ${profile.region}` : ""}`
            : client.notes
        }
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/clients", label: "Universities" },
          { label: client.name },
        ]}
        actions={
          <>
            {profile?.onboardingStatus === "in_progress" ? (
              <ButtonLink href={`/admin/clients/new?clientId=${client.id}`} size="sm">
                Complete onboarding
              </ButtonLink>
            ) : (
              <ButtonLink href={`/admin/inquiries/new?clientId=${client.id}`} size="sm">
                New inquiry
              </ButtonLink>
            )}
            <ButtonLink href={`/admin/events/new?clientId=${client.id}`} variant="secondary" size="sm">
              New event
            </ButtonLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditNotes(client.notes);
                setEditStatus(client.status);
                setEditOpen(true);
              }}
            >
              Edit university
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="client" value={client.status} />
        {profile ? <StatusBadge kind="onboarding" value={profile.onboardingStatus} /> : null}
        <span className="text-sm text-ink-muted">
          {client.isReturning ? "Returning" : "New"}
        </span>
        {workAgain ? (
          <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
            Work-again
          </span>
        ) : null}
        {eventReady ? (
          <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
            Event-ready
          </span>
        ) : null}
        {primary ? (
          <span className="text-sm text-ink-muted">
            Primary: {primary.name}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setContactOpen(true)}>
          Add contact
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            patchClient(client.id, { isReturning: true, status: "active" });
            notify({ title: "Marked as returning." });
          }}
        >
          Mark returning
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const target = lastEvent ?? nextEvent;
            if (target) {
              patchEvent(target.id, { workAgainRecommendation: true, eventReady: true });
              notify({ title: "Marked work-again / event-ready." });
            } else {
              notify({
                title: "No event yet",
                message: "Create an event before marking work-again.",
              });
            }
          }}
        >
          Mark work-again
        </Button>
        <ButtonLink href="#history" variant="ghost" size="sm">
          View history
        </ButtonLink>
      </div>

      <Section title="Overview">
        <FactGrid
          columns={3}
          items={[
            { label: "University", value: client.name },
            { label: "Status", value: <span className="capitalize">{client.status}</span> },
            { label: "Returning / new", value: client.isReturning ? "Returning" : "New" },
            {
              label: "Work-again / event-ready",
              value: workAgain || eventReady ? "Yes" : "Not yet marked",
            },
            {
              label: "Last event",
              value: lastEvent ? (
                <TextLink href={`/admin/events/${lastEvent.id}`}>{lastEvent.name}</TextLink>
              ) : (
                "—"
              ),
            },
            {
              label: "Next event",
              value: nextEvent ? (
                <TextLink href={`/admin/events/${nextEvent.id}`}>{nextEvent.name}</TextLink>
              ) : (
                "None scheduled"
              ),
            },
          ]}
        />
      </Section>

      <Section
        title="Contacts"
        action={
          <Button variant="secondary" size="sm" onClick={() => setContactOpen(true)}>
            Add contact
          </Button>
        }
      >
        {contacts.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {contacts.map((contact) => (
              <li key={contact.id} className="border border-line bg-paper-raised px-3 py-3">
                <p className="font-medium">
                  {contact.name}
                  {contact.isPrimary ? (
                    <span className="ml-2 text-xs font-normal text-success">Primary</span>
                  ) : null}
                </p>
                <p className="text-sm text-ink-muted">
                  {contact.roleTitle}
                  {contact.department ? ` · ${contact.department}` : ""}
                </p>
                <p className="text-sm">
                  <a className="app-link" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </p>
                <p className="text-sm text-ink-muted">{contact.phone}</p>
                {contact.preferredContactMethod ? (
                  <p className="text-xs text-ink-faint">Prefers {contact.preferredContactMethod}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No contacts yet"
            description="Add a primary operations contact before sending an inquiry."
            action={
              <Button size="sm" onClick={() => setContactOpen(true)}>
                Add contact
              </Button>
            }
          />
        )}
      </Section>

      <Section title="Inquiry / sales status">
        {currentInquiry ? (
          <FactGrid
            columns={3}
            items={[
              {
                label: "Current inquiry",
                value: (
                  <TextLink href={`/admin/inquiries/${currentInquiry.id}`}>
                    {currentInquiry.eventType || currentInquiry.source}
                  </TextLink>
                ),
              },
              {
                label: "Current stage",
                value: (
                  <StatusBadge kind="inquiry" value={currentInquiry.stage} />
                ),
              },
              {
                label: "Last contact",
                value: currentInquiry.lastActivityAt
                  ? formatShortDate(currentInquiry.lastActivityAt)
                  : "—",
              },
              { label: "Next action", value: currentInquiry.nextAction },
              { label: "Owner", value: currentInquiry.ownerName ?? "Chester" },
              { label: "Notes", value: currentInquiry.notes },
            ]}
          />
        ) : (
          <EmptyState
            title="No inquiries yet"
            description="Open an inquiry to start the sales conversation."
            action={
              <ButtonLink href={`/admin/inquiries/new?clientId=${client.id}`} size="sm">
                New inquiry
              </ButtonLink>
            }
          />
        )}
      </Section>

      <Section title="Event history">
        <AdminTable
          empty={
            <EmptyState
              title="No events yet"
              description="Create an event after the inquiry is won."
              action={
                <ButtonLink href={`/admin/events/new?clientId=${client.id}`} size="sm">
                  New event
                </ButtonLink>
              }
            />
          }
          columns={[
            { key: "event", header: "Event" },
            { key: "when", header: "When" },
            { key: "status", header: "Status" },
            { key: "quote", header: "Quote" },
            { key: "invoice", header: "Invoice" },
          ]}
          rows={[...upcoming, ...past].map(({ event, window }) => {
            const estimate = queries.estimatesForEvent(event.id)[0];
            const invoice = queries.invoicesForEvent(event.id)[0];
            return {
              id: event.id,
              href: `/admin/events/${event.id}`,
              title: event.name,
              subtitle: window ? formatDate(window.start) : undefined,
              trailing: <StatusBadge kind="event" value={event.status} size="sm" />,
              cells: {
                event: (
                  <>
                    <TextLink href={`/admin/events/${event.id}`}>{event.name}</TextLink>
                    <p className="text-ink-muted">
                      {(window?.start ?? "") >= "2026-08-28" ? "Upcoming" : "Past"}
                    </p>
                  </>
                ),
                when: window ? formatDate(window.start) : "—",
                status: <StatusBadge kind="event" value={event.status} />,
                quote: (
                  <>
                    {formatMoney(event.quoteAmountCents)}
                    {estimate ? <p className="text-ink-muted">Estimate {estimate.status}</p> : null}
                  </>
                ),
                invoice: invoice ? (
                  <StatusBadge kind="invoice" value={invoice.status} />
                ) : (
                  "No invoice yet"
                ),
              },
            };
          })}
        />
      </Section>

      <Section title="Compliance">
        {profile ? (
          <FactGrid
            columns={3}
            items={[
              { label: "Insurance", value: profile.insuranceRequired ? "Required" : "Not required" },
              { label: "COI", value: profile.coiRequirements || "—" },
              {
                label: "Vendor requirements",
                value: profile.vendorOnboardingRequired ? "Campus vendor onboarding" : "None",
              },
              { label: "NDA", value: profile.ndaRequired ? "Required" : "Not required" },
              { label: "Other requirements", value: profile.otherCompliance || "—" },
            ]}
          />
        ) : null}
        {insurance.length ? (
          <ul className="mt-3 grid gap-2">
            {insurance.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start gap-2 border border-line bg-paper-raised px-3 py-2.5"
              >
                <StatusBadge kind="insurance" value={item.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.year} reminder</p>
                  <p className="text-sm text-ink-muted">Due {formatShortDate(item.dueOn)}</p>
                  {item.notes ? <p className="text-sm text-ink-muted">{item.notes}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">No insurance reminders on this record.</p>
        )}
      </Section>

      <Section title="Billing">
        {profile ? (
          <FactGrid
            columns={3}
            items={[
              { label: "Billing contact", value: profile.billingContact || "—" },
              { label: "AP contact", value: profile.apContact || "—" },
              { label: "Billing email", value: profile.billingEmail || "—" },
              { label: "PO requirements", value: profile.poRequirements },
              { label: "Payment terms", value: profile.paymentTerms },
              { label: "Notes", value: profile.billingNotes || client.notes },
            ]}
          />
        ) : (
          <p className="text-sm text-ink-muted">{client.notes}</p>
        )}
      </Section>

      <Section title="Documents">
        {profile?.documentPlaceholders.length ? (
          <AdminTable
            columns={[
              { key: "name", header: "Document" },
              { key: "type", header: "Type" },
              { key: "status", header: "Status" },
              { key: "date", header: "Date" },
              { key: "expires", header: "Expiration" },
            ]}
            rows={profile.documentPlaceholders.map((doc) => ({
              id: doc.id,
              title: doc.name,
              subtitle: doc.type,
              trailing: (
                <span className="text-sm text-ink-muted">{labelize(doc.status)}</span>
              ),
              cells: {
                name: doc.name,
                type: doc.type,
                status: labelize(doc.status),
                date: doc.date ? formatShortDate(doc.date) : "—",
                expires: doc.expiresOn ? formatShortDate(doc.expiresOn) : "—",
              },
            }))}
          />
        ) : (
          <EmptyState
            title="No documents"
            description="COI and vendor files appear here once collected."
          />
        )}
      </Section>

      <Section title="Relationship">
        <FactGrid
          columns={3}
          items={[
            {
              label: "First engagement",
              value: firstEngagement ? formatShortDate(firstEngagement) : "Not yet",
            },
            { label: "Number of events", value: String(events.length) },
            { label: "Total revenue", value: formatMoney(revenue || events.reduce((s, e) => s + e.quoteAmountCents, 0)) },
            {
              label: "Last event",
              value: lastEvent?.name ?? "—",
            },
            { label: "Returning client", value: client.isReturning ? "Yes" : "No" },
            { label: "Work-again status", value: workAgain ? "Recommended" : "Not marked" },
          ]}
        />
        <p className="text-sm text-ink-muted">{client.notes}</p>
      </Section>

      <Section title="Activity / history">
        <div id="history">
          {activity.length ? (
            <ol className="border-l border-line pl-4">
              {activity.map((item) => (
                <li key={item.id} className="relative mb-4">
                  <span className="absolute top-1.5 -left-[1.15rem] h-2 w-2 rounded-full bg-accent" />
                  <p className="text-xs text-ink-faint">{formatShortDate(item.at)}</p>
                  {item.href ? (
                    <TextLink href={item.href}>{item.title}</TextLink>
                  ) : (
                    <p className="font-medium">{item.title}</p>
                  )}
                  {item.detail ? <p className="text-sm text-ink-muted">{item.detail}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-muted">No activity recorded yet.</p>
          )}
        </div>
      </Section>

      <Dialog open={contactOpen} title="Add contact" onClose={() => setContactOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!contactName.trim()) return;
            addContact(client.id, {
              name: contactName.trim(),
              roleTitle: contactRole || "Contact",
              department: "",
              email: contactEmail,
              phone: contactPhone,
              isPrimary: contacts.length === 0,
            });
            notify({ title: "Contact added." });
            setContactName("");
            setContactRole("");
            setContactEmail("");
            setContactPhone("");
            setContactOpen(false);
          }}
        >
          <Field id="c-name" label="Name" required>
            <Input id="c-name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Field>
          <Field id="c-role" label="Role">
            <Input id="c-role" value={contactRole} onChange={(e) => setContactRole(e.target.value)} />
          </Field>
          <Field id="c-email" label="Email">
            <Input id="c-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </Field>
          <Field id="c-phone" label="Phone">
            <Input id="c-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setContactOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save contact</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={editOpen} title="Edit university" onClose={() => setEditOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            patchClient(client.id, { notes: editNotes, status: editStatus });
            notify({ title: "University updated." });
            setEditOpen(false);
          }}
        >
          <Field id="edit-status" label="Relationship status">
            <Select
              id="edit-status"
              value={editStatus}
              onChange={(e) =>
                setEditStatus(e.target.value as "prospect" | "active" | "inactive")
              }
              options={[
                { value: "prospect", label: "Prospect" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </Field>
          <Field id="edit-notes" label="Notes">
            <Textarea
              id="edit-notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save university</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
