"use client";

import type { ReactNode } from "react";
import { DemoSessionProvider } from "@/components/demo/demo-session";
import { OperationsProvider } from "@/components/operations/operations-store";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <OperationsProvider>
        <DemoSessionProvider>{children}</DemoSessionProvider>
      </OperationsProvider>
    </ToastProvider>
  );
}
