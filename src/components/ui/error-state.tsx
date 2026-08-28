type ErrorStateProps = {
  title?: string;
  description: string;
};

export function ErrorState({
  title = "Something needs attention",
  description,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft px-4 py-4 text-danger"
    >
      <p className="font-serif text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}
