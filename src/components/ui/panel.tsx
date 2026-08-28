import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article";
  padded?: boolean;
};

export function Panel({
  as: Tag = "section",
  className,
  padded = true,
  ...props
}: PanelProps) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-lg)] border border-line bg-paper-raised",
        padded && "p-4 sm:p-5",
        className,
      )}
      {...props}
    />
  );
}
