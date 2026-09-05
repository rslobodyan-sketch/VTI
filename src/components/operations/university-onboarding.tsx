"use client";

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { Client, ClientContact } from "@/types/domain";
import type { UniversityProfile } from "@/types/operations";

const STEPS = [
  "University details",
  "Contacts",
  "Operations",
  "Billing",
  "Compliance",
  "Review",
] as const;

type FormState = {
  name: string;
  institutionType: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  website: string;
  mainPhone: string;
  generalEmail: string;
  notes: string;
  primaryName: string;
  primaryTitle: string;
  primaryDepartment: string;
  primaryEmail: string;
  primaryPhone: string;
  preferredContactMethod: string;
  extraName: string;
  extraRole: string;
  extraEmail: string;
  extraPhone: string;
  extraNotes: string;
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
};

const empty: FormState = {
  name: "",
  institutionType: "Private university",
  line1: "",
  city: "",
  region: "",
  postalCode: "",
  website: "",
  mainPhone: "",
  generalEmail: "",
  notes: "",
  primaryName: "",
  primaryTitle: "",
  primaryDepartment: "Commencement",
  primaryEmail: "",
  primaryPhone: "",
  preferredContactMethod: "Email",
  extraName: "",
  extraRole: "",
  extraEmail: "",
  extraPhone: "",
  extraNotes: "",
  typicalSeason: "Spring commencement",
  expectedReaders: "Lead plus second reader",
  typicalAttendance: "",
  ceremonyCount: "One ceremony",
  preferredVenues: "",
  eventDuration: "One day",
  specialRequirements: "",
  accessibility: "",
  travelExpectations: "",
  transferRequirements: "",
  hotelRequirements: "",
  billingContact: "",
  apContact: "",
  billingEmail: "",
  poRequirements: "PO required before invoice",
  paymentTerms: "Net 30",
  taxVendorRequirements: "W-9 on file",
  insuranceRequirements: "",
  contractRequirements: "Call Sheet is the assignment packet",
  billingNotes: "",
  insuranceRequired: true,
  coiRequirements: "General liability COI; additional insured as specified",
  vendorOnboardingRequired: false,
  backgroundCheckRequirements: "None beyond VTI contractor files",
  ndaRequired: true,
  otherCompliance: "",
};

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function formFromExisting(
  client: Client,
  profile: UniversityProfile,
  contacts: ClientContact[],
): FormState {
  const primary = contacts.find((item) => item.isPrimary) ?? contacts[0];
  const extra = contacts.find((item) => !item.isPrimary);
  return {
    ...empty,
    name: client.name,
    institutionType: profile.institutionType,
    line1: profile.line1,
    city: profile.city,
    region: profile.region,
    postalCode: profile.postalCode,
    website: profile.website,
    mainPhone: profile.mainPhone,
    generalEmail: profile.generalEmail,
    notes: client.notes,
    primaryName: primary?.name ?? "",
    primaryTitle: primary?.roleTitle ?? "",
    primaryDepartment: primary?.department ?? "Commencement",
    primaryEmail: primary?.email ?? "",
    primaryPhone: primary?.phone ?? "",
    preferredContactMethod: primary?.preferredContactMethod ?? "Email",
    extraName: extra?.name ?? "",
    extraRole: extra?.roleTitle ?? "",
    extraEmail: extra?.email ?? "",
    extraPhone: extra?.phone ?? "",
    extraNotes: extra?.notes ?? "",
    typicalSeason: profile.typicalSeason,
    expectedReaders: profile.expectedReaders,
    typicalAttendance: profile.typicalAttendance,
    ceremonyCount: profile.ceremonyCount,
    preferredVenues: profile.preferredVenues,
    eventDuration: profile.eventDuration,
    specialRequirements: profile.specialRequirements,
    accessibility: profile.accessibility,
    travelExpectations: profile.travelExpectations,
    transferRequirements: profile.transferRequirements,
    hotelRequirements: profile.hotelRequirements,
    billingContact: profile.billingContact,
    apContact: profile.apContact,
    billingEmail: profile.billingEmail,
    poRequirements: profile.poRequirements,
    paymentTerms: profile.paymentTerms,
    taxVendorRequirements: profile.taxVendorRequirements,
    insuranceRequirements: profile.insuranceRequirements,
    contractRequirements: profile.contractRequirements,
    billingNotes: profile.billingNotes,
    insuranceRequired: profile.insuranceRequired,
    coiRequirements: profile.coiRequirements,
    vendorOnboardingRequired: profile.vendorOnboardingRequired,
    backgroundCheckRequirements: profile.backgroundCheckRequirements,
    ndaRequired: profile.ndaRequired,
    otherCompliance: profile.otherCompliance,
  };
}

export function UniversityOnboarding({ existingId }: { existingId?: string }) {
  const router = useRouter();
  const { createUniversity, completeOnboarding, queries, profileFor, ready } = useOperations();
  const { notify } = useToast();
  const [step, setStep] = useState(0);
  const [highest, setHighest] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!ready || !existingId || prefilled) return;
    const client = queries.getClient(existingId);
    if (!client) return;
    const profile = profileFor(existingId);
    const contacts = queries.contactsForClient(existingId);
    if (profile) {
      setForm(formFromExisting(client, profile, contacts));
    } else {
      const primary = contacts.find((item) => item.isPrimary) ?? contacts[0];
      setForm({
        ...empty,
        name: client.name,
        notes: client.notes,
        primaryName: primary?.name ?? "",
        primaryTitle: primary?.roleTitle ?? "",
        primaryDepartment: primary?.department ?? "Commencement",
        primaryEmail: primary?.email ?? "",
        primaryPhone: primary?.phone ?? "",
        preferredContactMethod: primary?.preferredContactMethod ?? "Email",
      });
    }
    setPrefilled(true);
  }, [ready, existingId, prefilled, queries, profileFor]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(target: number) {
    const next: Record<string, string> = {};
    if (target === 0) {
      if (!form.name.trim()) next.name = "University name is required.";
      if (!form.city.trim()) next.city = "City is required.";
      if (!form.region.trim()) next.region = "State is required.";
    }
    if (target === 1) {
      if (!form.primaryName.trim()) next.primaryName = "Primary contact name is required.";
      if (!form.primaryEmail.trim()) next.primaryEmail = "Email is required.";
      else if (!form.primaryEmail.includes("@")) next.primaryEmail = "Enter a valid email.";
      if (!form.primaryPhone.trim()) next.primaryPhone = "Phone is required.";
    }
    return next;
  }

  function validateCurrent() {
    const next = validateStep(step);
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateRequired() {
    const next = { ...validateStep(0), ...validateStep(1) };
    setErrors(next);
    if (Object.keys(next).length === 0) return true;
    setStep(next.name || next.city || next.region ? 0 : 1);
    return false;
  }

  function nextStep() {
    if (!validateCurrent()) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setHighest((max) => Math.max(max, next));
    setStep(next);
  }

  function create() {
    if (!validateRequired()) return;
    const profile: Omit<UniversityProfile, "clientId" | "onboardingStatus" | "documentPlaceholders"> =
      {
        institutionType: form.institutionType,
        line1: form.line1,
        city: form.city,
        region: form.region,
        postalCode: form.postalCode,
        website: form.website,
        mainPhone: form.mainPhone,
        generalEmail: form.generalEmail,
        typicalSeason: form.typicalSeason,
        expectedReaders: form.expectedReaders,
        typicalAttendance: form.typicalAttendance,
        ceremonyCount: form.ceremonyCount,
        preferredVenues: form.preferredVenues,
        eventDuration: form.eventDuration,
        specialRequirements: form.specialRequirements,
        accessibility: form.accessibility,
        travelExpectations: form.travelExpectations,
        transferRequirements: form.transferRequirements,
        hotelRequirements: form.hotelRequirements,
        billingContact: form.billingContact || form.primaryName,
        apContact: form.apContact,
        billingEmail: form.billingEmail || form.primaryEmail,
        poRequirements: form.poRequirements,
        paymentTerms: form.paymentTerms,
        taxVendorRequirements: form.taxVendorRequirements,
        insuranceRequirements: form.insuranceRequirements,
        contractRequirements: form.contractRequirements,
        billingNotes: form.billingNotes,
        insuranceRequired: form.insuranceRequired,
        coiRequirements: form.coiRequirements,
        vendorOnboardingRequired: form.vendorOnboardingRequired,
        backgroundCheckRequirements: form.backgroundCheckRequirements,
        ndaRequired: form.ndaRequired,
        otherCompliance: form.otherCompliance,
      };
    const payload = {
      client: {
        name: form.name.trim(),
        status: "active" as const,
        isReturning: false,
        calendarColor: "",
        notes: form.notes,
      },
      profile,
      primary: {
        name: form.primaryName.trim(),
        email: form.primaryEmail.trim(),
        phone: form.primaryPhone.trim(),
        department: form.primaryDepartment,
        roleTitle: form.primaryTitle || "Primary contact",
        preferredContactMethod: form.preferredContactMethod,
      },
      additional: form.extraName.trim()
        ? {
            name: form.extraName.trim(),
            email: form.extraEmail,
            phone: form.extraPhone,
            department: "",
            roleTitle: form.extraRole || "Additional contact",
            notes: form.extraNotes,
          }
        : null,
    };
    const id = existingId
      ? completeOnboarding(existingId, payload)
      : createUniversity(payload);
    notify({
      title: "University onboarded successfully.",
      message: `${form.name.trim()} is an active university record.`,
    });
    setCreated({ id, name: form.name.trim() });
  }

  if (existingId) {
    const client = queries.getClient(existingId);
    if (!client) {
      if (!ready) return <RecordPending />;
      notFound();
    }
  }
  if (existingId && !prefilled) return <RecordPending />;

  if (created) {
    return (
      <div className="app-page">
        <PageHeader
          title="University onboarded successfully"
          description={`${created.name} is now an active relationship record. Contacts, operations, billing, and compliance are on the university profile.`}
          breadcrumbs={[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/clients", label: "Universities" },
            { label: "Onboarded" },
          ]}
        />
        <p className="text-sm text-ink-muted">
          Next: open the university profile, or create an inquiry to move toward an event.
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/admin/clients/${created.id}`}>View university</ButtonLink>
          <ButtonLink href={`/admin/inquiries/new?clientId=${created.id}`} variant="secondary">
            Create inquiry
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <PageHeader
        title={existingId ? "Complete university onboarding" : "Onboard university"}
        description="Capture the institution, contacts, operational requirements, billing, and compliance before the first inquiry."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/clients", label: "Universities" },
          { label: "Onboard" },
        ]}
      />

      <ol className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-6" aria-label="Onboarding progress">
        {STEPS.map((label, index) => (
          <li key={label} className="min-w-[7rem] shrink-0 lg:min-w-0">
            <button
              type="button"
              onClick={() => {
                if (index <= highest) setStep(index);
              }}
              disabled={index > highest}
              aria-current={index === step ? "step" : undefined}
              className={`min-h-11 w-full border-b-2 pb-2 text-left text-xs ${
                index === step
                  ? "border-accent font-medium text-ink"
                  : index <= highest
                    ? "border-success text-ink-muted"
                    : "cursor-not-allowed border-line text-ink-faint"
              }`}
            >
              <span className="app-kicker">Step {index + 1}</span>
              <span className="mt-0.5 block">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="grid gap-4" aria-labelledby="step-details">
          <h2 id="step-details" className="font-serif text-lg font-semibold">
            University details
          </h2>
          <Field id="uni-name" label="University name" required error={errors.name}>
            <Input
              id="uni-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              autoComplete="organization"
            />
          </Field>
          <Row>
            <Field id="uni-type" label="Institution type">
              <Select
                id="uni-type"
                value={form.institutionType}
                onChange={(event) => set("institutionType", event.target.value)}
                options={[
                  { value: "Private university", label: "Private university" },
                  { value: "Public university", label: "Public university" },
                  { value: "College of arts", label: "College of arts" },
                  { value: "Private college of arts", label: "Private college of arts" },
                  { value: "State university", label: "State university" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </Field>
            <Field id="uni-web" label="Website">
              <Input
                id="uni-web"
                value={form.website}
                onChange={(event) => set("website", event.target.value)}
                placeholder="https://"
              />
            </Field>
          </Row>
          <Field id="uni-line1" label="Address">
            <Input
              id="uni-line1"
              value={form.line1}
              onChange={(event) => set("line1", event.target.value)}
            />
          </Field>
          <Row>
            <Field id="uni-city" label="City" required error={errors.city}>
              <Input
                id="uni-city"
                value={form.city}
                onChange={(event) => set("city", event.target.value)}
              />
            </Field>
            <Field id="uni-region" label="State" required error={errors.region}>
              <Input
                id="uni-region"
                value={form.region}
                onChange={(event) => set("region", event.target.value)}
              />
            </Field>
          </Row>
          <Row>
            <Field id="uni-zip" label="ZIP">
              <Input
                id="uni-zip"
                value={form.postalCode}
                onChange={(event) => set("postalCode", event.target.value)}
              />
            </Field>
            <Field id="uni-phone" label="Main phone">
              <Input
                id="uni-phone"
                value={form.mainPhone}
                onChange={(event) => set("mainPhone", event.target.value)}
              />
            </Field>
          </Row>
          <Field id="uni-email" label="General email">
            <Input
              id="uni-email"
              type="email"
              value={form.generalEmail}
              onChange={(event) => set("generalEmail", event.target.value)}
            />
          </Field>
          <Field id="uni-notes" label="Notes">
            <Textarea
              id="uni-notes"
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </Field>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="grid gap-6" aria-labelledby="step-contacts">
          <div className="grid gap-4">
            <h2 id="step-contacts" className="font-serif text-lg font-semibold">
              Primary contact
            </h2>
            <Row>
              <Field id="p-name" label="Name" required error={errors.primaryName}>
                <Input
                  id="p-name"
                  value={form.primaryName}
                  onChange={(event) => set("primaryName", event.target.value)}
                />
              </Field>
              <Field id="p-title" label="Title / department">
                <Input
                  id="p-title"
                  value={form.primaryTitle}
                  onChange={(event) => set("primaryTitle", event.target.value)}
                  placeholder="Director of Commencement"
                />
              </Field>
            </Row>
            <Field id="p-dept" label="Department">
              <Input
                id="p-dept"
                value={form.primaryDepartment}
                onChange={(event) => set("primaryDepartment", event.target.value)}
              />
            </Field>
            <Row>
              <Field id="p-email" label="Email" required error={errors.primaryEmail}>
                <Input
                  id="p-email"
                  type="email"
                  value={form.primaryEmail}
                  onChange={(event) => set("primaryEmail", event.target.value)}
                />
              </Field>
              <Field id="p-phone" label="Phone" required error={errors.primaryPhone}>
                <Input
                  id="p-phone"
                  value={form.primaryPhone}
                  onChange={(event) => set("primaryPhone", event.target.value)}
                />
              </Field>
            </Row>
            <Field id="p-method" label="Preferred contact method">
              <Select
                id="p-method"
                value={form.preferredContactMethod}
                onChange={(event) => set("preferredContactMethod", event.target.value)}
                options={[
                  { value: "Email", label: "Email" },
                  { value: "Phone", label: "Phone" },
                  { value: "Either", label: "Either" },
                ]}
              />
            </Field>
          </div>
          <div className="grid gap-4 border-t border-line pt-4">
            <h2 className="font-serif text-lg font-semibold">Additional contact</h2>
            <p className="text-sm text-ink-muted">Optional. Add a second operations or billing contact now, or later from the university record.</p>
            <Row>
              <Field id="x-name" label="Name">
                <Input
                  id="x-name"
                  value={form.extraName}
                  onChange={(event) => set("extraName", event.target.value)}
                />
              </Field>
              <Field id="x-role" label="Role">
                <Input
                  id="x-role"
                  value={form.extraRole}
                  onChange={(event) => set("extraRole", event.target.value)}
                />
              </Field>
            </Row>
            <Row>
              <Field id="x-email" label="Email">
                <Input
                  id="x-email"
                  type="email"
                  value={form.extraEmail}
                  onChange={(event) => set("extraEmail", event.target.value)}
                />
              </Field>
              <Field id="x-phone" label="Phone">
                <Input
                  id="x-phone"
                  value={form.extraPhone}
                  onChange={(event) => set("extraPhone", event.target.value)}
                />
              </Field>
            </Row>
            <Field id="x-notes" label="Notes">
              <Input
                id="x-notes"
                value={form.extraNotes}
                onChange={(event) => set("extraNotes", event.target.value)}
              />
            </Field>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="grid gap-4" aria-labelledby="step-ops">
          <h2 id="step-ops" className="font-serif text-lg font-semibold">
            Operations / event requirements
          </h2>
          <Row>
            <Field id="season" label="Typical commencement season">
              <Input
                id="season"
                value={form.typicalSeason}
                onChange={(event) => set("typicalSeason", event.target.value)}
              />
            </Field>
            <Field id="readers" label="Expected reader requirements">
              <Input
                id="readers"
                value={form.expectedReaders}
                onChange={(event) => set("expectedReaders", event.target.value)}
              />
            </Field>
          </Row>
          <Row>
            <Field id="attend" label="Typical attendance">
              <Input
                id="attend"
                value={form.typicalAttendance}
                onChange={(event) => set("typicalAttendance", event.target.value)}
              />
            </Field>
            <Field id="ceremonies" label="Number of ceremonies">
              <Input
                id="ceremonies"
                value={form.ceremonyCount}
                onChange={(event) => set("ceremonyCount", event.target.value)}
              />
            </Field>
          </Row>
          <Row>
            <Field id="venues" label="Preferred venues">
              <Input
                id="venues"
                value={form.preferredVenues}
                onChange={(event) => set("preferredVenues", event.target.value)}
              />
            </Field>
            <Field id="duration" label="Typical event duration">
              <Input
                id="duration"
                value={form.eventDuration}
                onChange={(event) => set("eventDuration", event.target.value)}
              />
            </Field>
          </Row>
          <Field id="special" label="Special requirements">
            <Textarea
              id="special"
              value={form.specialRequirements}
              onChange={(event) => set("specialRequirements", event.target.value)}
            />
          </Field>
          <Field id="access" label="Accessibility requirements">
            <Textarea
              id="access"
              value={form.accessibility}
              onChange={(event) => set("accessibility", event.target.value)}
            />
          </Field>
          <Field id="travel" label="Travel expectations">
            <Textarea
              id="travel"
              value={form.travelExpectations}
              onChange={(event) => set("travelExpectations", event.target.value)}
            />
          </Field>
          <Row>
            <Field id="transfer" label="Transfer requirements">
              <Input
                id="transfer"
                value={form.transferRequirements}
                onChange={(event) => set("transferRequirements", event.target.value)}
              />
            </Field>
            <Field id="hotel" label="Hotel requirements">
              <Input
                id="hotel"
                value={form.hotelRequirements}
                onChange={(event) => set("hotelRequirements", event.target.value)}
              />
            </Field>
          </Row>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="grid gap-4" aria-labelledby="step-billing">
          <h2 id="step-billing" className="font-serif text-lg font-semibold">
            Billing / administrative
          </h2>
          <Row>
            <Field id="bill-c" label="Billing contact">
              <Input
                id="bill-c"
                value={form.billingContact}
                onChange={(event) => set("billingContact", event.target.value)}
              />
            </Field>
            <Field id="ap-c" label="Accounts payable contact">
              <Input
                id="ap-c"
                value={form.apContact}
                onChange={(event) => set("apContact", event.target.value)}
              />
            </Field>
          </Row>
          <Field id="bill-e" label="Billing email">
            <Input
              id="bill-e"
              type="email"
              value={form.billingEmail}
              onChange={(event) => set("billingEmail", event.target.value)}
            />
          </Field>
          <Row>
            <Field id="po" label="PO requirements">
              <Input
                id="po"
                value={form.poRequirements}
                onChange={(event) => set("poRequirements", event.target.value)}
              />
            </Field>
            <Field id="terms" label="Payment terms">
              <Input
                id="terms"
                value={form.paymentTerms}
                onChange={(event) => set("paymentTerms", event.target.value)}
              />
            </Field>
          </Row>
          <Field id="tax" label="Tax / vendor requirements">
            <Input
              id="tax"
              value={form.taxVendorRequirements}
              onChange={(event) => set("taxVendorRequirements", event.target.value)}
            />
          </Field>
          <Field id="ins-req" label="Insurance requirements">
            <Input
              id="ins-req"
              value={form.insuranceRequirements}
              onChange={(event) => set("insuranceRequirements", event.target.value)}
            />
          </Field>
          <Field id="contract" label="Contract requirements">
            <Input
              id="contract"
              value={form.contractRequirements}
              onChange={(event) => set("contractRequirements", event.target.value)}
            />
          </Field>
          <Field id="bill-notes" label="Notes">
            <Textarea
              id="bill-notes"
              value={form.billingNotes}
              onChange={(event) => set("billingNotes", event.target.value)}
            />
          </Field>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="grid gap-4" aria-labelledby="step-comp">
          <h2 id="step-comp" className="font-serif text-lg font-semibold">
            Compliance
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.insuranceRequired}
              onChange={(event) => set("insuranceRequired", event.target.checked)}
            />
            Insurance required
          </label>
          <Field id="coi" label="COI requirements">
            <Textarea
              id="coi"
              value={form.coiRequirements}
              onChange={(event) => set("coiRequirements", event.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.vendorOnboardingRequired}
              onChange={(event) => set("vendorOnboardingRequired", event.target.checked)}
            />
            Vendor onboarding required
          </label>
          <Field id="bg" label="Background check requirements">
            <Input
              id="bg"
              value={form.backgroundCheckRequirements}
              onChange={(event) => set("backgroundCheckRequirements", event.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ndaRequired}
              onChange={(event) => set("ndaRequired", event.target.checked)}
            />
            NDA required
          </label>
          <Field id="other-c" label="Other compliance requirements">
            <Textarea
              id="other-c"
              value={form.otherCompliance}
              onChange={(event) => set("otherCompliance", event.target.value)}
            />
          </Field>
          <p className="text-sm text-ink-muted">
            Document required before assignment. Files can be attached on the university record after creation.
          </p>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="grid gap-4" aria-labelledby="step-review">
          <h2 id="step-review" className="font-serif text-lg font-semibold">
            Review
          </h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="app-kicker">University</dt>
              <dd className="font-medium">{form.name || "—"}</dd>
              <dd className="text-ink-muted">
                {form.institutionType}
                {form.city ? ` · ${form.city}, ${form.region}` : ""}
              </dd>
            </div>
            <div>
              <dt className="app-kicker">Primary contact</dt>
              <dd className="font-medium">{form.primaryName || "—"}</dd>
              <dd className="text-ink-muted">
                {form.primaryEmail} · {form.primaryPhone}
              </dd>
            </div>
            {form.extraName ? (
              <div>
                <dt className="app-kicker">Additional contact</dt>
                <dd className="font-medium">{form.extraName}</dd>
                <dd className="text-ink-muted">
                  {[form.extraRole, form.extraEmail, form.extraPhone].filter(Boolean).join(" · ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="app-kicker">Operational requirements</dt>
              <dd>{form.typicalSeason}</dd>
              <dd className="text-ink-muted">
                {[form.expectedReaders, form.preferredVenues].filter(Boolean).join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="app-kicker">Billing</dt>
              <dd>{form.paymentTerms}</dd>
              <dd className="text-ink-muted">
                {[form.billingEmail, form.poRequirements].filter(Boolean).join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="app-kicker">Compliance</dt>
              <dd>
                Insurance {form.insuranceRequired ? "required" : "not required"} · NDA{" "}
                {form.ndaRequired ? "required" : "not required"}
              </dd>
            </div>
            <div>
              <dt className="app-kicker">Notes</dt>
              <dd className="text-ink-muted">{form.notes || "None"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <Button
          variant="secondary"
          onClick={() => (step === 0 ? router.push("/admin/clients") : setStep((value) => value - 1))}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={nextStep}>
            Continue
          </Button>
        ) : (
          <Button onClick={create}>{existingId ? "Complete onboarding" : "Create university"}</Button>
        )}
      </div>
    </div>
  );
}
