import { msalInstance } from "./msal-instance";
import { loginRequest } from "./msal-config";

/**
 * Returns Authorization headers for authenticated API calls.
 * Acquires a token silently from MSAL cache, falling back to redirect if needed.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
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
