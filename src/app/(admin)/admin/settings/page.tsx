import { DemoBanner } from "@/components/demo/demo-banner";
import { FoundationControls } from "@/components/foundation/foundation-controls";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Settings"
        description="Product settings, invites, Wave, Patriot, and authentication are not implemented. University calendar colors in the demo live on each university record."
      />
      <DemoBanner>
        The controls below only verify the interface foundation. They do not change operational records.
      </DemoBanner>
      <FoundationControls />
    </div>
  );
}
