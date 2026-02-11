import { type AuthenticationResult } from "@azure/msal-browser";
import { msalInstance, msalInitPromise, isAzureConfigured } from "./msal-instance";
import { loginRequest } from "./msal-config";

/**
 * Initiates MSAL login redirect with PKCE (Authorization Code Flow).
 * In dev mode: no-op (auth is handled by CDS mock Basic auth).
 */
export async function loginRedirect(): Promise<void> {
  if (!isAzureConfigured) return;
  await msalInitPromise;
  await msalInstance.loginRedirect(loginRequest);
}

/**
 * Clears MSAL session and redirects to post-logout URI.
 * In dev mode: no-op.
 */
export async function logoutRedirect(): Promise<void> {
  if (!isAzureConfigured) return;
  await msalInitPromise;
  await msalInstance.logoutRedirect();
}

/**
 * Attempts silent token acquisition. Falls back to redirect on interaction-required errors.
 * Returns null if no active account or if redirect is triggered.
 * In dev mode: returns null (api-client uses Basic auth instead).
 */
export async function acquireTokenSilent(): Promise<AuthenticationResult | null> {
  if (!isAzureConfigured) return null;
  await msalInitPromise;
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  try {
    return await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "InteractionRequiredAuthError") {
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
 * In dev mode: returns false (auth state is managed via authStore).
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAzureConfigured) return false;
  await msalInitPromise;
  return msalInstance.getActiveAccount() !== null;
}
