import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";

describe("MobileNav", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      roles: ["administrator"],
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn((role: string) => role === "administrator" || role === "seller"),
    });
  });

  it("renders hamburger button", () => {
    render(<MobileNav />);
    expect(screen.getByLabelText("Ouvrir le menu")).toBeInTheDocument();
  });

  it("opens sheet on hamburger click", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByLabelText("Ouvrir le menu"));
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
  });

  it("shows admin links for administrator", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByLabelText("Ouvrir le menu"));
    expect(screen.getByText("Administration")).toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Alertes")).toBeInTheDocument();
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
  });

  it("hides admin links for non-admin user", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      roles: ["buyer"],
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => false),
    });

    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByLabelText("Ouvrir le menu"));
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("shows seller links for seller role", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      roles: ["seller"],
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn((role: string) => role === "seller"),
    });

    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByLabelText("Ouvrir le menu"));
    expect(screen.getByText("Mes brouillons")).toBeInTheDocument();
    expect(screen.getByText("Publier")).toBeInTheDocument();
  });

  it("is hidden on md+ screens via CSS class", () => {
    render(<MobileNav />);
    const container = screen.getByLabelText("Ouvrir le menu").closest("div");
    expect(container?.className).toContain("md:hidden");
  });
});
