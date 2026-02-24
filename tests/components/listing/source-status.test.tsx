import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SourceStatus } from "@/components/listing/source-status";
import type { ApiSourceStatus } from "@auto/shared";

describe("SourceStatus", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render nothing when sources array is empty", () => {
    const { container } = render(<SourceStatus sources={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("should render all source indicators", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IVehicleLookupAdapter",
        providerKey: "mock",
        status: "success",
        responseTimeMs: 100,
      },
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "pending",
      },
      {
        adapterInterface: "IRecallAdapter",
        providerKey: "rappelconso",
        status: "failed",
        errorMessage: "API down",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-status")).toBeInTheDocument();
    expect(screen.getByTestId("source-IVehicleLookupAdapter")).toBeInTheDocument();
    expect(screen.getByTestId("source-IEmissionAdapter")).toBeInTheDocument();
    expect(screen.getByTestId("source-IRecallAdapter")).toBeInTheDocument();
  });

  it("should show 'done' for success status", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IVehicleLookupAdapter",
        providerKey: "mock",
        status: "success",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-IVehicleLookupAdapter")).toHaveTextContent("SIV terminé");
  });

  it("should show 'cached' for cached status", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IVehicleLookupAdapter",
        providerKey: "cache",
        status: "cached",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-IVehicleLookupAdapter")).toHaveTextContent("SIV en cache");
  });

  it("should show 'failed' for failed status", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "failed",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-IEmissionAdapter")).toHaveTextContent("ADEME échoué");
  });

  it("should show '...' for pending status", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "ICritAirCalculator",
        providerKey: "local.critair",
        status: "pending",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-ICritAirCalculator")).toHaveTextContent("Crit'Air ...");
  });

  it("should use adapter interface as label for unknown adapters", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "ICustomAdapter",
        providerKey: "custom",
        status: "success",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-ICustomAdapter")).toHaveTextContent("ICustomAdapter terminé");
  });

  it("should display human-readable labels for known adapters", () => {
    const sources: ApiSourceStatus[] = [
      { adapterInterface: "IVehicleLookupAdapter", providerKey: "mock", status: "success" },
      { adapterInterface: "IEmissionAdapter", providerKey: "ademe", status: "success" },
      { adapterInterface: "IRecallAdapter", providerKey: "rappelconso", status: "success" },
      { adapterInterface: "ICritAirCalculator", providerKey: "local.critair", status: "success" },
      { adapterInterface: "IVINTechnicalAdapter", providerKey: "nhtsa", status: "success" },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-IVehicleLookupAdapter")).toHaveTextContent("SIV");
    expect(screen.getByTestId("source-IEmissionAdapter")).toHaveTextContent("ADEME");
    expect(screen.getByTestId("source-IRecallAdapter")).toHaveTextContent("Rappels");
    expect(screen.getByTestId("source-ICritAirCalculator")).toHaveTextContent("Crit'Air");
    expect(screen.getByTestId("source-IVINTechnicalAdapter")).toHaveTextContent("VIN Tech");
  });

  it("should show 'stale' indicator for cached source with stale cache status", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
    ];

    render(<SourceStatus sources={sources} />);
    const el = screen.getByTestId("source-IEmissionAdapter");
    expect(el).toHaveTextContent("ADEME obsolète");
  });

  it("should show regular cache indicator for cached source without stale status", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "cached",
      },
    ];

    render(<SourceStatus sources={sources} />);
    expect(screen.getByTestId("source-IEmissionAdapter")).toHaveTextContent("ADEME en cache");
  });

  it("should differentiate stale and fresh cache indicators visually", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IVehicleLookupAdapter",
        providerKey: "cache",
        status: "cached",
        cacheStatus: "cached",
      },
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
    ];

    render(<SourceStatus sources={sources} />);
    const cachedEl = screen.getByTestId("source-IVehicleLookupAdapter");
    const staleEl = screen.getByTestId("source-IEmissionAdapter");
    // Cached = blue, Stale = orange
    expect(cachedEl.className).toContain("blue");
    expect(staleEl.className).toContain("orange");
  });
});
