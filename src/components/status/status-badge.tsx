import { Badge } from "@/components/ui/badge";
import { INQUIRY_STAGE_LABELS } from "@/types/operations";
import { labelize, toneFor } from "@/lib/status";
import type { InquiryStage } from "@/types/domain";

function displayLabel(kind: string, value: string): string {
  if (kind === "inquiry" && value in INQUIRY_STAGE_LABELS) {
    return INQUIRY_STAGE_LABELS[value as InquiryStage];
  }
  if (kind === "client") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  if (kind === "onboarding" && value === "complete") return "Complete";
  if (kind === "onboarding" && value === "in_progress") return "In progress";
  if (kind === "expense" && value === "submitted") return "Under review";
  if (kind === "expense" && value === "reimbursed") return "Paid";
  return labelize(value);
}

export function StatusBadge({
  kind,
  value,
  size = "md",
}: {
  kind: string;
  value: string;
  size?: "md" | "sm";
}) {
  return (
    <Badge tone={toneFor(kind, value)} size={size}>
      {displayLabel(kind, value)}
    </Badge>
  );
}
