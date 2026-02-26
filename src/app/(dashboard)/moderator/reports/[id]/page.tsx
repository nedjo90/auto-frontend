"use client";

import { use } from "react";
import { ReportDetail } from "@/components/moderation/report-detail";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = use(params);

  return <ReportDetail reportId={id} />;
}
