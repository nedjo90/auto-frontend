import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@/lib/auth/auth-utils", () => ({
  loginRedirect: vi.fn(),
  logoutRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { loginRedirect, logoutRedirect } from "@/lib/auth/auth-utils";

describe("use-auth hook", () => {
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

  it("returns user, isAuthenticated, and roles from store", () => {
    useAuthStore.setState({
      user: { id: "1", email: "a@b.com", name: "A" },
      isAuthenticated: true,
      roles: ["buyer"],
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toEqual({ id: "1", email: "a@b.com", name: "A" });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.roles).toEqual(["buyer"]);
  });

  it("provides login function that calls loginRedirect", async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.login();
    expect(loginRedirect).toHaveBeenCalled();
  });

  it("provides logout function that calls logoutRedirect", async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.logout();
    expect(logoutRedirect).toHaveBeenCalled();
  });

  it("hasRole returns true for matching role", () => {
    useAuthStore.setState({ roles: ["buyer", "administrator"] });

    const { result } = renderHook(() => useAuth());
    expect(result.current.hasRole("buyer")).toBe(true);
    expect(result.current.hasRole("administrator")).toBe(true);
  });

  it("hasRole returns false for non-matching role", () => {
    useAuthStore.setState({ roles: ["buyer"] });

    const { result } = renderHook(() => useAuth());
    expect(result.current.hasRole("administrator")).toBe(false);
  });
});
