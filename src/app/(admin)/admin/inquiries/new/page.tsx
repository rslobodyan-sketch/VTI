import { InquiryCreateView } from "@/components/operations/inquiry-create";

export default async function NewInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  return <InquiryCreateView clientId={clientId} />;
}
