import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ListingHistoryCard } from "@/components/listing/listing-history-card";
import type { ISellerListingHistoryItem } from "@auto/shared";

const MOCK_SOLD_LISTING: ISellerListingHistoryItem = {
  ID: "listing-1",
  make: "Peugeot",
  model: "308",
  year: 2023,
  price: 22000,
  status: "sold",
  visibilityScore: 90,
  publishedAt: "2026-01-15T10:00:00Z",
  soldAt: "2026-02-10T14:00:00Z",
  archivedAt: null,
  viewCount: 320,
  favoriteCount: 25,
  chatCount: 8,
  daysOnMarket: 26,
  photoCount: 10,
  primaryPhotoUrl: "https://cdn.example.com/photo.jpg",
};

const MOCK_ARCHIVED_LISTING: ISellerListingHistoryItem = {
  ...MOCK_SOLD_LISTING,
  ID: "listing-2",
  status: "archived",
  soldAt: null,
  archivedAt: "2026-02-01T08:00:00Z",
};

describe("ListingHistoryCard", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render listing title", () => {
    render(<ListingHistoryCard listing={MOCK_SOLD_LISTING} />);
    expect(screen.getByText("Peugeot 308 (2023)")).toBeInTheDocument();
  });

  it("should render sold status badge", () => {
    render(<ListingHistoryCard listing={MOCK_SOLD_LISTING} />);
    expect(screen.getByText("Vendu")).toBeInTheDocument();
  });

  it("should render archived status badge", () => {
    render(<ListingHistoryCard listing={MOCK_ARCHIVED_LISTING} />);
    expect(screen.getByText("Archive")).toBeInTheDocument();
  });

  it("should render published date", () => {
    render(<ListingHistoryCard listing={MOCK_SOLD_LISTING} />);
    expect(screen.getByText(/Publie/)).toBeInTheDocument();
  });

  it("should render sold date when sold", () => {
    render(<ListingHistoryCard listing={MOCK_SOLD_LISTING} />);
    expect(screen.getByText(/Vendu :/)).toBeInTheDocument();
  });

  it("should render archived date when archived", () => {
    render(<ListingHistoryCard listing={MOCK_ARCHIVED_LISTING} />);
    expect(screen.getByText(/Archive :/)).toBeInTheDocument();
  });

  it("should render view count", () => {
    render(<ListingHistoryCard listing={MOCK_SOLD_LISTING} />);
    expect(screen.getByText(/320 vues/)).toBeInTheDocument();
  });

  it("should render days on market", () => {
    render(<ListingHistoryCard listing={MOCK_SOLD_LISTING} />);
    expect(screen.getByText("26j")).toBeInTheDocument();
  });

  it("should handle missing photo gracefully", () => {
    render(<ListingHistoryCard listing={{ ...MOCK_SOLD_LISTING, primaryPhotoUrl: null }} />);
    expect(screen.getByText("Pas de photo")).toBeInTheDocument();
  });
});
