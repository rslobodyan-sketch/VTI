import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-paper px-4 py-10 text-ink">
      <main className="mx-auto grid min-h-[80dvh] max-w-3xl content-center gap-8">
        <div>
          <Badge tone="accent" size="sm" className="normal-case">
            VTI Operations
          </Badge>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
            Voice Talent International
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Run commencement work from inquiry through payment tracking. Authentication, database,
            Wave, and Patriot are pending connection.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="border border-line bg-paper-raised p-5">
            <p className="app-kicker">Operations</p>
            <h2 className="mt-2 font-serif text-2xl">Admin</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Calendar, universities, assignments, Call Sheets, expenses, and payment tracking.
            </p>
            <ButtonLink href="/admin" className="mt-4 w-full sm:w-auto">
              Open operations
            </ButtonLink>
          </article>
          <article className="border border-line bg-paper-raised p-5">
            <p className="app-kicker">Assignment packet</p>
            <h2 className="mt-2 font-serif text-2xl">Reader</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Next job, Call Sheet, travel, own compensation, receipts, expenses, and debrief.
            </p>
            <ButtonLink href="/reader" className="mt-4 w-full sm:w-auto">
              Open reader
            </ButtonLink>
          </article>
        </div>
        <p className="text-sm text-ink-faint">
          Reader opens as Marcus Hale. Use the header switcher to inspect other contractors. Sign-in
          arrives with production authentication.
        </p>
      </main>
    </div>
  );
}
