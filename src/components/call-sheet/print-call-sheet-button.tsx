"use client";

import { Button } from "@/components/ui/button";

export function PrintCallSheetButton() {
  return (
    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => window.print()}>
      Print / save PDF
    </Button>
  );
}
