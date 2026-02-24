import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SellerCockpitPage from "@/app/(dashboard)/seller/page";

describe("SellerCockpitPage", () => {
  it("should render page title", () => {
    render(<SellerCockpitPage />);
    expect(screen.getByText("Cockpit Vendeur")).toBeInTheDocument();
  });

  it("should render all section links", () => {
    render(<SellerCockpitPage />);
    expect(screen.getByText("Mes brouillons")).toBeInTheDocument();
    expect(screen.getByText("Mes annonces en ligne")).toBeInTheDocument();
    expect(screen.getByText("Publier")).toBeInTheDocument();
    expect(screen.getByText("Historique")).toBeInTheDocument();
  });

  it("should link to drafts page", () => {
    render(<SellerCockpitPage />);
    const link = screen.getByText("Mes brouillons").closest("a");
    expect(link).toHaveAttribute("href", "/seller/drafts");
  });

  it("should link to listings page", () => {
    render(<SellerCockpitPage />);
    const link = screen.getByText("Mes annonces en ligne").closest("a");
    expect(link).toHaveAttribute("href", "/seller/listings");
  });

  it("should link to publish page", () => {
    render(<SellerCockpitPage />);
    const link = screen.getByText("Publier").closest("a");
    expect(link).toHaveAttribute("href", "/seller/publish");
  });

  it("should link to history page", () => {
    render(<SellerCockpitPage />);
    const link = screen.getByText("Historique").closest("a");
    expect(link).toHaveAttribute("href", "/seller/history");
  });
});
