import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Result from publishLegalVersion action */
export interface PublishLegalVersionResult {
  ID: string;
  document_ID: string;
  version: number;
  content: string;
  summary: string;
  publishedAt: string;
  publishedBy: string;
  archived: boolean;
}

/** Current version content from legal service */
export interface LegalVersionContent {
  ID: string;
  document_ID: string;
  version: number;
  content: string;
  summary: string;
  publishedAt: string;
}

/** Pending legal acceptance item */
export interface PendingLegalAcceptance {
  documentId: string;
  documentKey: string;
  title: string;
  version: number;
  summary: string;
}

/** Accept result */
export interface AcceptLegalResult {
  success: boolean;
  message: string;
}

/**
 * Publish a new version of a legal document via AdminService action.
 */
export async function publishLegalVersion(
  documentId: string,
  content: string,
  summary: string,
  requiresReacceptance: boolean,
): Promise<PublishLegalVersionResult> {
  const res = await apiClient(`${API_BASE}/api/admin/publishLegalVersion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId, content, summary, requiresReacceptance }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to publish version: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Get acceptance count for a legal document via AdminService function.
 */
export async function getLegalAcceptanceCount(documentId: string): Promise<number> {
  const res = await apiClient(
    `${API_BASE}/api/admin/getLegalAcceptanceCount(documentId='${encodeURIComponent(documentId)}')`,
  );
  if (!res.ok) {
    throw new Error(`Failed to get acceptance count: ${res.status}`);
  }
  const data = await res.json();
  return typeof data.value === "number" ? data.value : data;
}

/**
 * Get current version content for a legal document (public endpoint).
 */
export async function getCurrentLegalVersion(documentKey: string): Promise<LegalVersionContent> {
  const res = await fetch(
    `${API_BASE}/api/legal/getCurrentVersion(documentKey='${encodeURIComponent(documentKey)}')`,
  );
  if (!res.ok) {
    throw new Error(`Failed to get legal version: ${res.status}`);
  }
  return res.json();
}

/**
 * Check which legal documents need re-acceptance for the current user.
 */
export async function checkLegalAcceptance(): Promise<PendingLegalAcceptance[]> {
  const res = await apiClient(`${API_BASE}/api/legal/checkLegalAcceptance()`);
  if (!res.ok) {
    throw new Error(`Failed to check legal acceptance: ${res.status}`);
  }
  const data = await res.json();
  return data.value ?? data;
}

/**
 * Accept a legal document version for the current user.
 */
export async function acceptLegalDocument(
  documentId: string,
  version: number,
): Promise<AcceptLegalResult> {
  const res = await apiClient(`${API_BASE}/api/legal/acceptLegalDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId, version }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to accept document: ${res.status} ${errorText}`);
  }
  return res.json();
}
