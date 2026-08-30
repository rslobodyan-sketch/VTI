export function RecordPending() {
  return (
    <div className="app-page" aria-live="polite" aria-busy="true">
      <div className="grid gap-3">
        <div className="h-8 w-48 rounded-[var(--radius-md)] bg-paper-inset" />
        <div className="h-4 w-full max-w-md rounded-[var(--radius-md)] bg-paper-inset" />
        <p className="text-sm text-ink-muted">Loading this record…</p>
      </div>
    </div>
  );
}
