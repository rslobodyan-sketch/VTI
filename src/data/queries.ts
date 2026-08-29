import { catalog, DEMO_CATALOG_REVISION, DEMO_DEFAULT_READER_ID } from "@/data/catalog";
import { dayKey, daysInMonth, pad2 } from "@/lib/format";
import type {
  Assignment,
  CalendarNote,
  CallSheet,
  Catalog,
  Ceremony,
  Client,
  EventRecord,
  ExpenseReport,
  ReaderCompensation,
  ReaderProfile,
} from "@/types/domain";

export type AssignmentView = Assignment & {
  reader: ReaderProfile;
  event: EventRecord;
  client: Client;
  callSheet?: CallSheet;
  acknowledged: boolean;
};

export type CalendarDayEvent = {
  event: EventRecord;
  client: Client;
  ceremonies: Ceremony[];
  lead?: ReaderProfile;
  assignments: AssignmentView[];
  callSheet?: CallSheet;
  notes: CalendarNote[];
  issues: string[];
};

export function createQueries(data: Catalog) {
function getClient(id: string) {
  return data.clients.find((item) => item.id === id);
}

function getReader(id: string) {
  return data.readers.find((item) => item.id === id);
}

function getEvent(id: string) {
  return data.events.find((item) => item.id === id);
}

function getAssignment(id: string) {
  return data.assignments.find((item) => item.id === id);
}

function ceremoniesForEvent(eventId: string) {
  return data.ceremonies
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function assignmentsForEvent(eventId: string) {
  return data.assignments.filter((item) => item.eventId === eventId);
}

function assignmentsForReader(readerId: string) {
  return data.assignments.filter((item) => item.readerId === readerId);
}

function currentCallSheet(eventId: string): CallSheet | undefined {
  return data.callSheets
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => b.version - a.version)
    .find((item) => item.status === "issued") ??
    data.callSheets
      .filter((item) => item.eventId === eventId)
      .sort((a, b) => b.version - a.version)[0];
}

function callSheetsForEvent(eventId: string) {
  return data.callSheets
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => b.version - a.version);
}

function acknowledgementFor(callSheetId: string, readerId: string) {
  return data.acknowledgements.find(
    (item) => item.callSheetId === callSheetId && item.readerId === readerId,
  );
}

function leadForEvent(eventId: string) {
  const lead = assignmentsForEvent(eventId).find((item) => item.role === "lead");
  return lead ? getReader(lead.readerId) : undefined;
}

function eventWindow(eventId: string) {
  const rows = ceremoniesForEvent(eventId);
  if (!rows.length) return null;
  return { start: rows[0].startsAt, end: rows[rows.length - 1].endsAt };
}

function contactsForClient(clientId: string) {
  return data.contacts.filter((item) => item.clientId === clientId);
}

function insuranceForClient(clientId: string) {
  return data.insurance.filter((item) => item.clientId === clientId);
}

function estimatesForEvent(eventId: string) {
  return data.estimates.filter((item) => item.eventId === eventId);
}

function invoicesForEvent(eventId: string) {
  return data.invoices.filter((item) => item.eventId === eventId);
}

function expensesForAssignment(assignmentId: string) {
  return data.expenseReports.filter((item) => item.assignmentId === assignmentId);
}

function linesForReport(reportId: string) {
  return data.expenseLines.filter((item) => item.expenseReportId === reportId);
}

function compensationForAssignment(assignmentId: string) {
  return data.compensation.filter((item) => item.assignmentId === assignmentId);
}

function compensationForReader(readerId: string) {
  return data.compensation.filter((item) => item.readerId === readerId);
}

function debriefsForEvent(eventId: string) {
  return data.debriefs.filter((item) => item.eventId === eventId);
}

function documentsForEvent(eventId: string) {
  return data.eventDocuments.filter((item) => item.eventId === eventId);
}

function documentsForReader(readerId: string) {
  return data.readerDocuments.filter((item) => item.readerId === readerId);
}

function notesForEvent(eventId: string) {
  return data.notes.filter((item) => item.eventId === eventId);
}

function eventsForClient(clientId: string) {
  return data.events.filter((item) => item.clientId === clientId);
}

function inquiriesForClient(clientId: string) {
  return data.inquiries.filter((item) => item.clientId === clientId);
}

function assignmentView(assignment: Assignment): AssignmentView | null {
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

function allAssignmentViews() {
  return data.assignments
    .map(assignmentView)
    .filter((item): item is AssignmentView => Boolean(item));
}

function upcomingAssignments(readerId = DEMO_DEFAULT_READER_ID) {
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

function readerAvailabilityInMonth(monthStartIso: string, monthEndIso: string) {
  const busyIds = new Set(
    data.assignments
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

  const blocked = data.availability.filter(
    (item) =>
      item.kind === "unavailable" &&
      item.startsAt <= monthEndIso &&
      item.endsAt >= monthStartIso,
  );

  return data.readers.map((reader) => {
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

function dashboardMetrics() {
  const activeUniversities = data.clients.filter((item) => item.status === "active").length;
  const openEvents = data.events.filter((item) => item.status !== "cancelled").length;
  const utilizedReaders = new Set(
    data.assignments
      .filter((item) =>
        ["offered", "accepted", "assigned", "completed"].includes(item.status),
      )
      .map((item) => item.readerId),
  ).size;
  const potentialIncome = data.estimates
    .filter((item) => item.status === "draft" || item.status === "sent" || item.status === "accepted")
    .reduce((sum, item) => sum + item.amountCents, 0);
  const projectedExpenses =
    data.compensation
      .filter((item) => item.status === "promised" || item.status === "pending_approval")
      .reduce((sum, item) => sum + item.amountCents, 0) +
    data.expenseReports
      .filter((item) => item.status === "submitted" || item.status === "draft")
      .reduce((sum, report) => {
        return (
          sum +
          data.expenseLines
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
  const expensesNeedingReview = data.expenseReports.filter(
    (item) => item.status === "submitted",
  );
  const payNeedingApproval = data.compensation.filter(
    (item) => item.status === "pending_approval" || item.status === "promised",
  );
  const offeredAssignments = allAssignmentViews().filter(
    (item) => item.status === "offered",
  );
  const insuranceDue = data.insurance.filter(
    (item) => item.status === "submitted" || item.status === "not_started",
  );
  const expiringDocs = data.readerDocuments.filter(
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

function eventsTouchingDay(dateKey: string) {
  return data.events.filter((event) =>
    ceremoniesForEvent(event.id).some((ceremony) => dayKey(ceremony.startsAt) === dateKey),
  );
}

function operationalIssues(eventId: string): string[] {
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
    data.eventDocuments.some(
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

function expenseReportView(report: ExpenseReport) {
  const reader = getReader(report.readerId);
  const assignment = getAssignment(report.assignmentId);
  const event = assignment ? getEvent(assignment.eventId) : undefined;
  const client = event ? getClient(event.clientId) : undefined;
  const lines = linesForReport(report.id);
  const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const reimbursement = data.compensation.find(
    (item) =>
      item.assignmentId === report.assignmentId && item.kind === "reimbursement",
  );
  return { report, reader, assignment, event, client, lines, totalCents, reimbursement };
}

function allExpenseReportViews() {
  return data.expenseReports.map(expenseReportView);
}

function compensationView(row: ReaderCompensation) {
  const reader = getReader(row.readerId);
  const assignment = getAssignment(row.assignmentId);
  const event = assignment ? getEvent(assignment.eventId) : undefined;
  const client = event ? getClient(event.clientId) : undefined;
  return { row, reader, assignment, event, client };
}

function allCompensationViews() {
  return data.compensation.map(compensationView);
}

function calendarDayEvents(dateKey: string): CalendarDayEvent[] {
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
      notes: data.calendarNotes.filter(
        (item) => item.eventId === event.id && item.pinnedToCalendar,
      ),
      issues: operationalIssues(event.id),
    });
  }
  return rows;
}

function personalBlocksOnDay(dateKey: string) {
  return data.personalBlocks.filter(
    (item) =>
      item.showOnOperationalCalendar &&
      dayKey(item.startsAt) <= dateKey &&
      dayKey(item.endsAt) >= dateKey,
  );
}

function monthIsoBounds(year: number, month: number) {
  const last = daysInMonth(year, month);
  return {
    start: `${year}-${pad2(month)}-01T00:00:00.000Z`,
    end: `${year}-${pad2(month)}-${pad2(last)}T23:59:59.000Z`,
  };
}

  return {
    getClient,
    getReader,
    getEvent,
    getAssignment,
    ceremoniesForEvent,
    assignmentsForEvent,
    assignmentsForReader,
    currentCallSheet,
    callSheetsForEvent,
    acknowledgementFor,
    leadForEvent,
    eventWindow,
    contactsForClient,
    insuranceForClient,
    estimatesForEvent,
    invoicesForEvent,
    expensesForAssignment,
    linesForReport,
    compensationForAssignment,
    compensationForReader,
    debriefsForEvent,
    documentsForEvent,
    documentsForReader,
    notesForEvent,
    eventsForClient,
    inquiriesForClient,
    assignmentView,
    allAssignmentViews,
    upcomingAssignments,
    readerAvailabilityInMonth,
    dashboardMetrics,
    eventsTouchingDay,
    operationalIssues,
    expenseReportView,
    allExpenseReportViews,
    compensationView,
    allCompensationViews,
    calendarDayEvents,
    personalBlocksOnDay,
    monthIsoBounds,
  };
}

const seed = createQueries(catalog);
export const getClient = seed.getClient;
export const getReader = seed.getReader;
export const getEvent = seed.getEvent;
export const getAssignment = seed.getAssignment;
export const ceremoniesForEvent = seed.ceremoniesForEvent;
export const assignmentsForEvent = seed.assignmentsForEvent;
export const assignmentsForReader = seed.assignmentsForReader;
export const currentCallSheet = seed.currentCallSheet;
export const callSheetsForEvent = seed.callSheetsForEvent;
export const acknowledgementFor = seed.acknowledgementFor;
export const leadForEvent = seed.leadForEvent;
export const eventWindow = seed.eventWindow;
export const contactsForClient = seed.contactsForClient;
export const insuranceForClient = seed.insuranceForClient;
export const estimatesForEvent = seed.estimatesForEvent;
export const invoicesForEvent = seed.invoicesForEvent;
export const expensesForAssignment = seed.expensesForAssignment;
export const linesForReport = seed.linesForReport;
export const compensationForAssignment = seed.compensationForAssignment;
export const compensationForReader = seed.compensationForReader;
export const debriefsForEvent = seed.debriefsForEvent;
export const documentsForEvent = seed.documentsForEvent;
export const documentsForReader = seed.documentsForReader;
export const notesForEvent = seed.notesForEvent;
export const eventsForClient = seed.eventsForClient;
export const inquiriesForClient = seed.inquiriesForClient;
export const assignmentView = seed.assignmentView;
export const allAssignmentViews = seed.allAssignmentViews;
export const upcomingAssignments = seed.upcomingAssignments;
export const readerAvailabilityInMonth = seed.readerAvailabilityInMonth;
export const dashboardMetrics = seed.dashboardMetrics;
export const eventsTouchingDay = seed.eventsTouchingDay;
export const operationalIssues = seed.operationalIssues;
export const expenseReportView = seed.expenseReportView;
export const allExpenseReportViews = seed.allExpenseReportViews;
export const compensationView = seed.compensationView;
export const allCompensationViews = seed.allCompensationViews;
export const calendarDayEvents = seed.calendarDayEvents;
export const personalBlocksOnDay = seed.personalBlocksOnDay;
export const monthIsoBounds = seed.monthIsoBounds;
export { catalog, DEMO_CATALOG_REVISION };
