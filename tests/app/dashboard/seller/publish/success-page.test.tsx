import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

const mockGetPaymentSessionStatus = vi.fn();

vi.mock("@/lib/api/publish-api", () => ({
  getPaymentSessionStatus: (...args: unknown[]) => mockGetPaymentSessionStatus(...args),
}));

import PublishSuccessPage from "@/app/(dashboard)/seller/publish/success/page";

describe("PublishSuccessPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show error when no session_id in URL", () => {
    mockGet.mockReturnValue(null);
    render(<PublishSuccessPage />);
    expect(screen.getByTestId("no-session")).toBeInTheDocument();
    expect(screen.getByText("Session de paiement invalide")).toBeInTheDocument();
  });

  it("should navigate to publish page from no-session state", async () => {
    mockGet.mockReturnValue(null);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PublishSuccessPage />);

    await user.click(screen.getByTestId("go-publish-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/publish");
  });

  it("should show pending state while polling", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Pending",
      listingCount: 2,
      listings: [],
    });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("payment-pending")).toBeInTheDocument();
    });
    expect(screen.getByText("Confirmation du paiement en cours...")).toBeInTheDocument();
  });

  it("should show success state when payment is confirmed", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Succeeded",
      listingCount: 2,
      listings: [
        { ID: "listing-1", status: "published" },
        { ID: "listing-2", status: "published" },
      ],
    });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("payment-success")).toBeInTheDocument();
    });
    expect(screen.getByText("Paiement confirmé !")).toBeInTheDocument();
    expect(screen.getByText(/2 annonces/)).toBeInTheDocument();
  });

  it("should show published listings in success state", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Succeeded",
      listingCount: 2,
      listings: [
        { ID: "listing-1", status: "published" },
        { ID: "listing-2", status: "published" },
      ],
    });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("published-listings")).toBeInTheDocument();
    });
    expect(screen.getByTestId("published-listing-listing-1")).toBeInTheDocument();
    expect(screen.getByTestId("published-listing-listing-2")).toBeInTheDocument();
  });

  it("should show 'Publiée' status for published listings", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Succeeded",
      listingCount: 1,
      listings: [{ ID: "listing-1", status: "published" }],
    });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-status")).toHaveTextContent("Publiée");
    });
  });

  it("should show failed state when payment fails", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Failed",
      listingCount: 0,
      listings: [],
    });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("payment-failed")).toBeInTheDocument();
    });
    expect(screen.getByText("Le paiement a échoué")).toBeInTheDocument();
  });

  it("should navigate to publish page from failed state", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Failed",
      listingCount: 0,
      listings: [],
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("failed-retry-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("failed-retry-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/publish");
  });

  it("should show error state on API failure", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockRejectedValue(new Error("API down"));
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("payment-error")).toBeInTheDocument();
    });
    expect(screen.getByText("API down")).toBeInTheDocument();
  });

  it("should navigate to publish page from error state", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockRejectedValue(new Error("API down"));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("error-retry-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("error-retry-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/publish");
  });

  it("should navigate to drafts from success state", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Succeeded",
      listingCount: 1,
      listings: [{ ID: "listing-1", status: "published" }],
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("go-drafts-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("go-drafts-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/drafts");
  });

  it("should navigate to publish more from success state", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Succeeded",
      listingCount: 1,
      listings: [{ ID: "listing-1", status: "published" }],
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-more-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-more-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/publish");
  });

  it("should poll when status is Pending then transition to Succeeded", async () => {
    mockGet.mockReturnValue("cs_test_123");
    let callCount = 0;
    mockGetPaymentSessionStatus.mockImplementation(async () => {
      callCount++;
      if (callCount >= 2) {
        return {
          status: "Succeeded",
          listingCount: 1,
          listings: [{ ID: "l-1", status: "published" }],
        };
      }
      return { status: "Pending", listingCount: 0, listings: [] };
    });

    render(<PublishSuccessPage />);

    // First poll → Pending
    await waitFor(() => {
      expect(mockGetPaymentSessionStatus).toHaveBeenCalledTimes(1);
    });

    // Advance timer for second poll → Succeeded
    await vi.advanceTimersByTimeAsync(2500);

    await waitFor(() => {
      expect(screen.getByTestId("payment-success")).toBeInTheDocument();
    });

    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it("should show singular text for 1 listing", async () => {
    mockGet.mockReturnValue("cs_test_123");
    mockGetPaymentSessionStatus.mockResolvedValue({
      status: "Succeeded",
      listingCount: 1,
      listings: [{ ID: "listing-1", status: "published" }],
    });
    render(<PublishSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(/1 annonce/)).toBeInTheDocument();
      expect(screen.getByText(/a été publiée/)).toBeInTheDocument();
    });
  });
});
