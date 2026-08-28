"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { useDemoReader } from "@/components/demo/demo-reader";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { readerBottomNav, readerNav } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/reader") return pathname === "/reader";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ReaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { reader, readers, setReaderId } = useDemoReader();

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <a href="#reader-main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-paper-raised/95 px-3 py-2.5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <div>
            <p className="font-serif text-base leading-none">VTI Reader</p>
            <p className="mt-0.5 text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
              Event packet
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <Badge tone="warning">Demo</Badge>
            <label className="sr-only" htmlFor="demo-reader">
              View as reader
            </label>
            <Select
              id="demo-reader"
              className="min-h-11 min-w-[9.5rem] max-w-[42vw] text-sm"
              value={reader.id}
              onChange={(event) => setReaderId(event.target.value)}
              options={readers.map((item) => ({
                value: item.id,
                label: item.contractorName,
              }))}
            />
            <div className="md:hidden">
              <DropdownMenu
                label="More"
                items={readerNav.map((item) => ({
                  id: item.href,
                  label: item.label,
                  onSelect: () => router.push(item.href),
                }))}
              />
            </div>
          </div>
        </div>
        <nav
          aria-label="Reader"
          className="mx-auto mt-2 hidden max-w-2xl md:block"
        >
          <ul className="flex flex-wrap gap-2">
            {readerNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3 text-sm",
                      active
                        ? "border-accent bg-accent text-paper-raised"
                        : "border-line bg-paper-raised text-ink hover:bg-paper-inset",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        id="reader-main"
        className="mx-auto w-full max-w-lg px-3 pt-4 pb-[calc(var(--bottom-nav-h)+0.75rem)] md:max-w-2xl md:pb-8"
      >
        {children}
      </main>

      <nav
        aria-label="Reader primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-raised md:hidden"
      >
        <ul className="grid grid-cols-5">
          {readerBottomNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[var(--bottom-nav-h)] flex-col items-center justify-center px-1 text-[0.7rem] font-medium",
                    active ? "text-accent" : "text-ink-muted",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
