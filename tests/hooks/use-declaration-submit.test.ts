import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListingStore } from "@/stores/listing-store";

const mockSubmitDeclaration = vi.fn();
vi.mock("@/lib/api/declaration-api", () => ({
  submitDeclaration: (...args: unknown[]) => mockSubmitDeclaration(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useDeclarationSubmit } from "@/hooks/use-declaration-submit";
import { toast } from "sonner";

describe("useDeclarationSubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListingStore.setState({ listingId: "listing-123" });
  });

  it("should start with default state", () => {
    const { result } = renderHook(() => useDeclarationSubmit());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.declarationId).toBeNull();
    expect(result.current.signedAt).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should submit declaration successfully", async () => {
    mockSubmitDeclaration.mockResolvedValueOnce({
      declarationId: "decl-1",
      signedAt: "2026-02-24T10:00:00Z",
      success: true,
    });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "Test", checked: true }]);
    });

    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.declarationId).toBe("decl-1");
    expect(result.current.signedAt).toBe("2026-02-24T10:00:00Z");
    expect(toast.success).toHaveBeenCalledWith("Déclaration signée avec succès");
  });

  it("should set error when submission fails", async () => {
    mockSubmitDeclaration.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "Test", checked: true }]);
    });

    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.error).toBe("Network error");
    expect(toast.error).toHaveBeenCalled();
  });

  it("should set error when no listingId", async () => {
    useListingStore.setState({ listingId: null });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "Test", checked: true }]);
    });

    expect(result.current.error).toBe("Veuillez d'abord sauvegarder le brouillon");
    expect(mockSubmitDeclaration).not.toHaveBeenCalled();
  });

  it("should set isSubmitting during submission", async () => {
    let resolveSubmit: (value: unknown) => void;
    mockSubmitDeclaration.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );

    const { result } = renderHook(() => useDeclarationSubmit());

    act(() => {
      result.current.handleSubmit([{ label: "Test", checked: true }]);
    });

    // isSubmitting should be true while waiting
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSubmit!({ declarationId: "d-1", signedAt: "2026-01-01", success: true });
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should reset state", async () => {
    mockSubmitDeclaration.mockResolvedValueOnce({
      declarationId: "decl-1",
      signedAt: "2026-02-24T10:00:00Z",
      success: true,
    });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "Test", checked: true }]);
    });

    expect(result.current.isSubmitted).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.declarationId).toBeNull();
  });

  it("should handle success=false from backend", async () => {
    mockSubmitDeclaration.mockResolvedValueOnce({
      success: false,
    });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "Test", checked: true }]);
    });

    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.error).toBe("La soumission a échoué");
  });
});
