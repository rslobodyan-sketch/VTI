import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { catalog } from "@/data/catalog";
import { formatShortDate } from "@/lib/format";

export default function AdminInquiriesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Inquiries"
        description="Incoming university interest through returning-year confirmation. Universities do not log in. Chester moves the stage."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>University</Th>
            <Th>Contact</Th>
            <Th>Stage</Th>
            <Th>Returning</Th>
            <Th>Next action</Th>
          </tr>
        </thead>
        <tbody>
          {catalog.inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <Td>
                <Link href={`/admin/clients/${inquiry.clientId}`} className="underline-offset-2 hover:underline">
                  {inquiry.universityName}
                </Link>
                <p className="text-ink-muted">{inquiry.department}</p>
              </Td>
              <Td>
                {inquiry.contactName}
                <p className="text-ink-muted">{inquiry.email}</p>
              </Td>
              <Td>
                <StatusBadge kind="inquiry" value={inquiry.stage} />
              </Td>
              <Td className="text-ink-muted">
                {inquiry.returningInterest ?? "New"}
              </Td>
              <Td>
                {inquiry.nextAction}
                {inquiry.nextActionAt ? (
                  <p className="text-ink-muted">{formatShortDate(inquiry.nextActionAt)}</p>
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
