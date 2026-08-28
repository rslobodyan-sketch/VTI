import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Section } from "@/components/data/section";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import {
  assignmentView,
  assignmentsForReader,
  compensationForReader,
  documentsForReader,
  getEvent,
  getReader,
} from "@/data/queries";
import { formatMoney, formatShortDate } from "@/lib/format";

export function generateStaticParams() {
  return catalog.readers.map((item) => ({ id: item.id }));
}

export default async function AdminReaderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reader = getReader(id);
  if (!reader) notFound();

  const jobs = assignmentsForReader(reader.id)
    .map(assignmentView)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const docs = documentsForReader(reader.id);
  const pay = compensationForReader(reader.id);
  const address = catalog.addresses.find((item) => item.readerId === reader.id && item.kind === "primary");
  const emergency = catalog.emergencyContacts.find((item) => item.readerId === reader.id);
  const block = catalog.availability.find((item) => item.readerId === reader.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={reader.contractorName}
        description={reader.notes}
      />
      <DemoBanner>
        Legal entity and masked tax ID are visible to admin. Raw SSN, driver-license images, and bank numbers are not in this catalog.
      </DemoBanner>

      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink-faint">Onboarding</dt>
          <dd>
            <StatusBadge kind="onboarding" value={reader.onboardingStatus} />
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">NDA</dt>
          <dd>
            {reader.ndaSigned
              ? `Signed ${reader.ndaSignedAt ? formatShortDate(reader.ndaSignedAt) : ""}`
              : "Not signed"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">First-choice / veteran</dt>
          <dd>
            {reader.firstChoiceEligible ? "First-choice eligible" : "Building tenure"}
            {reader.veteranStatus ? " · veteran" : ""}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Entity</dt>
          <dd>
            {reader.legalName} · {reader.businessType} · {reader.taxIdType} {reader.taxIdMasked}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Contact</dt>
          <dd>
            {reader.email}
            <br />
            {reader.primaryPhone}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">Travel prefs</dt>
          <dd>
            {reader.airlinePreference} · {reader.seatPreference} · shirt {reader.shirtSize}
          </dd>
        </div>
      </dl>

      <Section title="Sound and geography (assignment support)">
        <p className="text-sm">{reader.soundNotes}</p>
        <p className="mt-2 text-sm text-ink-muted">{reader.geographyNotes}</p>
        {reader.leadershipAssessment ? (
          <p className="mt-2 text-sm">{reader.leadershipAssessment}</p>
        ) : null}
      </Section>

      <Section title="Availability">
        {block ? (
          <p className="text-sm">
            Unavailable {formatShortDate(block.startsAt)} – {formatShortDate(block.endsAt)}. {block.notes}
          </p>
        ) : (
          <p className="text-sm text-ink-muted">No unavailable block on file. Admin-entered only in this prototype.</p>
        )}
      </Section>

      <Section title="Documents">
        <ul className="grid gap-2 text-sm">
          {docs.map((doc) => (
            <li key={doc.id}>
              <StatusBadge kind="doc" value={doc.status} /> {doc.kind.replaceAll("_", " ")}
              {doc.expiresOn ? ` · expires ${formatShortDate(doc.expiresOn)}` : ""}
            </li>
          ))}
        </ul>
      </Section>

      {address || emergency ? (
        <Section title="Admin-only contact detail">
          {address ? (
            <p className="text-sm">
              {address.line1}, {address.city}, {address.region} {address.postalCode}
            </p>
          ) : null}
          {emergency ? (
            <p className="text-sm text-ink-muted">
              Emergency: {emergency.name} ({emergency.relationship}) {emergency.phone}
            </p>
          ) : null}
        </Section>
      ) : null}

      <Section title="Assignments">
        <TableWrap>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Promised</Th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((item) => (
              <tr key={item.id}>
                <Td>
                  <Link href={`/admin/assignments/${item.id}`} className="underline-offset-2 hover:underline">
                    {item.event.name}
                  </Link>
                </Td>
                <Td>{item.role}</Td>
                <Td>
                  <StatusBadge kind="assignment" value={item.status} />
                </Td>
                <Td className="tabular-nums">{formatMoney(item.promisedPayCents)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Compensation (this reader only)">
        <ul className="grid gap-2 text-sm">
          {pay.map((row) => {
            const event = getEvent(
              catalog.assignments.find((item) => item.id === row.assignmentId)?.eventId ?? "",
            );
            return (
              <li key={row.id} className="flex justify-between gap-3">
                <span>
                  {event?.name} · {row.kind}
                </span>
                <span>
                  {formatMoney(row.amountCents)}{" "}
                  <StatusBadge kind="pay" value={row.status} />
                </span>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
