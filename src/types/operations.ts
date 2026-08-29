import type { Catalog, InquiryStage } from "@/types/domain";

export type UniversityProfile = {
  clientId: string;
  institutionType: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  website: string;
  mainPhone: string;
  generalEmail: string;
  typicalSeason: string;
  expectedReaders: string;
  typicalAttendance: string;
  ceremonyCount: string;
  preferredVenues: string;
  eventDuration: string;
  specialRequirements: string;
  accessibility: string;
  travelExpectations: string;
  transferRequirements: string;
  hotelRequirements: string;
  billingContact: string;
  apContact: string;
  billingEmail: string;
  poRequirements: string;
  paymentTerms: string;
  taxVendorRequirements: string;
  insuranceRequirements: string;
  contractRequirements: string;
  billingNotes: string;
  insuranceRequired: boolean;
  coiRequirements: string;
  vendorOnboardingRequired: boolean;
  backgroundCheckRequirements: string;
  ndaRequired: boolean;
  otherCompliance: string;
  onboardingStatus: "in_progress" | "complete";
  documentPlaceholders: Array<{
    id: string;
    name: string;
    type: string;
    status: "required" | "on_file" | "expired";
    date?: string;
    expiresOn?: string;
  }>;
};

export type ActivityItem = {
  id: string;
  clientId: string;
  at: string;
  title: string;
  detail?: string;
  href?: string;
};

export type SearchHit = {
  id: string;
  href: string;
  title: string;
  type: string;
  subtitle?: string;
};

export const INQUIRY_STAGE_ORDER: InquiryStage[] = [
  "initial_inquiry",
  "needs_conversation",
  "pending_admin_approval",
  "coordinator_logistics",
  "closed_won",
];

export const INQUIRY_STAGE_LABELS: Record<InquiryStage, string> = {
  initial_inquiry: "New",
  needs_conversation: "Discovery",
  pending_admin_approval: "Pending admin approval",
  coordinator_logistics: "Coordinator logistics",
  closed_won: "Won",
  closed_lost: "Lost",
};

export type OperationsOverlay = {
  catalog: Catalog;
  profiles: UniversityProfile[];
  activity: ActivityItem[];
};
