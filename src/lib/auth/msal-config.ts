import type { Configuration, RedirectRequest } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID || "";
const tenantName = process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || "";
const policyName =
  process.env.NEXT_PUBLIC_AZURE_AD_B2C_SIGN_UP_SIGN_IN_FLOW || "B2C_1_signupsignin";

// M7: Warn at load time if critical env vars are missing
if (typeof window !== "undefined" && (!clientId || !tenantName)) {
  console.error(
    "[msal-config] Missing required env vars: NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID and NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME must be set",
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}`,
    knownAuthorities: [`${tenantName}.b2clogin.com`],
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "/auth/callback",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const apiScopes: string[] = (process.env.NEXT_PUBLIC_AZURE_AD_B2C_API_SCOPES || "")
  .split(",")
  .filter(Boolean);

export const loginRequest: RedirectRequest = {
  scopes: ["openid", "profile", "email", ...apiScopes],
};
