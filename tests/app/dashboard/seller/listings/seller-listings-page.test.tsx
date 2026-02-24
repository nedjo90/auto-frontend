import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerListingsPage from "@/app/(dashboard)/seller/listings/page";
import type { ISellerPublishedListing } from "@auto/shared";

const mockGetSellerListings = vi.fn();
const mockMarkAsSold = vi.fn();
const mockArchiveListing = vi.fn();

vi.mock("@/lib/api/lifecycle-api", () => ({
  getSellerListings: (...args: unknown[]) => mockGetSellerListings(...args),
  markAsSold: (...args: unknown[]) => mockMarkAsSold(...args),
  archiveListing: (...args: unknown[]) => mockArchiveListing(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const MOCK_LISTINGS: ISellerPublishedListing[] = [
  {
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
    primaryPhotoUrl: null,
  },
  {
    ID: "listing-2",
    make: "Peugeot",
    model: "308",
    year: 2023,
    price: 22000,
    status: "published",
    visibilityScore: 90,
    publishedAt: "2026-02-05T08:00:00Z",
    viewCount: 200,
    favoriteCount: 15,
    chatCount: 5,
    daysOnMarket: 19,
    photoCount: 8,
    primaryPhotoUrl: null,
  },
];

describe("SellerListingsPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGetSellerListings.mockResolvedValue(MOCK_LISTINGS);
    mockMarkAsSold.mockResolvedValue({ success: true });
    mockArchiveListing.mockResolvedValue({ success: true });
  });

  it("should render page title", async () => {
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Mes annonces en ligne")).toBeInTheDocument();
    });
  });

  it("should display listing count", async () => {
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(screen.getByText("2 annonces en ligne")).toBeInTheDocument();
    });
  });

  it("should render listing cards", async () => {
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("listings-grid")).toBeInTheDocument();
    });
    expect(screen.getAllByTestId("listing-action-card")).toHaveLength(2);
  });

  it("should show empty state when no listings", async () => {
    mockGetSellerListings.mockResolvedValue([]);
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  it("should remove listing from list after mark as sold", async () => {
    const user = userEvent.setup();
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId("listing-action-card")).toHaveLength(2);
    });

    // Click mark as sold on first listing
    const soldButtons = screen.getAllByTestId("mark-sold-button");
    await user.click(soldButtons[0]);

    // Confirm in dialog
    await user.click(screen.getByRole("button", { name: /confirmer la vente/i }));

    await waitFor(() => {
      expect(screen.getAllByTestId("listing-action-card")).toHaveLength(1);
    });
  });

  it("should remove listing from list after archive", async () => {
    const user = userEvent.setup();
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId("listing-action-card")).toHaveLength(2);
    });

    // Click archive on first listing
    const archiveButtons = screen.getAllByTestId("archive-button");
    await user.click(archiveButtons[0]);

    // Confirm in dialog
    await user.click(screen.getByRole("button", { name: /retirer l'annonce/i }));

    await waitFor(() => {
      expect(screen.getAllByTestId("listing-action-card")).toHaveLength(1);
    });
  });

  it("should show error toast on API failure", async () => {
    const { toast } = await import("sonner");
    mockGetSellerListings.mockRejectedValue(new Error("Network error"));
    render(<SellerListingsPage />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erreur lors du chargement des annonces");
    });
  });
});
