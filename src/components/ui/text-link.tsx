import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("app-link", className)}>
      {children}
    </Link>
  );
}
