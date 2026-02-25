import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingGrid } from "@/components/search/listing-grid";
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

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  constructor() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

const makeListing = (id: string, make: string): IPublicListingCard => ({
  ID: id,
  slug: `${make.toLowerCase()}-model-2020-${id}`,
  make,
  model: "Model",
  variant: null,
  year: 2020,
  price: 15000,
  mileage: 50000,
  fuelType: "Essence",
  gearbox: "Manuelle",
  bodyType: "Berline",
  color: "Rouge",
  condition: "Bon",
  visibilityScore: 75,
  visibilityLabel: "Bien documenté",
  publishedAt: "2026-01-01",
  primaryPhotoUrl: null,
  photoCount: 0,
  certifiedFieldCount: 5,
  totalFieldCount: 10,
  sellerId: "seller-1",
  certificationLevel: null,
  ctValid: null,
  marketComparison: null,
});

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
    fieldName: "fuelType",
    displayOrder: 3,
    isVisible: true,
    labelFr: "Carburant",
    labelEn: "Fuel",
    fieldType: "badge",
  },
];

describe("ListingGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render listing cards", () => {
    const items = [makeListing("1", "Renault"), makeListing("2", "Peugeot")];
    render(<ListingGrid initialItems={items} initialTotal={2} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-grid")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-2")).toBeInTheDocument();
  });

  it("should show result count", () => {
    const items = [makeListing("1", "Renault")];
    render(<ListingGrid initialItems={items} initialTotal={42} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-grid-count")).toHaveTextContent("42 annonces trouvées");
  });

  it("should show singular form for 1 result", () => {
    const items = [makeListing("1", "Renault")];
    render(<ListingGrid initialItems={items} initialTotal={1} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-grid-count")).toHaveTextContent("1 annonce trouvée");
  });

  it("should show empty state when no listings", () => {
    render(<ListingGrid initialItems={[]} initialTotal={0} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-grid-empty")).toBeInTheDocument();
    expect(screen.getByText("Aucune annonce trouvée")).toBeInTheDocument();
  });

  it("should show sentinel when hasMore", () => {
    const items = [makeListing("1", "Renault")];
    render(<ListingGrid initialItems={items} initialTotal={50} cardConfig={defaultConfig} />);

    expect(screen.getByTestId("listing-grid-sentinel")).toBeInTheDocument();
  });

  it("should not show sentinel when all loaded", () => {
    const items = [makeListing("1", "Renault")];
    render(<ListingGrid initialItems={items} initialTotal={1} cardConfig={defaultConfig} />);

    expect(screen.queryByTestId("listing-grid-sentinel")).not.toBeInTheDocument();
  });

  it("should set up IntersectionObserver when hasMore", () => {
    const items = [makeListing("1", "Renault")];
    render(<ListingGrid initialItems={items} initialTotal={50} cardConfig={defaultConfig} />);

    expect(mockObserve).toHaveBeenCalled();
  });
});
