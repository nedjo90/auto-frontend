import { getAccessToken, loginRedirect } from "./auth-utils";

/**
 * Authenticated HTTP client that wraps fetch.
 * - Automatically attaches Bearer token from MSAL.
 * - On 401: triggers re-authentication and throws (does not return the 401 response).
 */
export async function apiClient(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();

  // M6: Properly handle all HeadersInit types
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // H6: On 401, trigger redirect and throw — don't return the 401 response to caller
  if (response.status === 401) {
    loginRedirect().catch(() => {
      // Redirect failed — caller should handle the thrown error
    });
    throw new Error("Authentication required — redirecting to login");
  }

  return response;
}
