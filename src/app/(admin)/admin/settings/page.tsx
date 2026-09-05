"use client";

import { useState } from "react";
import { Section } from "@/components/data/section";
import { AdminTable } from "@/components/data/table";
import { useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/format";
import { labelize } from "@/lib/status";
import type { WorkspaceDocumentCategory } from "@/types/domain";

export default function AdminSettingsPage() {
  const { addWorkspaceDocument, workspaceDocuments } = useOperations();
  const { notify } = useToast();
  const [notifyAck, setNotifyAck] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyExpenses, setNotifyExpenses] = useState(true);
  const [notifyInsurance, setNotifyInsurance] = useState(true);
  const [docFilename, setDocFilename] = useState("");
  const [docCategory, setDocCategory] = useState<WorkspaceDocumentCategory>("rate_sheet");
  const [docNote, setDocNote] = useState("");
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

      <Section title="External ledgers">
        <p className="max-w-xl text-sm text-ink-muted">
          Tracked in VTI — Wave is official for estimates, invoices, and the general ledger. Patriot
          remains the intended reader master profile and pay initiator. Neither product is connected
          in this demo-ready MVP. Do not treat VTI totals as the books.
        </p>
      </Section>

      <Section
        title="Operational documents"
        description="Filename and category only. File bytes are not stored. Production encrypted storage is not in this demo."
      >
        <div id="workspace-document-library" className="grid gap-4">
          {workspaceDocuments.length ? (
            <AdminTable
              columns={[
                { key: "filename", header: "Filename" },
                { key: "category", header: "Category" },
                { key: "note", header: "Note" },
                { key: "recorded", header: "Recorded" },
              ]}
              rows={workspaceDocuments.map((doc) => ({
                id: doc.id,
                title: doc.filename,
                subtitle: labelize(doc.category),
                cells: {
                  filename: doc.filename,
                  category: labelize(doc.category),
                  note: doc.note || "—",
                  recorded: formatShortDate(doc.recordedAt),
                },
              }))}
            />
          ) : (
            <p className="text-sm text-ink-muted">
              No workspace documents recorded. Filenames only — bytes are not stored.
            </p>
          )}
          <form
            className="grid max-w-xl gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!docFilename.trim()) return;
              addWorkspaceDocument({
                filename: docFilename.trim(),
                category: docCategory,
                note: docNote,
              });
              notify({
                title: "Filename recorded.",
                message: "File bytes are not stored.",
              });
              setDocFilename("");
              setDocNote("");
            }}
          >
            <Field id="wdoc-filename" label="Filename">
              <Input
                id="wdoc-filename"
                value={docFilename}
                onChange={(event) => setDocFilename(event.target.value)}
                placeholder="Rate Sheet 2026.pdf"
              />
            </Field>
            <Field id="wdoc-category" label="Category">
              <Select
                id="wdoc-category"
                value={docCategory}
                onChange={(event) =>
                  setDocCategory(event.target.value as WorkspaceDocumentCategory)
                }
                options={[
                  { value: "rate_sheet", label: "Rate Sheet" },
                  { value: "operational", label: "Operational" },
                  { value: "other", label: "Other" },
                ]}
              />
            </Field>
            <Field id="wdoc-note" label="Description" hint="Optional. Do not paste file contents.">
              <Input
                id="wdoc-note"
                value={docNote}
                onChange={(event) => setDocNote(event.target.value)}
              />
            </Field>
            <div>
              <Button type="submit">Record filename</Button>
            </div>
          </form>
        </div>
      </Section>
    </div>
  );
}
