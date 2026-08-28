import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-line bg-paper-raised px-3 text-ink shadow-[var(--shadow-sm)] placeholder:text-ink-faint disabled:bg-paper-inset disabled:text-ink-faint";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(fieldClass, "touch-target touch-target-desktop-compact", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, "min-h-28 py-2.5", className)}
      {...props}
    />
  );
}
