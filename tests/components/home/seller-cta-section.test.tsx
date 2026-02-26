import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SellerCtaSection } from "@/components/home/seller-cta-section";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("SellerCtaSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
  });

  it("should render section with title", () => {
    render(<SellerCtaSection />);

    expect(screen.getByTestId("seller-cta-section")).toBeInTheDocument();
    expect(screen.getByText("Vendez votre véhicule")).toBeInTheDocument();
  });

  it("should display all 3 benefits", () => {
    render(<SellerCtaSection />);

    expect(screen.getByTestId("benefit-autofill")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-visibility")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-audience")).toBeInTheDocument();
  });

  it("should display benefit texts", () => {
    render(<SellerCtaSection />);

    expect(screen.getByText("Remplissage automatique en 3 secondes")).toBeInTheDocument();
    expect(screen.getByText("Score de visibilité en temps réel")).toBeInTheDocument();
    expect(screen.getByText(/Audience qualifiée d.acheteurs vérifiés/)).toBeInTheDocument();
  });

  it("should navigate to /register when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(<SellerCtaSection />);

    fireEvent.click(screen.getByTestId("seller-cta-button"));
    expect(pushMock).toHaveBeenCalledWith("/register");
  });

  it("should navigate to /seller/publish when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(<SellerCtaSection />);

    fireEvent.click(screen.getByTestId("seller-cta-button"));
    expect(pushMock).toHaveBeenCalledWith("/seller/publish");
  });

  it("should have responsive grid for benefits", () => {
    render(<SellerCtaSection />);

    const grid = screen.getByTestId("benefit-autofill").parentElement;
    expect(grid?.className).toContain("sm:grid-cols-3");
  });
});
