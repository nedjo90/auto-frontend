import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useListingStore } from "@/stores/listing-store";
import { usePhotoStore } from "@/stores/photo-store";
import { useDraftSave } from "@/hooks/use-draft-save";
import { useDraftRestore } from "@/hooks/use-draft-restore";

// Mock APIs
vi.mock("@/lib/api/draft-api", () => ({
  saveDraft: vi.fn(),
  loadDraft: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { saveDraft, loadDraft } from "@/lib/api/draft-api";
import { toast } from "sonner";

const mockSaveDraft = vi.mocked(saveDraft);
const mockLoadDraft = vi.mocked(loadDraft);

describe("Draft Lifecycle Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListingStore.getState().resetDraftState();
    usePhotoStore.setState({ photos: [], maxPhotos: 20, isLoading: false });
  });

  it("should create draft → save → modify → auto-save flow", async () => {
    vi.useFakeTimers();
    // Step 1: User fills in fields (simulated by setting store)
    useListingStore.setState({
      fields: {
        make: { fieldName: "make", value: "Renault", status: "declared" },
        price: { fieldName: "price", value: 15000, status: "declared" },
      },
      isDirty: true,
    });

    // Step 2: User clicks save (new draft, no listingId yet)
    mockSaveDraft.mockResolvedValueOnce({
      listingId: "new-draft-123",
      success: true,
      completionPercentage: 25,
      visibilityScore: 40,
      visibilityLabel: "Partiellement documenté",
    });

    const { result } = renderHook(() => useDraftSave());

    await act(async () => {
      await result.current.handleManualSave();
    });

    // Verify: listingId was set, isDirty cleared, score updated
    const state = useListingStore.getState();
    expect(state.listingId).toBe("new-draft-123");
    expect(state.isDirty).toBe(false);
    expect(state.visibilityScore).toBe(40);
    expect(state.completionPercentage).toBe(25);
    expect(toast.success).toHaveBeenCalledWith("Brouillon sauvegardé");

    // Step 3: User modifies a field
    act(() => {
      useListingStore.getState().updateField("mileage", 50000, "declared");
    });
    expect(useListingStore.getState().isDirty).toBe(true);

    // Step 4: Auto-save triggers after 60 seconds
    mockSaveDraft.mockResolvedValueOnce({
      listingId: "new-draft-123",
      success: true,
      completionPercentage: 35,
      visibilityScore: 55,
      visibilityLabel: "Partiellement documenté",
    });

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });

    // Verify: auto-save called, no toast shown
    expect(mockSaveDraft).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenCalledTimes(1); // Only the first manual save showed toast
    expect(useListingStore.getState().completionPercentage).toBe(35);
    expect(useListingStore.getState().visibilityScore).toBe(55);

    vi.useRealTimers();
  });

  it("should restore draft with full data including certified fields and photos", async () => {
    const mockListingData = {
      ID: "existing-draft",
      make: "Peugeot",
      model: "208",
      year: 2023,
      price: 22000,
      mileage: 30000,
      visibilityScore: 75,
      visibilityLabel: "Bon",
      completionPercentage: 60,
    };

    const mockCertifiedFields = [
      {
        fieldName: "make",
        fieldValue: "Peugeot",
        source: "SIV API",
        sourceTimestamp: "2026-02-01T10:00:00Z",
      },
      {
        fieldName: "model",
        fieldValue: "208",
        source: "SIV API",
        sourceTimestamp: "2026-02-01T10:00:00Z",
      },
    ];

    const mockPhotos = [
      {
        ID: "photo-1",
        cdnUrl: "https://cdn.example.com/p1.jpg",
        sortOrder: 0,
        isPrimary: true,
        fileSize: 500000,
        mimeType: "image/jpeg",
        width: 1920,
        height: 1080,
      },
      {
        ID: "photo-2",
        cdnUrl: "https://cdn.example.com/p2.jpg",
        sortOrder: 1,
        isPrimary: false,
        fileSize: 400000,
        mimeType: "image/png",
        width: 1280,
        height: 720,
      },
    ];

    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify(mockListingData),
      certifiedFields: JSON.stringify(mockCertifiedFields),
      photos: JSON.stringify(mockPhotos),
    });

    renderHook(() => useDraftRestore("existing-draft"));

    await waitFor(() => {
      const listingState = useListingStore.getState();

      // Listing ID set
      expect(listingState.listingId).toBe("existing-draft");

      // Certified fields restored with source info
      expect(listingState.fields.make.value).toBe("Peugeot");
      expect(listingState.fields.make.status).toBe("certified");
      expect(listingState.fields.make.certifiedSource).toBe("SIV API");

      // Declared fields restored
      expect(listingState.fields.price.value).toBe(22000);
      expect(listingState.fields.price.status).toBe("declared");

      // Score and completion restored
      expect(listingState.visibilityScore).toBe(75);
      expect(listingState.visibilityLabel).toBe("Bon");
      expect(listingState.completionPercentage).toBe(60);

      // Not dirty (clean baseline)
      expect(listingState.isDirty).toBe(false);
    });

    // Photos restored in order
    const photos = usePhotoStore.getState().photos;
    expect(photos).toHaveLength(2);
    expect(photos[0].id).toBe("photo-1");
    expect(photos[0].isPrimary).toBe(true);
    expect(photos[1].id).toBe("photo-2");
    expect(photos[1].sortOrder).toBe(1);
  });

  it("should handle restore → modify → save round-trip", async () => {
    // Step 1: Restore a draft
    mockLoadDraft.mockResolvedValue({
      listing: JSON.stringify({
        make: "Renault",
        price: 15000,
        visibilityScore: 50,
        visibilityLabel: "Moyen",
        completionPercentage: 30,
      }),
      certifiedFields: JSON.stringify([]),
      photos: JSON.stringify([]),
    });

    renderHook(() => useDraftRestore("restore-draft-1"));

    await waitFor(() => {
      expect(useListingStore.getState().listingId).toBe("restore-draft-1");
      expect(useListingStore.getState().isDirty).toBe(false);
    });

    // Step 2: User modifies a field
    act(() => {
      useListingStore.getState().updateField("price", 18000, "declared");
    });
    expect(useListingStore.getState().isDirty).toBe(true);

    // Step 3: User saves
    mockSaveDraft.mockResolvedValueOnce({
      listingId: "restore-draft-1",
      success: true,
      completionPercentage: 35,
      visibilityScore: 55,
      visibilityLabel: "Partiellement documenté",
    });

    const { result } = renderHook(() => useDraftSave());

    await act(async () => {
      await result.current.handleManualSave();
    });

    expect(mockSaveDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        listingId: "restore-draft-1",
        fields: expect.objectContaining({ make: "Renault", price: 18000 }),
      }),
    );
    expect(useListingStore.getState().isDirty).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Brouillon sauvegardé");
  });

  it("should reset state for a new listing after working on a draft", async () => {
    // Set up state as if a draft was loaded
    useListingStore.setState({
      listingId: "old-draft",
      fields: {
        make: { fieldName: "make", value: "Renault", status: "certified", certifiedSource: "SIV" },
      },
      visibilityScore: 80,
      completionPercentage: 70,
      isDirty: true,
      lastSavedAt: new Date(),
    });
    usePhotoStore.setState({
      photos: [
        {
          id: "p1",
          cdnUrl: "url",
          sortOrder: 0,
          isPrimary: true,
          fileSize: 100,
          mimeType: "image/jpeg",
          width: 100,
          height: 100,
          uploadStatus: "success",
          uploadProgress: 100,
        },
      ],
    });

    // Reset for new listing
    act(() => {
      useListingStore.getState().resetDraftState();
      usePhotoStore.setState({ photos: [] });
    });

    const state = useListingStore.getState();
    expect(state.listingId).toBeNull();
    expect(state.fields).toEqual({});
    expect(state.visibilityScore).toBe(0);
    expect(state.completionPercentage).toBe(0);
    expect(state.isDirty).toBe(false);
    expect(state.lastSavedAt).toBeNull();
    expect(usePhotoStore.getState().photos).toHaveLength(0);
  });
});
