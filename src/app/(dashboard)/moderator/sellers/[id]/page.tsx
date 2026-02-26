"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { SellerHistory } from "@/components/moderation/seller-history";

interface SellerHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default function SellerHistoryPage({ params }: SellerHistoryPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const fromReportId = searchParams.get("from") || undefined;

  return <SellerHistory sellerId={id} fromReportId={fromReportId} />;
}
