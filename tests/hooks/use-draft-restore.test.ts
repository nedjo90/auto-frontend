import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDraftRestore } from "@/hooks/use-draft-restore";
import { useListingStore } from "@/stores/listing-store";
import { usePhotoStore } from "@/stores/photo-store";

vi.mock("@/lib/api/draft-api", () => ({
  loadDraft: vi.fn(),
}));

import { loadDraft } from "@/lib/api/draft-api";

const mockLoadDraft = vi.mocked(loadDraft);

const mockListing = {
  ID: "draft-123",
  make: "Renault",
  model: "Clio",
  year: 2022,
  price: 15000,
  mileage: 50000,
  visibilityScore: 70,
  visibilityLabel: "Bon",
  completionPercentage: 45,
};

const mockCertifiedFields = [
  {
    fieldName: "make",
    fieldValue: "Renault",
    source: "SIV",
    sourceTimestamp: "2026-01-15T10:00:00Z",
  },
  {
    fieldName: "model",
    fieldValue: "Clio",
    source: "SIV",
    sourceTimestamp: "2026-01-15T10:00:00Z",
  },
];

const mockPhotos = [
  {
    ID: "photo-1",
    cdnUrl: "https://cdn.example.com/photo1.jpg",
    sortOrder: 0,
    isPrimary: true,
    fileSize: 500000,
    mimeType: "image/jpeg",
    width: 1920,
    height: 1080,
  },
  {
    ID: "photo-2",
    cdnUrl: "https://cdn.example.com/photo2.jpg",
    sortOrder: 1,
    isPrimary: false,
    fileSize: 400000,
    mimeType: "image/jpeg",
    width: 1920,
    height: 1080,
  },
];

describe("useDraftRestore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListingStore.getState().resetDraftState();
    usePhotoStore.setState({ photos: [], maxPhotos: 20, isLoading: false });
  });

  it("should not call loadDraft when draftId is null", () => {
    renderHook(() => useDraftRestore(null));
    expect(mockLoadDraft).not.toHaveBeenCalled();
  });

  it("should call loadDraft with the draftId", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify(mockCertifiedFields),
      photos: JSON.stringify(mockPhotos),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      expect(mockLoadDraft).toHaveBeenCalledWith("draft-123");
    });
  });

  it("should set listingId in store", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      expect(useListingStore.getState().listingId).toBe("draft-123");
    });
  });

  it("should populate fields from listing data", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify(mockCertifiedFields),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      const fields = useListingStore.getState().fields;
      expect(fields.make.value).toBe("Renault");
      expect(fields.make.status).toBe("certified");
      expect(fields.make.certifiedSource).toBe("SIV");
      expect(fields.model.value).toBe("Clio");
      expect(fields.model.status).toBe("certified");
      expect(fields.price.value).toBe(15000);
      expect(fields.price.status).toBe("declared");
      expect(fields.mileage.value).toBe(50000);
      expect(fields.mileage.status).toBe("declared");
    });
  });

  it("should mark unfilled fields as empty", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify({ make: "Renault" }),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      const fields = useListingStore.getState().fields;
      expect(fields.description.status).toBe("empty");
      expect(fields.description.value).toBeNull();
    });
  });

  it("should set visibility score and label from listing", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      expect(useListingStore.getState().visibilityScore).toBe(70);
      expect(useListingStore.getState().visibilityLabel).toBe("Bon");
      expect(useListingStore.getState().completionPercentage).toBe(45);
    });
  });

  it("should populate photos in photo store", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify(mockPhotos),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      const photos = usePhotoStore.getState().photos;
      expect(photos).toHaveLength(2);
      expect(photos[0].id).toBe("photo-1");
      expect(photos[0].isPrimary).toBe(true);
      expect(photos[0].uploadStatus).toBe("success");
      expect(photos[1].id).toBe("photo-2");
      expect(photos[1].sortOrder).toBe(1);
    });
  });

  it("should set isDirty to false after restore", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      expect(useListingStore.getState().isDirty).toBe(false);
    });
  });

  it("should set error on failure", async () => {
    mockLoadDraft.mockRejectedValue(new Error("Load failed"));

    const { result } = renderHook(() => useDraftRestore("bad-id"));

    await waitFor(() => {
      expect(result.current.error).toBe("Load failed");
    });
  });

  it("should report isRestoring during loading", async () => {
    let resolveLoad: (value: unknown) => void;
    mockLoadDraft.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        }),
    );

    const { result } = renderHook(() => useDraftRestore("draft-123"));

    // Initially restoring
    expect(result.current.isRestoring).toBe(true);

    // Resolve
    resolveLoad!({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    await waitFor(() => {
      expect(result.current.isRestoring).toBe(false);
    });
  });

  it("should only restore once even if re-rendered", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListing),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    const { rerender } = renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      expect(mockLoadDraft).toHaveBeenCalledTimes(1);
    });

    rerender();
    expect(mockLoadDraft).toHaveBeenCalledTimes(1);
  });

  it("should handle empty certified fields and photos", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify({ make: "Peugeot" }),
      certifiedFields: "[]",
      photos: "[]",
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      const fields = useListingStore.getState().fields;
      expect(fields.make.value).toBe("Peugeot");
      expect(fields.make.status).toBe("declared");
      expect(usePhotoStore.getState().photos).toHaveLength(0);
    });
  });

  it("should preserve certified field source and timestamp", async () => {
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify({ make: "Renault", model: "Clio" }),
      certifiedFields: JSON.stringify(mockCertifiedFields),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("draft-123"));

    await waitFor(() => {
      const make = useListingStore.getState().fields.make;
      expect(make.certifiedSource).toBe("SIV");
      expect(make.certifiedTimestamp).toBe("2026-01-15T10:00:00Z");
    });
  });
});
