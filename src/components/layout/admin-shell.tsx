"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useDemoSession } from "@/components/demo/demo-session";
import { useOperations } from "@/components/operations/operations-store";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { adminNav } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentLabel(pathname: string): string {
  const items = adminNav.flatMap((group) => group.items);
  const match = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Operations";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const { notify } = useToast();
  const { hasOverrides, reset } = useDemoSession();
  const { queries, search, markNotificationRead } = useOperations();
  const metrics = queries.dashboardMetrics();
  const unreadNotifications = queries.unreadNotifications();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => search(query), [query, search]);
  const alertItems = [
    ...unreadNotifications.map((item) => ({
      id: `ntf-${item.id}`,
      label: item.title,
      onSelect: () => {
        markNotificationRead(item.id);
        if (item.href) router.push(item.href);
      },
    })),
    ...metrics.unsignedCallSheets.map((item) => ({
      id: `ack-${item.id}`,
      label: `${item.reader.contractorName.split(" ")[0]}'s Call Sheet is unsigned`,
      onSelect: () => router.push(`/admin/assignments/${item.id}`),
    })),
    ...metrics.offeredAssignments.map((item) => ({
      id: `off-${item.id}`,
      label: `${item.reader.contractorName.split(" ")[0]}'s offer is awaiting response`,
      onSelect: () => router.push(`/admin/assignments/${item.id}`),
    })),
    ...metrics.expensesNeedingReview.map((item) => {
      const view = queries.expenseReportView(item);
      const first = view.reader?.contractorName.split(" ")[0] ?? "Reader";
      return {
        id: `exp-${item.id}`,
        label: `${first} submitted an expense`,
        onSelect: () => router.push(`/admin/expenses/${item.id}`),
      };
    }),
    ...metrics.payNeedingApproval.slice(0, 4).map((item) => {
      const reader = queries.getReader(item.readerId);
      const first = reader?.contractorName.split(" ")[0] ?? "Reader";
      return {
        id: `pay-${item.id}`,
        label: `${first} has a payment awaiting approval`,
        onSelect: () => router.push("/admin/payments"),
      };
    }),
    ...metrics.insuranceDue.map((item) => {
      const client = queries.getClient(item.clientId);
      return {
        id: `ins-${item.id}`,
        label: `${client?.name ?? "University"} insurance reminder`,
        onSelect: () => router.push(`/admin/clients/${item.clientId}`),
      };
    }),
    ...metrics.expiringDocs.map((item) => {
      const reader = queries.getReader(item.readerId);
      const first = reader?.contractorName.split(" ")[0] ?? "Reader";
      return {
        id: `doc-${item.id}`,
        label: `${first}'s document is expiring`,
        onSelect: () => router.push(`/admin/readers/${item.readerId}`),
      };
    }),
  ].slice(0, 10);
  const alertCount = alertItems.length;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const drawerOpen = desktop || menuOpen;

  return (
    <div className="min-h-dvh overflow-x-clip bg-paper text-ink lg:grid lg:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <aside
        id="admin-navigation"
        aria-hidden={!drawerOpen}
        {...(!drawerOpen ? { inert: true } : {})}
        className={cn(
          "no-print z-40 border-line bg-accent text-paper-raised",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[min(19rem,calc(100vw-2.5rem))] max-lg:shadow-[var(--shadow-md)]",
          menuOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          !drawerOpen && "max-lg:invisible max-lg:pointer-events-none",
          "flex flex-col transition-transform duration-150 lg:sticky lg:top-0 lg:h-dvh lg:w-[var(--sidebar-w)] lg:max-w-[var(--sidebar-w)] lg:translate-x-0",
        )}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <p className="font-serif text-lg leading-none">VTI</p>
          <p className="mt-1 text-[0.7rem] tracking-[0.1em] text-white/65 uppercase">
            Operations
          </p>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2 py-3">
          {adminNav.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-2.5 pb-1.5 text-[0.65rem] tracking-[0.14em] text-white/45 uppercase">
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
                          "flex min-h-10 items-center rounded-[var(--radius-md)] px-2.5 text-[0.9375rem]",
                          active
                            ? "bg-white/14 text-white shadow-[inset_2px_0_0_0_var(--focus)]"
                            : "text-white/78 hover:bg-white/8 hover:text-white",
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
        <p className="border-t border-white/10 px-4 py-3 text-xs text-white/50">
          Voice Talent International
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
        <header className="no-print sticky top-0 z-20 flex min-h-[var(--header-h)] items-center justify-between gap-2 border-b border-line bg-paper-raised px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-5 lg:pt-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="touch-target inline-flex items-center justify-center rounded-[var(--radius-md)] border border-line lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="admin-navigation"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span aria-hidden className="flex flex-col gap-1">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentLabel(pathname)}</p>
              <p className="hidden truncate text-xs text-ink-faint sm:block">
                Voice Talent International
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <label htmlFor="global-search" className="sr-only">
                Search operations
              </label>
              <input
                ref={searchRef}
                id="global-search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                placeholder="Search"
                className="h-9 w-[min(42vw,11rem)] rounded-[var(--radius-md)] border border-line bg-paper px-2.5 text-sm sm:w-44 md:w-52 lg:w-40 xl:w-64"
              />
              {searchOpen && hits.length ? (
                <ul className="absolute right-0 z-30 mt-1 w-[min(calc(100vw-1.5rem),20rem)] border border-line bg-paper-raised py-1 shadow-[var(--shadow-md)]">
                  {hits.map((hit) => (
                    <li key={`${hit.type}-${hit.id}`}>
                      <Link
                        href={hit.href}
                        className="block px-3 py-2 hover:bg-paper-inset"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQuery("");
                          setSearchOpen(false);
                        }}
                      >
                        <span className="block text-sm font-medium">{hit.title}</span>
                        <span className="text-xs text-ink-muted">
                          {hit.type}
                          {hit.subtitle ? ` · ${hit.subtitle}` : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <span className="hidden xl:inline-flex">
              <Badge tone="warning" size="sm">
                Tracking
              </Badge>
            </span>
            <DropdownMenu
              label={alertCount ? `Alerts · ${alertCount}` : "Alerts"}
              items={
                alertItems.length
                  ? alertItems
                  : [
                      {
                        id: "none",
                        label: "Nothing needs attention",
                        onSelect: () => router.push("/admin"),
                      },
                    ]
              }
            />
            <DropdownMenu
              label="Account"
              items={[
                {
                  id: "auth",
                  label: "Sign-in pending connection",
                  onSelect: () =>
                    notify({
                      title: "Authentication is pending external confirmation.",
                    }),
                },
                {
                  id: "reset",
                  label: hasOverrides ? "Clear session changes" : "No session changes",
                  onSelect: () => {
                    reset();
                    notify({ title: "Session changes cleared." });
                  },
                  disabled: !hasOverrides,
                },
              ]}
            />
          </div>
        </header>
        <main id="main-content" className="min-w-0 flex-1 px-3 py-5 sm:px-5 lg:px-7">
          <div className="mx-auto w-full max-w-[88rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
