import { MonthCalendar } from "@/components/calendar/month-calendar";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminCalendarPage() {
  return (
    <div className="app-page">
      <PageHeader
        title="Calendar"
        description="Purpose-built for VTI commencements. Color is the university. Consecutive days share that color. Not a generic week grid."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Calendar" },
        ]}
      />
      <p className="text-xs text-ink-muted">
        November 2026 is the current operating month. Personal blocks are admin-only pending Chester’s confirmation.
      </p>
      <MonthCalendar initialYear={2026} initialMonth={11} />
    </div>
  );
}
