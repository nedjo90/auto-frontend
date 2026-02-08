import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@azure/msal-react", () => ({
  useMsal: vi.fn(),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

import { Header } from "@/components/layout/header";
import { useMsal } from "@azure/msal-react";

describe("Header", () => {
  it("shows Sign In link when not authenticated", () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: {} as never,
      accounts: [],
      inProgress: "none" as never,
    });

    render(<Header />);
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
  });

  it("shows user menu when authenticated", () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: {} as never,
      accounts: [
        {
          homeAccountId: "id",
          localAccountId: "id",
          environment: "env",
          tenantId: "tid",
          username: "user@test.com",
          name: "Test User",
        } as never,
      ],
      inProgress: "none" as never,
    });

    render(<Header />);
    // Should show user initials instead of sign in link
    expect(screen.getByText("TU")).toBeInTheDocument();
  });
});
