import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDraftSave } from "@/hooks/use-draft-save";
import { useListingStore } from "@/stores/listing-store";
import { usePhotoStore } from "@/stores/photo-store";

// Mock draft API
vi.mock("@/lib/api/draft-api", () => ({
  saveDraft: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { saveDraft } from "@/lib/api/draft-api";
import { toast } from "sonner";

const mockSaveDraft = vi.mocked(saveDraft);

describe("useDraftSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useListingStore.setState({
      listingId: "listing-123",
      fields: {
        make: { fieldName: "make", value: "Renault", status: "declared" },
        price: { fieldName: "price", value: 15000, status: "declared" },
      },
      visibilityScore: 50,
      visibilityLabel: "Partiellement documenté",
      completionPercentage: 25,
      isLoading: false,
      isDirty: true,
      lastSavedAt: null,
      isSaving: false,
    });
    usePhotoStore.setState({ photos: [], maxPhotos: 20, isLoading: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("handleManualSave", () => {
    it("should call saveDraft API with correct data", async () => {
      mockSaveDraft.mockResolvedValue({
        listingId: "listing-123",
        success: true,
        completionPercentage: 25,
        visibilityScore: 50,
        visibilityLabel: "Partiellement documenté",
      });

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      expect(mockSaveDraft).toHaveBeenCalledWith({
        listingId: "listing-123",
        fields: { make: "Renault", price: 15000 },
        certifiedFields: undefined,
      });
    });

    it("should show success toast on manual save", async () => {
      mockSaveDraft.mockResolvedValue({
        listingId: "listing-123",
        success: true,
        completionPercentage: 25,
        visibilityScore: 50,
        visibilityLabel: "Partiellement documenté",
      });

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      expect(toast.success).toHaveBeenCalledWith("Brouillon sauvegardé");
    });

    it("should update store after successful save", async () => {
      mockSaveDraft.mockResolvedValue({
        listingId: "listing-123",
        success: true,
        completionPercentage: 50,
        visibilityScore: 70,
        visibilityLabel: "Bon",
      });

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      const state = useListingStore.getState();
      expect(state.isDirty).toBe(false);
      expect(state.visibilityScore).toBe(70);
      expect(state.visibilityLabel).toBe("Bon");
      expect(state.completionPercentage).toBe(50);
      expect(state.lastSavedAt).not.toBeNull();
    });

    it("should set listingId on first save (new draft)", async () => {
      useListingStore.setState({ listingId: null });

      mockSaveDraft.mockResolvedValue({
        listingId: "new-draft-id",
        success: true,
        completionPercentage: 10,
        visibilityScore: 20,
        visibilityLabel: "Faible",
      });

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      expect(useListingStore.getState().listingId).toBe("new-draft-id");
    });

    it("should show error toast with retry on failure", async () => {
      mockSaveDraft.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Network error",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Réessayer" }),
        }),
      );
    });

    it("should include certified fields in save payload", async () => {
      useListingStore.setState({
        ...useListingStore.getState(),
        fields: {
          make: {
            fieldName: "make",
            value: "Renault",
            status: "certified",
            certifiedSource: "SIV",
            certifiedTimestamp: "2026-01-01T00:00:00Z",
          },
        },
      });

      mockSaveDraft.mockResolvedValue({
        listingId: "listing-123",
        success: true,
        completionPercentage: 25,
        visibilityScore: 50,
        visibilityLabel: "Partiellement documenté",
      });

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      expect(mockSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          certifiedFields: [
            expect.objectContaining({
              fieldName: "make",
              fieldValue: "Renault",
              source: "SIV",
              isCertified: true,
            }),
          ],
        }),
      );
    });

    it("should not save when already saving", async () => {
      useListingStore.setState({ isSaving: true });

      const { result } = renderHook(() => useDraftSave());

      await act(async () => {
        await result.current.handleManualSave();
      });

      expect(mockSaveDraft).not.toHaveBeenCalled();
    });
  });

  describe("auto-save", () => {
    it("should auto-save after 60 seconds when dirty", async () => {
      mockSaveDraft.mockResolvedValue({
        listingId: "listing-123",
        success: true,
        completionPercentage: 25,
        visibilityScore: 50,
        visibilityLabel: "Partiellement documenté",
      });

      renderHook(() => useDraftSave());

      // Advance timer by 60 seconds
      await act(async () => {
        vi.advanceTimersByTime(60_000);
      });

      expect(mockSaveDraft).toHaveBeenCalled();
    });

    it("should not auto-save when not dirty", async () => {
      useListingStore.setState({ isDirty: false });

      renderHook(() => useDraftSave());

      await act(async () => {
        vi.advanceTimersByTime(60_000);
      });

      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it("should not show toast on auto-save", async () => {
      mockSaveDraft.mockResolvedValue({
        listingId: "listing-123",
        success: true,
        completionPercentage: 25,
        visibilityScore: 50,
        visibilityLabel: "Partiellement documenté",
      });

      renderHook(() => useDraftSave());

      await act(async () => {
        vi.advanceTimersByTime(60_000);
      });

      expect(toast.success).not.toHaveBeenCalled();
    });

    it("should clean up auto-save timer on unmount", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { unmount } = renderHook(() => useDraftSave());
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe("isDirty state", () => {
    it("should reflect isDirty from store", () => {
      useListingStore.setState({ isDirty: true });
      const { result } = renderHook(() => useDraftSave());
      expect(result.current.isDirty).toBe(true);
    });

    it("should reflect not dirty from store", () => {
      useListingStore.setState({ isDirty: false });
      const { result } = renderHook(() => useDraftSave());
      expect(result.current.isDirty).toBe(false);
    });
  });
});
