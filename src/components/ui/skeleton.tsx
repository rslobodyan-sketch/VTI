import { cn } from "@/lib/cn";

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-md)] bg-paper-inset", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonBlock() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
