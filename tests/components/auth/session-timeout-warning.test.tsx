import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

import { SessionTimeoutWarning } from "@/components/auth/session-timeout-warning";
import { useAuthStore } from "@/stores/auth-store";
import { logoutRedirect } from "@/lib/auth/auth-utils";

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
      <SessionTimeoutWarning
        timeoutMinutes={30}
        warningMinutes={5}
        showWarning={false}
        remainingSeconds={0}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when authenticated but showWarning is false", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    render(
      <SessionTimeoutWarning
        timeoutMinutes={30}
        warningMinutes={5}
        showWarning={false}
        remainingSeconds={300}
      />,
    );
    expect(screen.queryByText(/session/i)).not.toBeInTheDocument();
  });

  it("shows warning dialog with countdown when showWarning is true", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    render(
      <SessionTimeoutWarning
        timeoutMinutes={30}
        warningMinutes={5}
        showWarning={true}
        remainingSeconds={120}
      />,
    );

    expect(screen.getByText(/session sur le point d'expirer/i)).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rester connecté/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se déconnecter/i })).toBeInTheDocument();
  });

  it("calls updateLastActivity when Stay Connected is clicked", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now() - 25 * 60 * 1000,
    });

    render(
      <SessionTimeoutWarning
        timeoutMinutes={30}
        warningMinutes={5}
        showWarning={true}
        remainingSeconds={300}
      />,
    );

    const stayButton = screen.getByRole("button", { name: /rester connecté/i });
    const activityBefore = useAuthStore.getState().lastActivity;
    await user.click(stayButton);
    const activityAfter = useAuthStore.getState().lastActivity;
    expect(activityAfter).toBeGreaterThan(activityBefore);
  });

  it("calls logoutRedirect when Logout is clicked", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    render(
      <SessionTimeoutWarning
        timeoutMinutes={30}
        warningMinutes={5}
        showWarning={true}
        remainingSeconds={120}
      />,
    );

    const logoutButton = screen.getByRole("button", { name: /se déconnecter/i });
    await user.click(logoutButton);
    expect(logoutRedirect).toHaveBeenCalled();
  });

  it("formats remaining seconds correctly", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    render(
      <SessionTimeoutWarning
        timeoutMinutes={30}
        warningMinutes={5}
        showWarning={true}
        remainingSeconds={65}
      />,
    );

    expect(screen.getByText("1:05")).toBeInTheDocument();
  });
});
