import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetchSellerDrafts = vi.fn();
const mockDuplicateDraft = vi.fn();
const mockDeleteDraft = vi.fn();

vi.mock("@/lib/api/draft-api", () => ({
  fetchSellerDrafts: (...args: unknown[]) => mockFetchSellerDrafts(...args),
  duplicateDraft: (...args: unknown[]) => mockDuplicateDraft(...args),
  deleteDraft: (...args: unknown[]) => mockDeleteDraft(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import DraftsPage from "@/app/(dashboard)/seller/drafts/page";
import { toast } from "sonner";

const mockDrafts = {
  value: [
    {
      ID: "draft-1",
      make: "Renault",
      model: "Clio",
      createdAt: "2026-02-20T10:00:00Z",
      completionPercentage: 65,
      visibilityScore: 72,
      photoCount: 3,
    },
    {
      ID: "draft-2",
      make: null,
      model: null,
      createdAt: "2026-02-21T14:00:00Z",
      completionPercentage: 10,
      visibilityScore: 15,
      photoCount: 0,
    },
  ],
};

describe("DraftsPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show skeleton while loading", () => {
    mockFetchSellerDrafts.mockImplementation(() => new Promise(() => {}));
    render(<DraftsPage />);
    expect(screen.getByTestId("drafts-skeleton")).toBeInTheDocument();
  });

  it("should display drafts after loading", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("drafts-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("drafts-grid")).toBeInTheDocument();
    expect(screen.getByTestId("draft-card-draft-1")).toBeInTheDocument();
    expect(screen.getByTestId("draft-card-draft-2")).toBeInTheDocument();
  });

  it("should display page title", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getByText("Mes brouillons")).toBeInTheDocument();
    });
  });

  it("should display empty state when no drafts", async () => {
    mockFetchSellerDrafts.mockResolvedValue({ value: [] });
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("drafts-empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("Aucun brouillon. Créez votre première annonce !")).toBeInTheDocument();
  });

  it("should navigate to create page when 'Nouvelle annonce' is clicked", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("create-listing-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("create-listing-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/create");
  });

  it("should navigate to create page from empty state CTA", async () => {
    mockFetchSellerDrafts.mockResolvedValue({ value: [] });
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-create-btn")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("empty-create-btn"));
    expect(mockPush).toHaveBeenCalledWith("/seller/create");
  });

  it("should navigate to edit form when Modifier is clicked", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId("draft-edit-btn")).toHaveLength(2);
    });

    await user.click(screen.getAllByTestId("draft-edit-btn")[0]);
    expect(mockPush).toHaveBeenCalledWith("/seller/create?draftId=draft-1");
  });

  it("should call duplicateDraft and reload when Dupliquer is clicked", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    mockDuplicateDraft.mockResolvedValue({ listingId: "new-draft", success: true });
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId("draft-duplicate-btn")).toHaveLength(2);
    });

    await user.click(screen.getAllByTestId("draft-duplicate-btn")[0]);

    await waitFor(() => {
      expect(mockDuplicateDraft).toHaveBeenCalledWith("draft-1");
    });
    expect(toast.success).toHaveBeenCalledWith("Brouillon dupliqué");
  });

  it("should show confirmation dialog when Supprimer is clicked", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId("draft-delete-btn")).toHaveLength(2);
    });

    await user.click(screen.getAllByTestId("draft-delete-btn")[0]);
    expect(screen.getByTestId("delete-draft-dialog")).toBeInTheDocument();
  });

  it("should delete draft on confirmation", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    mockDeleteDraft.mockResolvedValue({ success: true, message: "OK" });
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId("draft-delete-btn")).toHaveLength(2);
    });

    await user.click(screen.getAllByTestId("draft-delete-btn")[0]);
    await user.click(screen.getByTestId("delete-confirm-btn"));

    await waitFor(() => {
      expect(mockDeleteDraft).toHaveBeenCalledWith("draft-1");
    });
    expect(toast.success).toHaveBeenCalledWith("Brouillon supprimé");
  });

  it("should show error toast on fetch failure", async () => {
    mockFetchSellerDrafts.mockRejectedValue(new Error("Network error"));
    render(<DraftsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  it("should show error toast on duplicate failure", async () => {
    mockFetchSellerDrafts.mockResolvedValue(mockDrafts);
    mockDuplicateDraft.mockRejectedValue(new Error("Dup failed"));
    const user = userEvent.setup();
    render(<DraftsPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId("draft-duplicate-btn")).toHaveLength(2);
    });

    await user.click(screen.getAllByTestId("draft-duplicate-btn")[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Dup failed");
    });
  });
});
