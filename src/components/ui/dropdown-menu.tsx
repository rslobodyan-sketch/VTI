"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type MenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

type DropdownMenuProps = {
  label: string;
  items: MenuItem[];
  align?: "left" | "right";
};

export function DropdownMenu({
  label,
  items,
  align = "right",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="touch-target touch-target-desktop-compact inline-flex items-center rounded-[var(--radius-md)] px-2.5 text-sm font-medium text-ink hover:bg-paper-inset"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className={cn(
            "absolute z-30 mt-1 min-w-44 rounded-[var(--radius-md)] border border-line bg-paper-raised py-1 shadow-[var(--shadow-md)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className="flex w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper-inset disabled:text-ink-faint"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function DropdownHint({ children }: { children: ReactNode }) {
  return <p className="px-3 py-2 text-xs text-ink-muted">{children}</p>;
}
