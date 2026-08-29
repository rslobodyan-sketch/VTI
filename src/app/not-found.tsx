import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-paper px-4 py-16 text-ink">
      <div className="mx-auto max-w-lg">
        <p className="app-kicker">VTI Operations</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          That page is not part of VTI Operations.
        </p>
        <ButtonLink href="/" className="mt-6">
          Return home
        </ButtonLink>
      </div>
    </div>
  );
}
