import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FavoriteButton } from "@/components/listing/favorite-button";

// Mock dependencies
vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(() => ({
    isAuthenticated: true,
    userId: "user-1",
    displayName: "Test User",
    email: "test@test.com",
  })),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  loginRedirect: vi.fn().mockResolvedValue(undefined),
}));

const mockToggleFavorite = vi.fn();
vi.mock("@/lib/api/favorites-api", () => ({
  toggleFavorite: (...args: unknown[]) => mockToggleFavorite(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render unfilled heart when not favorited", () => {
    render(<FavoriteButton listingId="listing-1" />);
    expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    expect(screen.getByTestId("favorite-heart-icon")).not.toHaveClass("fill-red-500");
  });

  it("should render filled heart when favorited", () => {
    render(<FavoriteButton listingId="listing-1" isFavorited={true} />);
    expect(screen.getByTestId("favorite-heart-icon")).toHaveClass("fill-red-500");
  });

  it("should toggle favorite on click", async () => {
    mockToggleFavorite.mockResolvedValue({ favorited: true, favoriteId: "fav-1" });

    render(<FavoriteButton listingId="listing-1" />);
    fireEvent.click(screen.getByTestId("favorite-button"));

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith("listing-1");
    });
  });

  it("should call onToggle callback after successful toggle", async () => {
    const onToggle = vi.fn();
    mockToggleFavorite.mockResolvedValue({ favorited: true, favoriteId: "fav-1" });

    render(<FavoriteButton listingId="listing-1" onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId("favorite-button"));

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  it("should revert on API error (optimistic rollback)", async () => {
    mockToggleFavorite.mockRejectedValue(new Error("API error"));

    render(<FavoriteButton listingId="listing-1" isFavorited={false} />);

    // Click to toggle - optimistic update should make it filled
    fireEvent.click(screen.getByTestId("favorite-button"));

    // After error, should revert to unfilled
    await waitFor(() => {
      expect(screen.getByTestId("favorite-heart-icon")).not.toHaveClass("fill-red-500");
    });
  });

  it("should redirect to login when not authenticated", async () => {
    const { useCurrentUser } = await import("@/hooks/use-current-user");
    (useCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      userId: null,
      displayName: null,
      email: null,
    });

    const { loginRedirect } = await import("@/lib/auth/auth-utils");

    render(<FavoriteButton listingId="listing-1" />);
    fireEvent.click(screen.getByTestId("favorite-button"));

    expect(loginRedirect).toHaveBeenCalled();
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });

  it("should prevent event propagation (no navigation on card click)", () => {
    const handleParentClick = vi.fn();

    render(
      <div onClick={handleParentClick}>
        <FavoriteButton listingId="listing-1" />
      </div>,
    );

    fireEvent.click(screen.getByTestId("favorite-button"));
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it("should have correct aria-label for unfavorited state", () => {
    render(<FavoriteButton listingId="listing-1" />);
    expect(screen.getByTestId("favorite-button")).toHaveAttribute(
      "aria-label",
      "Ajouter aux favoris",
    );
  });

  it("should have correct aria-label for favorited state", () => {
    render(<FavoriteButton listingId="listing-1" isFavorited={true} />);
    expect(screen.getByTestId("favorite-button")).toHaveAttribute(
      "aria-label",
      "Retirer des favoris",
    );
  });
});
