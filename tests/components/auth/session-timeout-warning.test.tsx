import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

import { SessionTimeoutWarning } from "@/components/auth/session-timeout-warning";
import { useAuthStore } from "@/stores/auth-store";

describe("SessionTimeoutWarning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      roles: [],
      isLoading: false,
      lastActivity: 0,
    });
  });

  it("renders nothing when not authenticated", () => {
    const { container } = render(
      <SessionTimeoutWarning timeoutMinutes={30} warningMinutes={5} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when authenticated but session is active", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    const { container } = render(
      <SessionTimeoutWarning timeoutMinutes={30} warningMinutes={5} />,
    );
    // Dialog should not be open (no warning text visible)
    expect(screen.queryByText(/session/i)).not.toBeInTheDocument();
  });

  it("accepts timeoutMinutes and warningMinutes props", () => {
    // Just verify it renders without error
    expect(() =>
      render(
        <SessionTimeoutWarning timeoutMinutes={30} warningMinutes={5} />,
      ),
    ).not.toThrow();
  });
});
