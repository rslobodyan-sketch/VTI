"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDemoReader } from "@/components/demo/demo-reader";
import { useLiveQueries } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  calendarDateKey,
  defaultAssignedCalendarMonth,
  shiftCalendarMonth,
  WEEKDAYS,
} from "@/lib/calendar-grid";
import { cn } from "@/lib/cn";
import {
  currentChicagoDate,
  dayKey,
  daysInMonth,
  formatDateTime,
  formatMonthTitle,
  formatTime,
  weekdaySundayIndex,
} from "@/lib/format";
import { downloadIcs, readerCalendarIcs } from "@/lib/ics";
import { labelize } from "@/lib/status";
import type { ReaderCalendarDayEvent } from "@/data/queries";

function assignedCeremonyDateKeys(
  queries: ReturnType<typeof useLiveQueries>,
  readerId: string,
) {
  return queries.upcomingAssignments(readerId).flatMap((assignment) =>
    queries.ceremoniesForEvent(assignment.eventId).map((ceremony) => dayKey(ceremony.startsAt)),
  );
}

export function ReaderMonthCalendar() {
  const { reader } = useDemoReader();
  const queries = useLiveQueries();
  const [{ year, month }, setView] = useState(() =>
    defaultAssignedCalendarMonth(
      assignedCeremonyDateKeys(queries, reader.id),
      currentChicagoDate(),
    ),
  );
  const [selected, setSelected] = useState<{
    dateKey: string;
    assignmentId: string;
  } | null>(null);

  useEffect(() => {
    setView(
      defaultAssignedCalendarMonth(
        assignedCeremonyDateKeys(queries, reader.id),
        currentChicagoDate(),
      ),
    );
    setSelected(null);
    // Re-derive the landing month only when the signed-in reader changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reader.id is the intended trigger
  }, [reader.id]);

  const lastDay = daysInMonth(year, month);
  const leadBlanks = weekdaySundayIndex(year, month, 1);
  const rows = Math.ceil((leadBlanks + lastDay) / 7);

  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const key = calendarDateKey(year, month, day);
    return {
      day,
      key,
      events: queries.readerCalendarDayEvents(reader.id, key),
    };
  });

  const selectedItem = selected
    ? days
        .find((day) => day.key === selected.dateKey)
        ?.events.find((item) => item.assignmentId === selected.assignmentId)
    : undefined;

  const exportEvents = useMemo(() => {
    const items: ReaderCalendarDayEvent[] = days.flatMap((day) => day.events);
    return items.flatMap((item) =>
      item.ceremonies.map((ceremony) => ({
        uid: `${item.assignmentId}-${ceremony.id}@vti-operations.demo`,
        title: `${item.universityName} · ${ceremony.name}`,
        startsAt: ceremony.startsAt,
        endsAt: ceremony.endsAt,
        location: ceremony.venueName,
        description: `${item.eventName} · ${item.role} · ${labelize(item.status)}`,
      })),
    );
  }, [days]);

  function shiftMonth(delta: number) {
    setView((current) => shiftCalendarMonth(current.year, current.month, delta));
    setSelected(null);
  }

  function goToCurrentMonth() {
    const today = currentChicagoDate();
    setView({ year: today.year, month: today.month });
    setSelected(null);
  }

  return (
    <div className="reader-calendar grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <p className="font-serif text-2xl font-semibold">{formatMonthTitle(year, month)}</p>
          <p className="text-sm text-ink-muted">
            Your assigned ceremonies · America/Chicago · other readers and admin calendars are not
            shown
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(-1)}>
            Previous
          </Button>
          <p className="min-w-[7.5rem] px-2 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {formatMonthTitle(year, month)}
          </p>
          <Button variant="secondary" size="sm" onClick={() => goToCurrentMonth()}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(1)}>
            Next
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadIcs(
                `vti-reader-calendar-${year}-${String(month).padStart(2, "0")}.ics`,
                readerCalendarIcs(exportEvents),
              )
            }
            disabled={!exportEvents.length}
          >
            Export .ics
          </Button>
        </div>
      </div>

      <p className="hidden print:block font-serif text-xl font-semibold">
        {reader.contractorName} · {formatMonthTitle(year, month)}
      </p>

      <div className="overflow-x-auto border border-line bg-paper-raised">
        <div className="min-w-[20rem]">
          <div className="grid grid-cols-7 border-b border-line bg-paper-inset">
            {WEEKDAYS.map((label, index) => (
              <p
                key={label}
                className={cn(
                  "px-1 py-1.5 text-center text-[0.65rem] tracking-[0.06em] text-ink-faint uppercase sm:px-2",
                  (index === 0 || index === 6) && "bg-paper",
                )}
              >
                {label}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: rows * 7 }, (_, index) => {
              const dayNumber = index - leadBlanks + 1;
              const inMonth = dayNumber >= 1 && dayNumber <= lastDay;
              const day = inMonth ? days[dayNumber - 1] : null;
              const weekend = index % 7 === 0 || index % 7 === 6;
              const selectedDay = Boolean(day && selected?.dateKey === day.key);
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[4.5rem] border-b border-r border-line p-1 sm:min-h-[5.5rem]",
                    !inMonth && "bg-paper-inset/60",
                    weekend && inMonth && "bg-[color-mix(in_srgb,var(--paper)_70%,var(--paper-inset))]",
                    selectedDay && "ring-1 ring-inset ring-focus",
                  )}
                >
                  {day ? (
                    <>
                      <p
                        className={cn(
                          "mb-1 text-xs tabular-nums",
                          weekend ? "font-semibold text-ink-muted" : "font-medium",
                        )}
                      >
                        {day.day}
                      </p>
                      <div className="grid gap-1">
                        {day.events.map((item) => {
                          const selectedEvent =
                            selected?.dateKey === day.key &&
                            selected.assignmentId === item.assignmentId;
                          return (
                            <button
                              key={item.assignmentId}
                              type="button"
                              onClick={() =>
                                setSelected({
                                  dateKey: day.key,
                                  assignmentId: item.assignmentId,
                                })
                              }
                              className={cn(
                                "w-full rounded-[2px] border-l-4 px-1 py-0.5 text-left text-[0.65rem] leading-snug sm:text-[0.7rem]",
                                "bg-paper-raised",
                                selectedEvent && "outline outline-1 outline-focus",
                              )}
                              style={{ borderLeftColor: item.calendarColor }}
                            >
                              <span className="block font-semibold text-ink">
                                {item.universityName}
                              </span>
                              <span className="block text-ink-muted">
                                {item.ceremonies
                                  .map((ceremony) => formatTime(ceremony.startsAt))
                                  .join(" · ")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!days.some((day) => day.events.length) ? (
        <EmptyState
          title="No assigned events this month"
          description="When Chester assigns you, those ceremonies appear on this grid."
        />
      ) : null}

      <Dialog
        open={Boolean(selectedItem)}
        title={selectedItem ? selectedItem.universityName : "Assignment"}
        onClose={() => setSelected(null)}
        className="max-h-[min(80dvh,40rem)] w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto rounded-[var(--radius-lg)] border border-line bg-paper-raised p-0 text-ink shadow-[var(--shadow-md)]"
      >
        {selectedItem ? (
          <div className="grid gap-3 text-sm">
            <p className="font-medium">{selectedItem.eventName}</p>
            <p className="capitalize text-ink-muted">
              {selectedItem.role} · {labelize(selectedItem.status)}
            </p>
            <ul className="grid gap-2">
              {selectedItem.ceremonies.map((ceremony) => (
                <li key={ceremony.id}>
                  <span className="font-medium">{ceremony.name}</span>
                  <span className="block text-ink-muted">
                    {formatDateTime(ceremony.startsAt)} · {ceremony.venueName}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={`/reader/assignments/${selectedItem.assignmentId}`}
              className="app-link-accent text-sm"
            >
              Open assignment
            </Link>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
