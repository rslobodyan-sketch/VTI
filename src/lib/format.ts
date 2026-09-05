export const CHICAGO_TZ = "America/Chicago";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function toDate(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return new Date(`${iso}T18:00:00.000Z`);
  }
  return new Date(iso);
}

export function formatMoney(cents: number): string {
  return money.format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: CHICAGO_TZ,
  }).format(toDate(iso));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: CHICAGO_TZ,
  }).format(toDate(iso));
}

export function formatMonthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: CHICAGO_TZ,
  }).format(new Date(Date.UTC(year, month - 1, 15, 18)));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CHICAGO_TZ,
  }).format(toDate(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function monthKey(iso: string): string {
  const date = toDate(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    timeZone: CHICAGO_TZ,
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Calendar year/month/day in America/Chicago for an instant (defaults to now). */
export function currentChicagoDate(now = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: value("year"), month: value("month"), day: value("day") };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function weekdaySundayIndex(year: number, month: number, day: number): number {
  const iso = `${year}-${pad2(month)}-${pad2(day)}T18:00:00.000Z`;
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: CHICAGO_TZ,
  }).format(new Date(iso));
  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const idx = order.indexOf(weekday);
  return idx >= 0 ? idx : new Date(iso).getUTCDay();
}

export function dayKey(iso: string): string {
  const date = toDate(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: CHICAGO_TZ,
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function chicagoWallParts(isoOrDate: string | Date): { date: string; time: string } {
  const date = typeof isoOrDate === "string" ? toDate(isoOrDate) : isoOrDate;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

/** Interpret a date + HH:MM as America/Chicago wall clock, including CST/CDT. */
export function chicagoWallToIso(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? time : time.slice(0, 5);
  for (const offset of ["-06:00", "-05:00"] as const) {
    const iso = new Date(`${date}T${normalizedTime}:00${offset}`).toISOString();
    const back = chicagoWallParts(iso);
    if (back.date === date && back.time === normalizedTime) return iso;
  }
  return new Date(`${date}T${normalizedTime}:00-06:00`).toISOString();
}

export function addHoursIso(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString();
}
