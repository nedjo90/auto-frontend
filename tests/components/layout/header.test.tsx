import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

import { Header } from "@/components/layout/header";
import { useCurrentUser } from "@/hooks/use-current-user";

describe("Header", () => {
  it("shows Sign In link when not authenticated", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: false,
      userId: null,
      displayName: null,
      email: null,
    });

    render(<Header />);
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
  });

  it("shows user menu when authenticated", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: true,
      userId: "user-id",
      displayName: "Test User",
      email: "user@test.com",
    });

    render(<Header />);
    // Should show user initials instead of sign in link
    expect(screen.getByText("TU")).toBeInTheDocument();
  });
});
