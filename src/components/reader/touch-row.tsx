import Link from "next/link";
import type { ReactNode } from "react";

export function TouchRow({
  href,
  title,
  meta,
  trailing,
}: {
  href?: string;
  title: string;
  meta?: ReactNode;
  trailing?: ReactNode;
}) {
  const content = (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-3">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {meta ? <div className="text-sm text-ink-muted">{meta}</div> : null}
      </div>
      {trailing}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block rounded-[var(--radius-md)] hover:bg-paper-inset/70">
      {content}
    </Link>
  );
}
