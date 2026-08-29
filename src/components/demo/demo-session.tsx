"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useOperations } from "@/components/operations/operations-store";

type DemoSessionContextValue = {
  isAcknowledged: (callSheetId: string, readerId: string, catalogValue: boolean) => boolean;
  assignmentStatus: (id: string, catalogValue: string) => string;
  expenseStatus: (id: string, catalogValue: string) => string;
  acknowledge: (callSheetId: string, readerId: string) => void;
  acceptAssignment: (id: string) => void;
  submitExpense: (id: string) => void;
  reset: () => void;
  hasOverrides: boolean;
};

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const ops = useOperations();

  const value = useMemo<DemoSessionContextValue>(
    () => ({
      isAcknowledged: ops.isAcknowledged,
      assignmentStatus: ops.assignmentStatus,
      expenseStatus: ops.expenseStatus,
      acknowledge: (callSheetId, readerId) => {
        const assignment = ops.catalog.assignments.find((item) => {
          if (item.readerId !== readerId) return false;
          return ops.catalog.callSheets.some(
            (sheet) => sheet.id === callSheetId && sheet.eventId === item.eventId,
          );
        });
        ops.acknowledge(callSheetId, readerId, assignment?.id ?? "");
      },
      acceptAssignment: ops.acceptAssignment,
      submitExpense: ops.submitExpense,
      reset: ops.reset,
      hasOverrides: ops.hasOverrides,
    }),
    [ops],
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession() {
  const value = useContext(DemoSessionContext);
  if (!value) {
    throw new Error("useDemoSession must be used inside DemoSessionProvider");
  }
  return value;
}
