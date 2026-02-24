import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingCard } from "@/components/listing/listing-card";
import type { IPublicListingCard, IConfigListingCard } from "@auto/shared";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseListing: IPublicListingCard = {
  ID: "test-listing-1",
  make: "Renault",
  model: "Clio",
  variant: "RS",
  year: 2020,
  price: 15000,
  mileage: 50000,
  fuelType: "Essence",
  gearbox: "Manuelle",
  bodyType: "Berline",
  color: "Rouge",
  condition: "Bon",
  visibilityScore: 80,
  visibilityLabel: "Bien documenté",
  publishedAt: "2026-01-01T00:00:00Z",
  primaryPhotoUrl: "https://cdn.example.com/photo1.jpg",
  photoCount: 5,
  certifiedFieldCount: 10,
  totalFieldCount: 15,
  sellerId: "seller-1",
};

const defaultConfig: IConfigListingCard[] = [
  {
    ID: "1",
    fieldName: "price",
    displayOrder: 1,
    isVisible: true,
    labelFr: "Prix",
    labelEn: "Price",
    fieldType: "price",
  },
  {
    ID: "2",
    fieldName: "make",
    displayOrder: 2,
    isVisible: true,
    labelFr: "Marque",
    labelEn: "Make",
    fieldType: "text",
  },
  {
    ID: "3",
    fieldName: "model",
    displayOrder: 3,
    isVisible: true,
    labelFr: "Modèle",
    labelEn: "Model",
    fieldType: "text",
  },
  {
    ID: "4",
    fieldName: "year",
    displayOrder: 4,
    isVisible: true,
    labelFr: "Année",
    labelEn: "Year",
    fieldType: "text",
  },
  {
    ID: "5",
    fieldName: "mileage",
    displayOrder: 5,
    isVisible: true,
    labelFr: "Kilométrage",
    labelEn: "Mileage",
    fieldType: "text",
  },
  {
    ID: "6",
    fieldName: "fuelType",
    displayOrder: 6,
    isVisible: true,
    labelFr: "Carburant",
    labelEn: "Fuel",
    fieldType: "badge",
  },
  {
    ID: "7",
    fieldName: "visibilityLabel",
    displayOrder: 7,
    isVisible: true,
    labelFr: "Certification",
    labelEn: "Certification",
    fieldType: "badge",
  },
];

describe("ListingCard", () => {
  it("should render card with listing data", () => {
    render(<ListingCard listing={baseListing} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-card-test-listing-1")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-price")).toHaveTextContent("15");
    expect(screen.getByTestId("listing-card-title")).toHaveTextContent("Renault Clio (2020)");
  });

  it("should render configurable fields", () => {
    render(<ListingCard listing={baseListing} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-card-field-fuelType")).toHaveTextContent("Essence");
    expect(screen.getByTestId("listing-card-field-visibilityLabel")).toHaveTextContent(
      "Bien documenté",
    );
    expect(screen.getByTestId("listing-card-field-mileage")).toHaveTextContent("50");
  });

  it("should work with 4 fields", () => {
    const fourFields = defaultConfig.slice(0, 4);
    render(<ListingCard listing={baseListing} cardConfig={fourFields} />);

    expect(screen.getByTestId("listing-card-title")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-fields")).toBeInTheDocument();
  });

  it("should work with 5 fields", () => {
    const fiveFields = defaultConfig.slice(0, 5);
    render(<ListingCard listing={baseListing} cardConfig={fiveFields} />);

    expect(screen.getByTestId("listing-card-title")).toBeInTheDocument();
  });

  it("should work with 6 fields", () => {
    const sixFields = defaultConfig.slice(0, 6);
    render(<ListingCard listing={baseListing} cardConfig={sixFields} />);

    expect(screen.getByTestId("listing-card-title")).toBeInTheDocument();
  });

  it("should work with 7 fields", () => {
    render(<ListingCard listing={baseListing} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-card-title")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-fields")).toBeInTheDocument();
  });

  it("should handle listing without photo", () => {
    const noPhoto = { ...baseListing, primaryPhotoUrl: null, photoCount: 0 };
    render(<ListingCard listing={noPhoto} cardConfig={defaultConfig} />);

    expect(screen.getByText("Pas de photo")).toBeInTheDocument();
  });

  it("should show photo count when multiple photos", () => {
    render(<ListingCard listing={baseListing} cardConfig={defaultConfig} />);

    expect(screen.getByText("5 photos")).toBeInTheDocument();
  });

  it("should not show photo count when only one photo", () => {
    const onePhoto = { ...baseListing, photoCount: 1 };
    render(<ListingCard listing={onePhoto} cardConfig={defaultConfig} />);

    expect(screen.queryByText(/photos/)).not.toBeInTheDocument();
  });

  it("should link to listing detail page", () => {
    render(<ListingCard listing={baseListing} cardConfig={defaultConfig} />);

    const link = screen.getByTestId("listing-card-test-listing-1");
    expect(link).toHaveAttribute("href", "/listings/test-listing-1");
  });

  it("should apply green badge for high visibility score", () => {
    const highScore = { ...baseListing, visibilityScore: 90 };
    render(<ListingCard listing={highScore} cardConfig={defaultConfig} />);

    const badge = screen.getByTestId("listing-card-field-visibilityLabel");
    expect(badge.className).toContain("green");
  });

  it("should handle listing without price", () => {
    const noPrice = { ...baseListing, price: null };
    render(<ListingCard listing={noPrice} cardConfig={defaultConfig} />);

    expect(screen.queryByTestId("listing-card-price")).not.toBeInTheDocument();
  });
});
