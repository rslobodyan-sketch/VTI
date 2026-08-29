import type { BadgeTone } from "@/components/ui/badge";

export function labelize(value: string): string {
  return value.replaceAll("_", " ");
}

export function toneFor(kind: string, value: string): BadgeTone {
  const key = `${kind}:${value}`;
  const map: Record<string, BadgeTone> = {
    "event:tentative": "warning",
    "event:confirmed": "success",
    "event:postponed": "info",
    "event:cancelled": "danger",
    "assignment:offered": "warning",
    "assignment:accepted": "info",
    "assignment:assigned": "success",
    "assignment:declined": "danger",
    "assignment:released_to_pool": "neutral",
    "assignment:completed": "neutral",
    "callsheet:draft": "neutral",
    "callsheet:issued": "info",
    "callsheet:superseded": "neutral",
    "expense:draft": "neutral",
    "expense:submitted": "warning",
    "expense:approved": "success",
    "expense:rejected": "danger",
    "expense:reimbursed": "success",
    "pay:promised": "neutral",
    "pay:pending_approval": "warning",
    "pay:approved": "info",
    "pay:queued": "info",
    "pay:paid": "success",
    "pay:cashed": "success",
    "pay:void": "danger",
    "invoice:draft": "neutral",
    "invoice:sent": "info",
    "invoice:due": "warning",
    "invoice:reminded": "warning",
    "invoice:paid": "success",
    "onboarding:complete": "success",
    "onboarding:ready": "success",
    "onboarding:in_progress": "warning",
    "onboarding:blocked": "danger",
    "onboarding:not_started": "neutral",
    "doc:valid": "success",
    "doc:expiring": "warning",
    "doc:expired": "danger",
    "doc:missing": "danger",
    "insurance:accepted": "success",
    "insurance:submitted": "warning",
    "insurance:not_started": "warning",
    "insurance:change_needed": "danger",
    "inquiry:initial_inquiry": "info",
    "inquiry:needs_conversation": "warning",
    "inquiry:pending_admin_approval": "warning",
    "inquiry:coordinator_logistics": "info",
    "inquiry:closed_won": "success",
    "client:prospect": "info",
    "client:active": "success",
    "client:inactive": "neutral",
  };
  return map[key] ?? "neutral";
}
