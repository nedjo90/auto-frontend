import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@azure/msal-react", () => ({
  useMsal: vi.fn(),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

import { UserMenu } from "@/components/layout/user-menu";
import { useMsal } from "@azure/msal-react";

const mockAccount = {
  homeAccountId: "home-id",
  localAccountId: "local-id",
  environment: "login.microsoftonline.com",
  tenantId: "tenant-id",
  username: "test@example.com",
  name: "Jean Dupont",
};

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user avatar with initials", () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: {} as never,
      accounts: [mockAccount as never],
      inProgress: "none" as never,
    });

    render(<UserMenu />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders nothing when no account", () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: {} as never,
      accounts: [],
      inProgress: "none" as never,
    });

    const { container } = render(<UserMenu />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a trigger button", () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: {} as never,
      accounts: [mockAccount as never],
      inProgress: "none" as never,
    });

    render(<UserMenu />);
    const trigger = screen.getAllByText("JD")[0].closest("button");
    expect(trigger).toBeInTheDocument();
  });

  it("computes initials correctly for single-word names", () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: {} as never,
      accounts: [{ ...mockAccount, name: "Admin" } as never],
      inProgress: "none" as never,
    });

    render(<UserMenu />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
