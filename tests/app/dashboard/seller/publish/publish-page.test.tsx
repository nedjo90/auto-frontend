import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockGetPublishableListings = vi.fn();
const mockCreateCheckoutSession = vi.fn();

vi.mock("@/lib/api/publish-api", () => ({
  getPublishableListings: (...args: unknown[]) => mockGetPublishableListings(...args),
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import PublishPage from "@/app/(dashboard)/seller/publish/page";
import { toast } from "sonner";

const mockListings = {
  listings: [
    {
      ID: "listing-1",
      make: "Renault",
      model: "Clio",
      year: 2020,
      visibilityScore: 85,
      photoCount: 5,
      declarationId: "decl-1",
    },
    {
      ID: "listing-2",
      make: "Peugeot",
      model: "208",
      year: 2021,
      visibilityScore: 60,
      photoCount: 3,
      declarationId: "decl-2",
    },
    {
      ID: "listing-3",
      make: null,
      model: null,
      year: null,
      visibilityScore: 40,
      photoCount: 1,
      declarationId: "decl-3",
    },
  ],
  unitPriceCents: 499,
};

describe("PublishPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Reset window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, href: "", origin: "http://localhost:3000" },
    });
  });

  it("should show skeleton while loading", () => {
    mockGetPublishableListings.mockImplementation(() => new Promise(() => {}));
    render(<PublishPage />);
    expect(screen.getByTestId("publish-skeleton")).toBeInTheDocument();
  });

  it("should display listings after loading", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("publish-grid")).toBeInTheDocument();
    expect(screen.getByTestId("publish-card-listing-1")).toBeInTheDocument();
    expect(screen.getByTestId("publish-card-listing-2")).toBeInTheDocument();
    expect(screen.getByTestId("publish-card-listing-3")).toBeInTheDocument();
  });

  it("should display page title", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByText("Publier mes annonces")).toBeInTheDocument();
    });
  });

  it("should display empty state when no publishable listings", async () => {
    mockGetPublishableListings.mockResolvedValue({ listings: [], unitPriceCents: 499 });
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-empty-state")).toBeInTheDocument();
    });
  });

  it("should navigate back to drafts from empty state", async () => {
    mockGetPublishableListings.mockResolvedValue({ listings: [], unitPriceCents: 499 });
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-go-drafts-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("empty-go-drafts-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/drafts");
  });

  it("should show correct listing titles (make + model or fallback)", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-grid")).toBeInTheDocument();
    });

    const titles = screen.getAllByTestId("publish-card-title");
    expect(titles[0]).toHaveTextContent("Renault Clio");
    expect(titles[1]).toHaveTextContent("Peugeot 208");
    expect(titles[2]).toHaveTextContent("Véhicule");
  });

  it("should toggle individual listing selection", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-checkbox-listing-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-checkbox-listing-1"));

    await waitFor(() => {
      expect(screen.getByTestId("checkout-summary")).toHaveTextContent("1 annonce sélectionnée");
    });
  });

  it("should toggle all listings with select all checkbox", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("select-all-checkbox")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("select-all-checkbox"));

    await waitFor(() => {
      expect(screen.getByTestId("checkout-summary")).toHaveTextContent("3 annonces sélectionnées");
    });
  });

  it("should deselect all when select all is clicked while all selected", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("select-all-checkbox")).toBeInTheDocument();
    });

    // Select all
    await user.click(screen.getByTestId("select-all-checkbox"));
    await waitFor(() => {
      expect(screen.getByTestId("checkout-summary")).toHaveTextContent("3 annonces sélectionnées");
    });

    // Deselect all
    await user.click(screen.getByTestId("select-all-checkbox"));
    await waitFor(() => {
      expect(screen.getByTestId("checkout-summary")).toHaveTextContent("0 annonces sélectionnées");
    });
  });

  it("should calculate correct total price", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("select-all-checkbox")).toBeInTheDocument();
    });

    // Select 2 listings: 2 × 499 cents = 998 cents = 9,98 €
    await user.click(screen.getByTestId("publish-checkbox-listing-1"));
    await user.click(screen.getByTestId("publish-checkbox-listing-2"));

    await waitFor(() => {
      expect(screen.getByTestId("checkout-total")).toHaveTextContent("9,98");
    });
  });

  it("should show unit price when items are selected", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-checkbox-listing-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-checkbox-listing-1"));

    await waitFor(() => {
      expect(screen.getByTestId("checkout-unit-price")).toBeInTheDocument();
    });
  });

  it("should disable checkout button when nothing selected", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("checkout-btn")).toBeInTheDocument();
    });

    expect(screen.getByTestId("checkout-btn")).toBeDisabled();
  });

  it("should redirect to Stripe checkout on pay button click", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    mockCreateCheckoutSession.mockResolvedValue({
      sessionId: "cs_test_123",
      sessionUrl: "https://checkout.stripe.com/cs_test_123",
    });
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-checkbox-listing-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-checkbox-listing-1"));
    await user.click(screen.getByTestId("checkout-btn"));

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        ["listing-1"],
        expect.stringContaining("/seller/publish/success"),
        expect.stringContaining("/seller/publish"),
      );
    });

    expect(window.location.href).toBe("https://checkout.stripe.com/cs_test_123");
  });

  it("should show error toast on checkout failure", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    mockCreateCheckoutSession.mockRejectedValue(new Error("Checkout failed"));
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-checkbox-listing-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-checkbox-listing-1"));
    await user.click(screen.getByTestId("checkout-btn"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Checkout failed");
    });
  });

  it("should show error toast when no sessionUrl returned", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    mockCreateCheckoutSession.mockResolvedValue({
      sessionId: "cs_test_123",
      sessionUrl: "",
    });
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-checkbox-listing-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-checkbox-listing-1"));
    await user.click(screen.getByTestId("checkout-btn"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No checkout URL returned");
    });
  });

  it("should show error toast on fetch failure", async () => {
    mockGetPublishableListings.mockRejectedValue(new Error("Network error"));
    render(<PublishPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  it("should navigate back to drafts when back button clicked", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("back-to-drafts-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("back-to-drafts-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/drafts");
  });

  it("should show photo count for each listing", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-grid")).toBeInTheDocument();
    });

    const photoCounts = screen.getAllByTestId("publish-card-photos");
    expect(photoCounts[0]).toHaveTextContent("5");
    expect(photoCounts[1]).toHaveTextContent("3");
    expect(photoCounts[2]).toHaveTextContent("1");
  });

  it("should show visibility scores for each listing", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-grid")).toBeInTheDocument();
    });

    const scores = screen.getAllByTestId("publish-card-score");
    expect(scores[0]).toHaveTextContent("85%");
    expect(scores[1]).toHaveTextContent("60%");
    expect(scores[2]).toHaveTextContent("40%");
  });

  it("should toggle selection by clicking on the card", async () => {
    mockGetPublishableListings.mockResolvedValue(mockListings);
    const user = userEvent.setup();
    render(<PublishPage />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-card-listing-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("publish-card-listing-1"));

    await waitFor(() => {
      expect(screen.getByTestId("checkout-summary")).toHaveTextContent("1 annonce sélectionnée");
    });
  });
});
