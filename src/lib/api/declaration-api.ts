import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface DeclarationTemplate {
  version: string;
  checkboxItems: string[]; // parsed from JSON
  introText: string;
  legalNotice: string;
}

export interface SubmitDeclarationParams {
  listingId: string;
  checkboxStates: Array<{ label: string; checked: boolean }>;
}

export interface SubmitDeclarationResult {
  declarationId: string;
  signedAt: string;
  success: boolean;
}

export interface DeclarationSummary {
  hasDeclared: boolean;
  signedAt: string | null;
  declarationVersion: string | null;
}

export async function getDeclarationTemplate(): Promise<DeclarationTemplate> {
  const res = await apiClient(`${API_BASE}/api/seller/getDeclarationTemplate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to load declaration template: ${res.status} ${errorText}`);
  }

  const data = await res.json();

  return {
    version: data.version,
    checkboxItems:
      typeof data.checkboxItems === "string" ? JSON.parse(data.checkboxItems) : data.checkboxItems,
    introText: data.introText || "",
    legalNotice: data.legalNotice || "",
  };
}

export async function submitDeclaration(
  params: SubmitDeclarationParams,
): Promise<SubmitDeclarationResult> {
  const res = await apiClient(`${API_BASE}/api/seller/submitDeclaration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId: params.listingId,
      checkboxStates: JSON.stringify(params.checkboxStates),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Declaration submission failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getDeclarationSummary(listingId: string): Promise<DeclarationSummary> {
  const res = await apiClient(`${API_BASE}/api/seller/getDeclarationSummary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to load declaration summary: ${res.status} ${errorText}`);
  }

  return res.json();
}
