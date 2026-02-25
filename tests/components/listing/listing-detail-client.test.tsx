import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

const baseDetail: IPublicListingDetail = {
  ID: "test-listing-1",
  make: "Renault",
  model: "Clio",
  variant: "RS",
  year: 2020,
  price: 15000,
  mileage: 50000,
  fuelType: "Essence",
  engineCapacityCc: 1600,
  powerKw: 147,
  powerHp: 200,
  gearbox: "Manuelle",
  bodyType: "Berline",
  doors: 5,
  seats: 5,
  color: "Rouge",
  co2GKm: 140,
  euroNorm: "Euro 6",
  energyClass: "C",
  critAirLevel: "1",
  critAirLabel: "Crit'Air 1",
  condition: "Bon",
  description: "Une superbe voiture bien entretenue.",
  options: '["GPS","Climatisation"]',
  interiorColor: "Noir",
  exteriorColor: "Rouge",
  transmission: "Manuelle",
  driveType: "Traction",
  registrationDate: "2020-03-15",
  status: "published",
  visibilityScore: 80,
  visibilityLabel: "Bien documenté",
  publishedAt: "2026-01-01T00:00:00Z",
  soldAt: null,
  sellerId: "seller-1",
  certificationLevel: "bien_documente",
  ctValid: true,
  marketComparison: { position: "aligned", percentageDiff: 0, displayText: "Prix aligné" },
  photos: [
    {
      ID: "photo-1",
      listingId: "test-listing-1",
      blobUrl: "blob://photo1",
      cdnUrl: "https://cdn/photo1.jpg",
      sortOrder: 0,
      isPrimary: true,
      fileSize: 500000,
      mimeType: "image/jpeg",
      width: 1200,
      height: 800,
      uploadedAt: "2026-01-01",
    },
  ],
  certifiedFields: [
    { fieldName: "make", source: "SIV", isCertified: true },
    { fieldName: "model", source: "SIV", isCertified: true },
    { fieldName: "year", source: "SIV", isCertified: true },
  ],
  hasHistoryReport: true,
  analytics: { viewCount: 42, favoriteCount: 5 },
};

describe("ListingDetailClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<ListingDetailClient listingId="test-listing-1" />);

    expect(screen.getByTestId("listing-detail-loading")).toBeInTheDocument();
  });

  it("should render listing detail after loading", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(baseDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-detail")).toBeInTheDocument();
    });

    expect(screen.getByTestId("listing-detail-title")).toHaveTextContent("Renault Clio RS (2020)");
    expect(screen.getByTestId("listing-detail-price")).toHaveTextContent("15");
  });

  it("should show certification badges", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(baseDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-detail-cert-badge")).toBeInTheDocument();
    });

    expect(screen.getByTestId("listing-detail-cert-badge")).toHaveTextContent("Bien documenté");
    expect(screen.getByTestId("listing-detail-cert-count")).toHaveTextContent("3 champs certifiés");
  });

  it("should show history report badge when available", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(baseDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByText("Historique disponible")).toBeInTheDocument();
    });
  });

  it("should show description", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(baseDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-detail-description")).toHaveTextContent(
        "Une superbe voiture bien entretenue.",
      );
    });
  });

  it("should show contact button for published listing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(baseDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("contact-button")).toBeInTheDocument();
    });
    expect(screen.getByTestId("contact-button")).not.toBeDisabled();
  });

  it("should show sold banner and disabled contact for sold listing", async () => {
    const soldDetail = { ...baseDetail, status: "sold", soldAt: "2026-02-01" };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(soldDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("sold-banner")).toBeInTheDocument();
    });
    expect(screen.getByTestId("contact-button-disabled")).toBeDisabled();
  });

  it("should show error for not found listing", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<ListingDetailClient listingId="not-found" />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-detail-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Annonce introuvable")).toBeInTheDocument();
  });

  it("should show spec fields with certified indicators", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ listing: JSON.stringify(baseDetail) }),
    });

    render(<ListingDetailClient listingId="test-listing-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("spec-field-year")).toBeInTheDocument();
    });
    expect(screen.getByTestId("spec-field-fuelType")).toHaveTextContent("Essence");
    expect(screen.getByTestId("spec-field-gearbox")).toHaveTextContent("Manuelle");
  });
});
