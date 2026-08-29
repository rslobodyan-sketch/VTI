import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto border-y border-line", className)}>
      <table className="w-full min-w-[40rem] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "border-b border-line px-3 py-2 text-[0.7rem] font-medium tracking-[0.08em] text-ink-faint uppercase",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("border-b border-line px-3 py-2.5 align-top", className)}>
      {children}
    </td>
  );
}

export type AdminTableColumn = {
  key: string;
  header: string;
  className?: string;
};

export type AdminTableRow = {
  id: string;
  href?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  cells: Record<string, ReactNode>;
};

export function AdminTable({
  columns,
  rows,
  empty,
}: {
  columns: AdminTableColumn[];
  rows: AdminTableRow[];
  empty?: ReactNode;
}) {
  if (!rows.length && empty) {
    return <>{empty}</>;
  }
  return (
    <>
      <TableWrap className="max-md:hidden">
        <thead>
          <tr>
            {columns.map((column) => (
              <Th key={column.key} className={column.className}>
                {column.header}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <Td key={column.key} className={column.className}>
                  {row.cells[column.key]}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <ul className="divide-y divide-line border-y border-line md:hidden">
        {rows.map((row) => {
          const body = (
            <div className="flex min-h-14 items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="font-medium">{row.title}</div>
                {row.subtitle ? (
                  <div className="mt-0.5 text-sm text-ink-muted">{row.subtitle}</div>
                ) : null}
              </div>
              {row.trailing ? <div className="shrink-0">{row.trailing}</div> : null}
            </div>
          );
          return (
            <li key={row.id}>
              {row.href ? (
                <Link href={row.href} className="block hover:bg-paper-inset">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
