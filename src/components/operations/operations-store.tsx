"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { catalog as seedCatalog } from "@/data/catalog";
import { seedActivity, seedUniversityProfiles } from "@/data/university-profiles";
import { createQueries } from "@/data/queries";
import {
  clearPersistedRaw,
  loadPersistedRaw,
  OPERATIONS_OVERLAY_KEY,
  savePersistedRaw,
} from "@/lib/operations-persistence";
import type {
  ActivityLogAction,
  ActivityLogEntry,
  AppNotification,
  AppNotificationType,
  Assignment,
  AssignmentStatus,
  CallSheet,
  CallSheetAcknowledgement,
  Catalog,
  Ceremony,
  Client,
  ClientContact,
  EventRecord,
  Flight,
  HotelStay,
  GroundTransfer,
  EventDocument,
  ExpenseLine,
  ExpenseReport,
  ExpenseStatus,
  Inquiry,
  InquiryStage,
  InsuranceRequirement,
  Debrief,
  OperationalNote,
  ReaderCompensation,
  Task,
  TaskStatus,
  WorkspaceDocument,
  WorkspaceDocumentCategory,
  AvailabilityBlock,
  PersonalTimeBlock,
  CalendarNote,
  Invoice,
  Estimate,
  UniversityPayment,
  NotificationPreferenceKey,
  NotificationPreferences,
} from "@/types/domain";
import type {
  ActivityItem,
  SearchHit,
  UniversityProfile,
} from "@/types/operations";
import { INQUIRY_STAGE_ORDER } from "@/types/operations";

const COLORS = ["#4a5560", "#6b2d3c", "#1f4e79", "#3d5a3a", "#5c4a2e", "#3b4a6b", "#5a3d4e"];

type Overlay = {
  clients: Client[];
  contacts: ClientContact[];
  inquiries: Inquiry[];
  events: EventRecord[];
  ceremonies: Ceremony[];
  assignments: Assignment[];
  callSheets: CallSheet[];
  acknowledgements: CallSheetAcknowledgement[];
  insurance: InsuranceRequirement[];
  expenseReports: ExpenseReport[];
  expenseLines: ExpenseLine[];
  debriefs: Debrief[];
  compensation: ReaderCompensation[];
  profiles: UniversityProfile[];
  activity: ActivityItem[];
  assignmentStatus: Record<string, AssignmentStatus>;
  expenseStatus: Record<string, ExpenseStatus>;
  compensationPatches: Record<string, Partial<ReaderCompensation>>;
  clientPatches: Record<string, Partial<Client>>;
  eventPatches: Record<string, Partial<EventRecord>>;
  assignmentNotices: Record<string, { preparedAt: string; status: "prepared" }>;
  notes: OperationalNote[];
  workspaceDocuments: WorkspaceDocument[];
  tasks: Task[];
  notifications: AppNotification[];
  activityLog: ActivityLogEntry[];
  flights: Flight[];
  hotelStays: HotelStay[];
  groundTransfers: GroundTransfer[];
  eventDocuments: EventDocument[];
  availability: AvailabilityBlock[];
  personalBlocks: PersonalTimeBlock[];
  calendarNotes: CalendarNote[];
  invoices: Invoice[];
  estimates: Estimate[];
  universityPayments: UniversityPayment[];
  notificationPreferences: NotificationPreferences;
  removedAvailabilityIds: string[];
  removedPersonalBlockIds: string[];
  removedCalendarNoteIds: string[];
};

function blankOverlay(): Overlay {
  return {
    clients: [],
    contacts: [],
    inquiries: [],
    events: [],
    ceremonies: [],
    assignments: [],
    callSheets: [],
    acknowledgements: [],
    insurance: [],
    expenseReports: [],
    expenseLines: [],
    debriefs: [],
    compensation: [],
    profiles: [],
    activity: [],
    assignmentStatus: {},
    expenseStatus: {},
    compensationPatches: {},
    clientPatches: {},
    eventPatches: {},
    assignmentNotices: {},
    notes: [],
    workspaceDocuments: [],
    tasks: [],
    notifications: [],
    activityLog: [],
    flights: [],
    hotelStays: [],
    groundTransfers: [],
    eventDocuments: [],
    availability: [],
    personalBlocks: [],
    calendarNotes: [],
    invoices: [],
    estimates: [],
    universityPayments: [],
    notificationPreferences: {
      call_sheet_ack: true,
      assignment_offers: true,
      expenses: true,
      insurance: true,
      payments: true,
      tasks: true,
    },
    removedAvailabilityIds: [],
    removedPersonalBlockIds: [],
    removedCalendarNoteIds: [],
  };
}

const emptyOverlay: Overlay = blankOverlay();

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function upsert<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const map = new Map(base.map((item) => [item.id, item]));
  for (const item of extra) map.set(item.id, item);
  return [...map.values()];
}

function upsertProfiles(base: UniversityProfile[], extra: UniversityProfile[]): UniversityProfile[] {
  const map = new Map(base.map((item) => [item.clientId, item]));
  for (const item of extra) map.set(item.clientId, item);
  return [...map.values()];
}

function mergeCatalog(overlay: Overlay): Catalog {
  const assignments = upsert(seedCatalog.assignments, asArray(overlay.assignments)).map((item) =>
    overlay.assignmentStatus?.[item.id] ? { ...item, status: overlay.assignmentStatus[item.id] } : item,
  );
  const expenseReports = upsert(seedCatalog.expenseReports, asArray(overlay.expenseReports)).map((item) =>
    overlay.expenseStatus?.[item.id] ? { ...item, status: overlay.expenseStatus[item.id] } : item,
  );
  const overlayCompensation = asArray(overlay.compensation);
  const compensationBase = upsert(seedCatalog.compensation, overlayCompensation);
  const paidAssignmentIds = new Set(
    compensationBase
      .filter((item) => item.kind === "compensation")
      .map((item) => item.assignmentId),
  );
  const impliedCompensation: ReaderCompensation[] = overlay.assignments
    .filter((item) => !paidAssignmentIds.has(item.id))
    .map((item) => ({
      id: `pay-${item.id}`,
      assignmentId: item.id,
      readerId: item.readerId,
      kind: "compensation",
      amountCents: item.promisedPayCents,
      status: "promised",
    }));
  const compensation = upsert(compensationBase, impliedCompensation).map((item) =>
    overlay.compensationPatches[item.id]
      ? { ...item, ...overlay.compensationPatches[item.id] }
      : item,
  );
  const clients = upsert(seedCatalog.clients, asArray(overlay.clients)).map((item) =>
    overlay.clientPatches?.[item.id] ? { ...item, ...overlay.clientPatches[item.id] } : item,
  );
  const events = upsert(seedCatalog.events, asArray(overlay.events)).map((item) =>
    overlay.eventPatches?.[item.id] ? { ...item, ...overlay.eventPatches[item.id] } : item,
  );
  return {
    ...seedCatalog,
    clients,
    contacts: upsert(seedCatalog.contacts, asArray(overlay.contacts)),
    inquiries: upsert(seedCatalog.inquiries, asArray(overlay.inquiries)),
    events,
    ceremonies: upsert(seedCatalog.ceremonies, asArray(overlay.ceremonies)),
    assignments,
    callSheets: upsert(seedCatalog.callSheets, asArray(overlay.callSheets)),
    acknowledgements: upsert(seedCatalog.acknowledgements, asArray(overlay.acknowledgements)),
    insurance: upsert(seedCatalog.insurance, asArray(overlay.insurance)),
    expenseReports,
    expenseLines: upsert(seedCatalog.expenseLines, asArray(overlay.expenseLines)),
    compensation,
    debriefs: upsert(seedCatalog.debriefs, asArray(overlay.debriefs)),
    notes: upsert(seedCatalog.notes, asArray(overlay.notes)),
    tasks: upsert(seedCatalog.tasks, asArray(overlay.tasks)),
    notifications: upsert(seedCatalog.notifications, asArray(overlay.notifications)),
    activityLog: upsert(seedCatalog.activityLog, asArray(overlay.activityLog)),
    flights: upsert(seedCatalog.flights, asArray(overlay.flights)),
    hotelStays: upsert(seedCatalog.hotelStays, asArray(overlay.hotelStays)),
    groundTransfers: upsert(seedCatalog.groundTransfers, asArray(overlay.groundTransfers)),
    eventDocuments: upsert(seedCatalog.eventDocuments, asArray(overlay.eventDocuments)),
    availability: upsert(seedCatalog.availability.filter((item) => !overlay.removedAvailabilityIds.includes(item.id)), asArray(overlay.availability)),
    personalBlocks: upsert(seedCatalog.personalBlocks.filter((item) => !overlay.removedPersonalBlockIds.includes(item.id)), asArray(overlay.personalBlocks)),
    calendarNotes: upsert(seedCatalog.calendarNotes.filter((item) => !overlay.removedCalendarNoteIds.includes(item.id)), asArray(overlay.calendarNotes)),
    invoices: upsert(seedCatalog.invoices, asArray(overlay.invoices)),
    estimates: upsert(seedCatalog.estimates, asArray(overlay.estimates)),
    universityPayments: upsert(seedCatalog.universityPayments, asArray(overlay.universityPayments)),
  };
}

function writeOverlay(next: Overlay) {
  savePersistedRaw(JSON.stringify(next));
}

function notificationPreferenceKey(type: AppNotificationType): NotificationPreferenceKey | undefined {
  if (type === "call_sheet") return "call_sheet_ack";
  if (type === "assignment") return "assignment_offers";
  if (type === "expense") return "expenses";
  if (type === "payment") return "payments";
  if (type === "task") return "tasks";
  return undefined;
}

function appendTrail(
  prev: Overlay,
  entry: {
    action: ActivityLogAction;
    title: string;
    detail?: string;
    actorName?: string;
    eventId?: string;
    clientId?: string;
    assignmentId?: string;
    href?: string;
  },
  notification?: Omit<AppNotification, "id" | "createdAt">,
): Pick<Overlay, "activityLog" | "notifications"> {
  const createdAt = new Date().toISOString();
  const preferenceKey = notification ? notificationPreferenceKey(notification.type) : undefined;
  const notificationEnabled = !preferenceKey || prev.notificationPreferences[preferenceKey];
  return {
    activityLog: [
      ...prev.activityLog,
      {
        id: uid("alog"),
        action: entry.action,
        title: entry.title,
        detail: entry.detail,
        actorName: entry.actorName ?? "Chester Tadeja",
        createdAt,
        eventId: entry.eventId,
        clientId: entry.clientId,
        assignmentId: entry.assignmentId,
        href: entry.href,
      },
    ],
    notifications: notification && notificationEnabled
      ? [
          ...prev.notifications,
          {
            id: uid("ntf"),
            createdAt,
            ...notification,
          },
        ]
      : prev.notifications,
  };
}

function loadOverlay(): Overlay {
  if (typeof window === "undefined") return blankOverlay();
  try {
    const raw = loadPersistedRaw();
    if (!raw) return blankOverlay();
    const parsed = JSON.parse(raw) as Partial<Overlay>;
    const next: Overlay = {
      ...blankOverlay(),
      ...parsed,
      clients: asArray(parsed.clients),
      contacts: asArray(parsed.contacts),
      inquiries: asArray(parsed.inquiries),
      events: asArray(parsed.events),
      ceremonies: asArray(parsed.ceremonies),
      assignments: asArray(parsed.assignments),
      callSheets: asArray(parsed.callSheets),
      acknowledgements: asArray(parsed.acknowledgements),
      insurance: asArray(parsed.insurance),
      expenseReports: asArray(parsed.expenseReports),
      expenseLines: asArray(parsed.expenseLines),
      debriefs: asArray(parsed.debriefs),
      compensation: asArray(parsed.compensation),
      profiles: asArray(parsed.profiles),
      activity: asArray(parsed.activity),
      assignmentStatus: parsed.assignmentStatus ?? {},
      expenseStatus: parsed.expenseStatus ?? {},
      compensationPatches: parsed.compensationPatches ?? {},
      clientPatches: parsed.clientPatches ?? {},
      eventPatches: parsed.eventPatches ?? {},
      assignmentNotices: parsed.assignmentNotices ?? {},
      notes: asArray(parsed.notes),
      workspaceDocuments: asArray(parsed.workspaceDocuments),
      tasks: asArray(parsed.tasks),
      notifications: asArray(parsed.notifications),
      activityLog: asArray(parsed.activityLog),
      flights: asArray(parsed.flights),
      hotelStays: asArray(parsed.hotelStays),
      groundTransfers: asArray(parsed.groundTransfers),
      eventDocuments: asArray(parsed.eventDocuments),
      availability: asArray(parsed.availability),
      personalBlocks: asArray(parsed.personalBlocks),
      calendarNotes: asArray(parsed.calendarNotes),
      invoices: asArray(parsed.invoices),
      estimates: asArray(parsed.estimates),
      universityPayments: asArray(parsed.universityPayments),
      notificationPreferences: { ...blankOverlay().notificationPreferences, ...(parsed.notificationPreferences ?? {}) },
      removedAvailabilityIds: asArray(parsed.removedAvailabilityIds),
      removedPersonalBlockIds: asArray(parsed.removedPersonalBlockIds),
      removedCalendarNoteIds: asArray(parsed.removedCalendarNoteIds),
    };
    writeOverlay(next);
    return next;
  } catch {
    return blankOverlay();
  }
}

export type CreateUniversityInput = {
  client: Omit<Client, "id" | "kind">;
  profile: Omit<UniversityProfile, "clientId" | "onboardingStatus" | "documentPlaceholders"> & {
    documentPlaceholders?: UniversityProfile["documentPlaceholders"];
  };
  primary: Omit<ClientContact, "id" | "clientId" | "isPrimary">;
  additional?: Omit<ClientContact, "id" | "clientId" | "isPrimary"> | null;
};

type OperationsContextValue = {
  catalog: Catalog;
  queries: ReturnType<typeof createQueries>;
  profiles: UniversityProfile[];
  activity: ActivityItem[];
  profileFor: (clientId: string) => UniversityProfile | undefined;
  activityFor: (clientId: string) => ActivityItem[];
  search: (query: string) => SearchHit[];
  createUniversity: (input: CreateUniversityInput) => string;
  completeOnboarding: (clientId: string, input: CreateUniversityInput) => string;
  patchClient: (id: string, patch: Partial<Client>) => void;
  addContact: (clientId: string, contact: Omit<ClientContact, "id" | "clientId">) => void;
  createInquiry: (input: Omit<Inquiry, "id">) => string;
  setInquiryStage: (id: string, stage: InquiryStage, nextAction?: string) => void;
  createEvent: (input: {
    clientId: string;
    name: string;
    status: EventRecord["status"];
    quoteAmountCents: number;
    estimatedGraduateCount: number;
    notes: string;
    travelNotes: string;
    airfareNotes: string;
    accommodationNotes: string;
    transferNotes: string;
    ceremony: Omit<Ceremony, "id" | "eventId">;
    inquiryId?: string;
  }) => string;
  offerAssignment: (eventId: string, readerId: string, role: Assignment["role"], promisedPayCents: number) => string;
  acceptAssignment: (id: string) => void;
  acknowledge: (callSheetId: string, readerId: string, assignmentId: string) => void;
  isAcknowledged: (callSheetId: string, readerId: string, catalogValue: boolean) => boolean;
  assignmentStatus: (id: string, catalogValue: string) => string;
  expenseStatus: (id: string, catalogValue: string) => string;
  submitExpense: (id: string) => void;
  reviewExpense: (id: string, status: "approved" | "rejected") => void;
  addExpenseLine: (input: {
    reportId?: string;
    assignmentId: string;
    readerId: string;
    category: string;
    amountCents: number;
    incurredOn: string;
    description: string;
    receiptLabel: string;
  }) => string;
  patchCompensation: (id: string, patch: Partial<ReaderCompensation>) => void;
  issueCallSheet: (eventId: string) => string;
  addActivity: (item: Omit<ActivityItem, "id">) => void;
  addCeremony: (eventId: string, ceremony: Omit<Ceremony, "id" | "eventId">) => void;
  patchEvent: (id: string, patch: Partial<EventRecord>) => void;
  confirmAssignment: (id: string) => void;
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void;
  prepareAssignmentNotice: (assignmentId: string) => void;
  assignmentNotice: (assignmentId: string) => { preparedAt: string; status: "prepared" } | undefined;
  addUniversityNote: (clientId: string, body: string) => string;
  addWorkspaceDocument: (input: {
    filename: string;
    category: WorkspaceDocumentCategory;
    note: string;
  }) => string;
  workspaceDocuments: WorkspaceDocument[];
  submitDebrief: (input: Omit<Debrief, "id" | "submittedAt">) => string;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  createTask: (input: Omit<Task, "id" | "createdAt" | "completedAt">) => string;
  createInvoice: (input: Omit<Invoice, "id">) => string;
  addFlight: (input: Omit<Flight, "id">) => string;
  addHotelStay: (input: Omit<HotelStay, "id">) => string;
  addGroundTransfer: (input: Omit<GroundTransfer, "id">) => string;
  addEventDocument: (input: Omit<EventDocument, "id" | "uploadedAt">) => string;
  patchFlight: (id: string, patch: Partial<Flight>) => void;
  patchHotelStay: (id: string, patch: Partial<HotelStay>) => void;
  patchGroundTransfer: (id: string, patch: Partial<GroundTransfer>) => void;
  addAvailabilityBlock: (input: Omit<AvailabilityBlock, "id">) => string;
  removeAvailabilityBlock: (id: string) => void;
  addPersonalTimeBlock: (input: Omit<PersonalTimeBlock, "id">) => string;
  removePersonalTimeBlock: (id: string) => void;
  addCalendarNote: (input: Omit<CalendarNote, "id">) => string;
  patchInvoice: (id: string, patch: Partial<Invoice>) => void;
  recordUniversityPayment: (input: Omit<UniversityPayment, "id">) => string;
  notificationPreferences: NotificationPreferences;
  setNotificationPreference: (key: NotificationPreferenceKey, enabled: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  reset: () => void;
  hasOverrides: boolean;
  ready: boolean;
};

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(emptyOverlay);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setOverlay(loadOverlay());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === OPERATIONS_OVERLAY_KEY || event.key === null) {
        setOverlay(loadOverlay());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((updater: Overlay | ((prev: Overlay) => Overlay)) => {
    flushSync(() => {
      setOverlay((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        writeOverlay(next);
        return next;
      });
    });
  }, []);

  const catalog = useMemo(() => mergeCatalog(overlay), [overlay]);
  const queries = useMemo(() => createQueries(catalog), [catalog]);
  const profiles = useMemo(
    () => upsertProfiles(seedUniversityProfiles, overlay.profiles),
    [overlay.profiles],
  );
  const activity = useMemo(() => [...seedActivity, ...overlay.activity], [overlay.activity]);

  const profileFor = useCallback(
    (clientId: string) => profiles.find((item) => item.clientId === clientId),
    [profiles],
  );
  const activityFor = useCallback(
    (clientId: string) =>
      activity
        .filter((item) => item.clientId === clientId)
        .sort((a, b) => b.at.localeCompare(a.at)),
    [activity],
  );

  const search = useCallback(
    (query: string): SearchHit[] => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];
      const hits: SearchHit[] = [];
      for (const client of catalog.clients) {
        if (client.name.toLowerCase().includes(q)) {
          hits.push({
            id: client.id,
            href: `/admin/clients/${client.id}`,
            title: client.name,
            type: "University",
            subtitle: client.status,
          });
        }
      }
      for (const contact of catalog.contacts) {
        if (
          contact.name.toLowerCase().includes(q) ||
          contact.email.toLowerCase().includes(q)
        ) {
          const client = catalog.clients.find((item) => item.id === contact.clientId);
          hits.push({
            id: contact.id,
            href: `/admin/clients/${contact.clientId}`,
            title: contact.name,
            type: "Contact",
            subtitle: client?.name,
          });
        }
      }
      for (const event of catalog.events) {
        if (event.name.toLowerCase().includes(q)) {
          hits.push({
            id: event.id,
            href: `/admin/events/${event.id}`,
            title: event.name,
            type: "Event",
            subtitle: event.status,
          });
        }
      }
      for (const reader of catalog.readers) {
        if (reader.contractorName.toLowerCase().includes(q)) {
          hits.push({
            id: reader.id,
            href: `/admin/readers/${reader.id}`,
            title: reader.contractorName,
            type: "Reader",
            subtitle: reader.onboardingStatus.replaceAll("_", " "),
          });
        }
      }
      for (const row of queries.allAssignmentViews()) {
        const label = `${row.reader.contractorName} · ${row.event.name}`;
        if (label.toLowerCase().includes(q)) {
          hits.push({
            id: row.id,
            href: `/admin/assignments/${row.id}`,
            title: label,
            type: "Assignment",
            subtitle: row.role,
          });
        }
      }
      for (const sheet of catalog.callSheets) {
        const event = catalog.events.find((item) => item.id === sheet.eventId);
        const title = `${event?.name ?? "Event"} Call Sheet v${sheet.version}`;
        if (title.toLowerCase().includes(q) || `v${sheet.version}`.includes(q)) {
          hits.push({
            id: sheet.id,
            href: `/admin/call-sheets/${sheet.id}`,
            title,
            type: "Call Sheet",
            subtitle: sheet.status,
          });
        }
      }
      for (const invoice of catalog.invoices) {
        const client = catalog.clients.find((item) => item.id === invoice.clientId);
        const title = `${client?.name ?? "University"} invoice`;
        if (title.toLowerCase().includes(q) || invoice.id.toLowerCase().includes(q)) {
          hits.push({
            id: invoice.id,
            href: "/admin/payments",
            title,
            type: "Invoice",
            subtitle: invoice.status,
          });
        }
      }
      return hits.slice(0, 12);
    },
    [catalog, queries],
  );

  const addActivity = useCallback(
    (item: Omit<ActivityItem, "id">) => {
      persist((prev) => ({
        ...prev,
        activity: [...prev.activity, { ...item, id: uid("act") }],
      }));
    },
    [persist],
  );

  const createUniversity = useCallback(
    (input: CreateUniversityInput) => {
      const id = uid("uni");
      const color = COLORS[catalog.clients.length % COLORS.length];
      const client: Client = {
        ...input.client,
        id,
        kind: "university",
        calendarColor: input.client.calendarColor || color,
      };
      const profile: UniversityProfile = {
        ...input.profile,
        clientId: id,
        onboardingStatus: "complete",
        documentPlaceholders: input.profile.documentPlaceholders ?? [
          {
            id: uid("doc"),
            name: "Certificate of insurance",
            type: "COI",
            status: input.profile.insuranceRequired ? "required" : "on_file",
          },
        ],
      };
      const primary: ClientContact = {
        id: uid("ct"),
        clientId: id,
        isPrimary: true,
        ...input.primary,
      };
      const extra = input.additional?.name
        ? [
            {
              id: uid("ct"),
              clientId: id,
              isPrimary: false,
              ...input.additional,
            },
          ]
        : [];
      const insurance: InsuranceRequirement[] = input.profile.insuranceRequired
        ? [
            {
              id: uid("ins"),
              clientId: id,
              year: 2026,
              status: "not_started",
              dueOn: "2026-12-01",
              notes: input.profile.coiRequirements || "COI required before first event.",
            },
          ]
        : [];
      persist((prev) => ({
        ...prev,
        clients: [...prev.clients, client],
        contacts: [...prev.contacts, primary, ...extra],
        profiles: [...prev.profiles, profile],
        insurance: [...prev.insurance, ...insurance],
        activity: [
          ...prev.activity,
          {
            id: uid("act"),
            clientId: id,
            at: new Date().toISOString(),
            title: "University onboarded",
            detail: `${client.name} intake completed.`,
            href: `/admin/clients/${id}`,
          },
          {
            id: uid("act"),
            clientId: id,
            at: new Date().toISOString(),
            title: "Contact added",
            detail: `${primary.name} · ${primary.roleTitle}`,
          },
        ],
      }));
      return id;
    },
    [catalog.clients.length, persist],
  );

  const completeOnboarding = useCallback(
    (clientId: string, input: CreateUniversityInput) => {
      persist((prev) => {
        const existing = upsertProfiles(seedUniversityProfiles, prev.profiles).find(
          (item) => item.clientId === clientId,
        );
        const profile: UniversityProfile = {
          ...input.profile,
          clientId,
          onboardingStatus: "complete",
          documentPlaceholders:
            input.profile.documentPlaceholders ??
            existing?.documentPlaceholders ?? [
              {
                id: uid("doc"),
                name: "Certificate of insurance",
                type: "COI",
                status: input.profile.insuranceRequired ? "required" : "on_file",
              },
            ],
        };
        const mergedContacts = upsert(seedCatalog.contacts, prev.contacts);
        const existingPrimary = mergedContacts.find((item) => item.clientId === clientId && item.isPrimary);
        const contactUpdates: ClientContact[] = [
          existingPrimary
            ? { ...existingPrimary, ...input.primary, clientId, isPrimary: true }
            : { id: uid("ct"), clientId, isPrimary: true, ...input.primary },
        ];
        if (input.additional?.name) {
          const extraExisting = mergedContacts.find(
            (item) =>
              item.clientId === clientId &&
              !item.isPrimary &&
              item.name.trim().toLowerCase() === input.additional!.name.trim().toLowerCase(),
          );
          contactUpdates.push(
            extraExisting
              ? { ...extraExisting, ...input.additional, clientId, isPrimary: false }
              : { id: uid("ct"), clientId, isPrimary: false, ...input.additional },
          );
        }
        const hasInsurance = [...seedCatalog.insurance, ...prev.insurance].some(
          (item) => item.clientId === clientId,
        );
        const insurance: InsuranceRequirement[] =
          input.profile.insuranceRequired && !hasInsurance
            ? [
                {
                  id: uid("ins"),
                  clientId,
                  year: 2026,
                  status: "not_started",
                  dueOn: "2026-12-01",
                  notes: input.profile.coiRequirements || "COI required before first event.",
                },
              ]
            : [];
        return {
          ...prev,
          clientPatches: {
            ...prev.clientPatches,
            [clientId]: {
              ...prev.clientPatches[clientId],
              name: input.client.name,
              status: "active",
              notes: input.client.notes,
            },
          },
          profiles: upsertProfiles(prev.profiles, [profile]),
          contacts: upsert(prev.contacts, contactUpdates),
          insurance: [...prev.insurance, ...insurance],
          activity: [
            ...prev.activity,
            {
              id: uid("act"),
              clientId,
              at: new Date().toISOString(),
              title: "University onboarded",
              detail: `${input.client.name} intake completed.`,
              href: `/admin/clients/${clientId}`,
            },
          ],
        };
      });
      return clientId;
    },
    [persist],
  );

  const patchClient = useCallback(
    (id: string, patch: Partial<Client>) => {
      persist((prev) => ({
        ...prev,
        clientPatches: { ...prev.clientPatches, [id]: { ...prev.clientPatches[id], ...patch } },
      }));
    },
    [persist],
  );

  const addContact = useCallback(
    (clientId: string, contact: Omit<ClientContact, "id" | "clientId">) => {
      persist((prev) => ({
        ...prev,
        contacts: [
          ...prev.contacts,
          { ...contact, id: uid("ct"), clientId },
        ],
        activity: [
          ...prev.activity,
          {
            id: uid("act"),
            clientId,
            at: new Date().toISOString(),
            title: "Contact added",
            detail: contact.name,
          },
        ],
      }));
    },
    [persist],
  );

  const createInquiry = useCallback(
    (input: Omit<Inquiry, "id">) => {
      const id = uid("inq");
      persist((prev) => ({
        ...prev,
        inquiries: [...prev.inquiries, { ...input, id, lastActivityAt: new Date().toISOString() }],
        activity: [
          ...prev.activity,
          {
            id: uid("act"),
            clientId: input.clientId,
            at: new Date().toISOString(),
            title: "Inquiry created",
            detail: input.notes,
            href: `/admin/inquiries/${id}`,
          },
        ],
      }));
      return id;
    },
    [persist],
  );

  const setInquiryStage = useCallback(
    (id: string, stage: InquiryStage, nextAction?: string) => {
      persist((prev) => {
        const existing =
          prev.inquiries.find((item) => item.id === id) ??
          seedCatalog.inquiries.find((item) => item.id === id);
        if (!existing) return prev;
        return {
        ...prev,
        inquiries: upsert(prev.inquiries, [
          {
            ...existing,
            stage,
            nextAction: nextAction ?? existing.nextAction,
            lastActivityAt: new Date().toISOString(),
          },
        ]),
        activity: [
          ...prev.activity,
          {
            id: uid("act"),
            clientId: existing.clientId,
            at: new Date().toISOString(),
            title: `Inquiry moved to ${stage.replaceAll("_", " ")}`,
            href: `/admin/inquiries/${id}`,
          },
        ],
        };
      });
    },
    [persist],
  );

  const createEvent = useCallback(
    (input: Parameters<OperationsContextValue["createEvent"]>[0]) => {
      const id = uid("evt");
      const event: EventRecord = {
        id,
        clientId: input.clientId,
        name: input.name,
        status: input.status,
        estimatedGraduateCount: input.estimatedGraduateCount,
        quoteAmountCents: input.quoteAmountCents,
        eventReady: false,
        notes: input.notes,
        travelNotes: input.travelNotes,
        airfareNotes: input.airfareNotes,
        accommodationNotes: input.accommodationNotes,
        transferNotes: input.transferNotes,
      };
      const ceremony: Ceremony = { ...input.ceremony, id: uid("cer"), eventId: id };
      persist((prev) => {
        let inquiries = prev.inquiries;
        if (input.inquiryId) {
          const existing =
            prev.inquiries.find((item) => item.id === input.inquiryId) ??
            seedCatalog.inquiries.find((item) => item.id === input.inquiryId);
          if (existing) {
            inquiries = upsert(prev.inquiries, [
              {
                ...existing,
                stage: "closed_won",
                nextAction: "Event created",
                lastActivityAt: new Date().toISOString(),
              },
            ]);
          }
        }
        const existingEstimate = seedCatalog.estimates.find((item) => item.eventId === id);
        const estimates = existingEstimate
          ? prev.estimates
          : [
              ...prev.estimates,
              {
                id: uid("est"),
                clientId: input.clientId,
                eventId: id,
                amountCents: input.quoteAmountCents,
                status: "draft",
                notes: "Tracking copy. Official estimate lives in Wave.",
              } satisfies Estimate,
            ];
        return {
          ...prev,
          inquiries,
          events: [...prev.events, event],
          ceremonies: [...prev.ceremonies, ceremony],
          estimates,
          activity: [
            ...prev.activity,
            {
              id: uid("act"),
              clientId: input.clientId,
              at: new Date().toISOString(),
              title: "Event created",
              detail: event.name,
              href: `/admin/events/${id}`,
            },
          ],
        };
      });
      return id;
    },
    [persist],
  );

  const offerAssignment = useCallback(
    (eventId: string, readerId: string, role: Assignment["role"], promisedPayCents: number) => {
      const id = uid("asg");
      const event = catalog.events.find((item) => item.id === eventId);
      const reader = catalog.readers.find((item) => item.id === readerId);
      persist((prev) => {
        const trail = appendTrail(
          prev,
          {
            action: "assignment_offered",
            title: "Assignment offered",
            detail: reader?.contractorName,
            eventId,
            clientId: event?.clientId,
            assignmentId: id,
            href: `/admin/assignments/${id}`,
          },
          {
            type: "assignment",
            title: "Assignment offer outstanding",
            message: `${reader?.contractorName ?? "A reader"} was offered an assignment.`,
            severity: "info",
            href: `/admin/assignments/${id}`,
            relatedEntityType: "assignment",
            relatedEntityId: id,
          },
        );
        return {
          ...prev,
          assignments: [
            ...prev.assignments,
            { id, eventId, readerId, role, status: "offered", promisedPayCents },
          ],
          compensation: [
            ...prev.compensation,
            {
              id: uid("pay"),
              assignmentId: id,
              readerId,
              kind: "compensation",
              amountCents: promisedPayCents,
              status: "promised",
            },
          ],
          activity: event
            ? [
                ...prev.activity,
                {
                  id: uid("act"),
                  clientId: event.clientId,
                  at: new Date().toISOString(),
                  title: "Reader offered",
                  href: `/admin/assignments/${id}`,
                },
              ]
            : prev.activity,
          ...trail,
        };
      });
      return id;
    },
    [catalog.events, catalog.readers, persist],
  );

  const acceptAssignment = useCallback(
    (id: string) => {
      persist((prev) => {
        const assignment =
          prev.assignments.find((item) => item.id === id) ??
          seedCatalog.assignments.find((item) => item.id === id);
        const event = assignment
          ? seedCatalog.events.find((item) => item.id === assignment.eventId) ||
            prev.events.find((item) => item.id === assignment.eventId)
          : undefined;
        const reader = assignment
          ? seedCatalog.readers.find((item) => item.id === assignment.readerId)
          : undefined;
        const trail = appendTrail(
          prev,
          {
            action: "assignment_accepted",
            title: "Assignment accepted",
            detail: reader?.contractorName,
            actorName: reader?.contractorName ?? "Reader",
            eventId: assignment?.eventId,
            clientId: event?.clientId,
            assignmentId: id,
            href: `/admin/assignments/${id}`,
          },
          {
            type: "assignment",
            title: "Assignment accepted",
            message: `${reader?.contractorName ?? "A reader"} accepted an assignment.`,
            severity: "info",
            href: `/admin/assignments/${id}`,
            relatedEntityType: "assignment",
            relatedEntityId: id,
          },
        );
        return {
          ...prev,
          assignmentStatus: { ...prev.assignmentStatus, [id]: "accepted" },
          ...trail,
        };
      });
    },
    [persist],
  );

  const acknowledge = useCallback(
    (callSheetId: string, readerId: string, assignmentId: string) => {
      persist((prev) => {
        const reader = seedCatalog.readers.find((item) => item.id === readerId);
        const assignment =
          prev.assignments.find((item) => item.id === assignmentId) ??
          seedCatalog.assignments.find((item) => item.id === assignmentId);
        const event = assignment
          ? seedCatalog.events.find((item) => item.id === assignment.eventId) ||
            prev.events.find((item) => item.id === assignment.eventId)
          : undefined;
        const trail = appendTrail(prev, {
          action: "call_sheet_acknowledged",
          title: "Call Sheet acknowledged",
          detail: reader?.contractorName,
          actorName: reader?.contractorName ?? "Reader",
          eventId: assignment?.eventId,
          clientId: event?.clientId,
          assignmentId,
          href: assignmentId ? `/admin/assignments/${assignmentId}` : undefined,
        });
        return {
          ...prev,
          acknowledgements: [
            ...prev.acknowledgements,
            {
              id: uid("ack"),
              callSheetId,
              readerId,
              assignmentId,
              acceptedAt: new Date().toISOString(),
              method: "click_accept",
            },
          ],
          ...trail,
        };
      });
    },
    [persist],
  );

  const isAcknowledged = useCallback(
    (callSheetId: string, readerId: string, catalogValue: boolean) => {
      if (catalogValue) return true;
      return overlay.acknowledgements.some(
        (item) => item.callSheetId === callSheetId && item.readerId === readerId,
      );
    },
    [overlay.acknowledgements],
  );

  const assignmentStatusFn = useCallback(
    (id: string, catalogValue: string) => overlay.assignmentStatus[id] ?? catalogValue,
    [overlay.assignmentStatus],
  );
  const expenseStatusFn = useCallback(
    (id: string, catalogValue: string) => overlay.expenseStatus[id] ?? catalogValue,
    [overlay.expenseStatus],
  );

  const submitExpense = useCallback(
    (id: string) => {
      persist((prev) => {
        const existing =
          prev.expenseReports.find((item) => item.id === id) ??
          seedCatalog.expenseReports.find((item) => item.id === id);
        const assignment =
          existing &&
          (prev.assignments.find((item) => item.id === existing.assignmentId) ??
            seedCatalog.assignments.find((item) => item.id === existing.assignmentId));
        const event = assignment
          ? seedCatalog.events.find((item) => item.id === assignment.eventId) ||
            prev.events.find((item) => item.id === assignment.eventId)
          : undefined;
        const reader = existing
          ? seedCatalog.readers.find((item) => item.id === existing.readerId)
          : undefined;
        const trail = appendTrail(
          prev,
          {
            action: "expense_submitted",
            title: "Expense submitted",
            detail: reader?.contractorName,
            actorName: reader?.contractorName ?? "Reader",
            eventId: assignment?.eventId,
            clientId: event?.clientId,
            assignmentId: existing?.assignmentId,
            href: `/admin/expenses/${id}`,
          },
          {
            type: "expense",
            title: "Expense awaiting review",
            message: `${reader?.contractorName ?? "A reader"} submitted an expense report.`,
            severity: "warning",
            href: `/admin/expenses/${id}`,
            relatedEntityType: "expense_report",
            relatedEntityId: id,
          },
        );
        return {
          ...prev,
          expenseStatus: { ...prev.expenseStatus, [id]: "submitted" },
          expenseReports: existing
            ? upsert(prev.expenseReports, [
                {
                  ...existing,
                  status: "submitted",
                  submittedAt: existing.submittedAt ?? new Date().toISOString(),
                },
              ])
            : prev.expenseReports,
          ...trail,
        };
      });
    },
    [persist],
  );

  const reviewExpense = useCallback(
    (id: string, status: "approved" | "rejected") => {
      persist((prev) => {
        const existing =
          prev.expenseReports.find((item) => item.id === id) ??
          seedCatalog.expenseReports.find((item) => item.id === id);
        const assignment =
          existing &&
          (prev.assignments.find((item) => item.id === existing.assignmentId) ??
            seedCatalog.assignments.find((item) => item.id === existing.assignmentId));
        const event = assignment
          ? seedCatalog.events.find((item) => item.id === assignment.eventId) ||
            prev.events.find((item) => item.id === assignment.eventId)
          : undefined;
        const trail = appendTrail(prev, {
          action: status === "approved" ? "expense_approved" : "expense_rejected",
          title: status === "approved" ? "Expense approved" : "Expense rejected",
          eventId: assignment?.eventId,
          clientId: event?.clientId,
          assignmentId: existing?.assignmentId,
          href: `/admin/expenses/${id}`,
        });
        return {
          ...prev,
          expenseStatus: { ...prev.expenseStatus, [id]: status },
          expenseReports: existing
            ? upsert(prev.expenseReports, [
                {
                  ...existing,
                  status,
                  reviewedAt: new Date().toISOString(),
                  reviewedByName: "Chester Tadeja",
                },
              ])
            : prev.expenseReports,
          ...trail,
        };
      });
    },
    [persist],
  );

  const addExpenseLine = useCallback(
    (input: {
      reportId?: string;
      assignmentId: string;
      readerId: string;
      category: string;
      amountCents: number;
      incurredOn: string;
      description: string;
      receiptLabel: string;
    }) => {
      const lineId = uid("el");
      persist((prev) => {
        const reports = upsert(seedCatalog.expenseReports, prev.expenseReports);
        let reportId = input.reportId;
        let expenseReports = prev.expenseReports;
        const requestedReport = reportId ? reports.find((item) => item.id === reportId) : undefined;
        const usableReport = requestedReport && (requestedReport.status === "draft" || requestedReport.status === "rejected")
          ? requestedReport
          : undefined;
        if (usableReport) {
          reportId = usableReport.id;
        } else {
          const existingDraft = reports.find(
            (item) =>
              item.assignmentId === input.assignmentId &&
              item.readerId === input.readerId &&
              (item.status === "draft" || item.status === "rejected"),
          );
          if (existingDraft) {
            reportId = existingDraft.id;
          } else {
            reportId = uid("exp");
            expenseReports = [
              ...prev.expenseReports,
              {
                id: reportId,
                assignmentId: input.assignmentId,
                readerId: input.readerId,
                status: "draft",
                notes: "Receipts captured on the assignment.",
              },
            ];
          }
        }
        return {
          ...prev,
          expenseReports,
          expenseLines: [
            ...prev.expenseLines,
            {
              id: lineId,
              expenseReportId: reportId,
              category: input.category,
              amountCents: input.amountCents,
              incurredOn: input.incurredOn,
              description: input.description,
              receiptLabel: input.receiptLabel,
            },
          ],
        };
      });
      return lineId;
    },
    [persist],
  );

  const patchCompensation = useCallback(
    (id: string, patch: Partial<ReaderCompensation>) => {
      persist((prev) => {
        const current =
          prev.compensation.find((item) => item.id === id) ??
          seedCatalog.compensation.find((item) => item.id === id) ??
          ({ ...prev.compensationPatches[id], id } as ReaderCompensation | undefined);
        const merged = { ...(current ?? {}), ...prev.compensationPatches[id], ...patch };
        let action: ActivityLogAction | null = null;
        let title = "Payment updated";
        if (patch.status === "approved") {
          action = "payment_approved";
          title = "Payment approved";
        } else if (patch.status === "paid" || patch.paidOn) {
          action = "payment_marked_paid";
          title = "Payment marked paid";
        } else if (patch.status === "cashed" || patch.cashedOn) {
          action = "payment_marked_cashed";
          title = "Payment marked cashed";
        }
        const trail = action
          ? appendTrail(prev, {
              action,
              title,
              assignmentId: merged.assignmentId,
              href: "/admin/payments",
            })
          : { activityLog: prev.activityLog, notifications: prev.notifications };
        return {
          ...prev,
          compensationPatches: {
            ...prev.compensationPatches,
            [id]: { ...prev.compensationPatches[id], ...patch },
          },
          ...trail,
        };
      });
    },
    [persist],
  );

  const issueCallSheet = useCallback(
    (eventId: string) => {
      const versions = catalog.callSheets.filter((item) => item.eventId === eventId);
      const version = Math.max(0, ...versions.map((item) => item.version)) + 1;
      const id = uid("cs");
      const event = catalog.events.find((item) => item.id === eventId);
      persist((prev) => {
        const supersededSeed = seedCatalog.callSheets
          .filter((item) => item.eventId === eventId && item.status === "issued")
          .map((item) => ({ ...item, status: "superseded" as const }));
        const supersededOverlay = prev.callSheets.map((item) =>
          item.eventId === eventId && item.status === "issued"
            ? { ...item, status: "superseded" as const }
            : item,
        );
        const callSheets = upsert(supersededOverlay, supersededSeed);
        const trail = appendTrail(
          prev,
          {
            action: "call_sheet_issued",
            title: `Call Sheet v${version} issued`,
            eventId,
            clientId: event?.clientId,
            href: `/admin/call-sheets/${id}`,
          },
          {
            type: "call_sheet",
            title: "Call Sheet issued",
            message: `${event?.name ?? "Event"} Call Sheet v${version} was issued to assigned readers.`,
            severity: "info",
            href: `/admin/call-sheets/${id}`,
            relatedEntityType: "call_sheet",
            relatedEntityId: id,
          },
        );
        return {
          ...prev,
          callSheets: [
            ...callSheets,
            {
              id,
              eventId,
              version,
              status: "issued" as const,
              issuedAt: new Date().toISOString(),
              talentSummary: "Issued from operations.",
              perDiemCents: 7500,
              parkingNotes: event?.transferNotes ?? "",
              travelNotes: event?.travelNotes ?? "",
              airfareNotes: event?.airfareNotes ?? "",
              accommodationNotes: event?.accommodationNotes ?? "",
              transferRideshareNotes: event?.transferNotes ?? "",
              contactsSnapshot: "See university record.",
              taskInstructions: "Follow the issued packet.",
              preparationRequirements: "Review university materials in the assignment hub.",
              dressCode: "Black suit, white shirt or blouse, dark shoes.",
              errorRateExpectations: "Names must be correct.",
              expenseRules: "Photograph receipts the same day.",
              confidentialityLegalText:
                "This Call Sheet is confidential and functions as the assignment packet.",
              debriefInstructions: "Complete the in-app debrief within 72 hours.",
            },
          ],
          activity: event
            ? [
                ...prev.activity,
                {
                  id: uid("act"),
                  clientId: event.clientId,
                  at: new Date().toISOString(),
                  title: `Call Sheet v${version} issued`,
                  href: `/admin/call-sheets/${id}`,
                },
              ]
            : prev.activity,
          ...trail,
        };
      });
      return id;
    },
    [catalog.callSheets, catalog.events, persist],
  );

  const addCeremony = useCallback(
    (eventId: string, ceremony: Omit<Ceremony, "id" | "eventId">) => {
      persist((prev) => ({
        ...prev,
        ceremonies: [...prev.ceremonies, { ...ceremony, id: uid("cer"), eventId }],
      }));
    },
    [persist],
  );

  const patchEvent = useCallback(
    (id: string, patch: Partial<EventRecord>) => {
      persist((prev) => {
        const existing =
          prev.events.find((item) => item.id === id) ??
          seedCatalog.events.find((item) => item.id === id);
        const merged = { ...(existing ?? {}), ...prev.eventPatches[id], ...patch };
        const trail =
          patch.status && patch.status !== existing?.status
            ? appendTrail(prev, {
                action: "event_status_changed",
                title: `Event status → ${patch.status}`,
                detail: existing?.name ?? id,
                eventId: id,
                clientId: merged.clientId,
                href: `/admin/events/${id}`,
              })
            : { activityLog: prev.activityLog, notifications: prev.notifications };
        return {
          ...prev,
          eventPatches: { ...prev.eventPatches, [id]: { ...prev.eventPatches[id], ...patch } },
          ...trail,
        };
      });
    },
    [persist],
  );

  const confirmAssignment = useCallback(
    (id: string) => {
      persist((prev) => {
        const assignment = prev.assignments.find((item) => item.id === id) ?? seedCatalog.assignments.find((item) => item.id === id);
        if (!assignment) return prev;
        const event = prev.events.find((item) => item.id === assignment.eventId) ?? seedCatalog.events.find((item) => item.id === assignment.eventId);
        const reader = seedCatalog.readers.find((item) => item.id === assignment.readerId);
        const trail = appendTrail(prev, { action: "assignment_status_changed", title: "Assignment confirmed", detail: reader?.contractorName, eventId: assignment.eventId, clientId: event?.clientId, assignmentId: id, href: `/admin/assignments/${id}` });
        return { ...prev, assignmentStatus: { ...prev.assignmentStatus, [id]: "assigned" }, ...trail };
      });
    },
    [persist],
  );

  const setAssignmentStatus = useCallback(
    (id: string, status: AssignmentStatus) => {
      persist((prev) => {
        const assignment =
          prev.assignments.find((item) => item.id === id) ??
          seedCatalog.assignments.find((item) => item.id === id);
        const event = assignment
          ? seedCatalog.events.find((item) => item.id === assignment.eventId) ||
            prev.events.find((item) => item.id === assignment.eventId)
          : undefined;
        const action: ActivityLogAction =
          status === "declined"
            ? "assignment_declined"
            : status === "released_to_pool"
              ? "assignment_released"
              : "assignment_status_changed";
        const trail = appendTrail(prev, {
          action,
          title: `Assignment → ${status}`,
          eventId: assignment?.eventId,
          clientId: event?.clientId,
          assignmentId: id,
          href: `/admin/assignments/${id}`,
        });
        return {
          ...prev,
          assignmentStatus: { ...prev.assignmentStatus, [id]: status },
          ...trail,
        };
      });
    },
    [persist],
  );

  const prepareAssignmentNotice = useCallback(
    (assignmentId: string) => {
      persist((prev) => {
        const assignment = prev.assignments.find((item) => item.id === assignmentId) ?? seedCatalog.assignments.find((item) => item.id === assignmentId);
        const event = assignment ? (prev.events.find((item) => item.id === assignment.eventId) ?? seedCatalog.events.find((item) => item.id === assignment.eventId)) : undefined;
        const reader = assignment ? seedCatalog.readers.find((item) => item.id === assignment.readerId) : undefined;
        const trail = appendTrail(prev, { action: "assignment_status_changed", title: "Assignment notice prepared", detail: reader?.contractorName, eventId: assignment?.eventId, clientId: event?.clientId, assignmentId, href: `/admin/assignments/${assignmentId}` }, { type: "assignment", title: "Assignment notice ready", message: `${reader?.contractorName ?? "Reader"} notification is prepared for the usual email send.`, severity: "info", href: `/admin/assignments/${assignmentId}`, relatedEntityType: "assignment", relatedEntityId: assignmentId });
        return { ...prev, assignmentNotices: { ...prev.assignmentNotices, [assignmentId]: { preparedAt: new Date().toISOString(), status: "prepared" } }, ...trail };
      });
    },
    [persist],
  );

  const assignmentNotice = useCallback(
    (assignmentId: string) => overlay.assignmentNotices?.[assignmentId],
    [overlay.assignmentNotices],
  );

  const addWorkspaceDocument = useCallback(
    (input: { filename: string; category: WorkspaceDocumentCategory; note: string }) => {
      const id = uid("wdoc");
      persist((prev) => ({
        ...prev,
        workspaceDocuments: [
          ...(prev.workspaceDocuments ?? []),
          {
            id,
            filename: input.filename.trim(),
            category: input.category,
            note: input.note.trim(),
            recordedAt: new Date().toISOString(),
          },
        ],
      }));
      return id;
    },
    [persist],
  );

  const addUniversityNote = useCallback(
    (clientId: string, body: string) => {
      const id = uid("on");
      persist((prev) => ({
        ...prev,
        notes: [
          ...prev.notes,
          {
            id,
            clientId,
            authorName: "Chester Tadeja",
            visibility: "admin_only",
            body,
            createdAt: new Date().toISOString(),
          },
        ],
        activity: [
          ...prev.activity,
          {
            id: uid("act"),
            clientId,
            at: new Date().toISOString(),
            title: "Internal note added",
            detail: "Admin-only operational note.",
            href: `/admin/clients/${clientId}`,
          },
        ],
      }));
      return id;
    },
    [persist],
  );

  const submitDebrief = useCallback(
    (input: Omit<Debrief, "id" | "submittedAt">) => {
      const id = uid("deb");
      persist((prev) => ({
        ...prev,
        debriefs: [
          ...prev.debriefs,
          { ...input, id, submittedAt: new Date().toISOString() },
        ],
        activity: [
          ...prev.activity,
          {
            id: uid("act"),
            clientId:
              catalog.events.find((item) => item.id === input.eventId)?.clientId ?? "",
            at: new Date().toISOString(),
            title: "Debrief completed",
            href: "/admin/debriefs",
          },
        ],
      }));
      return id;
    },
    [catalog.events, persist],
  );

  const createTask = useCallback(
    (input: Omit<Task, "id" | "createdAt" | "completedAt">) => {
      const id = uid("task");
      const createdAt = new Date().toISOString();
      persist((prev) => {
        const trail = appendTrail(
          prev,
          {
            action: "task_status_changed",
            title: "Task created",
            detail: input.title,
            eventId: input.eventId,
            clientId: input.clientId,
            href: input.eventId ? `/admin/events/${input.eventId}` : "/admin",
          },
          {
            type: "task",
            title: "New task",
            message: input.title,
            severity: input.priority === "high" ? "high" : "info",
            href: input.eventId ? `/admin/events/${input.eventId}` : "/admin",
            relatedEntityType: "task",
            relatedEntityId: id,
          },
        );
        return { ...prev, tasks: [...prev.tasks, { ...input, id, createdAt }], ...trail };
      });
      return id;
    },
    [persist],
  );

  const addFlight = useCallback(
    (input: Omit<Flight, "id">) => {
      const id = uid("flt");
      persist((prev) => {
        const event = catalog.events.find((item) => item.id === input.eventId);
        const trail = appendTrail(prev, {
          action: "travel_recorded",
          title: "Flight recorded",
          detail: `${input.airline}${input.flightNumber ? ` ${input.flightNumber}` : ""}`,
          eventId: input.eventId,
          clientId: event?.clientId,
          href: `/admin/events/${input.eventId}`,
        });
        return { ...prev, flights: [...prev.flights, { ...input, id }], ...trail };
      });
      return id;
    },
    [catalog.events, persist],
  );

  const addHotelStay = useCallback(
    (input: Omit<HotelStay, "id">) => {
      const id = uid("hotel");
      persist((prev) => {
        const event = catalog.events.find((item) => item.id === input.eventId);
        const trail = appendTrail(prev, {
          action: "travel_recorded",
          title: "Hotel stay recorded",
          detail: input.propertyName,
          eventId: input.eventId,
          clientId: event?.clientId,
          href: `/admin/events/${input.eventId}`,
        });
        return { ...prev, hotelStays: [...prev.hotelStays, { ...input, id }], ...trail };
      });
      return id;
    },
    [catalog.events, persist],
  );

  const addGroundTransfer = useCallback(
    (input: Omit<GroundTransfer, "id">) => {
      const id = uid("trf");
      persist((prev) => {
        const event = catalog.events.find((item) => item.id === input.eventId);
        const trail = appendTrail(prev, {
          action: "travel_recorded",
          title: "Ground transfer recorded",
          detail: input.provider || input.notes,
          eventId: input.eventId,
          clientId: event?.clientId,
          href: `/admin/events/${input.eventId}`,
        });
        return { ...prev, groundTransfers: [...prev.groundTransfers, { ...input, id }], ...trail };
      });
      return id;
    },
    [catalog.events, persist],
  );

  const addEventDocument = useCallback(
    (input: Omit<EventDocument, "id" | "uploadedAt">) => {
      const id = uid("doc");
      persist((prev) => {
        const event = catalog.events.find((item) => item.id === input.eventId);
        const trail = appendTrail(
          prev,
          {
            action: "document_uploaded",
            title: "Event document uploaded",
            detail: input.originalFilename,
            eventId: input.eventId,
            clientId: event?.clientId,
            href: `/admin/events/${input.eventId}`,
          },
          {
            type: "event",
            title: "Event document added",
            message: input.originalFilename,
            severity: "info",
            href: `/admin/events/${input.eventId}`,
            relatedEntityType: "event_document",
            relatedEntityId: id,
          },
        );
        return {
          ...prev,
          eventDocuments: [...prev.eventDocuments, { ...input, id, uploadedAt: new Date().toISOString() }],
          ...trail,
        };
      });
      return id;
    },
    [catalog.events, persist],
  );

  const patchFlight = useCallback(
    (id: string, patch: Partial<Flight>) =>
      persist((prev) => ({ ...prev, flights: upsert(prev.flights, [{ ...(prev.flights.find((item) => item.id === id) ?? seedCatalog.flights.find((item) => item.id === id)!), ...patch }]) })),
    [persist],
  );

  const patchHotelStay = useCallback(
    (id: string, patch: Partial<HotelStay>) =>
      persist((prev) => ({ ...prev, hotelStays: upsert(prev.hotelStays, [{ ...(prev.hotelStays.find((item) => item.id === id) ?? seedCatalog.hotelStays.find((item) => item.id === id)!), ...patch }]) })),
    [persist],
  );

  const patchGroundTransfer = useCallback(
    (id: string, patch: Partial<GroundTransfer>) =>
      persist((prev) => ({ ...prev, groundTransfers: upsert(prev.groundTransfers, [{ ...(prev.groundTransfers.find((item) => item.id === id) ?? seedCatalog.groundTransfers.find((item) => item.id === id)!), ...patch }]) })),
    [persist],
  );

  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      persist((prev) => {
        const existing =
          prev.tasks.find((item) => item.id === id) ??
          seedCatalog.tasks.find((item) => item.id === id);
        if (!existing) return prev;
        const completedAt = status === "done" ? new Date().toISOString() : undefined;
        const nextTask: Task = {
          ...existing,
          status,
          completedAt: status === "done" ? completedAt : undefined,
        };
        const trail = appendTrail(
          prev,
          {
            action: status === "done" ? "task_completed" : "task_status_changed",
            title: status === "done" ? "Task completed" : `Task → ${status}`,
            detail: existing.title,
            eventId: existing.eventId,
            clientId: existing.clientId,
            href: existing.eventId ? `/admin/events/${existing.eventId}` : "/admin",
          },
          status === "done"
            ? {
                type: "task",
                title: "Task completed",
                message: existing.title,
                severity: "info",
                href: existing.eventId ? `/admin/events/${existing.eventId}` : "/admin",
                relatedEntityType: "task",
                relatedEntityId: id,
              }
            : undefined,
        );
        return {
          ...prev,
          tasks: upsert(prev.tasks, [nextTask]),
          ...trail,
        };
      });
    },
    [persist],
  );

  const addAvailabilityBlock = useCallback(
    (input: Omit<AvailabilityBlock, "id">) => {
      const id = uid("av");
      persist((prev) => {
        const reader = seedCatalog.readers.find((item) => item.id === input.readerId);
        const trail = appendTrail(prev, {
          action: "availability_changed",
          title: `${input.kind === "available" ? "Availability added" : "Unavailable block added"}`,
          detail: `${reader?.contractorName ?? "Reader"} · ${input.startsAt.slice(0, 10)}`,
        });
        return { ...prev, availability: [...prev.availability, { ...input, id }], ...trail };
      });
      return id;
    },
    [persist],
  );

  const removeAvailabilityBlock = useCallback(
    (id: string) => {
      persist((prev) => {
        const existing = prev.availability.find((item) => item.id === id) ?? seedCatalog.availability.find((item) => item.id === id);
        if (!existing) return prev;
        const trail = appendTrail(prev, { action: "availability_changed", title: "Availability block removed", detail: existing.notes });
        return { ...prev, availability: prev.availability.filter((item) => item.id !== id), removedAvailabilityIds: [...new Set([...prev.removedAvailabilityIds, id])], ...trail };
      });
    },
    [persist],
  );

  const addPersonalTimeBlock = useCallback(
    (input: Omit<PersonalTimeBlock, "id">) => {
      const id = uid("personal");
      persist((prev) => {
        const trail = appendTrail(prev, { action: "personal_block_added", title: "Personal calendar block added", detail: input.title });
        return { ...prev, personalBlocks: [...prev.personalBlocks, { ...input, id }], ...trail };
      });
      return id;
    },
    [persist],
  );

  const removePersonalTimeBlock = useCallback(
    (id: string) => {
      persist((prev) => {
        const existing = prev.personalBlocks.find((item) => item.id === id) ?? seedCatalog.personalBlocks.find((item) => item.id === id);
        if (!existing) return prev;
        const trail = appendTrail(prev, { action: "personal_block_added", title: "Personal calendar block removed", detail: existing.title });
        return { ...prev, personalBlocks: prev.personalBlocks.filter((item) => item.id !== id), removedPersonalBlockIds: [...new Set([...prev.removedPersonalBlockIds, id])], ...trail };
      });
    },
    [persist],
  );

  const addCalendarNote = useCallback(
    (input: Omit<CalendarNote, "id">) => {
      const id = uid("calnote");
      persist((prev) => {
        const trail = appendTrail(prev, { action: "calendar_note_added", title: "Calendar note added", detail: input.note, eventId: input.eventId });
        return { ...prev, calendarNotes: [...prev.calendarNotes, { ...input, id }], ...trail };
      });
      return id;
    },
    [persist],
  );

  const createInvoice = useCallback(
    (input: Omit<Invoice, "id">) => {
      const id = uid("inv");
      persist((prev) => {
        const event = input.eventId
          ? prev.events.find((item) => item.id === input.eventId) ??
            seedCatalog.events.find((item) => item.id === input.eventId)
          : undefined;
        const trail = appendTrail(
          prev,
          {
            action: "invoice_updated",
            title: "Invoice draft created",
            detail: `${input.amountCents / 100}`,
            eventId: input.eventId,
            clientId: input.clientId,
            href: input.eventId ? `/admin/events/${input.eventId}` : "/admin/financial",
          },
          {
            type: "payment",
            title: "Invoice draft created",
            message: `${event?.name ?? "University invoice"} now has a tracking invoice draft.`,
            severity: "info",
            href: input.eventId ? `/admin/events/${input.eventId}` : "/admin/financial",
            relatedEntityType: "invoice",
            relatedEntityId: id,
          },
        );
        return { ...prev, invoices: [...prev.invoices, { ...input, id }], ...trail };
      });
      return id;
    },
    [persist],
  );

  const patchInvoice = useCallback(
    (id: string, patch: Partial<Invoice>) => {
      persist((prev) => {
        const current = prev.invoices.find((item) => item.id === id) ?? seedCatalog.invoices.find((item) => item.id === id);
        if (!current) return prev;
        const merged = { ...current, ...patch };
        const event = merged.eventId ? (prev.events.find((item) => item.id === merged.eventId) ?? seedCatalog.events.find((item) => item.id === merged.eventId)) : undefined;
        const trail = appendTrail(prev, {
          action: "invoice_updated",
          title: `Invoice ${merged.status}`,
          detail: `${merged.amountCents / 100}` ,
          eventId: merged.eventId,
          clientId: merged.clientId,
          href: merged.eventId ? `/admin/events/${merged.eventId}` : "/admin/financial",
        }, {
          type: "payment",
          title: `Invoice ${merged.status}`,
          message: `${event?.name ?? "University invoice"} is now ${merged.status}.`,
          severity: merged.status === "paid" ? "info" : "warning",
          href: merged.eventId ? `/admin/events/${merged.eventId}` : "/admin/financial",
          relatedEntityType: "invoice",
          relatedEntityId: id,
        });
        return { ...prev, invoices: upsert(prev.invoices, [merged]), ...trail };
      });
    },
    [persist],
  );

  const recordUniversityPayment = useCallback(
    (input: Omit<UniversityPayment, "id">) => {
      const id = uid("upay");
      persist((prev) => {
        const invoice = prev.invoices.find((item) => item.id === input.invoiceId) ?? seedCatalog.invoices.find((item) => item.id === input.invoiceId);
        if (!invoice) return prev;
        const existingPayments = upsert(seedCatalog.universityPayments, prev.universityPayments).filter((item) => item.invoiceId === input.invoiceId);
        const paidTotal = existingPayments.reduce((sum, item) => sum + item.amountCents, 0) + input.amountCents;
        const nextStatus = paidTotal >= invoice.amountCents ? "paid" : "due";
        const nextInvoice = { ...invoice, status: nextStatus as Invoice["status"], paidOn: nextStatus === "paid" ? input.paidOn : invoice.paidOn };
        const event = invoice.eventId ? (prev.events.find((item) => item.id === invoice.eventId) ?? seedCatalog.events.find((item) => item.id === invoice.eventId)) : undefined;
        const trail = appendTrail(prev, {
          action: "university_payment_recorded",
          title: "University payment recorded",
          detail: `${input.amountCents / 100}` ,
          eventId: invoice.eventId,
          clientId: invoice.clientId,
          href: "/admin/financial",
        }, {
          type: "payment",
          title: "University payment recorded",
          message: `${event?.name ?? "University invoice"} received a tracked payment.`,
          severity: "info",
          href: "/admin/financial",
          relatedEntityType: "invoice",
          relatedEntityId: input.invoiceId,
        });
        return {
          ...prev,
          universityPayments: [...prev.universityPayments, { ...input, id }],
          invoices: upsert(prev.invoices, [nextInvoice]),
          ...trail,
        };
      });
      return id;
    },
    [persist],
  );

  const setNotificationPreference = useCallback(
    (key: NotificationPreferenceKey, enabled: boolean) => {
      persist((prev) => ({
        ...prev,
        notificationPreferences: { ...prev.notificationPreferences, [key]: enabled },
      }));
    },
    [persist],
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      persist((prev) => {
        const existing =
          prev.notifications.find((item) => item.id === id) ??
          seedCatalog.notifications.find((item) => item.id === id);
        if (!existing || existing.readAt) return prev;
        const readAt = new Date().toISOString();
        const trail = appendTrail(prev, {
          action: "notification_read",
          title: "Notification marked read",
          detail: existing.title,
        });
        return {
          ...prev,
          notifications: upsert(prev.notifications, [{ ...existing, readAt }]),
          activityLog: trail.activityLog,
        };
      });
    },
    [persist],
  );

  const markAllNotificationsRead = useCallback(() => {
    persist((prev) => {
      const readAt = new Date().toISOString();
      const merged = upsert(seedCatalog.notifications, prev.notifications).map((item) =>
        item.readAt ? item : { ...item, readAt },
      );
      return {
        ...prev,
        notifications: merged,
      };
    });
  }, [persist]);

  const reset = useCallback(() => {
    clearPersistedRaw();
    persist(blankOverlay());
    try {
      sessionStorage.removeItem("vti-demo-reader");
    } catch {
      /* private mode */
    }
  }, [persist]);

  const hasOverrides =
    overlay.clients.length +
      overlay.contacts.length +
      overlay.inquiries.length +
      overlay.events.length +
      overlay.ceremonies.length +
      overlay.assignments.length +
      overlay.callSheets.length +
      overlay.acknowledgements.length +
      overlay.insurance.length +
      overlay.expenseReports.length +
      overlay.expenseLines.length +
      overlay.debriefs.length +
      (overlay.compensation?.length ?? 0) +
      overlay.profiles.length +
      overlay.activity.length +
      Object.keys(overlay.assignmentStatus).length +
      Object.keys(overlay.expenseStatus).length +
      Object.keys(overlay.compensationPatches).length +
      Object.keys(overlay.clientPatches).length +
      Object.keys(overlay.eventPatches).length +
      Object.keys(overlay.assignmentNotices ?? {}).length +
      (overlay.notes?.length ?? 0) +
      (overlay.workspaceDocuments?.length ?? 0) +
      (overlay.tasks?.length ?? 0) +
      (overlay.notifications?.length ?? 0) +
      (overlay.activityLog?.length ?? 0) +
      (overlay.availability?.length ?? 0) +
      (overlay.personalBlocks?.length ?? 0) +
      (overlay.calendarNotes?.length ?? 0) +
      (overlay.invoices?.length ?? 0) +
      (overlay.universityPayments?.length ?? 0) +
      (overlay.removedAvailabilityIds?.length ?? 0) +
      (overlay.removedPersonalBlockIds?.length ?? 0) +
      (overlay.removedCalendarNoteIds?.length ?? 0) >
    0;

  const value = useMemo<OperationsContextValue>(
    () => ({
      catalog,
      queries,
      profiles,
      activity,
      profileFor,
      activityFor,
      search,
      createUniversity,
      completeOnboarding,
      patchClient,
      addContact,
      createInquiry,
      setInquiryStage,
      createEvent,
      offerAssignment,
      acceptAssignment,
      acknowledge,
      isAcknowledged,
      assignmentStatus: assignmentStatusFn,
      expenseStatus: expenseStatusFn,
      submitExpense,
      reviewExpense,
      addExpenseLine,
      patchCompensation,
      issueCallSheet,
      addActivity,
      addCeremony,
      patchEvent,
      confirmAssignment,
      setAssignmentStatus,
      prepareAssignmentNotice,
      assignmentNotice,
      addUniversityNote,
      addWorkspaceDocument,
      workspaceDocuments: overlay.workspaceDocuments ?? [],
      submitDebrief,
      setTaskStatus,
      createTask,
      createInvoice,
      addFlight,
      addHotelStay,
      addGroundTransfer,
      addEventDocument,
      patchFlight,
      patchHotelStay,
      patchGroundTransfer,
      addAvailabilityBlock,
      removeAvailabilityBlock,
      addPersonalTimeBlock,
      removePersonalTimeBlock,
      addCalendarNote,
      patchInvoice,
      recordUniversityPayment,
      notificationPreferences: overlay.notificationPreferences,
      setNotificationPreference,
      markNotificationRead,
      markAllNotificationsRead,
      reset,
      hasOverrides,
      ready,
    }),
    [
      catalog,
      queries,
      profiles,
      activity,
      profileFor,
      activityFor,
      search,
      createUniversity,
      completeOnboarding,
      patchClient,
      addContact,
      createInquiry,
      setInquiryStage,
      createEvent,
      offerAssignment,
      acceptAssignment,
      acknowledge,
      isAcknowledged,
      assignmentStatusFn,
      expenseStatusFn,
      submitExpense,
      reviewExpense,
      addExpenseLine,
      patchCompensation,
      issueCallSheet,
      addActivity,
      addCeremony,
      patchEvent,
      confirmAssignment,
      setAssignmentStatus,
      prepareAssignmentNotice,
      assignmentNotice,
      addUniversityNote,
      addWorkspaceDocument,
      overlay.workspaceDocuments,
      submitDebrief,
      setTaskStatus,
      createTask,
      createInvoice,
      addFlight,
      addHotelStay,
      addGroundTransfer,
      addEventDocument,
      patchFlight,
      patchHotelStay,
      patchGroundTransfer,
      addAvailabilityBlock,
      removeAvailabilityBlock,
      addPersonalTimeBlock,
      removePersonalTimeBlock,
      addCalendarNote,
      patchInvoice,
      recordUniversityPayment,
      overlay.notificationPreferences,
      setNotificationPreference,
      markNotificationRead,
      markAllNotificationsRead,
      reset,
      hasOverrides,
      ready,
    ],
  );

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error("useOperations must be used inside OperationsProvider");
  return value;
}

export function useLiveQueries() {
  return useOperations().queries;
}

export { INQUIRY_STAGE_ORDER };
