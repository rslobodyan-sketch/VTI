"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  calendarDayEvents,
  monthIsoBounds,
  personalBlocksOnDay,
  readerAvailabilityInMonth,
  type CalendarDayEvent,
} from "@/data/queries";
import { cn } from "@/lib/cn";
import {
  daysInMonth,
  formatMoney,
  formatMonthTitle,
  formatTime,
  pad2,
  weekdaySundayIndex,
} from "@/lib/format";
import { labelize } from "@/lib/status";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function assignmentSignal(item: CalendarDayEvent): string {
  const live = item.assignments.filter((row) =>
    ["offered", "accepted", "assigned"].includes(row.status),
  );
  if (!live.length) return "Unassigned";
  if (live.some((row) => row.status === "offered")) return "Offer out";
  const unsigned = live.filter((row) => !row.acknowledged && item.callSheet?.status === "issued");
  if (unsigned.length) return "Call Sheet unsigned";
  return live.map((row) => row.reader.contractorName.split(" ")[0]).join(" · ");
}

function travelBits(item: CalendarDayEvent): string[] {
  const bits: string[] = [];
  if (item.event.accommodationNotes && !item.event.accommodationNotes.toLowerCase().startsWith("none")) {
    bits.push("Hotel");
  }
  if (item.event.airfarePaidCents) bits.push("Air");
  if (item.event.transferNotes && !item.event.transferNotes.toLowerCase().startsWith("none")) {
    bits.push("Transfer");
  }
  return bits;
}

export function MonthCalendar({
  initialYear = 2026,
  initialMonth = 11,
}: {
  initialYear?: number;
  initialMonth?: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState<{
    dateKey: string;
    eventId: string;
  } | null>(null);

  const lastDay = daysInMonth(year, month);
  const leadBlanks = weekdaySundayIndex(year, month, 1);
  const cells = leadBlanks + lastDay;
  const rows = Math.ceil(cells / 7);

  const bounds = monthIsoBounds(year, month);
  const availability = readerAvailabilityInMonth(bounds.start, bounds.end);

  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const key = dateKey(year, month, day);
    return {
      day,
      key,
      events: calendarDayEvents(key),
      personal: personalBlocksOnDay(key),
    };
  });

  const selectedItem = selected
    ? calendarDayEvents(selected.dateKey).find((item) => item.event.id === selected.eventId)
    : undefined;

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth() + 1);
    setSelected(null);
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-serif text-2xl font-semibold">{formatMonthTitle(year, month)}</p>
          <p className="text-sm text-ink-muted">
            Operational month · America/Chicago · consecutive days share university color
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(-1)}>
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setYear(2026);
              setMonth(11);
            }}
          >
            Nov 2026
          </Button>
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(1)}>
            Next
          </Button>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <li>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" /> Confirmed
        </li>
        <li>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-warning" /> Tentative / offer
        </li>
        <li>
          <span className="mr-1 inline-block h-2 w-2 bg-ink-faint" /> Personal (admin)
        </li>
        <li>Unsigned Call Sheet = amber mark</li>
        <li>Hotel / Air / Transfer shown when present</li>
      </ul>

      <div className="overflow-x-auto border border-line">
        <div className="min-w-[72rem]">
          <div className="grid grid-cols-7 border-b border-line bg-paper-inset">
            {WEEKDAYS.map((label) => (
              <p
                key={label}
                className="px-2 py-1.5 text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase"
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
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[11.5rem] border-b border-r border-line p-1.5",
                    !inMonth && "bg-paper-inset/50",
                  )}
                >
                  {day ? (
                    <>
                      <p className="mb-1 text-xs font-medium tabular-nums">{day.day}</p>
                      <div className="grid gap-1.5">
                        {day.events.map((item) => (
                          <button
                            key={item.event.id}
                            type="button"
                            onClick={() =>
                              setSelected({ dateKey: day.key, eventId: item.event.id })
                            }
                            className={cn(
                              "w-full rounded-[2px] border-l-4 px-1.5 py-1 text-left text-[0.7rem] leading-snug",
                              item.event.status === "tentative"
                                ? "bg-paper-raised/80"
                                : "bg-paper-raised",
                            )}
                            style={{ borderLeftColor: item.client.calendarColor }}
                          >
                            <span className="block font-medium text-ink">
                              {item.client.name}
                            </span>
                            <span className="text-ink-muted">
                              {item.ceremonies
                                .map((ceremony) =>
                                  ceremony.kind === "team_dinner"
                                    ? `Dinner ${formatTime(ceremony.startsAt)}`
                                    : formatTime(ceremony.startsAt),
                                )
                                .join(" · ")}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-1">
                              <StatusBadge kind="event" value={item.event.status} />
                              {item.callSheet ? (
                                <StatusBadge kind="callsheet" value={item.callSheet.status} />
                              ) : (
                                <span className="text-warning">No CS</span>
                              )}
                              {item.assignments.some(
                                (row) =>
                                  !row.acknowledged &&
                                  item.callSheet?.status === "issued" &&
                                  ["offered", "accepted", "assigned"].includes(row.status),
                              ) ? (
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full bg-warning"
                                  title="Call Sheet acknowledgement outstanding"
                                />
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-ink-muted">
                              {item.event.estimatedGraduateCount.toLocaleString()} names
                              {item.event.priorYearGraduateCount
                                ? ` / last yr ${item.event.priorYearGraduateCount.toLocaleString()}`
                                : ""}
                            </span>
                            <span className="block text-ink-muted">
                              {formatMoney(item.event.quoteAmountCents)}
                              {item.event.priorYearQuoteAmountCents
                                ? ` / last yr ${formatMoney(item.event.priorYearQuoteAmountCents)}`
                                : ""}
                            </span>
                            <span className="block">
                              {item.lead ? `Lead ${item.lead.contractorName}` : "No lead"}
                            </span>
                            <span className="block text-ink-muted">{assignmentSignal(item)}</span>
                            {travelBits(item).length ? (
                              <span className="block text-ink-faint">
                                {travelBits(item).join(" · ")}
                              </span>
                            ) : null}
                            {item.issues.length ? (
                              <span className="block text-warning">{item.issues[0]}</span>
                            ) : null}
                          </button>
                        ))}
                        {day.personal.map((block) => (
                          <p
                            key={block.id}
                            className="border-l-4 border-ink-faint bg-paper-inset px-1.5 py-1 text-[0.7rem] text-ink-muted"
                          >
                            {block.title}
                          </p>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 border-t border-line pt-4 lg:grid-cols-[1fr_16rem]">
        <div className="lg:hidden">
          <p className="mb-2 text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
            Month as a list
          </p>
          <ul className="grid gap-2">
            {days.flatMap((day) =>
              day.events.map((item) => (
                <li key={`${day.key}-${item.event.id}`}>
                  <button
                    type="button"
                    className="w-full border-l-4 bg-paper-raised px-3 py-2 text-left text-sm"
                    style={{ borderLeftColor: item.client.calendarColor }}
                    onClick={() => setSelected({ dateKey: day.key, eventId: item.event.id })}
                  >
                    <span className="font-medium">
                      {day.day} · {item.client.name}
                    </span>
                    <span className="block text-ink-muted">{assignmentSignal(item)}</span>
                  </button>
                </li>
              )),
            )}
          </ul>
        </div>
        <aside className="border border-line bg-paper-raised p-3">
          <p className="text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase">
            Reader availability
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Admin-entered. Readers cannot edit this in the prototype.
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            {availability.map((row) => (
              <li key={row.reader.id} className="flex items-start justify-between gap-2">
                <Link
                  href={`/admin/readers/${row.reader.id}`}
                  className="underline-offset-2 hover:underline"
                >
                  {row.reader.contractorName}
                </Link>
                <span
                  className={cn(
                    "text-xs",
                    row.status === "unavailable" && "text-danger",
                    row.status === "assigned" && "text-info",
                    row.status === "available" && "text-success",
                  )}
                >
                  {labelize(row.status)}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Dialog
        open={Boolean(selectedItem)}
        title={selectedItem ? selectedItem.client.name : "Event"}
        onClose={() => setSelected(null)}
        className="w-[min(40rem,calc(100vw-1.5rem))] rounded-[var(--radius-lg)] border border-line bg-paper-raised p-0 text-ink shadow-[var(--shadow-md)]"
      >
        {selectedItem ? (
          <div className="grid gap-3 text-sm">
            <p className="font-medium">{selectedItem.event.name}</p>
            <p className="text-ink-muted">
              {selectedItem.ceremonies
                .map(
                  (ceremony) =>
                    `${ceremony.name} · ${formatTime(ceremony.startsAt)} · ${ceremony.venueName}`,
                )
                .join(" · ")}
            </p>
            <p>
              Names {selectedItem.event.estimatedGraduateCount.toLocaleString()}
              {selectedItem.event.priorYearGraduateCount
                ? ` (last year ${selectedItem.event.priorYearGraduateCount.toLocaleString()})`
                : ""}
              {" · "}
              Quote {formatMoney(selectedItem.event.quoteAmountCents)}
              {selectedItem.event.priorYearQuoteAmountCents
                ? ` (last year ${formatMoney(selectedItem.event.priorYearQuoteAmountCents)})`
                : ""}
            </p>
            <p>
              Hotel: {selectedItem.event.accommodationNotes}
              {selectedItem.event.hotelEstimateCents
                ? ` · ${formatMoney(selectedItem.event.hotelEstimateCents)}`
                : ""}
            </p>
            <p>
              Air: {selectedItem.event.airfareNotes}
              {selectedItem.event.airfarePaidCents
                ? ` · paid ${formatMoney(selectedItem.event.airfarePaidCents)}`
                : ""}
              {selectedItem.event.creditsRefundsCents
                ? ` · credits ${formatMoney(selectedItem.event.creditsRefundsCents)}`
                : ""}
            </p>
            <p>Transfers: {selectedItem.event.transferNotes}</p>
            {selectedItem.notes.map((note) => (
              <p key={note.id} className="text-ink-muted">
                Note: {note.note}
              </p>
            ))}
            {selectedItem.issues.length ? (
              <p className="text-warning">{selectedItem.issues.join(" · ")}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/admin/events/${selectedItem.event.id}`}
                className="text-sm underline-offset-2 hover:underline"
              >
                Open event
              </Link>
              {selectedItem.callSheet ? (
                <Link
                  href={`/admin/call-sheets/${selectedItem.callSheet.id}`}
                  className="text-sm underline-offset-2 hover:underline"
                >
                  Call Sheet v{selectedItem.callSheet.version}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Dialog>
      <span className="sr-only">Operational month grid</span>
    </div>
  );
}
