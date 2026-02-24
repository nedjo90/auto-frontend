import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventType } from "@azure/msal-browser";

// ── Shared mock state ──────────────────────────────────────────────────
const mockAccounts = { value: [] as unknown[] };
const mockCallbacks: Array<(event: unknown) => void> = [];

const mockMsalInstance = {
  initialize: vi.fn(() => Promise.resolve()),
  getAllAccounts: vi.fn(() => mockAccounts.value),
  setActiveAccount: vi.fn(),
  addEventCallback: vi.fn((cb: (event: unknown) => void) => {
    mockCallbacks.push(cb);
  }),
};

vi.mock("@azure/msal-browser", async () => {
  const actual = await vi.importActual<typeof import("@azure/msal-browser")>(
    "@azure/msal-browser",
  );
  return {
    ...actual,
    // Use a regular function so it works with `new`
    PublicClientApplication: vi.fn(function () {
      return mockMsalInstance;
    }),
  };
});

vi.mock("@/lib/auth/msal-config", () => ({
  msalConfig: {
    auth: { clientId: "", authority: "", knownAuthorities: [], redirectUri: "/" },
    cache: { cacheLocation: "sessionStorage" },
  },
}));

// ── Tests ──────────────────────────────────────────────────────────────

describe("msal-instance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccounts.value = [];
    mockCallbacks.length = 0;
    vi.resetModules();
  });

  describe("when Azure is NOT configured (dev mode)", () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID;
    });

    it("should set isAzureConfigured to false", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      expect(mod.isAzureConfigured).toBe(false);
    });

    it("should call initialize but skip account setup", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      expect(mockMsalInstance.initialize).toHaveBeenCalled();
      expect(mockMsalInstance.getAllAccounts).not.toHaveBeenCalled();
      expect(mockMsalInstance.addEventCallback).not.toHaveBeenCalled();
    });

    it("should silently swallow initialization errors", async () => {
      mockMsalInstance.initialize.mockRejectedValueOnce(new Error("init fail"));
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const mod = await import("@/lib/auth/msal-instance");
      // Should not throw
      await mod.msalInitPromise;

      // In dev mode, error is swallowed (no console.error)
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("when Azure IS configured (prod mode)", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID = "test-client-id";
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID;
    });

    it("should set isAzureConfigured to true", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      expect(mod.isAzureConfigured).toBe(true);
    });

    it("should set active account when accounts exist", async () => {
      const fakeAccount = { homeAccountId: "acc-1", username: "user@test.com" };
      mockAccounts.value = [fakeAccount];

      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      expect(mockMsalInstance.getAllAccounts).toHaveBeenCalled();
      expect(mockMsalInstance.setActiveAccount).toHaveBeenCalledWith(fakeAccount);
    });

    it("should not set active account when no accounts exist", async () => {
      mockAccounts.value = [];

      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      expect(mockMsalInstance.getAllAccounts).toHaveBeenCalled();
      expect(mockMsalInstance.setActiveAccount).not.toHaveBeenCalled();
    });

    it("should register event callback for LOGIN_SUCCESS", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      expect(mockMsalInstance.addEventCallback).toHaveBeenCalled();
    });

    it("should set active account on LOGIN_SUCCESS event with account", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      // Simulate LOGIN_SUCCESS event
      const fakeAccount = { homeAccountId: "login-acc", username: "logged@test.com" };
      const loginEvent = {
        eventType: EventType.LOGIN_SUCCESS,
        payload: { account: fakeAccount },
      };

      // Clear setActiveAccount calls from init
      mockMsalInstance.setActiveAccount.mockClear();

      // Fire the event callback
      expect(mockCallbacks.length).toBeGreaterThan(0);
      mockCallbacks[0](loginEvent);

      expect(mockMsalInstance.setActiveAccount).toHaveBeenCalledWith(fakeAccount);
    });

    it("should NOT set active account on LOGIN_SUCCESS without account in payload", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      const loginEventNoAccount = {
        eventType: EventType.LOGIN_SUCCESS,
        payload: { account: null },
      };

      mockMsalInstance.setActiveAccount.mockClear();
      mockCallbacks[0](loginEventNoAccount);

      expect(mockMsalInstance.setActiveAccount).not.toHaveBeenCalled();
    });

    it("should NOT set active account on non-LOGIN_SUCCESS events", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      const otherEvent = {
        eventType: EventType.LOGOUT_SUCCESS,
        payload: { account: { homeAccountId: "x" } },
      };

      mockMsalInstance.setActiveAccount.mockClear();
      mockCallbacks[0](otherEvent);

      expect(mockMsalInstance.setActiveAccount).not.toHaveBeenCalled();
    });

    it("should NOT set active account when payload has no account property", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      const eventNoAccountProp = {
        eventType: EventType.LOGIN_SUCCESS,
        payload: { someOtherProp: "value" },
      };

      mockMsalInstance.setActiveAccount.mockClear();
      mockCallbacks[0](eventNoAccountProp);

      expect(mockMsalInstance.setActiveAccount).not.toHaveBeenCalled();
    });

    it("should NOT set active account when payload is null", async () => {
      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      const eventNullPayload = {
        eventType: EventType.LOGIN_SUCCESS,
        payload: null,
      };

      mockMsalInstance.setActiveAccount.mockClear();
      mockCallbacks[0](eventNullPayload);

      expect(mockMsalInstance.setActiveAccount).not.toHaveBeenCalled();
    });

    it("should log error when initialization fails in prod mode", async () => {
      mockMsalInstance.initialize.mockRejectedValueOnce(new Error("MSAL init error"));
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const mod = await import("@/lib/auth/msal-instance");
      await mod.msalInitPromise;

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[msal-instance] Initialization failed:",
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
