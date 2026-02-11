import { msalInstance } from "./msal-instance";
import { isAzureConfigured } from "./msal-instance";
import { loginRequest } from "./msal-config";

/**
 * Returns Authorization headers for authenticated API calls.
 * In dev mode: uses CDS mock Basic auth (admin user, empty password).
 * In prod mode: acquires a token silently from MSAL cache, falling back to redirect if needed.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!isAzureConfigured) {
    return {
      Authorization: "Basic " + btoa("admin:"),
    };
  }

  const account = msalInstance.getActiveAccount();
  if (!account) return {};

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return {
      Authorization: `Bearer ${response.accessToken}`,
    };
  } catch {
    return {};
  }
}
