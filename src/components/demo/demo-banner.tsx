import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function DemoBanner({
  children = "Working session for operations review. Wave and Patriot are not connected.",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
      <Badge tone="warning" size="sm">
        Demo
      </Badge>
      <span>{children}</span>
    </p>
  );
}
