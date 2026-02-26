import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicTabBar } from "@/components/layout/public-tab-bar";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("PublicTabBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
  });

  it("should render tab bar with 5 tabs", () => {
    render(<PublicTabBar />);

    expect(screen.getByTestId("public-tab-bar")).toBeInTheDocument();
    expect(screen.getByTestId("tab-accueil")).toBeInTheDocument();
    expect(screen.getByTestId("tab-recherche")).toBeInTheDocument();
    expect(screen.getByTestId("tab-favoris")).toBeInTheDocument();
    expect(screen.getByTestId("tab-messages")).toBeInTheDocument();
    expect(screen.getByTestId("tab-profil")).toBeInTheDocument();
  });

  it("should have correct hrefs for public tabs", () => {
    render(<PublicTabBar />);

    expect(screen.getByTestId("tab-accueil")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("tab-recherche")).toHaveAttribute("href", "/search");
  });

  it("should redirect auth-required tabs to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(<PublicTabBar />);

    expect(screen.getByTestId("tab-favoris")).toHaveAttribute("href", "/login");
    expect(screen.getByTestId("tab-messages")).toHaveAttribute("href", "/login");
    expect(screen.getByTestId("tab-profil")).toHaveAttribute("href", "/login");
  });

  it("should link to real routes when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(<PublicTabBar />);

    expect(screen.getByTestId("tab-favoris")).toHaveAttribute("href", "/favorites");
    expect(screen.getByTestId("tab-messages")).toHaveAttribute("href", "/seller/chat");
    expect(screen.getByTestId("tab-profil")).toHaveAttribute("href", "/profile");
  });

  it("should highlight active tab based on exact match for home", () => {
    mockUsePathname.mockReturnValue("/");
    render(<PublicTabBar />);

    const homeTab = screen.getByTestId("tab-accueil");
    expect(homeTab.className).toContain("text-primary");
  });

  it("should highlight active tab based on startsWith for search", () => {
    mockUsePathname.mockReturnValue("/search?make=Peugeot");
    render(<PublicTabBar />);

    const searchTab = screen.getByTestId("tab-recherche");
    expect(searchTab.className).toContain("text-primary");

    const homeTab = screen.getByTestId("tab-accueil");
    expect(homeTab.className).toContain("text-muted-foreground");
  });

  it("should be hidden on md+ breakpoint via CSS", () => {
    render(<PublicTabBar />);

    const tabBar = screen.getByTestId("public-tab-bar");
    expect(tabBar.className).toContain("md:hidden");
  });

  it("should have fixed positioning at bottom", () => {
    render(<PublicTabBar />);

    const tabBar = screen.getByTestId("public-tab-bar");
    expect(tabBar.className).toContain("fixed");
    expect(tabBar.className).toContain("bottom-0");
    expect(tabBar.className).toContain("z-50");
  });
});
