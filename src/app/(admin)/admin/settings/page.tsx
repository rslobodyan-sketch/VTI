"use client";

import { useState } from "react";
import { Section } from "@/components/data/section";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [notifyAck, setNotifyAck] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyExpenses, setNotifyExpenses] = useState(true);
  const [notifyInsurance, setNotifyInsurance] = useState(true);
  return (
    <div className="app-page">
      <PageHeader
        title="Settings"
        description="Organization preferences for this workspace. Authentication and external ledgers are pending connection."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Settings" },
        ]}
      />

      <Section title="Organization">
        <div className="grid max-w-xl gap-3">
          <Field id="org-name" label="Organization">
            <Input id="org-name" defaultValue="Voice Talent International" readOnly />
          </Field>
          <Field id="org-tz" label="Default timezone">
            <Input id="org-tz" defaultValue="America/Chicago" readOnly />
          </Field>
        </div>
      </Section>

      <Section title="Account">
        <div className="grid max-w-xl gap-3">
          <Field id="acct-name" label="Signed-in operator">
            <Input id="acct-name" defaultValue="Chester" readOnly />
          </Field>
          <Field id="acct-role" label="Role">
            <Input id="acct-role" defaultValue="VTI operations" readOnly />
          </Field>
          <p className="text-sm text-ink-muted">Sign-in is pending external confirmation.</p>
        </div>
      </Section>

      <Section title="Notifications">
        <div className="grid max-w-xl gap-3">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--accent)]"
              checked={notifyAck}
              onChange={(event) => setNotifyAck(event.target.checked)}
            />
            Call Sheet acknowledgements outstanding
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--accent)]"
              checked={notifyOffers}
              onChange={(event) => setNotifyOffers(event.target.checked)}
            />
            Assignment offers awaiting response
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--accent)]"
              checked={notifyExpenses}
              onChange={(event) => setNotifyExpenses(event.target.checked)}
            />
            Expenses awaiting review
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--accent)]"
              checked={notifyInsurance}
              onChange={(event) => setNotifyInsurance(event.target.checked)}
            />
            University insurance reminders
          </label>
          <p className="text-xs text-ink-muted">
            Preferences apply to this workspace session. External email delivery is not connected.
          </p>
        </div>
      </Section>

      <Section title="Operational preferences">
        <div className="grid max-w-xl gap-3">
          <Field id="pref-season" label="Default commencement season">
            <Select
              id="pref-season"
              defaultValue="fall-spring"
              options={[
                { value: "fall-spring", label: "Fall and spring" },
                { value: "spring", label: "Spring only" },
              ]}
            />
          </Field>
          <Field id="pref-ack" label="Call Sheet acknowledgement">
            <Input id="pref-ack" defaultValue="Click-to-accept (no drawn signature)" readOnly />
          </Field>
          <p className="text-xs text-ink-muted">
            Assumption pending Chester confirmation: click-to-accept is enough for now. Drawn signatures
            are not in use.
          </p>
        </div>
      </Section>

      <Section title="Default expense rules">
        <Field id="exp-rules" label="Reader guidance">
          <Textarea
            id="exp-rules"
            defaultValue="Photograph receipts the same day. Per diem and rideshare caps are on the Call Sheet. Compensation is not submitted as an expense."
            readOnly
          />
        </Field>
      </Section>

      <Section title="Document preferences">
        <p className="text-sm text-ink-muted">
          Document required before assignment: NDA, COI as specified by the university, and current reader identity files.
        </p>
      </Section>

    </div>
  );
}
