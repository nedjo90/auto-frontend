import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

import { useAuthStore } from "@/stores/auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      roles: [],
      isLoading: false,
      lastActivity: 0,
    });
  });

  it("initializes with default state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.roles).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("sets user and marks authenticated", () => {
    const user = {
      id: "123",
      email: "test@example.com",
      name: "Test User",
    };
    useAuthStore.getState().setUser(user, ["buyer"]);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.roles).toEqual(["buyer"]);
  });

  it("clears user on clearUser", () => {
    useAuthStore.getState().setUser(
      { id: "1", email: "a@b.com", name: "A" },
      ["buyer"],
    );
    useAuthStore.getState().clearUser();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.roles).toEqual([]);
  });

  it("updates lastActivity timestamp", () => {
    const before = Date.now();
    useAuthStore.getState().updateLastActivity();
    const state = useAuthStore.getState();
    expect(state.lastActivity).toBeGreaterThanOrEqual(before);
  });

  it("checkSessionTimeout returns true when timed out", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now() - 31 * 60 * 1000, // 31 minutes ago
    });

    const timedOut = useAuthStore.getState().checkSessionTimeout(30);
    expect(timedOut).toBe(true);
  });

  it("checkSessionTimeout returns false when active", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    const timedOut = useAuthStore.getState().checkSessionTimeout(30);
    expect(timedOut).toBe(false);
  });

  it("checkSessionTimeout returns false when not authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: false,
      lastActivity: Date.now() - 60 * 60 * 1000,
    });

    const timedOut = useAuthStore.getState().checkSessionTimeout(30);
    expect(timedOut).toBe(false);
  });
});
