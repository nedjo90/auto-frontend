import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { ListingDetailClient } from "@/app/(public)/listings/[id]/listing-detail-client";
import type { IPublicListingDetail } from "@auto/shared";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function makeDetail(overrides: Partial<IPublicListingDetail> = {}): IPublicListingDetail {
  return {
    ID: "id-1",
    make: "Renault",
    model: "Clio",
    variant: null,
    year: 2022,
    price: 15000,
    mileage: 50000,
    fuelType: "Essence",
    engineCapacityCc: null,
    powerKw: null,
    powerHp: null,
    gearbox: "Manuelle",
    bodyType: null,
    doors: null,
    seats: null,
    color: null,
    co2GKm: null,
    euroNorm: null,
    energyClass: null,
    critAirLevel: null,
    critAirLabel: null,
    condition: "Bon",
    description: "Vehicule en bon etat",
    options: null,
    interiorColor: null,
    exteriorColor: null,
    transmission: null,
    driveType: null,
    registrationDate: null,
    status: "published",
    visibilityScore: 70,
    visibilityLabel: "Bien documenté",
    publishedAt: "2026-01-01",
    soldAt: null,
    sellerId: "seller-1",
    photos: [],
    certifiedFields: [],
    hasHistoryReport: false,
    analytics: { viewCount: 10, favoriteCount: 2 },
    ...overrides,
  };
}

describe("ListingDetailClient", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading spinner initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<ListingDetailClient listingId="id-1" />);
    expect(screen.getByTestId("listing-detail-loading")).toBeInTheDocument();
  });

  it("should render published listing normally", async () => {
    const detail = makeDetail();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(detail) }),
    });

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("listing-detail-title")).toHaveTextContent("Renault Clio (2022)");
    });
    expect(screen.getByTestId("contact-button")).toBeInTheDocument();
    expect(screen.queryByTestId("sold-banner")).not.toBeInTheDocument();
  });

  it("should render sold listing with sold banner", async () => {
    const detail = makeDetail({ status: "sold", soldAt: "2026-02-01" });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(detail) }),
    });

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("sold-banner")).toBeInTheDocument();
    });
  });

  it("should disable contact button for sold listings", async () => {
    const detail = makeDetail({ status: "sold" });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(detail) }),
    });

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("contact-button-disabled")).toBeInTheDocument();
    });
    expect(screen.getByTestId("contact-button-disabled")).toBeDisabled();
  });

  it("should show error when listing not found", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<ListingDetailClient listingId="nonexistent" />);
    await waitFor(() => {
      expect(screen.getByText("Annonce introuvable")).toBeInTheDocument();
    });
  });

  it("should show error on API failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<ListingDetailClient listingId="id-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("listing-detail-error")).toBeInTheDocument();
    });
  });
});
