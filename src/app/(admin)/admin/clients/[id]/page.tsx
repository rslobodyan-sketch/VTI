"use client";

import { use } from "react";
import { UniversityProfileView } from "@/components/operations/university-profile";

export default function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <UniversityProfileView id={id} />;
}
