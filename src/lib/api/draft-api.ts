import { apiClient } from "@/lib/auth/api-client";
import type { SaveDraftResult } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface SaveDraftParams {
  listingId?: string | null;
  fields: Record<string, unknown>;
  certifiedFields?: Array<{
    fieldName: string;
    fieldValue: string;
    source: string;
    sourceTimestamp: string;
    isCertified: boolean;
  }>;
}

export async function saveDraft(params: SaveDraftParams): Promise<SaveDraftResult> {
  const res = await apiClient(`${API_BASE}/api/seller/saveDraft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId: params.listingId || null,
      fields: JSON.stringify(params.fields),
      certifiedFields: params.certifiedFields ? JSON.stringify(params.certifiedFields) : null,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Save draft failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export interface LoadDraftResult {
  listing: string; // JSON string
  certifiedFields: string; // JSON string
  photos: string; // JSON string
}

export async function loadDraft(listingId: string): Promise<LoadDraftResult> {
  const res = await apiClient(`${API_BASE}/api/seller/loadDraft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Load draft failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function duplicateDraft(
  listingId: string,
): Promise<{ listingId: string; success: boolean }> {
  const res = await apiClient(`${API_BASE}/api/seller/duplicateDraft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Duplicate draft failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function deleteDraft(
  listingId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await apiClient(`${API_BASE}/api/seller/deleteDraft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Delete draft failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function fetchSellerDrafts(): Promise<{ value: Record<string, unknown>[] }> {
  const res = await apiClient(
    `${API_BASE}/api/seller/Listings?$filter=status eq 'draft'&$orderby=modifiedAt desc`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch drafts: ${res.status}`);
  }

  return res.json();
}
