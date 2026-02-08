import { describe, it, expect } from "vitest";
import { msalConfig, loginRequest, apiScopes } from "@/lib/auth/msal-config";

describe("msal-config", () => {
  describe("msalConfig", () => {
    it("has auth configuration with required fields", () => {
      expect(msalConfig.auth).toBeDefined();
      expect(msalConfig.auth!.clientId).toBeDefined();
      expect(msalConfig.auth!.authority).toBeDefined();
      expect(msalConfig.auth!.knownAuthorities).toBeDefined();
      expect(msalConfig.auth!.redirectUri).toBeDefined();
      expect(msalConfig.auth!.postLogoutRedirectUri).toBe("/");
    });

    it("uses sessionStorage for cache", () => {
      expect(msalConfig.cache!.cacheLocation).toBe("sessionStorage");
    });

    it("disables auth state in cookie", () => {
      expect(msalConfig.cache!.storeAuthStateInCookie).toBe(false);
    });
  });

  describe("loginRequest", () => {
    it("includes openid, profile, and email scopes", () => {
      expect(loginRequest.scopes).toContain("openid");
      expect(loginRequest.scopes).toContain("profile");
      expect(loginRequest.scopes).toContain("email");
    });
  });

  describe("apiScopes", () => {
    it("is an array of scope strings", () => {
      expect(Array.isArray(apiScopes)).toBe(true);
    });
  });
});
