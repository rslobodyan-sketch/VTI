"use client";

import Link from "next/link";
import { useState } from "react";
import { useLiveQueries, useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DEMO_AS_OF } from "@/data/catalog";
import { cn } from "@/lib/cn";
import {
  calendarDateKey,
  defaultAssignedCalendarMonth,
  isCalendarToday,
  shiftCalendarMonth,
  WEEKDAYS,
} from "@/lib/calendar-grid";
import {
  dayKey,
  daysInMonth,
  formatMoney,
  formatMonthTitle,
  formatTime,
  weekdaySundayIndex,
  chicagoWallToIso,
} from "@/lib/format";
import { labelize } from "@/lib/status";
import type { CalendarDayEvent } from "@/data/queries";

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

function demoAsOfDate() {
  const [year, month, day] = DEMO_AS_OF.split("-").map(Number);
  return { year, month, day };
}

export function MonthCalendar() {
  const queries = useLiveQueries();
  const { catalog, addAvailabilityBlock, removeAvailabilityBlock, addPersonalTimeBlock, removePersonalTimeBlock } = useOperations();
  const asOf = demoAsOfDate();
  const [{ year, month }, setView] = useState(() =>
    defaultAssignedCalendarMonth(
      catalog.ceremonies.map((ceremony) => dayKey(ceremony.startsAt)),
      asOf,
    ),
  );
  const [availabilityReaderId, setAvailabilityReaderId] = useState("");
  const [availabilityKind, setAvailabilityKind] = useState<"available" | "unavailable">("unavailable");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState("09:00");
  const [availabilityEnd, setAvailabilityEnd] = useState("18:00");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [personalTitle, setPersonalTitle] = useState("");
  const [personalDate, setPersonalDate] = useState("");
  const [personalStart, setPersonalStart] = useState("09:00");
  const [personalEnd, setPersonalEnd] = useState("12:00");
  const [personalNote, setPersonalNote] = useState("");


  const [selected, setSelected] = useState<{
    dateKey: string;
    eventId: string;
  } | null>(null);

  const lastDay = daysInMonth(year, month);
  const leadBlanks = weekdaySundayIndex(year, month, 1);
  const cells = leadBlanks + lastDay;
  const rows = Math.ceil(cells / 7);

  const bounds = queries.monthIsoBounds(year, month);
  const availability = queries.readerAvailabilityInMonth(bounds.start, bounds.end);

  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const key = calendarDateKey(year, month, day);
    return {
      day,
      key,
      events: queries.calendarDayEvents(key),
      personal: queries.personalBlocksOnDay(key),
    };
  });

  const selectedItem = selected
    ? queries.calendarDayEvents(selected.dateKey).find((item) => item.event.id === selected.eventId)
    : undefined;

  function shiftMonth(delta: number) {
    setView((current) => shiftCalendarMonth(current.year, current.month, delta));
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(-1)}>
            Previous
          </Button>
          <p className="min-w-[7.5rem] px-2 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {formatMonthTitle(year, month)}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setView({ year: asOf.year, month: asOf.month });
              setSelected(null);
            }}
          >
            Today
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
        <li>Unsigned Call Sheet noted on the event card</li>
        <li>Hotel / Air / Transfer shown when present</li>
      </ul>

      <div
        id="admin-calendar-grid"
        className="hidden w-full min-w-0 max-w-full overflow-x-auto border border-line bg-paper-raised lg:block"
        role="grid"
        aria-label={`${formatMonthTitle(year, month)} operational calendar`}
      >
        <div className="w-full min-w-0">
          <div className="grid grid-cols-7 border-b border-line bg-paper-inset">
            {WEEKDAYS.map((label, index) => (
              <p
                key={label}
                className={cn(
                  "px-2 py-1.5 text-[0.7rem] tracking-[0.08em] text-ink-faint uppercase",
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
              const isToday = Boolean(day && isCalendarToday(year, month, day.day, asOf));
              return (
                <div
                  key={index}
                  role="gridcell"
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "min-w-0 overflow-hidden border-b border-r border-line p-1.5",
                    day && (day.events.length || day.personal.length)
                      ? "min-h-[10.25rem]"
                      : "min-h-[4.75rem]",
                    !inMonth && "bg-paper-inset/60",
                    weekend && inMonth && "bg-[color-mix(in_srgb,var(--paper)_70%,var(--paper-inset))]",
                    isToday && "bg-accent-soft/60",
                    selectedDay && "ring-1 ring-inset ring-focus",
                  )}
                >
                  {day ? (
                    <>
                      <p
                        className={cn(
                          "mb-1 text-xs tabular-nums",
                          isToday &&
                            "inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-accent px-1 font-semibold text-paper-raised",
                          !isToday && (weekend ? "font-semibold text-ink-muted" : "font-medium"),
                        )}
                      >
                        <span className="sr-only">{isToday ? "Demo as-of day " : ""}</span>
                        {day.day}
                      </p>
                      <div className="grid gap-1">
                        {day.events.map((item) => {
                          const selectedEvent =
                            selected?.dateKey === day.key && selected.eventId === item.event.id;
                          const unsigned = item.assignments.some(
                            (row) =>
                              !row.acknowledged &&
                              item.callSheet?.status === "issued" &&
                              ["offered", "accepted", "assigned"].includes(row.status),
                          );
                          const bits = travelBits(item);
                          return (
                            <button
                              key={item.event.id}
                              type="button"
                              onClick={() =>
                                setSelected({ dateKey: day.key, eventId: item.event.id })
                              }
                              aria-label={`${item.client.name}, ${item.event.name}`}
                              className={cn(
                                "w-full min-w-0 break-words rounded-[2px] border-l-4 px-1.5 py-1 text-left text-[0.68rem] leading-snug",
                                item.event.status === "tentative"
                                  ? "bg-paper/90"
                                  : "bg-paper-raised",
                                "hover:bg-accent-soft",
                                selectedEvent && "outline outline-1 outline-focus",
                              )}
                              style={{ borderLeftColor: item.client.calendarColor }}
                            >
                              <span className="block font-semibold text-ink">
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
                              <span className="mt-0.5 block text-[0.65rem] text-ink-faint">
                                {labelize(item.event.status)}
                                {item.callSheet ? ` · CS v${item.callSheet.version}` : " · no CS"}
                                {unsigned ? " · unsigned" : ""}
                              </span>
                              <span className="block tabular-nums text-ink-muted">
                                {item.event.estimatedGraduateCount.toLocaleString()} names
                                {item.event.priorYearGraduateCount
                                  ? ` / ${item.event.priorYearGraduateCount.toLocaleString()}`
                                  : ""}
                                {" · "}
                                {formatMoney(item.event.quoteAmountCents)}
                                {item.event.priorYearQuoteAmountCents
                                  ? ` / ${formatMoney(item.event.priorYearQuoteAmountCents)}`
                                  : ""}
                              </span>
                              <span className="block">
                                {item.lead ? `Lead ${item.lead.contractorName}` : "No lead"}
                                {" · "}
                                {assignmentSignal(item)}
                              </span>
                              {bits.length ? (
                                <span className="block text-ink-faint">{bits.join(" · ")}</span>
                              ) : null}
                              {item.issues.length ? (
                                <span className="block text-warning">{item.issues[0]}</span>
                              ) : null}
                            </button>
                          );
                        })}
                        {day.personal.map((block) => (
                          <p
                            key={block.id}
                            className="border-l-4 border-ink-faint bg-paper-inset px-1.5 py-1 text-[0.68rem] text-ink-muted"
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

      <div className="grid gap-6 border-t border-line pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
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
                    className="w-full min-h-12 border-l-4 bg-paper-raised px-3 py-2.5 text-left text-sm"
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
            Admin-entered. Who sets reader availability is pending Chester confirmation.
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            {availability.map((row) => (
              <li key={row.reader.id} className="flex items-start justify-between gap-2">
                <Link
                  href={`/admin/readers/${row.reader.id}`}
                  className="app-link"
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

      <div className="grid gap-6 border-t border-line pt-5 lg:grid-cols-2">
        <section className="grid gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold">Reader availability & conflicts</h2>
            <p className="text-sm text-ink-muted">Keep Chester&apos;s availability list close to the calendar. Conflicts are checked against event windows.</p>
          </div>
          <form className="grid gap-3 border border-line bg-paper-raised p-4" onSubmit={(e) => {
            e.preventDefault();
            if (!availabilityReaderId || !availabilityDate) return;
            addAvailabilityBlock({ readerId: availabilityReaderId, kind: availabilityKind, startsAt: chicagoWallToIso(availabilityDate, availabilityStart), endsAt: chicagoWallToIso(availabilityDate, availabilityEnd), notes: availabilityNote || `${availabilityKind === "available" ? "Available" : "Unavailable"} block entered by Chester.`, source: "admin_entered" });
            setAvailabilityNote("");
          }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm"><span className="text-ink-muted">Reader</span><select className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2" value={availabilityReaderId} onChange={(e) => setAvailabilityReaderId(e.target.value)}><option value="">Choose reader</option>{catalog.readers.map((r) => <option key={r.id} value={r.id}>{r.contractorName}</option>)}</select></label>
              <label className="grid gap-1 text-sm"><span className="text-ink-muted">Type</span><select className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2" value={availabilityKind} onChange={(e) => setAvailabilityKind(e.target.value as "available" | "unavailable")}><option value="unavailable">Unavailable</option><option value="available">Available</option></select></label>
              <label className="grid gap-1 text-sm"><span className="text-ink-muted">Date</span><input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2" type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} /></label>
              <label className="grid gap-1 text-sm"><span className="text-ink-muted">Start / end</span><span className="flex gap-2"><input className="h-10 min-w-0 flex-1 rounded-[var(--radius-md)] border border-line bg-paper px-2" type="time" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)} /><input className="h-10 min-w-0 flex-1 rounded-[var(--radius-md)] border border-line bg-paper px-2" type="time" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)} /></span></label>
            </div>
            <input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2 text-sm" value={availabilityNote} onChange={(e) => setAvailabilityNote(e.target.value)} placeholder="Optional note" />
            <Button size="sm" type="submit">Save availability block</Button>
          </form>
          <ul className="grid gap-0 border-y border-line text-sm">{catalog.availability.slice().sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).slice(0,8).map((block) => <li key={block.id} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"><span><span className="font-medium">{catalog.readers.find(r=>r.id===block.readerId)?.contractorName}</span> · {block.kind} · {dayKey(block.startsAt)}</span><button type="button" className="text-accent underline-offset-2 hover:underline" onClick={() => removeAvailabilityBlock(block.id)}>Remove</button></li>)}</ul>
        </section>

        <section className="grid gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold">Personal / external commitments</h2>
            <p className="text-sm text-ink-muted">Admin-only blocks can sit beside university work so venue or personal conflicts are visible.</p>
          </div>
          <form className="grid gap-3 border border-line bg-paper-raised p-4" onSubmit={(e) => {
            e.preventDefault();
            if (!personalTitle || !personalDate) return;
            addPersonalTimeBlock({ title: personalTitle, startsAt: chicagoWallToIso(personalDate, personalStart), endsAt: chicagoWallToIso(personalDate, personalEnd), notes: personalNote, showOnOperationalCalendar: true });
            setPersonalTitle(""); setPersonalNote("");
          }}>
            <input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2 text-sm" value={personalTitle} onChange={(e) => setPersonalTitle(e.target.value)} placeholder="Personal or external commitment" />
            <div className="grid gap-3 sm:grid-cols-3"><input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2 text-sm" type="date" value={personalDate} onChange={(e) => setPersonalDate(e.target.value)} /><input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2 text-sm" type="time" value={personalStart} onChange={(e) => setPersonalStart(e.target.value)} /><input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2 text-sm" type="time" value={personalEnd} onChange={(e) => setPersonalEnd(e.target.value)} /></div>
            <input className="h-10 rounded-[var(--radius-md)] border border-line bg-paper px-2 text-sm" value={personalNote} onChange={(e) => setPersonalNote(e.target.value)} placeholder="Optional private note" />
            <Button size="sm" type="submit">Add personal block</Button>
          </form>
          <ul className="grid gap-0 border-y border-line text-sm">{catalog.personalBlocks.map((block) => <li key={block.id} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"><span><span className="font-medium">{block.title}</span> · {dayKey(block.startsAt)}</span><button type="button" className="text-accent underline-offset-2 hover:underline" onClick={() => removePersonalTimeBlock(block.id)}>Remove</button></li>)}</ul>
        </section>
      </div>

      <Dialog
        open={Boolean(selectedItem)}
        title={selectedItem ? selectedItem.client.name : "Event"}
        onClose={() => setSelected(null)}
        className="max-h-[min(80dvh,40rem)] w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto rounded-[var(--radius-lg)] border border-line bg-paper-raised p-0 text-ink shadow-[var(--shadow-md)]"
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
                className="app-link-accent text-sm"
              >
                Open event
              </Link>
              {selectedItem.callSheet ? (
                <Link
                  href={`/admin/call-sheets/${selectedItem.callSheet.id}`}
                  className="app-link-accent text-sm"
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
