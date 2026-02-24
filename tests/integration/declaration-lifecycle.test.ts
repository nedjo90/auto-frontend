import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListingStore } from "@/stores/listing-store";

const mockSubmitDeclaration = vi.fn();
const mockGetDeclarationSummary = vi.fn();
const mockGetDeclarationTemplate = vi.fn();

vi.mock("@/lib/api/declaration-api", () => ({
  submitDeclaration: (...args: unknown[]) => mockSubmitDeclaration(...args),
  getDeclarationSummary: (...args: unknown[]) => mockGetDeclarationSummary(...args),
  getDeclarationTemplate: () => mockGetDeclarationTemplate(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useDeclarationSubmit } from "@/hooks/use-declaration-submit";

describe("Declaration Lifecycle Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListingStore.setState({
      listingId: "listing-123",
      fields: {},
      isDirty: false,
      isSaving: false,
    });
  });

  it("complete flow: load template -> submit -> verify success state", async () => {
    // Step 1: Template loads
    mockGetDeclarationTemplate.mockResolvedValueOnce({
      version: "v1.0",
      checkboxItems: ["Item 1", "Item 2"],
      introText: "Intro",
      legalNotice: "Legal",
    });

    // Step 2: Submit declaration
    mockSubmitDeclaration.mockResolvedValueOnce({
      declarationId: "decl-123",
      signedAt: "2026-02-24T10:00:00Z",
      success: true,
    });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([
        { label: "Item 1", checked: true },
        { label: "Item 2", checked: true },
      ]);
    });

    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.declarationId).toBe("decl-123");
    expect(result.current.signedAt).toBe("2026-02-24T10:00:00Z");
  });

  it("submit -> error -> retry -> success", async () => {
    mockSubmitDeclaration.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
      declarationId: "decl-456",
      signedAt: "2026-02-24T11:00:00Z",
      success: true,
    });

    const { result } = renderHook(() => useDeclarationSubmit());
    const states = [{ label: "Item 1", checked: true }];

    // First attempt: fails
    await act(async () => {
      await result.current.handleSubmit(states);
    });
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.error).toBe("Network error");

    // Second attempt: succeeds
    await act(async () => {
      await result.current.handleSubmit(states);
    });
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("no listingId -> error without API call", async () => {
    useListingStore.setState({ listingId: null });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "Item 1", checked: true }]);
    });

    expect(result.current.error).toBe("Veuillez d'abord sauvegarder le brouillon");
    expect(mockSubmitDeclaration).not.toHaveBeenCalled();
  });

  it("submit -> reset -> clean state", async () => {
    mockSubmitDeclaration.mockResolvedValueOnce({
      declarationId: "decl-789",
      signedAt: "2026-02-24T12:00:00Z",
      success: true,
    });

    const { result } = renderHook(() => useDeclarationSubmit());

    await act(async () => {
      await result.current.handleSubmit([{ label: "A", checked: true }]);
    });
    expect(result.current.isSubmitted).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.declarationId).toBeNull();
    expect(result.current.signedAt).toBeNull();
  });
});
