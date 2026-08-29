"use client";

import { use } from "react";
import { InquiryDetailView } from "@/components/operations/inquiry-detail";

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InquiryDetailView id={id} />;
}
