import { catalog, DEMO_CATALOG_REVISION, DEMO_DEFAULT_READER_ID } from "@/data/catalog";
import { dayKey, daysInMonth, pad2 } from "@/lib/format";
import type {
  Assignment,
  CallSheet,
  Client,
  EventRecord,
  ExpenseReport,
  ReaderCompensation,
  ReaderProfile,
} from "@/types/domain";

export function getClient(id: string) {
  return catalog.clients.find((item) => item.id === id);
}

export function getReader(id: string) {
  return catalog.readers.find((item) => item.id === id);
}

export function getEvent(id: string) {
  return catalog.events.find((item) => item.id === id);
}

export function getAssignment(id: string) {
  return catalog.assignments.find((item) => item.id === id);
}

export function ceremoniesForEvent(eventId: string) {
  return catalog.ceremonies
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function assignmentsForEvent(eventId: string) {
  return catalog.assignments.filter((item) => item.eventId === eventId);
}

export function assignmentsForReader(readerId: string) {
  return catalog.assignments.filter((item) => item.readerId === readerId);
}

export function currentCallSheet(eventId: string): CallSheet | undefined {
  return catalog.callSheets
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => b.version - a.version)
    .find((item) => item.status === "issued") ??
    catalog.callSheets
      .filter((item) => item.eventId === eventId)
      .sort((a, b) => b.version - a.version)[0];
}

export function callSheetsForEvent(eventId: string) {
  return catalog.callSheets
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => b.version - a.version);
}

export function acknowledgementFor(callSheetId: string, readerId: string) {
  return catalog.acknowledgements.find(
    (item) => item.callSheetId === callSheetId && item.readerId === readerId,
  );
}

export function leadForEvent(eventId: string) {
  const lead = assignmentsForEvent(eventId).find((item) => item.role === "lead");
  return lead ? getReader(lead.readerId) : undefined;
}

export function eventWindow(eventId: string) {
  const rows = ceremoniesForEvent(eventId);
  if (!rows.length) return null;
  return { start: rows[0].startsAt, end: rows[rows.length - 1].endsAt };
}

export function contactsForClient(clientId: string) {
  return catalog.contacts.filter((item) => item.clientId === clientId);
}

export function insuranceForClient(clientId: string) {
  return catalog.insurance.filter((item) => item.clientId === clientId);
}

export function estimatesForEvent(eventId: string) {
  return catalog.estimates.filter((item) => item.eventId === eventId);
}

export function invoicesForEvent(eventId: string) {
  return catalog.invoices.filter((item) => item.eventId === eventId);
}

export function expensesForAssignment(assignmentId: string) {
  return catalog.expenseReports.filter((item) => item.assignmentId === assignmentId);
}

export function linesForReport(reportId: string) {
  return catalog.expenseLines.filter((item) => item.expenseReportId === reportId);
}

export function compensationForAssignment(assignmentId: string) {
  return catalog.compensation.filter((item) => item.assignmentId === assignmentId);
}

export function compensationForReader(readerId: string) {
  return catalog.compensation.filter((item) => item.readerId === readerId);
}

export function debriefsForEvent(eventId: string) {
  return catalog.debriefs.filter((item) => item.eventId === eventId);
}

export function documentsForEvent(eventId: string) {
  return catalog.eventDocuments.filter((item) => item.eventId === eventId);
}

export function documentsForReader(readerId: string) {
  return catalog.readerDocuments.filter((item) => item.readerId === readerId);
}

export function notesForEvent(eventId: string) {
  return catalog.notes.filter((item) => item.eventId === eventId);
}

export function eventsForClient(clientId: string) {
  return catalog.events.filter((item) => item.clientId === clientId);
}

export type AssignmentView = Assignment & {
  reader: ReaderProfile;
  event: EventRecord;
  client: Client;
  callSheet?: CallSheet;
  acknowledged: boolean;
};

export function assignmentView(assignment: Assignment): AssignmentView | null {
  const reader = getReader(assignment.readerId);
  const event = getEvent(assignment.eventId);
  const client = event ? getClient(event.clientId) : undefined;
  if (!reader || !event || !client) return null;
  const callSheet = currentCallSheet(event.id);
  const acknowledged = callSheet
    ? Boolean(acknowledgementFor(callSheet.id, reader.id))
    : false;
  return { ...assignment, reader, event, client, callSheet, acknowledged };
}

export function allAssignmentViews() {
  return catalog.assignments
    .map(assignmentView)
    .filter((item): item is AssignmentView => Boolean(item));
}

export function upcomingAssignments(readerId = DEMO_DEFAULT_READER_ID) {
  return assignmentsForReader(readerId)
    .map(assignmentView)
    .filter((item): item is AssignmentView => Boolean(item))
    .filter((item) => item.status !== "completed" && item.status !== "released_to_pool")
    .sort((a, b) => {
      const aStart = eventWindow(a.eventId)?.start ?? "";
      const bStart = eventWindow(b.eventId)?.start ?? "";
      return aStart.localeCompare(bStart);
    });
}

export function readerAvailabilityInMonth(monthStartIso: string, monthEndIso: string) {
  const busyIds = new Set(
    catalog.assignments
      .filter((item) =>
        ["offered", "accepted", "assigned"].includes(item.status),
      )
      .filter((item) => {
        const window = eventWindow(item.eventId);
        if (!window) return false;
        return window.start <= monthEndIso && window.end >= monthStartIso;
      })
      .map((item) => item.readerId),
  );

  const blocked = catalog.availability.filter(
    (item) =>
      item.kind === "unavailable" &&
      item.startsAt <= monthEndIso &&
      item.endsAt >= monthStartIso,
  );

  return catalog.readers.map((reader) => {
    const block = blocked.find((item) => item.readerId === reader.id);
    const assigned = busyIds.has(reader.id);
    const status = block
      ? "unavailable"
      : assigned
        ? "assigned"
        : "available";
    return { reader, status, note: block?.notes };
  });
}

export function dashboardMetrics() {
  const activeUniversities = catalog.clients.filter((item) => item.status === "active").length;
  const openEvents = catalog.events.filter((item) => item.status !== "cancelled").length;
  const utilizedReaders = new Set(
    catalog.assignments
      .filter((item) =>
        ["offered", "accepted", "assigned", "completed"].includes(item.status),
      )
      .map((item) => item.readerId),
  ).size;
  const potentialIncome = catalog.estimates
    .filter((item) => item.status === "draft" || item.status === "sent" || item.status === "accepted")
    .reduce((sum, item) => sum + item.amountCents, 0);
  const projectedExpenses =
    catalog.compensation
      .filter((item) => item.status === "promised" || item.status === "pending_approval")
      .reduce((sum, item) => sum + item.amountCents, 0) +
    catalog.expenseReports
      .filter((item) => item.status === "submitted" || item.status === "draft")
      .reduce((sum, report) => {
        return (
          sum +
          catalog.expenseLines
            .filter((line) => line.expenseReportId === report.id)
            .reduce((lineSum, line) => lineSum + line.amountCents, 0)
        );
      }, 0);

  const unsignedCallSheets = allAssignmentViews().filter(
    (item) =>
      item.callSheet?.status === "issued" &&
      !item.acknowledged &&
      ["offered", "accepted", "assigned"].includes(item.status),
  );
  const expensesNeedingReview = catalog.expenseReports.filter(
    (item) => item.status === "submitted",
  );
  const payNeedingApproval = catalog.compensation.filter(
    (item) => item.status === "pending_approval" || item.status === "promised",
  );
  const offeredAssignments = allAssignmentViews().filter(
    (item) => item.status === "offered",
  );
  const insuranceDue = catalog.insurance.filter(
    (item) => item.status === "submitted" || item.status === "not_started",
  );
  const expiringDocs = catalog.readerDocuments.filter(
    (item) => item.status === "expiring" || item.status === "expired",
  );

  return {
    activeUniversities,
    openEvents,
    utilizedReaders,
    potentialIncome,
    projectedExpenses,
    unsignedCallSheets,
    expensesNeedingReview,
    payNeedingApproval,
    offeredAssignments,
    insuranceDue,
    expiringDocs,
  };
}

export function eventsTouchingDay(dateKey: string) {
  return catalog.events.filter((event) =>
    ceremoniesForEvent(event.id).some((ceremony) => dayKey(ceremony.startsAt) === dateKey),
  );
}

export function operationalIssues(eventId: string): string[] {
  const event = getEvent(eventId);
  if (!event) return [];
  const issues: string[] = [];
  const assigned = assignmentsForEvent(eventId).filter((item) =>
    ["offered", "accepted", "assigned"].includes(item.status),
  );
  if (assigned.length === 0) {
    issues.push("No reader currently assigned");
  }
  if (assigned.some((item) => item.status === "offered")) {
    issues.push("Assignment offered — acceptance outstanding");
  }
  const callSheet = currentCallSheet(eventId);
  if (!callSheet) {
    issues.push("No Call Sheet issued");
  } else if (callSheet.status === "issued") {
    const unsigned = assigned.filter(
      (item) => !acknowledgementFor(callSheet.id, item.readerId),
    );
    if (unsigned.length) {
      issues.push(`${unsigned.length} Call Sheet acknowledgement outstanding`);
    }
  }
  const insurance = insuranceForClient(event.clientId).find(
    (item) => item.status !== "accepted",
  );
  if (insurance) {
    issues.push(`Insurance ${insurance.status.replaceAll("_", " ")}`);
  }
  if (
    catalog.eventDocuments.some(
      (item) =>
        item.eventId === eventId &&
        item.kind === "name_list" &&
        item.statusNote.toLowerCase().includes("not yet"),
    )
  ) {
    issues.push("Name list not yet received");
  }
  return issues;
}

export function expenseReportView(report: ExpenseReport) {
  const reader = getReader(report.readerId);
  const assignment = getAssignment(report.assignmentId);
  const event = assignment ? getEvent(assignment.eventId) : undefined;
  const client = event ? getClient(event.clientId) : undefined;
  const lines = linesForReport(report.id);
  const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const reimbursement = catalog.compensation.find(
    (item) =>
      item.assignmentId === report.assignmentId && item.kind === "reimbursement",
  );
  return { report, reader, assignment, event, client, lines, totalCents, reimbursement };
}

export function allExpenseReportViews() {
  return catalog.expenseReports.map(expenseReportView);
}

export function compensationView(row: ReaderCompensation) {
  const reader = getReader(row.readerId);
  const assignment = getAssignment(row.assignmentId);
  const event = assignment ? getEvent(assignment.eventId) : undefined;
  const client = event ? getClient(event.clientId) : undefined;
  return { row, reader, assignment, event, client };
}

export function allCompensationViews() {
  return catalog.compensation.map(compensationView);
}

export type CalendarDayEvent = {
  event: EventRecord;
  client: Client;
  ceremonies: ReturnType<typeof ceremoniesForEvent>;
  lead?: ReaderProfile;
  assignments: AssignmentView[];
  callSheet?: CallSheet;
  notes: typeof catalog.calendarNotes;
  issues: string[];
};

export function calendarDayEvents(dateKey: string): CalendarDayEvent[] {
  const rows: CalendarDayEvent[] = [];
  for (const event of eventsTouchingDay(dateKey)) {
    const client = getClient(event.clientId);
    if (!client) continue;
    rows.push({
      event,
      client,
      ceremonies: ceremoniesForEvent(event.id).filter(
        (ceremony) => dayKey(ceremony.startsAt) === dateKey,
      ),
      lead: leadForEvent(event.id),
      assignments: assignmentsForEvent(event.id)
        .map(assignmentView)
        .filter((item): item is AssignmentView => Boolean(item)),
      callSheet: currentCallSheet(event.id),
      notes: catalog.calendarNotes.filter(
        (item) => item.eventId === event.id && item.pinnedToCalendar,
      ),
      issues: operationalIssues(event.id),
    });
  }
  return rows;
}

export function personalBlocksOnDay(dateKey: string) {
  return catalog.personalBlocks.filter(
    (item) =>
      item.showOnOperationalCalendar &&
      dayKey(item.startsAt) <= dateKey &&
      dayKey(item.endsAt) >= dateKey,
  );
}

export function monthIsoBounds(year: number, month: number) {
  const last = daysInMonth(year, month);
  return {
    start: `${year}-${pad2(month)}-01T00:00:00.000Z`,
    end: `${year}-${pad2(month)}-${pad2(last)}T23:59:59.000Z`,
  };
}

export { catalog, DEMO_CATALOG_REVISION };
