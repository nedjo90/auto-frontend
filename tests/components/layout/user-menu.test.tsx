import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

import { UserMenu } from "@/components/layout/user-menu";
import { useCurrentUser } from "@/hooks/use-current-user";

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user avatar with initials", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: true,
      userId: "local-id",
      displayName: "Jean Dupont",
      email: "test@example.com",
    });

    render(<UserMenu />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders nothing when not authenticated", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: false,
      userId: null,
      displayName: null,
      email: null,
    });

    const { container } = render(<UserMenu />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a trigger button", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: true,
      userId: "local-id",
      displayName: "Jean Dupont",
      email: "test@example.com",
    });

    render(<UserMenu />);
    const trigger = screen.getAllByText("JD")[0].closest("button");
    expect(trigger).toBeInTheDocument();
  });

  it("computes initials correctly for single-word names", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: true,
      userId: "local-id",
      displayName: "Admin",
      email: "admin@localhost",
    });

    render(<UserMenu />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
