import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function DemoBanner({
  children = "Demo catalog. Not live VTI records. Wave and Patriot are not connected.",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
      <Badge tone="warning">Demo data</Badge>
      <span>{children}</span>
    </p>
  );
}
