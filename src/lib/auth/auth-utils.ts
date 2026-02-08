import { msalInstance, msalInitPromise } from "./msal-instance";
import { loginRequest } from "./msal-config";

/**
 * Initiates MSAL login redirect with PKCE (Authorization Code Flow).
 */
export async function loginRedirect(): Promise<void> {
  await msalInitPromise;
  await msalInstance.loginRedirect(loginRequest);
}

/**
 * Clears MSAL session and redirects to post-logout URI.
 */
export async function logoutRedirect(): Promise<void> {
  await msalInitPromise;
  await msalInstance.logoutRedirect();
}

/**
 * Attempts silent token acquisition. Falls back to redirect on interaction-required errors.
 * Returns null if no active account or if redirect is triggered.
 */
export async function acquireTokenSilent() {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  try {
    return await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === "InteractionRequiredAuthError"
    ) {
      await msalInstance.loginRedirect(loginRequest);
    }
    return null;
  }
}

/**
 * Returns the current valid access token or triggers silent renewal.
 * Returns null if unable to obtain a token.
 */
export async function getAccessToken(): Promise<string | null> {
  const result = await acquireTokenSilent();
  return result?.accessToken ?? null;
}

/**
 * Checks if a valid account exists in the MSAL cache.
 */
export function isAuthenticated(): boolean {
  return msalInstance.getActiveAccount() !== null;
}
