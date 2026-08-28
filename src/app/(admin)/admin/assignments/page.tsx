import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { TableWrap, Td, Th } from "@/components/data/table";
import { StatusBadge } from "@/components/status/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { allAssignmentViews } from "@/data/queries";
import { formatMoney } from "@/lib/format";

export default function AdminAssignmentsPage() {
  const rows = allAssignmentViews();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Assignments"
        description="The assignment is the operational connection between university, reader, Call Sheet, schedule, travel, expenses, documents, and debrief."
      />
      <DemoBanner />
      <TableWrap>
        <thead>
          <tr>
            <Th>Reader</Th>
            <Th>Event</Th>
            <Th>Role</Th>
            <Th>Assignment</Th>
            <Th>Call Sheet</Th>
            <Th>Promised</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>
                <Link href={`/admin/readers/${item.reader.id}`} className="underline-offset-2 hover:underline">
                  {item.reader.contractorName}
                </Link>
              </Td>
              <Td>
                <Link href={`/admin/assignments/${item.id}`} className="underline-offset-2 hover:underline">
                  {item.event.name}
                </Link>
                <p className="text-ink-muted">{item.client.name}</p>
              </Td>
              <Td>{item.role}</Td>
              <Td>
                <StatusBadge kind="assignment" value={item.status} />
              </Td>
              <Td>
                {item.callSheet ? (
                  item.acknowledged ? (
                    `v${item.callSheet.version} accepted`
                  ) : (
                    `v${item.callSheet.version} outstanding`
                  )
                ) : (
                  "Not issued"
                )}
              </Td>
              <Td className="tabular-nums">{formatMoney(item.promisedPayCents)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
