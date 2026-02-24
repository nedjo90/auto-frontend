import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { ListingDetailClient } from "@/app/(public)/listings/[id]/listing-detail-client";

const mockGetPublicListing = vi.fn();

vi.mock("@/lib/api/lifecycle-api", () => ({
  getPublicListing: (...args: unknown[]) => mockGetPublicListing(...args),
}));

describe("ListingDetailClient", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading spinner initially", () => {
    mockGetPublicListing.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ListingDetailClient listingId="id-1" />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render published listing normally", async () => {
    mockGetPublicListing.mockResolvedValue({
      ID: "id-1",
      make: "Renault",
      model: "Clio",
      year: 2022,
      price: 15000,
      status: "published",
      description: "Vehicule en bon etat",
    });

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByText("Renault Clio (2022)")).toBeInTheDocument();
    });
    expect(screen.getByTestId("contact-button")).toBeInTheDocument();
    expect(screen.queryByTestId("sold-badge")).not.toBeInTheDocument();
  });

  it("should render sold listing with Vendu badge", async () => {
    mockGetPublicListing.mockResolvedValue({
      ID: "id-1",
      make: "Peugeot",
      model: "308",
      year: 2023,
      price: 22000,
      status: "sold",
      description: "Vehicule vendu",
    });

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("sold-badge")).toBeInTheDocument();
    });
    expect(screen.getByTestId("sold-banner")).toBeInTheDocument();
    expect(screen.getByTestId("sold-banner").textContent).toContain("a ete vendu");
  });

  it("should disable contact button for sold listings", async () => {
    mockGetPublicListing.mockResolvedValue({
      ID: "id-1",
      make: "Renault",
      model: "Clio",
      year: 2022,
      price: 15000,
      status: "sold",
    });

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("contact-button-disabled")).toBeInTheDocument();
    });
    expect(screen.getByTestId("contact-button-disabled")).toBeDisabled();
  });

  it("should show error when listing not found", async () => {
    mockGetPublicListing.mockResolvedValue(null);

    render(<ListingDetailClient listingId="nonexistent" />);
    await waitFor(() => {
      expect(screen.getByText("Annonce introuvable")).toBeInTheDocument();
    });
  });

  it("should show error on API failure", async () => {
    mockGetPublicListing.mockRejectedValue(new Error("Network error"));

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });
  });
});
