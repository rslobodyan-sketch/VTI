"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  title,
  onClose,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    if (!node.open) node.showModal();
    return () => {
      if (node.open) node.close();
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={
        className ??
        "w-[min(28rem,calc(100vw-1.5rem))] rounded-[var(--radius-lg)] border border-line bg-paper-raised p-0 text-ink shadow-[var(--shadow-md)]"
      }
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
        <h2 id={titleId} className="font-serif text-lg font-semibold">
          {title}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
          Close
        </Button>
      </div>
      <div className="px-4 py-4">{children}</div>
    </dialog>
  );
}
