import { apiClient } from "@/lib/auth/api-client";
import type {
  IListingLifecycleResult,
  ISellerPublishedListing,
  ISellerListingHistoryItem,
} from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Mark a listing as sold. */
export async function markAsSold(listingId: string): Promise<IListingLifecycleResult> {
  const res = await apiClient(`${API_BASE}/api/seller/markAsSold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to mark listing as sold: ${res.status} ${errorText}`);
  }

  return res.json();
}

/** Archive a listing. */
export async function archiveListing(listingId: string): Promise<IListingLifecycleResult> {
  const res = await apiClient(`${API_BASE}/api/seller/archiveListing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to archive listing: ${res.status} ${errorText}`);
  }

  return res.json();
}

/** Fetch seller's active (published) listings with analytics. */
export async function getSellerListings(): Promise<ISellerPublishedListing[]> {
  const res = await apiClient(`${API_BASE}/api/seller/getSellerListings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch seller listings: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return typeof data.listings === "string" ? JSON.parse(data.listings) : data.listings || [];
}

/** Fetch seller's listing history with performance metrics. */
export async function getListingHistory(): Promise<ISellerListingHistoryItem[]> {
  const res = await apiClient(`${API_BASE}/api/seller/getListingHistory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch listing history: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return typeof data.listings === "string" ? JSON.parse(data.listings) : data.listings || [];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fetch a single listing by ID (public view). */
export async function getPublicListing(listingId: string): Promise<Record<string, unknown> | null> {
  if (!UUID_RE.test(listingId)) {
    return null;
  }
  const res = await apiClient(
    `${API_BASE}/api/buyer/Listings('${encodeURIComponent(listingId)}')`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    if (res.status === 404) return null;
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch listing: ${res.status} ${errorText}`);
  }

  return res.json();
}
