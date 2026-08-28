"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";

export function FoundationControls() {
  const { notify } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <Panel>
        <h2 className="font-serif text-lg font-semibold">Interface foundation</h2>
        <p className="mt-1 text-sm text-ink-muted">
          These controls verify the Phase 0 design system. They are not product
          settings and do not save business data.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => notify({ title: "Foundation toast", message: "No data was saved." })}>
            Show toast
          </Button>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Foundation</Badge>
          <Badge tone="success">Ready</Badge>
          <Badge tone="warning">Due</Badge>
          <Badge tone="danger">Blocked</Badge>
          <Badge tone="info">Queued</Badge>
        </div>
      </Panel>

      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="foundation-name" label="Sample field" hint="Placeholder only.">
            <Input id="foundation-name" name="sample" placeholder="No personal data" />
          </Field>
          <Field id="foundation-status" label="Sample select">
            <Select
              id="foundation-status"
              options={[
                { value: "draft", label: "Draft" },
                { value: "issued", label: "Issued" },
              ]}
              defaultValue="draft"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field id="foundation-notes" label="Sample notes">
              <Textarea id="foundation-notes" placeholder="Do not enter sensitive information." />
            </Field>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <p className="mb-3 text-sm font-medium text-ink-muted">Loading state</p>
          <SkeletonBlock />
        </Panel>
        <ErrorState description="Example error treatment only. No system failure occurred." />
      </div>

      <Dialog
        open={dialogOpen}
        title="Foundation dialog"
        onClose={() => setDialogOpen(false)}
      >
        <p className="text-sm text-ink-muted">
          Keyboard: Escape closes. Focus stays in this dialog while it is open.
        </p>
      </Dialog>
    </div>
  );
}
