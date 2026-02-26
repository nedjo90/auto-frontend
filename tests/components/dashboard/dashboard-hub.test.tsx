import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

describe("DashboardHub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUser.mockReturnValue({ displayName: "Jean Dupont" });
    mockUseAuth.mockReturnValue({
      hasRole: () => false,
    });
  });

  it("should render welcome message with user name", () => {
    render(<DashboardHub />);

    expect(screen.getByTestId("dashboard-hub")).toBeInTheDocument();
    expect(screen.getByText(/Bienvenue, Jean Dupont/)).toBeInTheDocument();
  });

  it("should render welcome message without name when not available", () => {
    mockUseCurrentUser.mockReturnValue({ displayName: null });
    render(<DashboardHub />);

    expect(screen.getByText(/Bienvenue/)).toBeInTheDocument();
  });

  it("should always show buyer section", () => {
    render(<DashboardHub />);

    expect(screen.getByTestId("hub-buyer")).toBeInTheDocument();
    expect(screen.getByText("Rechercher")).toBeInTheDocument();
    expect(screen.getByText("Mes favoris")).toBeInTheDocument();
  });

  it("should show seller section for seller role", () => {
    mockUseAuth.mockReturnValue({
      hasRole: (r: string) => r === "seller",
    });
    render(<DashboardHub />);

    expect(screen.getByTestId("hub-seller")).toBeInTheDocument();
    expect(screen.getByText("Mes brouillons")).toBeInTheDocument();
    expect(screen.getByText("Publier")).toBeInTheDocument();
    expect(screen.getByText("Suivi marché")).toBeInTheDocument();
  });

  it("should not show seller section for buyer-only user", () => {
    render(<DashboardHub />);

    expect(screen.queryByTestId("hub-seller")).not.toBeInTheDocument();
  });

  it("should show moderator section for moderator role", () => {
    mockUseAuth.mockReturnValue({
      hasRole: (r: string) => r === "moderator",
    });
    render(<DashboardHub />);

    expect(screen.getByTestId("hub-moderator")).toBeInTheDocument();
    expect(screen.getAllByText("Modération").length).toBeGreaterThanOrEqual(1);
  });

  it("should show admin section for administrator role", () => {
    mockUseAuth.mockReturnValue({
      hasRole: (r: string) => r === "administrator",
    });
    render(<DashboardHub />);

    expect(screen.getByTestId("hub-admin")).toBeInTheDocument();
    expect(screen.getByText("KPIs")).toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Alertes")).toBeInTheDocument();
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
  });

  it("should not show moderator section when user is admin (admin section replaces it)", () => {
    mockUseAuth.mockReturnValue({
      hasRole: (r: string) => r === "administrator" || r === "moderator",
    });
    render(<DashboardHub />);

    expect(screen.getByTestId("hub-admin")).toBeInTheDocument();
    expect(screen.queryByTestId("hub-moderator")).not.toBeInTheDocument();
  });

  it("should show multiple sections for multi-role user (admin + seller)", () => {
    mockUseAuth.mockReturnValue({
      hasRole: (r: string) => r === "administrator" || r === "seller",
    });
    render(<DashboardHub />);

    expect(screen.getByTestId("hub-admin")).toBeInTheDocument();
    expect(screen.getByTestId("hub-seller")).toBeInTheDocument();
    expect(screen.getByTestId("hub-buyer")).toBeInTheDocument();
  });

  it("should have quick links pointing to correct routes", () => {
    mockUseAuth.mockReturnValue({
      hasRole: (r: string) => r === "seller",
    });
    render(<DashboardHub />);

    const draftsLink = screen.getByText("Mes brouillons").closest("a");
    expect(draftsLink).toHaveAttribute("href", "/seller/drafts");

    const publishLink = screen.getByText("Publier").closest("a");
    expect(publishLink).toHaveAttribute("href", "/seller/publish");
  });
});
