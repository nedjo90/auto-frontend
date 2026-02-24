import { apiClient } from "@/lib/auth/api-client";
import type {
  IPublishableListing,
  IBatchTotal,
  ICheckoutSessionResult,
  IPaymentSessionStatus,
} from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface PublishableListingsResponse {
  listings: IPublishableListing[];
  unitPriceCents: number;
}

export async function getPublishableListings(): Promise<PublishableListingsResponse> {
  const res = await apiClient(`${API_BASE}/api/seller/getPublishableListings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch publishable listings: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return {
    listings: typeof data.listings === "string" ? JSON.parse(data.listings) : data.listings || [],
    unitPriceCents: data.unitPriceCents,
  };
}

export async function calculateBatchTotal(listingIds: string[]): Promise<IBatchTotal> {
  const res = await apiClient(`${API_BASE}/api/seller/calculateBatchTotal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingIds: JSON.stringify(listingIds) }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to calculate batch total: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return {
    count: data.count,
    unitPriceCents: data.unitPriceCents,
    totalCents: data.totalCents,
    listingIds: typeof data.listingIds === "string" ? JSON.parse(data.listingIds) : data.listingIds,
  };
}

export async function createCheckoutSession(
  listingIds: string[],
  successUrl: string,
  cancelUrl: string,
): Promise<ICheckoutSessionResult> {
  const res = await apiClient(`${API_BASE}/api/seller/createCheckoutSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingIds: JSON.stringify(listingIds),
      successUrl,
      cancelUrl,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to create checkout session: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getPaymentSessionStatus(sessionId: string): Promise<IPaymentSessionStatus> {
  const res = await apiClient(`${API_BASE}/api/seller/getPaymentSessionStatus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to get payment status: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return {
    status: data.status,
    listingCount: data.listingCount,
    listings: typeof data.listings === "string" ? JSON.parse(data.listings) : data.listings || [],
  };
}
