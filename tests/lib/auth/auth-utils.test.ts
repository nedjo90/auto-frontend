import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AccountInfo, AuthenticationResult } from "@azure/msal-browser";

// Mock msal-instance before importing auth-utils
vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    loginRedirect: vi.fn(),
    logoutRedirect: vi.fn(),
    acquireTokenSilent: vi.fn(),
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
  msalInitPromise: Promise.resolve(),
  isAzureConfigured: true,
}));

vi.mock("@/lib/auth/msal-config", () => ({
  loginRequest: { scopes: ["openid", "profile", "email"] },
  apiScopes: ["https://tenant.onmicrosoft.com/api/access"],
}));

import {
  loginRedirect,
  logoutRedirect,
  acquireTokenSilent,
  getAccessToken,
  isAuthenticated,
} from "@/lib/auth/auth-utils";
import { msalInstance } from "@/lib/auth/msal-instance";

const mockAccount: AccountInfo = {
  homeAccountId: "home-id",
  localAccountId: "local-id",
  environment: "login.microsoftonline.com",
  tenantId: "tenant-id",
  username: "test@example.com",
  name: "Test User",
};

const mockAuthResult: AuthenticationResult = {
  authority: "https://tenant.b2clogin.com/tenant/policy",
  uniqueId: "unique-id",
  tenantId: "tenant-id",
  scopes: ["openid"],
  account: mockAccount,
  idToken: "id-token",
  idTokenClaims: {},
  accessToken: "access-token-123",
  fromCache: false,
  expiresOn: new Date(Date.now() + 3600000),
  tokenType: "Bearer",
  correlationId: "corr-id",
  fromNativeBroker: false,
  requestId: "",
};

describe("auth-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginRedirect", () => {
    it("calls msalInstance.loginRedirect with login request", async () => {
      await loginRedirect();
      expect(msalInstance.loginRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: expect.any(Array) }),
      );
    });
  });

  describe("logoutRedirect", () => {
    it("calls msalInstance.logoutRedirect", async () => {
      await logoutRedirect();
      expect(msalInstance.logoutRedirect).toHaveBeenCalled();
    });
  });

  describe("acquireTokenSilent", () => {
    it("returns auth result on success", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(mockAccount);
      vi.mocked(msalInstance.acquireTokenSilent).mockResolvedValue(mockAuthResult);

      const result = await acquireTokenSilent();
      expect(result).toBeDefined();
      expect(result!.accessToken).toBe("access-token-123");
    });

    it("returns null when no active account", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(null);

      const result = await acquireTokenSilent();
      expect(result).toBeNull();
    });

    it("falls back to loginRedirect on InteractionRequiredAuthError", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(mockAccount);
      const error = new Error("interaction_required");
      error.name = "InteractionRequiredAuthError";
      vi.mocked(msalInstance.acquireTokenSilent).mockRejectedValue(error);

      const result = await acquireTokenSilent();
      expect(result).toBeNull();
      expect(msalInstance.loginRedirect).toHaveBeenCalled();
    });
  });

  describe("getAccessToken", () => {
    it("returns access token string on success", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(mockAccount);
      vi.mocked(msalInstance.acquireTokenSilent).mockResolvedValue(mockAuthResult);

      const token = await getAccessToken();
      expect(token).toBe("access-token-123");
    });

    it("returns null when no account", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(null);

      const token = await getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when active account exists", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(mockAccount);
      expect(await isAuthenticated()).toBe(true);
    });

    it("returns false when no active account", async () => {
      vi.mocked(msalInstance.getActiveAccount).mockReturnValue(null);
      expect(await isAuthenticated()).toBe(false);
    });
  });
});
