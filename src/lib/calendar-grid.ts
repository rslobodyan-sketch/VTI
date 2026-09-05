import { pad2 } from "@/lib/format";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function calendarDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function shiftCalendarMonth(year: number, month: number, delta: number) {
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
}

/** Open the month of the nearest upcoming ceremony date; otherwise today's month. */
export function defaultAssignedCalendarMonth(
  ceremonyDateKeys: string[],
  today: { year: number; month: number; day: number },
) {
  const todayKey = calendarDateKey(today.year, today.month, today.day);
  const nearest = ceremonyDateKeys.filter((key) => key >= todayKey).sort()[0];
  if (!nearest) return { year: today.year, month: today.month };
  const [year, month] = nearest.split("-").map(Number);
  return { year, month };
}
