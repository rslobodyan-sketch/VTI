import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-paper px-4 py-16 text-ink">
      <div className="mx-auto max-w-lg">
        <p className="text-xs tracking-[0.12em] text-ink-faint uppercase">
          VTI Operations
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          That route is not part of the VTI operations prototype.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-sm font-medium text-paper-raised hover:bg-accent-hover"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
