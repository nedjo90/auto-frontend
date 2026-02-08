import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/seller",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/hooks/use-auth";

const mockAuth = vi.mocked(useAuth);

function setupAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  mockAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    roles: [],
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: vi.fn(),
    ...overrides,
  });
}

describe("RoleGuard", () => {
  beforeEach(() => {
    cleanup();
    mockPush.mockClear();
    mockAuth.mockReset();
  });

  it("renders children when user has required role", () => {
    setupAuth({
      user: { id: "1", email: "seller@test.com", name: "Seller" },
      isAuthenticated: true,
      roles: ["seller"],
    });

    render(
      <RoleGuard requiredRole="seller">
        <div>Seller Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Seller Content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children when user has one of multiple required roles", () => {
    setupAuth({
      user: { id: "1", email: "mod@test.com", name: "Mod" },
      isAuthenticated: true,
      roles: ["moderator"],
    });

    render(
      <RoleGuard requiredRole={["seller", "moderator"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("does not render children when authenticated but lacks role", () => {
    setupAuth({
      user: { id: "1", email: "buyer@test.com", name: "Buyer" },
      isAuthenticated: true,
      roles: ["buyer"],
    });

    render(
      <RoleGuard requiredRole="seller">
        <div>Seller Content</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Seller Content")).toBeNull();
    // Default fallback shows loading spinner
    expect(screen.getByRole("generic", { busy: true })).toBeInTheDocument();
  });

  it("does not render children when unauthenticated", () => {
    setupAuth({
      isAuthenticated: false,
      roles: [],
    });

    render(
      <RoleGuard requiredRole="seller">
        <div>Seller Content</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Seller Content")).toBeNull();
    // Default fallback shows loading spinner
    expect(screen.getByRole("generic", { busy: true })).toBeInTheDocument();
  });

  it("renders fallback when unauthorized and fallback is provided", () => {
    setupAuth({
      user: { id: "1", email: "buyer@test.com", name: "Buyer" },
      isAuthenticated: true,
      roles: ["buyer"],
    });

    render(
      <RoleGuard requiredRole="administrator" fallback={<div>Loading...</div>}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows loading spinner when unauthorized and no fallback provided", () => {
    setupAuth({
      user: { id: "1", email: "buyer@test.com", name: "Buyer" },
      isAuthenticated: true,
      roles: ["buyer"],
    });

    render(
      <RoleGuard requiredRole="administrator">
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    expect(screen.getByRole("generic", { busy: true })).toBeInTheDocument();
  });
});
