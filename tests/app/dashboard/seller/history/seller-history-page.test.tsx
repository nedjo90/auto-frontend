import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerHistoryPage from "@/app/(dashboard)/seller/history/page";
import type { ISellerListingHistoryItem } from "@auto/shared";

const mockGetListingHistory = vi.fn();

vi.mock("@/lib/api/lifecycle-api", () => ({
  getListingHistory: (...args: unknown[]) => mockGetListingHistory(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const MOCK_HISTORY: ISellerListingHistoryItem[] = [
  {
    ID: "listing-1",
    make: "Renault",
    model: "Clio",
    year: 2022,
    price: 15000,
    status: "sold",
    visibilityScore: 80,
    publishedAt: "2026-01-15T10:00:00Z",
    soldAt: "2026-02-10T14:00:00Z",
    archivedAt: null,
    viewCount: 320,
    favoriteCount: 25,
    chatCount: 8,
    daysOnMarket: 26,
    photoCount: 10,
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
    publishedAt: "2026-02-01T08:00:00Z",
    soldAt: null,
    archivedAt: null,
    viewCount: 200,
    favoriteCount: 15,
    chatCount: 5,
    daysOnMarket: 23,
    photoCount: 8,
    primaryPhotoUrl: null,
  },
  {
    ID: "listing-3",
    make: "Citroen",
    model: "C3",
    year: 2021,
    price: 12000,
    status: "archived",
    visibilityScore: 60,
    publishedAt: "2026-01-01T08:00:00Z",
    soldAt: null,
    archivedAt: "2026-02-01T08:00:00Z",
    viewCount: 50,
    favoriteCount: 2,
    chatCount: 1,
    daysOnMarket: 31,
    photoCount: 3,
    primaryPhotoUrl: null,
  },
];

describe("SellerHistoryPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGetListingHistory.mockResolvedValue(MOCK_HISTORY);
  });

  it("should render page title", async () => {
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(screen.getByText("Historique des annonces")).toBeInTheDocument();
    });
  });

  it("should display total listing count", async () => {
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(screen.getByText(/3 annonces au total/)).toBeInTheDocument();
    });
  });

  it("should render all history cards", async () => {
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(screen.getByTestId("history-grid")).toBeInTheDocument();
    });
    expect(screen.getAllByTestId("listing-history-card")).toHaveLength(3);
  });

  it("should render status filter control", async () => {
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId("listing-history-card")).toHaveLength(3);
    });

    // Verify filter controls exist
    expect(screen.getByTestId("status-filter")).toBeInTheDocument();
    expect(screen.getByTestId("sort-select")).toBeInTheDocument();
  });

  it("should show empty state when no listings match filter", async () => {
    mockGetListingHistory.mockResolvedValue([]);
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  it("should toggle sort direction", async () => {
    const user = userEvent.setup();
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(screen.getByTestId("sort-direction")).toBeInTheDocument();
    });

    expect(screen.getByText("Decroissant")).toBeInTheDocument();
    await user.click(screen.getByTestId("sort-direction"));
    expect(screen.getByText("Croissant")).toBeInTheDocument();
  });

  it("should show error toast on API failure", async () => {
    const { toast } = await import("sonner");
    mockGetListingHistory.mockRejectedValue(new Error("Network error"));
    render(<SellerHistoryPage />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erreur lors du chargement de l'historique");
    });
  });
});
