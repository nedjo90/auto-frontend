import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./msal-config";

export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Awaitable initialization promise.
 * Components that need MSAL ready (e.g., loginRedirect) should await this.
 */
export const msalInitPromise = msalInstance.initialize().then(() => {
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
});
