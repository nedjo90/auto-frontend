import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerListingsTable } from "@/components/seller/seller-listings-table";
import type { ISellerListingPerformance } from "@auto/shared";

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
    viewCount: 150,
    favoriteCount: 12,
    chatCount: 5,
    daysOnMarket: 23,
    photoCount: 5,
    primaryPhotoUrl: null,
    marketPosition: "aligned",
  },
  {
    ID: "listing-2",
    make: "Peugeot",
    model: "308",
    year: 2023,
    price: 22000,
    status: "published",
    visibilityScore: 50,
    visibilityLabel: "Bien documenté",
    publishedAt: "2026-02-05T08:00:00Z",
    viewCount: 80,
    favoriteCount: 6,
    chatCount: 2,
    daysOnMarket: 10,
    photoCount: 3,
    primaryPhotoUrl: null,
    marketPosition: "below",
  },
];

describe("SellerListingsTable", () => {
  it("renders loading skeleton when loading", () => {
    render(<SellerListingsTable listings={[]} loading={true} />);
    expect(screen.getByTestId("listings-table-skeleton")).toBeInTheDocument();
  });

  it("renders empty state when no listings", () => {
    render(<SellerListingsTable listings={[]} loading={false} />);
    expect(screen.getByTestId("listings-table-empty")).toBeInTheDocument();
    expect(screen.getByText(/Aucune annonce publiée/)).toBeInTheDocument();
  });

  it("renders listings table with data", () => {
    render(<SellerListingsTable listings={MOCK_LISTINGS} loading={false} />);
    expect(screen.getByTestId("seller-listings-table")).toBeInTheDocument();
    // Mobile cards render with combined text
    expect(screen.getByTestId("listing-card-listing-1")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-listing-2")).toBeInTheDocument();
  });

  it("shows listing count in header", () => {
    render(<SellerListingsTable listings={MOCK_LISTINGS} loading={false} />);
    expect(screen.getByText(/Performances des annonces \(2\)/)).toBeInTheDocument();
  });

  it("displays market position badges", () => {
    render(<SellerListingsTable listings={MOCK_LISTINGS} loading={false} />);
    expect(screen.getAllByText("Prix marché").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bon prix").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onSort when sort header is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<SellerListingsTable listings={MOCK_LISTINGS} loading={false} onSort={onSort} />);
    await user.click(screen.getByTestId("sort-price"));
    expect(onSort).toHaveBeenCalledWith("price", "desc");
  });

  it("toggles sort direction on subsequent clicks", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<SellerListingsTable listings={MOCK_LISTINGS} loading={false} onSort={onSort} />);

    // First click on viewCount (default column) toggles to asc
    await user.click(screen.getByTestId("sort-viewCount"));
    expect(onSort).toHaveBeenCalledWith("viewCount", "asc");
  });

  it("calls onListingClick when listing row is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SellerListingsTable listings={MOCK_LISTINGS} loading={false} onListingClick={onClick} />,
    );
    await user.click(screen.getByTestId("listing-row-listing-1"));
    expect(onClick).toHaveBeenCalledWith("listing-1");
  });

  it("renders mobile cards", () => {
    render(<SellerListingsTable listings={MOCK_LISTINGS} loading={false} />);
    expect(screen.getByTestId("listing-card-listing-1")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-listing-2")).toBeInTheDocument();
  });
});
