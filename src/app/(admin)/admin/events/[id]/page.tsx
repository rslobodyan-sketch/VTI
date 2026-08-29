"use client";

import { use } from "react";
import { EventDetailView } from "@/components/operations/event-detail";

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EventDetailView id={id} />;
}
