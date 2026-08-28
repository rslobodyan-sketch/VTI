import { Badge } from "@/components/ui/badge";
import { labelize, toneFor } from "@/lib/status";

export function StatusBadge({
  kind,
  value,
}: {
  kind: string;
  value: string;
}) {
  return <Badge tone={toneFor(kind, value)}>{labelize(value)}</Badge>;
}
