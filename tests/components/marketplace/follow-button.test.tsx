import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FollowButton } from "@/components/marketplace/follow-button";

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

const mockAddToMarketWatch = vi.fn();
const mockRemoveFromMarketWatch = vi.fn();
vi.mock("@/lib/api/market-watch-api", () => ({
  addToMarketWatch: (...args: unknown[]) => mockAddToMarketWatch(...args),
  removeFromMarketWatch: (...args: unknown[]) => mockRemoveFromMarketWatch(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render 'Suivre' when not watching", () => {
    render(<FollowButton listingId="listing-1" />);
    expect(screen.getByTestId("follow-button")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button")).toHaveTextContent("Suivre");
  });

  it("should render 'Suivi' when watching", () => {
    render(<FollowButton listingId="listing-1" isWatching={true} />);
    expect(screen.getByTestId("follow-button")).toHaveTextContent("Suivi");
  });

  it("should call addToMarketWatch on click when not watching", async () => {
    mockAddToMarketWatch.mockResolvedValue({ watching: true, watchId: "watch-1" });

    render(<FollowButton listingId="listing-1" />);
    fireEvent.click(screen.getByTestId("follow-button"));

    await waitFor(() => {
      expect(mockAddToMarketWatch).toHaveBeenCalledWith("listing-1");
    });
  });

  it("should call removeFromMarketWatch on click when watching", async () => {
    mockRemoveFromMarketWatch.mockResolvedValue({ success: true });

    render(<FollowButton listingId="listing-1" isWatching={true} />);
    fireEvent.click(screen.getByTestId("follow-button"));

    await waitFor(() => {
      expect(mockRemoveFromMarketWatch).toHaveBeenCalledWith("listing-1");
    });
  });

  it("should call onToggle callback", async () => {
    const onToggle = vi.fn();
    mockAddToMarketWatch.mockResolvedValue({ watching: true, watchId: "w-1" });

    render(<FollowButton listingId="listing-1" onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId("follow-button"));

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  it("should revert on API error (optimistic rollback)", async () => {
    mockAddToMarketWatch.mockRejectedValue(new Error("API error"));

    render(<FollowButton listingId="listing-1" isWatching={false} />);
    fireEvent.click(screen.getByTestId("follow-button"));

    await waitFor(() => {
      expect(screen.getByTestId("follow-button")).toHaveTextContent("Suivre");
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

    render(<FollowButton listingId="listing-1" />);
    fireEvent.click(screen.getByTestId("follow-button"));

    expect(loginRedirect).toHaveBeenCalled();
    expect(mockAddToMarketWatch).not.toHaveBeenCalled();
  });

  it("should not be disabled initially", () => {
    render(<FollowButton listingId="listing-1" />);
    expect(screen.getByTestId("follow-button")).not.toBeDisabled();
  });

  it("should prevent event propagation", () => {
    const handleParentClick = vi.fn();

    render(
      <div onClick={handleParentClick}>
        <FollowButton listingId="listing-1" />
      </div>,
    );

    fireEvent.click(screen.getByTestId("follow-button"));
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it("should have correct aria-label when not watching", () => {
    render(<FollowButton listingId="listing-1" />);
    expect(screen.getByTestId("follow-button")).toHaveAttribute(
      "aria-label",
      "Suivre cette annonce",
    );
  });

  it("should have correct aria-label when watching", () => {
    render(<FollowButton listingId="listing-1" isWatching={true} />);
    expect(screen.getByTestId("follow-button")).toHaveAttribute("aria-label", "Ne plus suivre");
  });
});
