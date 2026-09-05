"use client";

import { ReaderMonthCalendar } from "@/components/calendar/reader-month-calendar";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { PageHeader } from "@/components/ui/page-header";

export default function ReaderCalendarPage() {
  const { ready } = useOperations();
  if (!ready) return <RecordPending />;
  return (
    <div className="grid gap-5">
      <PageHeader
        title="Your calendar"
        description="Month grid of ceremonies assigned to you. Quotes, other readers, and Chester’s personal calendar are not shown."
      />
      <ReaderMonthCalendar />
    </div>
  );
}
