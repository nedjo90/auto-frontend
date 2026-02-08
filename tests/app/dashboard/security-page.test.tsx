import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  getAccessToken: vi.fn(),
  loginRedirect: vi.fn(),
}));

import SecuritySettingsPage from "@/app/(dashboard)/settings/security/page";
import { useAuth } from "@/hooks/use-auth";

describe("SecuritySettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 2FA section for seller role", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "seller@test.com", name: "Seller" },
      isAuthenticated: true,
      roles: ["seller"],
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: (role: string) => role === "seller",
    });

    render(<SecuritySettingsPage />);
    expect(screen.getByText("Authentification à deux facteurs (2FA)")).toBeInTheDocument();
    expect(screen.getByText("Activer")).toBeInTheDocument();
  });

  it("shows non-seller message for buyer role", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "buyer@test.com", name: "Buyer" },
      isAuthenticated: true,
      roles: ["buyer"],
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => false,
    });

    render(<SecuritySettingsPage />);
    expect(screen.getByText(/disponible pour les comptes vendeurs/)).toBeInTheDocument();
  });

  it("renders page title", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      roles: [],
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => false,
    });

    render(<SecuritySettingsPage />);
    const headings = screen.getAllByText("Sécurité");
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(headings[0].tagName).toBe("H1");
  });
});
