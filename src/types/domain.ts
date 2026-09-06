export type UserRole = "VTI_ADMIN" | "READER";

export type InquiryStage =
  | "initial_inquiry"
  | "needs_conversation"
  | "pending_admin_approval"
  | "coordinator_logistics"
  | "closed_won"
  | "closed_lost";

export type EventStatus = "tentative" | "confirmed" | "postponed" | "cancelled";

export type CeremonyKind =
  | "commencement"
  | "related_group"
  | "team_dinner"
  | "function";

export type AssignmentRole = "lead" | "reader" | "shadow";

export type AssignmentStatus =
  | "offered"
  | "accepted"
  | "declined"
  | "assigned"
  | "released_to_pool"
  | "completed";

export type CallSheetStatus = "draft" | "issued" | "superseded";

export type ExpenseStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "reimbursed";

export type CompensationStatus =
  | "promised"
  | "pending_approval"
  | "approved"
  | "queued"
  | "paid"
  | "cashed"
  | "void";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "due"
  | "reminded"
  | "paid"
  | "void";

export type EstimateStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "converted"
  | "void";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "ready"
  | "blocked";

export type DocumentStatus = "valid" | "expiring" | "expired" | "missing";

export type InsuranceStatus =
  | "not_started"
  | "submitted"
  | "accepted"
  | "change_needed";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  isActive: boolean;
};

export type ReaderProfile = {
  id: string;
  userId: string;
  contractorName: string;
  legalName: string;
  compensationCategory: string;
  businessType: string;
  taxIdType: "EIN" | "SSN";
  taxIdMasked: string;
  primaryPhone: string;
  email: string;
  shirtSize: string;
  airlinePreference: string;
  seatPreference: string;
  soundNotes: string;
  geographyNotes: string;
  veteranStatus: boolean;
  firstChoiceEligible: boolean;
  leadershipAssessment?: string;
  workStylePreference?: string;
  dietaryRestrictions?: string;
  pronounOrNickname?: string;
  onboardingStatus: OnboardingStatus;
  ndaSigned: boolean;
  ndaSignedAt?: string;
  notes: string;
};

export type ReaderAddress = {
  id: string;
  readerId: string;
  kind: "primary" | "secondary" | "previous";
  line1: string;
  city: string;
  region: string;
  postalCode: string;
};

export type EmergencyContact = {
  id: string;
  readerId: string;
  name: string;
  relationship: string;
  phone: string;
};

export type Client = {
  id: string;
  name: string;
  kind: "university";
  status: "prospect" | "active" | "inactive";
  isReturning: boolean;
  calendarColor: string;
  notes: string;
};

export type ClientContact = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  roleTitle: string;
  isPrimary: boolean;
  preferredContactMethod?: string;
  notes?: string;
};

export type Inquiry = {
  id: string;
  clientId: string;
  source: string;
  contactName: string;
  email: string;
  universityName: string;
  department: string;
  stage: InquiryStage;
  returningInterest?: "interested" | "committed";
  notes: string;
  nextAction: string;
  nextActionAt?: string;
  ownerName?: string;
  eventType?: string;
  expectedEventDate?: string;
  estimatedReaderCount?: number;
  estimatedValueCents?: number;
  lastActivityAt?: string;
};

export type EventRecord = {
  id: string;
  clientId: string;
  name: string;
  status: EventStatus;
  tentativeReason?: string;
  estimatedGraduateCount: number;
  priorYearGraduateCount?: number;
  quoteAmountCents: number;
  priorYearQuoteAmountCents?: number;
  workAgainRecommendation?: boolean;
  eventReady: boolean;
  notes: string;
  travelNotes: string;
  airfareNotes: string;
  airfarePaidCents?: number;
  creditsRefundsCents?: number;
  accommodationNotes: string;
  hotelEstimateCents?: number;
  transferNotes: string;
};

export type Ceremony = {
  id: string;
  eventId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  venueName: string;
  venueAddress: string;
  estimatedNames?: number;
  soundCheckAt?: string;
  callTime?: string;
  kind: CeremonyKind;
};

export type Assignment = {
  id: string;
  eventId: string;
  readerId: string;
  role: AssignmentRole;
  status: AssignmentStatus;
  logisticsStatus?: string;
  promisedPayCents: number;
  priorYearPayCents?: number;
};

export type CallSheet = {
  id: string;
  eventId: string;
  version: number;
  status: CallSheetStatus;
  issuedAt?: string;
  talentSummary: string;
  perDiemCents: number;
  parkingNotes: string;
  travelNotes: string;
  airfareNotes: string;
  airfarePaidCents?: number;
  creditsRefundsCents?: number;
  accommodationNotes: string;
  hotelEstimateCents?: number;
  transferRideshareNotes: string;
  contactsSnapshot: string;
  taskInstructions: string;
  preparationRequirements: string;
  dressCode: string;
  errorRateExpectations: string;
  expenseRules: string;
  confidentialityLegalText: string;
  debriefInstructions: string;
};

export type CallSheetAcknowledgement = {
  id: string;
  callSheetId: string;
  readerId: string;
  assignmentId: string;
  acceptedAt: string;
  method: "click_accept";
};

export type TravelPaidBy = "vti" | "reader" | "university" | "unknown";

export type TravelConfirmationStatus = "confirmed" | "pending" | "missing" | "not_required";

/** Structured flight replacing airfare prose where seeded. */
export type Flight = {
  id: string;
  eventId: string;
  readerId?: string;
  airline: string;
  flightNumber?: string;
  departsAt: string;
  arrivesAt: string;
  paidBy: TravelPaidBy;
  amountCents?: number;
  status: TravelConfirmationStatus;
  confirmation?: string;
  notes?: string;
};

export type HotelStay = {
  id: string;
  eventId: string;
  readerId?: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  roomCount?: number;
  estimateCents?: number;
  status: TravelConfirmationStatus;
  confirmation?: string;
  notes?: string;
};

export type GroundTransfer = {
  id: string;
  eventId: string;
  readerId?: string;
  provider?: string;
  notes: string;
  estimateCents?: number;
  status: TravelConfirmationStatus;
};

export type ReadinessLevel = "ready" | "attention" | "missing";

export type EventReadinessAreaKey =
  | "staffing"
  | "travel"
  | "call_sheet"
  | "documents"
  | "financial"
  | "tasks";

export type EventReadinessArea = {
  key: EventReadinessAreaKey;
  label: string;
  level: ReadinessLevel;
  summary: string;
};

/** Overlay-only. Email is not connected — this records that a notice was prepared. */
export type AssignmentNotice = {
  assignmentId: string;
  preparedAt: string;
  status: "prepared";
};

export type EventDocument = {
  id: string;
  eventId: string;
  ceremonyId?: string;
  kind: "university_instruction" | "name_list" | "other";
  originalFilename: string;
  statusNote: string;
  visibleToAssignedReaders: boolean;
  fileKey?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
};

export type ReaderDocument = {
  id: string;
  readerId: string;
  kind: "drivers_license" | "passport" | "nda" | "other";
  expiresOn?: string;
  status: DocumentStatus;
};

export type AvailabilityBlock = {
  id: string;
  readerId: string;
  startsAt: string;
  endsAt: string;
  kind: "available" | "unavailable";
  notes: string;
  source: "admin_entered";
};

export type PersonalTimeBlock = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  notes: string;
  showOnOperationalCalendar: boolean;
};

export type CalendarNote = {
  id: string;
  eventId: string;
  note: string;
  pinnedToCalendar: boolean;
};

export type InsuranceRequirement = {
  id: string;
  clientId: string;
  year: number;
  status: InsuranceStatus;
  dueOn: string;
  notes: string;
};

export type Estimate = {
  id: string;
  clientId: string;
  eventId?: string;
  amountCents: number;
  status: EstimateStatus;
  issuedOn?: string;
  notes: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  eventId?: string;
  estimateId?: string;
  amountCents: number;
  status: InvoiceStatus;
  billedOn?: string;
  dueOn?: string;
  lastRemindedOn?: string;
  paidOn?: string;
};

export type UniversityPayment = {
  id: string;
  invoiceId: string;
  amountCents: number;
  paidOn: string;
  method: string;
};

export type ReaderCompensation = {
  id: string;
  assignmentId: string;
  readerId: string;
  kind: "compensation" | "reimbursement";
  amountCents: number;
  status: CompensationStatus;
  approvedByName?: string;
  approvedAt?: string;
  paidOn?: string;
  cashedOn?: string;
  /** Tracking-only check / reference number. Not a bank confirmation. */
  checkNumber?: string;
};

export type ExpenseReport = {
  id: string;
  assignmentId: string;
  readerId: string;
  status: ExpenseStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedByName?: string;
  notes: string;
};

export type ExpenseLine = {
  id: string;
  expenseReportId: string;
  category: string;
  amountCents: number;
  incurredOn: string;
  description: string;
  receiptLabel?: string;
};

export type Debrief = {
  id: string;
  assignmentId: string;
  eventId: string;
  readerId: string;
  thoughtsAboutEvent: string;
  thoughtsAboutOtherReaders: string;
  interactionWithUniversityStaff: string;
  problemsOrConflicts: string;
  planVersusExecution: string;
  ratingEvent: number;
  ratingStaff: number;
  ratingOperations: number;
  submittedAt: string;
};

export type OperationalNote = {
  id: string;
  clientId?: string;
  eventId?: string;
  assignmentId?: string;
  authorName: string;
  visibility: "admin_only" | "admin_and_assigned_readers";
  body: string;
  createdAt: string;
};

/** Filename-only workspace record. Bytes are not stored. */
export type WorkspaceDocumentCategory = "rate_sheet" | "operational" | "other";

export type WorkspaceDocument = {
  id: string;
  filename: string;
  category: WorkspaceDocumentCategory;
  note: string;
  recordedAt: string;
};

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled" | "snoozed";

export type TaskPriority = "low" | "medium" | "high";

/** Operational work item for Chester (MVP Command Center precursor). */
export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  eventId?: string;
  clientId?: string;
  assigneeName: string;
  createdAt: string;
  completedAt?: string;
};

export type AppNotificationSeverity = "info" | "warning" | "high";

export type AppNotificationType =
  | "assignment"
  | "call_sheet"
  | "expense"
  | "payment"
  | "task"
  | "event"
  | "general";

/** Durable in-app notification. Not email/SMS. */
export type AppNotification = {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
  severity: AppNotificationSeverity;
  href?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};


export type NotificationPreferenceKey =
  | "call_sheet_ack"
  | "assignment_offers"
  | "expenses"
  | "insurance"
  | "payments"
  | "tasks";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export type ActivityLogAction =
  | "assignment_offered"
  | "assignment_accepted"
  | "assignment_declined"
  | "assignment_released"
  | "assignment_status_changed"
  | "call_sheet_issued"
  | "call_sheet_acknowledged"
  | "expense_submitted"
  | "expense_approved"
  | "expense_rejected"
  | "payment_approved"
  | "payment_marked_paid"
  | "payment_marked_cashed"
  | "task_completed"
  | "task_status_changed"
  | "travel_recorded"
  | "availability_changed"
  | "personal_block_added"
  | "calendar_note_added"
  | "invoice_updated"
  | "university_payment_recorded"
  | "document_uploaded"
  | "event_status_changed"
  | "notification_read";

/** Lightweight MVP activity / audit trail (not production security auditing). */
export type ActivityLogEntry = {
  id: string;
  action: ActivityLogAction;
  title: string;
  detail?: string;
  actorName: string;
  createdAt: string;
  eventId?: string;
  clientId?: string;
  assignmentId?: string;
  href?: string;
};

export type Catalog = {
  users: User[];
  readers: ReaderProfile[];
  addresses: ReaderAddress[];
  emergencyContacts: EmergencyContact[];
  clients: Client[];
  contacts: ClientContact[];
  inquiries: Inquiry[];
  events: EventRecord[];
  ceremonies: Ceremony[];
  assignments: Assignment[];
  callSheets: CallSheet[];
  acknowledgements: CallSheetAcknowledgement[];
  eventDocuments: EventDocument[];
  readerDocuments: ReaderDocument[];
  availability: AvailabilityBlock[];
  personalBlocks: PersonalTimeBlock[];
  calendarNotes: CalendarNote[];
  insurance: InsuranceRequirement[];
  estimates: Estimate[];
  invoices: Invoice[];
  universityPayments: UniversityPayment[];
  compensation: ReaderCompensation[];
  expenseReports: ExpenseReport[];
  expenseLines: ExpenseLine[];
  debriefs: Debrief[];
  notes: OperationalNote[];
  flights: Flight[];
  hotelStays: HotelStay[];
  groundTransfers: GroundTransfer[];
  tasks: Task[];
  notifications: AppNotification[];
  activityLog: ActivityLogEntry[];
};
