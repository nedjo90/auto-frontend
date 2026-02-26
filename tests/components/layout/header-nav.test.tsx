import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/header";

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

import { useCurrentUser } from "@/hooks/use-current-user";

describe("Header desktop navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: false,
      userId: null,
      displayName: null,
      email: null,
    });
  });

  it("should render public nav links on desktop", () => {
    render(<Header />);

    expect(screen.getByTestId("desktop-nav")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-search")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-how-it-works")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-trust")).toBeInTheDocument();
  });

  it("should render Recherche link pointing to /search", () => {
    render(<Header />);

    const link = screen.getByTestId("nav-link-search");
    expect(link).toHaveAttribute("href", "/search");
    expect(link).toHaveTextContent("Recherche");
  });

  it("should render Comment ça marche link pointing to /how-it-works", () => {
    render(<Header />);

    const link = screen.getByTestId("nav-link-how-it-works");
    expect(link).toHaveAttribute("href", "/how-it-works");
  });

  it("should render Confiance link pointing to /trust", () => {
    render(<Header />);

    const link = screen.getByTestId("nav-link-trust");
    expect(link).toHaveAttribute("href", "/trust");
    expect(link).toHaveTextContent("Confiance");
  });

  it("should highlight active link based on pathname", () => {
    mockUsePathname.mockReturnValue("/search");
    render(<Header />);

    const searchLink = screen.getByTestId("nav-link-search");
    expect(searchLink.className).toContain("text-foreground");
    expect(searchLink.className).toContain("font-medium");

    const trustLink = screen.getByTestId("nav-link-trust");
    expect(trustLink.className).toContain("text-muted-foreground");
  });

  it("should highlight link for sub-routes", () => {
    mockUsePathname.mockReturnValue("/search?make=Peugeot");
    render(<Header />);

    const searchLink = screen.getByTestId("nav-link-search");
    expect(searchLink.className).toContain("font-medium");
  });

  it("should show auth buttons when not authenticated", () => {
    render(<Header />);

    expect(screen.getByText("Se connecter")).toBeInTheDocument();
  });

  it("should show user menu when authenticated", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isAuthenticated: true,
      userId: "user-1",
      displayName: "Test User",
      email: "test@test.com",
    });
    render(<Header />);

    expect(screen.getByText("TU")).toBeInTheDocument();
  });
});
