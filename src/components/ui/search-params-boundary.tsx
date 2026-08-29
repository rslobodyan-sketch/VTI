"use client";

import { Suspense, type ReactNode } from "react";

export function SearchParamsBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
