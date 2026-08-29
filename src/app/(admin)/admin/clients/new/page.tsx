import { UniversityOnboarding } from "@/components/operations/university-onboarding";

export default async function NewUniversityPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  return <UniversityOnboarding existingId={clientId} />;
}

