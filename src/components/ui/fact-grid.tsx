import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FactGrid({
  items,
  columns = 3,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn(
        "grid gap-4 border-y border-line py-4 text-sm",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">{item.label}</dt>
          <dd className="mt-0.5">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
