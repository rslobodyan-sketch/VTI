"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DemoAction({
  label,
  title,
  message = "The demo catalog is read-only. Nothing is saved.",
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
