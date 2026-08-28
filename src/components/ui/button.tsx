import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-paper-raised hover:bg-accent-hover disabled:bg-line disabled:text-ink-faint",
  secondary:
    "bg-paper-raised text-ink border border-line-strong hover:bg-paper-inset disabled:text-ink-faint",
  ghost:
    "bg-transparent text-ink hover:bg-paper-inset disabled:text-ink-faint",
  danger:
    "bg-danger text-paper-raised hover:opacity-90 disabled:bg-line disabled:text-ink-faint",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium tracking-[0.01em] transition-colors disabled:cursor-not-allowed",
        "touch-target touch-target-desktop-compact px-3",
        size === "sm" && "px-2.5 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
