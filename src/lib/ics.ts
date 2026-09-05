import { CHICAGO_TZ, formatDateTime } from "@/lib/format";

export type ReaderCalendarExportEvent = {
  uid: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  description: string;
};

function icsStamp(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
}

/** Assigned-event ICS only. No compensation, quotes, or other readers. */
export function readerCalendarIcs(events: ReaderCalendarExportEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VTI Operations//Reader Calendar//EN",
    `X-WR-TIMEZONE:${CHICAGO_TZ}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcs(event.uid)}`,
      `DTSTAMP:${icsStamp(new Date().toISOString())}`,
      `DTSTART:${icsStamp(event.startsAt)}`,
      `DTEND:${icsStamp(event.endsAt)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `LOCATION:${escapeIcs(event.location)}`,
      `DESCRIPTION:${escapeIcs(`${event.description}\n${formatDateTime(event.startsAt)}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadIcs(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}
