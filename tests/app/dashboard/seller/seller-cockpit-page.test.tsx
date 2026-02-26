import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerCockpitPage from "@/app/(dashboard)/seller/page";
import type { ISellerKpiSummary, ISellerListingPerformance } from "@auto/shared";

const mockGetAggregateKPIs = vi.fn();
const mockGetListingPerformance = vi.fn();
const mockGetMetricDrilldown = vi.fn();

vi.mock("@/lib/api/seller-kpi-api", () => ({
  getAggregateKPIs: (...args: unknown[]) => mockGetAggregateKPIs(...args),
  getListingPerformance: (...args: unknown[]) => mockGetListingPerformance(...args),
  getMetricDrilldown: (...args: unknown[]) => mockGetMetricDrilldown(...args),
}));

const MOCK_KPIS: ISellerKpiSummary = {
  activeListings: { current: 3, previous: 2, trend: 50 },
  totalViews: { current: 200, previous: 150, trend: 33.3 },
  totalContacts: { current: 8, previous: 5, trend: 60 },
  avgDaysOnline: { current: 10, previous: 8, trend: 25 },
};

const MOCK_LISTINGS: ISellerListingPerformance[] = [
  {
    ID: "listing-1",
    make: "Renault",
    model: "Clio",
    year: 2022,
    price: 15000,
    status: "published",
    visibilityScore: 80,
    visibilityLabel: "Très documenté",
    publishedAt: "2026-02-01T08:00:00Z",
    viewCount: 100,
    favoriteCount: 8,
    chatCount: 3,
    daysOnMarket: 15,
    photoCount: 4,
    primaryPhotoUrl: null,
    marketPosition: "aligned",
    marketPercentageDiff: 2,
    marketDisplayText: "Prix aligné",
    marketIsEstimation: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAggregateKPIs.mockResolvedValue(MOCK_KPIS);
  mockGetListingPerformance.mockResolvedValue({ listings: MOCK_LISTINGS, total: 1 });
  mockGetMetricDrilldown.mockResolvedValue({
    metric: "totalViews",
    listingId: null,
    points: [{ date: "2026-02-01", value: 50 }],
    insights: [],
  });
});

describe("SellerCockpitPage", () => {
  it("renders page title", async () => {
    render(<SellerCockpitPage />);
    expect(screen.getByText("Cockpit Vendeur")).toBeInTheDocument();
  });

  it("renders all section links", async () => {
    render(<SellerCockpitPage />);
    expect(screen.getByText("Mes brouillons")).toBeInTheDocument();
    expect(screen.getByText("Mes annonces en ligne")).toBeInTheDocument();
    expect(screen.getByText("Publier")).toBeInTheDocument();
    expect(screen.getByText("Historique")).toBeInTheDocument();
  });

  it("fetches and displays KPIs", async () => {
    render(<SellerCockpitPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seller-kpi-grid")).toBeInTheDocument();
    });
    expect(screen.getByText("Annonces actives")).toBeInTheDocument();
    expect(screen.getByText("Vues totales")).toBeInTheDocument();
  });

  it("fetches and displays listings table", async () => {
    render(<SellerCockpitPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seller-listings-table")).toBeInTheDocument();
    });
    expect(screen.getByTestId("listing-card-listing-1")).toBeInTheDocument();
  });

  it("shows drilldown when KPI card is clicked", async () => {
    const user = userEvent.setup();
    render(<SellerCockpitPage />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-kpi-grid")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Vues totales").closest("[role='button']")!);

    await waitFor(() => {
      expect(screen.getByTestId("metric-drilldown")).toBeInTheDocument();
    });
  });

  it("closes drilldown when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<SellerCockpitPage />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-kpi-grid")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Vues totales").closest("[role='button']")!);
    await waitFor(() => {
      expect(screen.getByTestId("metric-drilldown")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("drilldown-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("metric-drilldown")).not.toBeInTheDocument();
    });
  });

  it("handles KPI fetch error gracefully", async () => {
    mockGetAggregateKPIs.mockRejectedValue(new Error("Failed"));
    render(<SellerCockpitPage />);
    // Should not crash, KPI grid just won't show
    await waitFor(() => {
      expect(screen.queryByTestId("kpi-grid-skeleton")).not.toBeInTheDocument();
    });
  });

  it("handles listing fetch error gracefully", async () => {
    mockGetListingPerformance.mockRejectedValue(new Error("Failed"));
    render(<SellerCockpitPage />);
    // Should show empty state
    await waitFor(() => {
      expect(screen.getByTestId("listings-table-empty")).toBeInTheDocument();
    });
  });

  it("links to drafts page", async () => {
    render(<SellerCockpitPage />);
    const link = screen.getByText("Mes brouillons").closest("a");
    expect(link).toHaveAttribute("href", "/seller/drafts");
  });

  it("shows market position detail when market badge is clicked", async () => {
    const user = userEvent.setup();
    render(<SellerCockpitPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seller-listings-table")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("market-badge-listing-1"));
    await waitFor(() => {
      expect(screen.getByTestId("market-position-detail")).toBeInTheDocument();
    });
  });

  it("closes market position detail when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<SellerCockpitPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seller-listings-table")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("market-badge-listing-1"));
    await waitFor(() => {
      expect(screen.getByTestId("market-position-detail")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("market-detail-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("market-position-detail")).not.toBeInTheDocument();
    });
  });
});
