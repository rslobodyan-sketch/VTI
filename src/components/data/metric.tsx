export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-[9rem]">
      <p className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
