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
  const { reader, readers, setReaderId, ready } = useDemoReader();

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <a href="#reader-main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-paper-raised px-3 pt-[max(0.65rem,env(safe-area-inset-top))] pb-2.5 no-print">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <div>
            <p className="font-serif text-base leading-none">VTI Reader</p>
            <p className="mt-0.5 text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
              Event packet
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <Badge tone="accent" size="sm">
              Reader
            </Badge>
            {ready ? (
              <>
                <label className="sr-only" htmlFor="demo-reader">
                  View as reader
                </label>
                <Select
                  id="demo-reader"
                  className="min-h-11 min-w-[8.5rem] max-w-[42vw] text-sm"
                  value={reader.id}
                  onChange={(event) => setReaderId(event.target.value)}
                  options={readers.map((item) => ({
                    value: item.id,
                    label: item.contractorName,
                  }))}
                />
              </>
            ) : (
              <p className="min-h-11 min-w-[8.5rem] text-sm text-ink-muted" aria-live="polite">
                Loading…
              </p>
            )}
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
          <ul className="flex flex-wrap gap-1.5">
            {readerNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-[var(--radius-md)] border px-3 text-sm",
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
        className="mx-auto w-full min-w-0 max-w-lg px-3 pt-4 pb-[calc(var(--bottom-nav-h)+0.85rem+env(safe-area-inset-bottom))] md:max-w-3xl md:pb-8"
      >
        {ready ? children : <p className="text-sm text-ink-muted">Loading assignment…</p>}
      </main>

      <nav
        aria-label="Reader primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-raised pb-[env(safe-area-inset-bottom)] md:hidden no-print"
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
                  {active ? (
                    <span className="mb-1 h-0.5 w-5 rounded-full bg-accent" aria-hidden />
                  ) : (
                    <span className="mb-1 h-0.5 w-5" aria-hidden />
                  )}
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
