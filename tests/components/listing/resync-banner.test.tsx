import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ResyncBanner } from "@/components/listing/resync-banner";
import type { ApiSourceStatus } from "@auto/shared";

describe("ResyncBanner", () => {
  const mockOnResync = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render nothing when no degraded sources and idle state", () => {
    const sources: ApiSourceStatus[] = [
      { adapterInterface: "IEmissionAdapter", providerKey: "ademe", status: "success" },
    ];
    const { container } = render(
      <ResyncBanner
        sources={sources}
        resyncState="idle"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("should show banner for stale sources", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
    ];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="idle"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByTestId("resync-banner")).toBeInTheDocument();
    expect(screen.getByText(/obsolètes ou indisponibles/)).toBeInTheDocument();
    expect(screen.getByText(/ADEME/)).toBeInTheDocument();
  });

  it("should show banner for failed sources", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IRecallAdapter",
        providerKey: "rappelconso",
        status: "failed",
        errorMessage: "Service down",
      },
    ];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="idle"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByTestId("resync-banner")).toBeInTheDocument();
    expect(screen.getByText(/Rappels/)).toBeInTheDocument();
  });

  it("should show resync button and call onResync when clicked", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
    ];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="idle"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    const button = screen.getByTestId("resync-button");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockOnResync).toHaveBeenCalledTimes(1);
  });

  it("should show syncing state", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
    ];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="syncing"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByText(/Re-synchronisation en cours/)).toBeInTheDocument();
  });

  it("should show success result", () => {
    const sources: ApiSourceStatus[] = [];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="done"
        resyncResult={{
          success: true,
          updatedFieldCount: 3,
          failedAdapters: [],
        }}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByText(/3 champs mis à jour/)).toBeInTheDocument();
  });

  it("should show partial success result with failed adapters", () => {
    const sources: ApiSourceStatus[] = [];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="done"
        resyncResult={{
          success: true,
          updatedFieldCount: 1,
          failedAdapters: ["IRecallAdapter"],
        }}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByText(/1 champ mis à jour/)).toBeInTheDocument();
    expect(screen.getByText(/1 source toujours indisponible/)).toBeInTheDocument();
  });

  it("should show error state", () => {
    const sources: ApiSourceStatus[] = [];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="error"
        resyncResult={null}
        resyncError="Service indisponible"
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByText("Service indisponible")).toBeInTheDocument();
  });

  it("should disable resync button during checking state", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
    ];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="checking"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByTestId("resync-button")).toBeDisabled();
  });

  it("should list multiple degraded sources", () => {
    const sources: ApiSourceStatus[] = [
      {
        adapterInterface: "IEmissionAdapter",
        providerKey: "ademe",
        status: "cached",
        cacheStatus: "stale",
      },
      {
        adapterInterface: "IRecallAdapter",
        providerKey: "rappelconso",
        status: "failed",
      },
      {
        adapterInterface: "IVehicleLookupAdapter",
        providerKey: "mock",
        status: "success",
      },
    ];
    render(
      <ResyncBanner
        sources={sources}
        resyncState="idle"
        resyncResult={null}
        resyncError={null}
        onResync={mockOnResync}
      />,
    );
    expect(screen.getByText(/ADEME, Rappels/)).toBeInTheDocument();
  });
});
