import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout";
import { useAuthStore } from "@/stores/auth-store";
import { logoutRedirect } from "@/lib/auth/auth-utils";

describe("use-inactivity-timeout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useAuthStore.setState({
      user: null,
      isAuthenticated: true,
      roles: [],
      isLoading: false,
      lastActivity: Date.now(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets up activity event listeners when authenticated", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useInactivityTimeout(30, 5));

    const eventTypes = addSpy.mock.calls.map((c) => c[0]);
    expect(eventTypes).toContain("mousemove");
    expect(eventTypes).toContain("keydown");
    expect(eventTypes).toContain("click");

    addSpy.mockRestore();
  });

  it("does not set up listeners when not authenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useInactivityTimeout(30, 5));

    const eventTypes = addSpy.mock.calls.map((c) => c[0]);
    expect(eventTypes).not.toContain("mousemove");

    addSpy.mockRestore();
  });

  it("calls logoutRedirect when session times out", () => {
    renderHook(() => useInactivityTimeout(30, 5));

    // Advance past timeout (31 min) + check interval (1 min)
    vi.advanceTimersByTime(32 * 60 * 1000);

    expect(logoutRedirect).toHaveBeenCalled();
  });

  it("does not call logoutRedirect when session is still active", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      lastActivity: Date.now(),
    });

    renderHook(() => useInactivityTimeout(30, 5));

    vi.advanceTimersByTime(60_000);

    expect(logoutRedirect).not.toHaveBeenCalled();
  });
});
