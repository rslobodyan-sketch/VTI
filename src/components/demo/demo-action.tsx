"use client";

import { Button } from "@/components/ui/button";
import { useDemoSession } from "@/components/demo/demo-session";
import { useToast } from "@/components/ui/toast";

export function DemoAction({
  label,
  title,
  message = "Demo actions stay in this browser tab only. They are not written to a database.",
  variant = "primary",
}: {
  label: string;
  title: string;
  message?: string;
  variant?: "primary" | "secondary";
}) {
  const { notify } = useToast();
  return (
    <Button
      variant={variant}
      className="w-full sm:w-auto"
      onClick={() => notify({ title, message })}
    >
      {label}
    </Button>
  );
}

export function AcknowledgeButton({
  callSheetId,
  readerId,
  catalogAcknowledged,
}: {
  callSheetId: string;
  readerId: string;
  catalogAcknowledged: boolean;
}) {
  const { isAcknowledged, acknowledge } = useDemoSession();
  const { notify } = useToast();
  const done = isAcknowledged(callSheetId, readerId, catalogAcknowledged);

  if (done) {
    return <p className="text-sm text-success">Call Sheet acknowledged.</p>;
  }

  return (
    <Button
      className="w-full min-h-12"
      onClick={() => {
        acknowledge(callSheetId, readerId);
        notify({
          title: "Reader acknowledgement recorded",
          message: "Acknowledgement is recorded for this Call Sheet version. Drawn signatures are not in use.",
        });
      }}
    >
      I accept this Call Sheet version
    </Button>
  );
}

export function AcceptAssignmentButton({
  assignmentId,
  catalogStatus,
}: {
  assignmentId: string;
  catalogStatus: string;
}) {
  const { assignmentStatus, acceptAssignment } = useDemoSession();
  const { notify } = useToast();
  const status = assignmentStatus(assignmentId, catalogStatus);
  if (status !== "offered") {
    return <p className="text-sm text-success">Assignment accepted.</p>;
  }
  return (
    <Button
      className="w-full min-h-12"
      onClick={() => {
        acceptAssignment(assignmentId);
        notify({
          title: "Assignment accepted",
          message: "Status updated across operations for this session.",
        });
      }}
    >
      Accept assignment
    </Button>
  );
}

export function SubmitExpenseButton({
  reportId,
  catalogStatus,
}: {
  reportId: string;
  catalogStatus: string;
}) {
  const { expenseStatus, submitExpense } = useDemoSession();
  const { notify } = useToast();
  const status = expenseStatus(reportId, catalogStatus);
  if (status !== "draft") return null;
  return (
    <Button
      className="w-full min-h-12"
      onClick={() => {
        submitExpense(reportId);
        notify({
          title: "Expense submitted for review",
          message: "Chester still reviews reimbursement before payment tracking is updated.",
        });
      }}
    >
      Submit expense report
    </Button>
  );
}
