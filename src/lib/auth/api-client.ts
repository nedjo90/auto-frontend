import { getAccessToken, loginRedirect } from "./auth-utils";

const isDevMode = !process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID;

/**
 * Authenticated HTTP client that wraps fetch.
 * - Automatically attaches Bearer token from MSAL.
 * - In dev mode (no Azure config): uses CDS mock Basic auth.
 * - On 401: triggers re-authentication and throws (does not return the 401 response).
 */
export async function apiClient(url: string, options: RequestInit = {}): Promise<Response> {
  // M6: Properly handle all HeadersInit types
  const headers = new Headers(options.headers);

  if (isDevMode) {
    // Dev mode: use CDS mock Basic auth (admin user, empty password)
    headers.set("Authorization", "Basic " + btoa("admin:"));
  } else {
    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // H6: On 401, trigger redirect and throw — don't return the 401 response to caller
  if (response.status === 401 && !isDevMode) {
    loginRedirect().catch(() => {
      // Redirect failed — caller should handle the thrown error
    });
    throw new Error("Authentication required — redirecting to login");
  }

  return response;
}
