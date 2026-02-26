import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "@/components/home/hero-section";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("HeroSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
  });

  it("should render hero section with title and subtitle", () => {
    render(<HeroSection />);

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("hero-title")).toHaveTextContent(
      "Trouvez votre prochain véhicule en toute confiance",
    );
    expect(screen.getByTestId("hero-subtitle")).toHaveTextContent(
      "Annonces vérifiées. Données certifiées. Transparence totale.",
    );
  });

  it("should render search form with all fields", () => {
    render(<HeroSection />);

    expect(screen.getByTestId("hero-search-form")).toBeInTheDocument();
    expect(screen.getByTestId("hero-search-make")).toBeInTheDocument();
    expect(screen.getByTestId("hero-search-model")).toBeInTheDocument();
    expect(screen.getByTestId("hero-search-city")).toBeInTheDocument();
    expect(screen.getByTestId("hero-search-budget")).toBeInTheDocument();
    expect(screen.getByTestId("hero-search-submit")).toBeInTheDocument();
  });

  it("should navigate to /search with params on form submit", () => {
    render(<HeroSection />);

    fireEvent.change(screen.getByTestId("hero-search-make"), {
      target: { value: "Peugeot" },
    });
    fireEvent.change(screen.getByTestId("hero-search-model"), {
      target: { value: "308" },
    });
    fireEvent.change(screen.getByTestId("hero-search-city"), {
      target: { value: "Paris" },
    });
    fireEvent.change(screen.getByTestId("hero-search-budget"), {
      target: { value: "20000" },
    });

    fireEvent.submit(screen.getByTestId("hero-search-form"));

    expect(pushMock).toHaveBeenCalledWith(
      "/search?make=Peugeot&model=308&search=Paris&maxPrice=20000",
    );
  });

  it("should navigate to /search without empty params", () => {
    render(<HeroSection />);

    fireEvent.submit(screen.getByTestId("hero-search-form"));

    expect(pushMock).toHaveBeenCalledWith("/search?");
  });

  it("should navigate to /search with partial params", () => {
    render(<HeroSection />);

    fireEvent.change(screen.getByTestId("hero-search-make"), {
      target: { value: "Renault" },
    });

    fireEvent.submit(screen.getByTestId("hero-search-form"));

    expect(pushMock).toHaveBeenCalledWith("/search?make=Renault");
  });

  it("should show seller CTA linking to /register when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(<HeroSection />);

    const sellerCta = screen.getByTestId("hero-seller-cta");
    expect(sellerCta).toBeInTheDocument();
    fireEvent.click(sellerCta);
    expect(pushMock).toHaveBeenCalledWith("/register");
  });

  it("should show seller CTA linking to /seller/publish when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(<HeroSection />);

    const sellerCta = screen.getByTestId("hero-seller-cta");
    fireEvent.click(sellerCta);
    expect(pushMock).toHaveBeenCalledWith("/seller/publish");
  });

  it("should have Lora serif font on title", () => {
    render(<HeroSection />);

    const title = screen.getByTestId("hero-title");
    expect(title.className).toContain("font-serif");
  });

  it("should have responsive title sizing", () => {
    render(<HeroSection />);

    const title = screen.getByTestId("hero-title");
    expect(title.className).toContain("text-3xl");
    expect(title.className).toContain("sm:text-4xl");
    expect(title.className).toContain("lg:text-5xl");
  });
});
