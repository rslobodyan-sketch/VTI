import { MonthCalendar } from "@/components/calendar/month-calendar";
import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminCalendarPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Operational calendar"
        description="Purpose-built for VTI commencements. Color is the university. Each cell carries status, names, quote versus last year, lead, Call Sheet, and travel — not a generic week grid."
      />
      <DemoBanner>
        Busy demo month is November 2026 (Walden + Eastbridge honors). Personal blocks are admin-only pending Chester’s confirmation.
      </DemoBanner>
      <MonthCalendar initialYear={2026} initialMonth={11} />
    </div>
  );
}
