"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { dashboardMetrics } from "@/data/queries";
import { cn } from "@/lib/cn";
import { adminNav } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const { notify } = useToast();
  const metrics = dashboardMetrics();
  const alertCount =
    metrics.unsignedCallSheets.length +
    metrics.offeredAssignments.length +
    metrics.expensesNeedingReview.length +
    metrics.payNeedingApproval.length +
    metrics.insuranceDue.length +
    metrics.expiringDocs.length;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const drawerOpen = desktop || menuOpen;

  return (
    <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[var(--sidebar-w)_1fr]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <aside
        id="admin-navigation"
        aria-hidden={!drawerOpen}
        {...(!drawerOpen ? { inert: true } : {})}
        className={cn(
          "z-40 border-line bg-accent text-paper-raised",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[min(19rem,calc(100vw-2.5rem))] max-lg:shadow-[var(--shadow-md)]",
          menuOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          !drawerOpen && "max-lg:invisible max-lg:pointer-events-none",
          "flex flex-col transition-transform duration-150 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
        )}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <p className="font-serif text-lg leading-none">VTI</p>
          <p className="mt-1 text-xs tracking-[0.08em] text-white/70 uppercase">
            Operations
          </p>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2 py-3">
          {adminNav.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 pb-1 text-[0.65rem] tracking-[0.12em] text-white/50 uppercase">
                {group.label}
              </p>
              <ul className="grid gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex min-h-11 items-center rounded-[var(--radius-md)] px-2.5 text-sm",
                          active
                            ? "bg-white/12 text-white"
                            : "text-white/80 hover:bg-white/8 hover:text-white",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <p className="border-t border-white/10 px-4 py-3 text-xs text-white/55">
          Demo catalog. Not live VTI records.
        </p>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[var(--overlay)] lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-[var(--header-h)] items-center justify-between gap-3 border-b border-line bg-paper-raised/95 px-3 backdrop-blur-sm sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="touch-target inline-flex items-center justify-center rounded-[var(--radius-md)] border border-line lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="admin-navigation"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="sr-only">Open menu</span>
              <span aria-hidden className="flex flex-col gap-1">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
              </span>
            </button>
            <p className="truncate text-sm text-ink-muted">
              Voice Talent International
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Badge tone="warning">Demo</Badge>
            <DropdownMenu
              label={`Alerts · ${alertCount}`}
              items={[
                {
                  id: "cs",
                  label: `${metrics.unsignedCallSheets.length} Call Sheets unsigned`,
                  onSelect: () => router.push("/admin/call-sheets"),
                },
                {
                  id: "asg",
                  label: `${metrics.offeredAssignments.length} offers outstanding`,
                  onSelect: () => router.push("/admin/assignments"),
                },
                {
                  id: "exp",
                  label: `${metrics.expensesNeedingReview.length} expenses to review`,
                  onSelect: () => router.push("/admin/expenses"),
                },
                {
                  id: "pay",
                  label: `${metrics.payNeedingApproval.length} pay lines need approval`,
                  onSelect: () => router.push("/admin/payments"),
                },
                {
                  id: "ins",
                  label: `${metrics.insuranceDue.length} insurance reminders`,
                  onSelect: () => router.push("/admin/clients"),
                },
              ]}
            />
            <DropdownMenu
              label="Account"
              items={[
                {
                  id: "auth",
                  label: "Sign in is not implemented",
                  onSelect: () =>
                    notify({
                      title: "Authentication is not implemented",
                    }),
                },
              ]}
            />
          </div>
        </header>
        <main id="main-content" className="flex-1 px-3 py-5 sm:px-5 lg:px-7">
          <div className="mx-auto w-full max-w-[88rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
