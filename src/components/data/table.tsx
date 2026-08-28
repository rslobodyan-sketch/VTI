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

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-line px-3 py-2 text-[0.7rem] font-medium tracking-[0.08em] text-ink-faint uppercase">
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
