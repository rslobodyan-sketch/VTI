import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-paper px-4 py-10 text-ink">
      <main className="mx-auto grid min-h-[80dvh] max-w-3xl content-center gap-8">
        <div>
          <Badge tone="accent">Demo catalog</Badge>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
            Voice Talent International
          </h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Operations prototype for inquiry through payment tracking. Records are local demo data. Authentication, database, Wave, and Patriot are not connected.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin"
            className="rounded-[var(--radius-lg)] border border-line bg-paper-raised p-5 hover:border-line-strong"
          >
            <p className="text-xs tracking-[0.12em] text-ink-faint uppercase">
              Desktop-first
            </p>
            <p className="mt-2 font-serif text-2xl">Admin</p>
            <p className="mt-1 text-sm text-ink-muted">
              Calendar, universities, assignments, Call Sheets, expenses, and payment tracking.
            </p>
          </Link>
          <Link
            href="/reader"
            className="rounded-[var(--radius-lg)] border border-line bg-paper-raised p-5 hover:border-line-strong"
          >
            <p className="text-xs tracking-[0.12em] text-ink-faint uppercase">
              Mobile-first
            </p>
            <p className="mt-2 font-serif text-2xl">Reader</p>
            <p className="mt-1 text-sm text-ink-muted">
              Next job, Call Sheet, travel, own compensation, receipts, expenses, and debrief.
            </p>
          </Link>
        </div>
        <p className="text-sm text-ink-faint">
          Default reader view is Marcus Hale. Use the demo switcher in the reader header to inspect other contractors. Sign in arrives later.
        </p>
      </main>
    </div>
  );
}
