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
        The month opens on the nearest upcoming ceremony from the demo as-of date. Today returns to
        that as-of month. Personal blocks are admin-only pending Chester’s confirmation.
      </p>
      <MonthCalendar />
    </div>
  );
}
