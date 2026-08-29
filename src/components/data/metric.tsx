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
    <div className="min-w-[7.5rem]">
      <p className="app-kicker">{label}</p>
      <p className="mt-1 font-serif text-xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
