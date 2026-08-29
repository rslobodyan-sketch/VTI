import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";

export function FilterPills({
  basePath,
  param = "status",
  value,
  options,
}: {
  basePath: string;
  param?: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter">
      <TextLink
        href={basePath}
        className={cn(
          "inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-2.5 text-sm no-underline",
          !value
            ? "border-accent bg-accent text-paper-raised hover:text-paper-raised"
            : "border-line bg-paper-raised",
        )}
      >
        All
      </TextLink>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <TextLink
            key={option.value}
            href={`${basePath}?${param}=${option.value}`}
            className={cn(
              "inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-2.5 text-sm no-underline",
              active
                ? "border-accent bg-accent text-paper-raised hover:text-paper-raised"
                : "border-line bg-paper-raised",
            )}
          >
            {option.label}
          </TextLink>
        );
      })}
    </div>
  );
}
