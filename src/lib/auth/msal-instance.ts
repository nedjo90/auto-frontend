import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./msal-config";

export const isAzureConfigured = !!process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID;

export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Awaitable initialization promise.
 * Components that need MSAL ready (e.g., loginRedirect) should await this.
 * Always calls initialize() so MsalProvider works in both dev and prod modes.
 * In dev mode (no Azure config), skips account setup after initialization.
 */
export const msalInitPromise = msalInstance
  .initialize()
  .then(() => {
    if (!isAzureConfigured) return;

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }

    msalInstance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS &&
        event.payload &&
        "account" in event.payload &&
        event.payload.account
      ) {
        msalInstance.setActiveAccount(event.payload.account);
      }
    });
  })
  .catch((err: unknown) => {
    if (isAzureConfigured) {
      console.error("[msal-instance] Initialization failed:", err);
    }
    // Dev mode: silently swallow MSAL init errors
  });
