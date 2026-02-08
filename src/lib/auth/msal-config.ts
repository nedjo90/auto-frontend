import type { Configuration, RedirectRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID || "",
    authority: `https://${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || ""}.b2clogin.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || ""}.onmicrosoft.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_SIGN_UP_SIGN_IN_FLOW || "B2C_1_signupsignin"}`,
    knownAuthorities: [
      `${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || ""}.b2clogin.com`,
    ],
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "/auth/callback",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const apiScopes: string[] = (
  process.env.NEXT_PUBLIC_AZURE_AD_B2C_API_SCOPES || ""
)
  .split(",")
  .filter(Boolean);

export const loginRequest: RedirectRequest = {
  scopes: ["openid", "profile", "email", ...apiScopes],
};
