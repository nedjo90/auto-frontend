import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingActionCard } from "@/components/listing/listing-action-card";
import type { ISellerPublishedListing } from "@auto/shared";

const mockOnMarkAsSold = vi.fn().mockResolvedValue(undefined);
const mockOnArchive = vi.fn().mockResolvedValue(undefined);

const MOCK_LISTING: ISellerPublishedListing = {
  ID: "listing-1",
  make: "Renault",
  model: "Clio",
  year: 2022,
  price: 15000,
  status: "published",
  visibilityScore: 80,
  publishedAt: "2026-02-01T08:00:00Z",
  viewCount: 150,
  favoriteCount: 12,
  chatCount: 3,
  daysOnMarket: 23,
  photoCount: 5,
  primaryPhotoUrl: "https://cdn.example.com/photo.jpg",
};

function renderCard(listing = MOCK_LISTING) {
  return render(
    <ListingActionCard
      listing={listing}
      onMarkAsSold={mockOnMarkAsSold}
      onArchive={mockOnArchive}
    />,
  );
}

describe("ListingActionCard", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render listing title", () => {
    renderCard();
    expect(screen.getByText("Renault Clio (2022)")).toBeInTheDocument();
  });

  it("should render price formatted in EUR", () => {
    renderCard();
    // French formatting: 15 000 €
    expect(screen.getByText(/15.*€/)).toBeInTheDocument();
  });

  it("should render view count", () => {
    renderCard();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("should render favorite count", () => {
    renderCard();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("should render chat count", () => {
    renderCard();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should render days on market", () => {
    renderCard();
    expect(screen.getByText("23j")).toBeInTheDocument();
  });

  it("should render visibility score", () => {
    renderCard();
    expect(screen.getByText("Score 80%")).toBeInTheDocument();
  });

  it("should render mark as sold button", () => {
    renderCard();
    expect(screen.getByTestId("mark-sold-button")).toBeInTheDocument();
  });

  it("should render archive button", () => {
    renderCard();
    expect(screen.getByTestId("archive-button")).toBeInTheDocument();
  });

  it("should open mark sold dialog when button clicked", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTestId("mark-sold-button"));
    expect(screen.getByText("Marquer comme vendu")).toBeInTheDocument();
  });

  it("should open archive dialog when button clicked", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTestId("archive-button"));
    expect(screen.getByText(/ne sera plus visible publiquement/i)).toBeInTheDocument();
  });

  it("should render photo thumbnail", () => {
    renderCard();
    const img = screen.getByAltText("Renault Clio (2022)");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", MOCK_LISTING.primaryPhotoUrl);
  });

  it("should show placeholder when no photo", () => {
    renderCard({ ...MOCK_LISTING, primaryPhotoUrl: null });
    expect(screen.getByText("Pas de photo")).toBeInTheDocument();
  });

  it("should handle missing make/model gracefully", () => {
    renderCard({ ...MOCK_LISTING, make: null, model: null });
    expect(screen.getByText("Vehicule")).toBeInTheDocument();
  });
});
