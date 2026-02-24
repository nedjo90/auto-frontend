import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock setup ─────────────────────────────────────────────────────────

const mockMsalInstance = {
  getActiveAccount: vi.fn(),
  acquireTokenSilent: vi.fn(),
};

let mockIsAzureConfigured = false;

vi.mock("@/lib/auth/msal-instance", () => ({
  get msalInstance() {
    return mockMsalInstance;
  },
  get isAzureConfigured() {
    return mockIsAzureConfigured;
  },
}));

vi.mock("@/lib/auth/msal-config", () => ({
  loginRequest: { scopes: ["openid", "profile", "email"] },
}));

import { getAuthHeaders } from "@/lib/auth/get-auth-headers";

// ── Tests ──────────────────────────────────────────────────────────────

describe("get-auth-headers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dev mode (Azure NOT configured)", () => {
    beforeEach(() => {
      mockIsAzureConfigured = false;
    });

    it("should return Basic auth header with admin credentials", async () => {
      const headers = await getAuthHeaders();
      expect(headers).toEqual({
        Authorization: "Basic " + btoa("admin:"),
      });
    });

    it("should not call msalInstance methods in dev mode", async () => {
      await getAuthHeaders();
      expect(mockMsalInstance.getActiveAccount).not.toHaveBeenCalled();
      expect(mockMsalInstance.acquireTokenSilent).not.toHaveBeenCalled();
    });
  });

  describe("prod mode (Azure IS configured)", () => {
    beforeEach(() => {
      mockIsAzureConfigured = true;
    });

    it("should return empty headers when no active account", async () => {
      mockMsalInstance.getActiveAccount.mockReturnValue(null);

      const headers = await getAuthHeaders();
      expect(headers).toEqual({});
      expect(mockMsalInstance.acquireTokenSilent).not.toHaveBeenCalled();
    });

    it("should return Bearer token when token acquired successfully", async () => {
      const fakeAccount = { homeAccountId: "acc-1", username: "user@test.com" };
      mockMsalInstance.getActiveAccount.mockReturnValue(fakeAccount);
      mockMsalInstance.acquireTokenSilent.mockResolvedValue({
        accessToken: "jwt-token-abc",
      });

      const headers = await getAuthHeaders();
      expect(headers).toEqual({
        Authorization: "Bearer jwt-token-abc",
      });
    });

    it("should call acquireTokenSilent with loginRequest and account", async () => {
      const fakeAccount = { homeAccountId: "acc-1", username: "user@test.com" };
      mockMsalInstance.getActiveAccount.mockReturnValue(fakeAccount);
      mockMsalInstance.acquireTokenSilent.mockResolvedValue({
        accessToken: "token",
      });

      await getAuthHeaders();
      expect(mockMsalInstance.acquireTokenSilent).toHaveBeenCalledWith({
        scopes: ["openid", "profile", "email"],
        account: fakeAccount,
      });
    });

    it("should return empty headers when acquireTokenSilent throws", async () => {
      const fakeAccount = { homeAccountId: "acc-1", username: "user@test.com" };
      mockMsalInstance.getActiveAccount.mockReturnValue(fakeAccount);
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(
        new Error("InteractionRequired"),
      );

      const headers = await getAuthHeaders();
      expect(headers).toEqual({});
    });

    it("should return empty headers on network errors", async () => {
      const fakeAccount = { homeAccountId: "acc-1", username: "user@test.com" };
      mockMsalInstance.getActiveAccount.mockReturnValue(fakeAccount);
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(
        new Error("Network error"),
      );

      const headers = await getAuthHeaders();
      expect(headers).toEqual({});
    });
  });
});
