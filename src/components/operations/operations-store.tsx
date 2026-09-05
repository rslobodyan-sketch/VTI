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
import type {
  Assignment,
  AssignmentStatus,
  CallSheet,
  CallSheetAcknowledgement,
  Catalog,
  Ceremony,
  Client,
  ClientContact,
  EventRecord,
  ExpenseLine,
  ExpenseReport,
  ExpenseStatus,
  Inquiry,
  InquiryStage,
  InsuranceRequirement,
  Debrief,
  OperationalNote,
  ReaderCompensation,
  WorkspaceDocument,
  WorkspaceDocumentCategory,
} from "@/types/domain";
import type {
  ActivityItem,
  SearchHit,
  UniversityProfile,
} from "@/types/operations";
import { INQUIRY_STAGE_ORDER } from "@/types/operations";

const STORAGE_KEY = "vti-operations-overlay";
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
  };
}

function readStoredOverlayRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeOverlay(next: Overlay) {
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* quota */
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* quota / private mode */
  }
}

function loadOverlay(): Overlay {
  if (typeof window === "undefined") return blankOverlay();
  try {
    const raw = readStoredOverlayRaw();
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
      if (event.key === STORAGE_KEY || event.key === null) {
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
        return {
          ...prev,
          inquiries,
          events: [...prev.events, event],
          ceremonies: [...prev.ceremonies, ceremony],
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
      persist((prev) => ({
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
      }));
      return id;
    },
    [catalog.events, persist],
  );

  const acceptAssignment = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        assignmentStatus: { ...prev.assignmentStatus, [id]: "accepted" },
      }));
    },
    [persist],
  );

  const acknowledge = useCallback(
    (callSheetId: string, readerId: string, assignmentId: string) => {
      persist((prev) => ({
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
      }));
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
        if (!reportId) {
          const existing = reports.find(
            (item) =>
              item.assignmentId === input.assignmentId && item.readerId === input.readerId,
          );
          if (existing) {
            reportId = existing.id;
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
      persist((prev) => ({
        ...prev,
        compensationPatches: {
          ...prev.compensationPatches,
          [id]: { ...prev.compensationPatches[id], ...patch },
        },
      }));
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
      persist((prev) => ({
        ...prev,
        eventPatches: { ...prev.eventPatches, [id]: { ...prev.eventPatches[id], ...patch } },
      }));
    },
    [persist],
  );

  const confirmAssignment = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        assignmentStatus: { ...prev.assignmentStatus, [id]: "assigned" },
      }));
    },
    [persist],
  );

  const setAssignmentStatus = useCallback(
    (id: string, status: AssignmentStatus) => {
      persist((prev) => ({
        ...prev,
        assignmentStatus: { ...prev.assignmentStatus, [id]: status },
      }));
    },
    [persist],
  );

  const prepareAssignmentNotice = useCallback(
    (assignmentId: string) => {
      persist((prev) => ({
        ...prev,
        assignmentNotices: {
          ...prev.assignmentNotices,
          [assignmentId]: { preparedAt: new Date().toISOString(), status: "prepared" },
        },
      }));
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

  const reset = useCallback(() => {
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
      (overlay.workspaceDocuments?.length ?? 0) >
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
