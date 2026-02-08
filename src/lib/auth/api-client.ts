import { getAccessToken, loginRedirect } from "./auth-utils";

/**
 * Authenticated HTTP client that wraps fetch.
 * - Automatically attaches Bearer token from MSAL.
 * - Intercepts 401 responses and triggers re-authentication.
 */
export async function apiClient(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await loginRedirect();
  }

  return response;
}
