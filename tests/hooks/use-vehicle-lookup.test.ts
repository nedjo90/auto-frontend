import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import { useVehicleLookup } from "@/hooks/use-vehicle-lookup";

describe("useVehicleLookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useVehicleLookup());
    expect(result.current.state).toBe("idle");
    expect(result.current.fields).toEqual([]);
    expect(result.current.sources).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasStaleSources).toBe(false);
  });

  it("should transition to loading state on lookup", async () => {
    mockApiClient.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { result } = renderHook(() => useVehicleLookup());

    act(() => {
      result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("loading");
  });

  it("should transition to success state on full success", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          fields: JSON.stringify([
            {
              fieldName: "make",
              fieldValue: "Renault",
              source: "SIV",
              sourceTimestamp: "2026-01-01T00:00:00.000Z",
              isCertified: true,
            },
          ]),
          sources: JSON.stringify([
            {
              adapterInterface: "IVehicleLookupAdapter",
              providerKey: "mock",
              status: "success",
              responseTimeMs: 100,
            },
          ]),
        }),
    };
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("success");
    expect(result.current.fields).toHaveLength(1);
    expect(result.current.fields[0].fieldName).toBe("make");
    expect(result.current.sources).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("should transition to partial state when some sources fail", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          fields: JSON.stringify([]),
          sources: JSON.stringify([
            {
              adapterInterface: "IVehicleLookupAdapter",
              providerKey: "mock",
              status: "success",
            },
            {
              adapterInterface: "IEmissionAdapter",
              providerKey: "ademe",
              status: "failed",
              errorMessage: "ADEME down",
            },
          ]),
        }),
    };
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("partial");
  });

  it("should transition to error state when all sources fail", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          fields: JSON.stringify([]),
          sources: JSON.stringify([
            {
              adapterInterface: "IVehicleLookupAdapter",
              providerKey: "mock",
              status: "failed",
            },
          ]),
        }),
    };
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Tous les services sont indisponibles");
  });

  it("should handle HTTP error response", async () => {
    mockApiClient.mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: { message: "Invalid plate format" },
        }),
    });

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("INVALID", "plate");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Invalid plate format");
  });

  it("should handle network error", async () => {
    mockApiClient.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Network error");
  });

  it("should reset state", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          fields: JSON.stringify([
            {
              fieldName: "make",
              fieldValue: "Renault",
              source: "SIV",
              sourceTimestamp: "2026-01-01T00:00:00.000Z",
              isCertified: true,
            },
          ]),
          sources: JSON.stringify([
            {
              adapterInterface: "IVehicleLookupAdapter",
              providerKey: "mock",
              status: "success",
            },
          ]),
        }),
    };
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("success");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.fields).toEqual([]);
    expect(result.current.sources).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle malformed fields JSON gracefully", async () => {
    mockApiClient.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          fields: "not-valid-json",
          sources: "[]",
        }),
    });

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toContain("Réponse invalide");
  });

  it("should not update state after reset during in-flight request", async () => {
    mockApiClient.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { result } = renderHook(() => useVehicleLookup());

    act(() => {
      result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.state).toBe("loading");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("idle");
  });

  it("should set hasStaleSources when a source has stale cache status", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          fields: JSON.stringify([]),
          sources: JSON.stringify([
            {
              adapterInterface: "IVehicleLookupAdapter",
              providerKey: "mock",
              status: "success",
            },
            {
              adapterInterface: "IEmissionAdapter",
              providerKey: "ademe",
              status: "cached",
              cacheStatus: "stale",
              cachedAt: "2026-01-01T00:00:00.000Z",
            },
          ]),
        }),
    };
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.hasStaleSources).toBe(true);
  });

  it("should set hasStaleSources to false when no stale sources", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          fields: JSON.stringify([]),
          sources: JSON.stringify([
            {
              adapterInterface: "IVehicleLookupAdapter",
              providerKey: "mock",
              status: "success",
            },
            {
              adapterInterface: "IEmissionAdapter",
              providerKey: "ademe",
              status: "cached",
              cacheStatus: "cached",
            },
          ]),
        }),
    };
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(result.current.hasStaleSources).toBe(false);
  });

  it("should call apiClient with correct URL and body", async () => {
    mockApiClient.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          fields: "[]",
          sources: "[]",
        }),
    });

    const { result } = renderHook(() => useVehicleLookup());

    await act(async () => {
      await result.current.lookup("AB-123-CD", "plate");
    });

    expect(mockApiClient).toHaveBeenCalledWith(
      expect.stringContaining("/api/seller/autoFillByPlate"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "AB-123-CD",
          identifierType: "plate",
        }),
      }),
    );
  });
});
