import { EventCreateView } from "@/components/operations/event-create";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; inquiryId?: string }>;
}) {
  const { clientId, inquiryId } = await searchParams;
  return <EventCreateView clientId={clientId} inquiryId={inquiryId} />;
}
