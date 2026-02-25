import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResults } from "@/components/search/search-results";
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

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

// Mock useIsMobile
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
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
];

describe("SearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the search results container", () => {
    const items = [makeListing("1", "Renault")];
    render(
      <SearchResults
        initialItems={items}
        initialTotal={1}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-results")).toBeInTheDocument();
  });

  it("should show result count", () => {
    const items = [makeListing("1", "Renault")];
    render(
      <SearchResults
        initialItems={items}
        initialTotal={42}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-result-count")).toHaveTextContent("42 annonces trouvées");
  });

  it("should show singular form for 1 result", () => {
    const items = [makeListing("1", "Renault")];
    render(
      <SearchResults
        initialItems={items}
        initialTotal={1}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-result-count")).toHaveTextContent("1 annonce trouvée");
  });

  it("should show empty state when no listings", () => {
    render(
      <SearchResults
        initialItems={[]}
        initialTotal={0}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-empty")).toBeInTheDocument();
  });

  it("should render listing cards", () => {
    const items = [makeListing("1", "Renault"), makeListing("2", "Peugeot")];
    render(
      <SearchResults
        initialItems={items}
        initialTotal={2}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("listing-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-2")).toBeInTheDocument();
  });

  it("should render the sort select", () => {
    render(
      <SearchResults
        initialItems={[makeListing("1", "Renault")]}
        initialTotal={1}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-sort")).toBeInTheDocument();
  });

  it("should render filter sidebar", () => {
    render(
      <SearchResults
        initialItems={[makeListing("1", "Renault")]}
        initialTotal={1}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-filter-sidebar")).toBeInTheDocument();
  });

  it("should render filter chips when URL params have filters", () => {
    // The component syncs from URL params, so set them
    mockSearchParams.set("make", "Renault");
    render(
      <SearchResults
        initialItems={[makeListing("1", "Renault")]}
        initialTotal={1}
        cardConfig={defaultConfig}
        initialFilters={{ make: "Renault" }}
      />,
    );
    expect(screen.getByTestId("filter-chips")).toBeInTheDocument();
    mockSearchParams.delete("make");
  });

  it("should show sentinel when hasMore", () => {
    const items = [makeListing("1", "Renault")];
    render(
      <SearchResults
        initialItems={items}
        initialTotal={50}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(screen.getByTestId("search-sentinel")).toBeInTheDocument();
  });

  it("should set up IntersectionObserver", () => {
    const items = [makeListing("1", "Renault")];
    render(
      <SearchResults
        initialItems={items}
        initialTotal={50}
        cardConfig={defaultConfig}
        initialFilters={{}}
      />,
    );
    expect(mockObserve).toHaveBeenCalled();
  });
});
