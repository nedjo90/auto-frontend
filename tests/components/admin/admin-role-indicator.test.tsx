import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

let mockRoles: string[] = [];

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    roles: mockRoles,
    isAuthenticated: true,
    user: null,
    hasRole: (r: string) => mockRoles.includes(r),
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { AdminRoleIndicator } from "@/components/admin/admin-role-indicator";

describe("AdminRoleIndicator", () => {
  beforeEach(() => {
    cleanup();
    mockRoles = [];
  });

  it("should render the role indicator container", () => {
    mockRoles = ["visitor", "buyer", "seller", "moderator", "administrator"];
    render(<AdminRoleIndicator />);
    expect(screen.getByTestId("admin-role-indicator")).toBeInTheDocument();
  });

  it("should show Administrateur badge for admin role", () => {
    mockRoles = ["visitor", "buyer", "seller", "moderator", "administrator"];
    render(<AdminRoleIndicator />);
    expect(screen.getByTestId("admin-role-badge")).toHaveTextContent("Administrateur");
  });

  it("should show super-role label for admin", () => {
    mockRoles = ["visitor", "buyer", "seller", "moderator", "administrator"];
    render(<AdminRoleIndicator />);
    expect(screen.getByTestId("super-role-label")).toHaveTextContent("Acces complet (FR54)");
  });

  it("should show Moderateur badge for moderator role", () => {
    mockRoles = ["visitor", "buyer", "seller", "moderator"];
    render(<AdminRoleIndicator />);
    expect(screen.getByTestId("admin-role-badge")).toHaveTextContent("Moderateur");
  });

  it("should not show super-role label for non-admin", () => {
    mockRoles = ["visitor", "buyer", "seller", "moderator"];
    render(<AdminRoleIndicator />);
    expect(screen.queryByTestId("super-role-label")).not.toBeInTheDocument();
  });

  it("should show Visiteur when roles array has only visitor", () => {
    mockRoles = ["visitor"];
    render(<AdminRoleIndicator />);
    expect(screen.getByTestId("admin-role-badge")).toHaveTextContent("Visiteur");
  });
});
