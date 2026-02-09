import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportSection } from "@/components/settings/data-export-section";

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: vi.fn(),
}));

const { apiClient } = await import("@/lib/auth/api-client");
const mockApiClient = apiClient as ReturnType<typeof vi.fn>;

describe("DataExportSection", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders export button", () => {
    render(<DataExportSection />);
    expect(screen.getByText("Demander l'export")).toBeInTheDocument();
  });

  it("renders section title", () => {
    render(<DataExportSection />);
    expect(screen.getByText("Exporter mes données")).toBeInTheDocument();
  });

  it("shows status after requesting export", async () => {
    const user = userEvent.setup();
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          requestId: "req-1",
          status: "pending",
          estimatedCompletionMinutes: 5,
        }),
    });

    render(<DataExportSection />);
    await user.click(screen.getByText("Demander l'export"));

    expect(await screen.findByText("En attente")).toBeInTheDocument();
    expect(screen.getByText(/5 minutes/)).toBeInTheDocument();

    // Verify API call arguments
    expect(mockApiClient).toHaveBeenCalledWith(
      expect.stringContaining("/api/rgpd/requestDataExport"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
  });

  it("shows error on failed request", async () => {
    const user = userEvent.setup();
    mockApiClient.mockResolvedValueOnce({ ok: false });

    render(<DataExportSection />);
    await user.click(screen.getByText("Demander l'export"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows download button when status is ready", async () => {
    const user = userEvent.setup();
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          requestId: "req-1",
          status: "ready",
          estimatedCompletionMinutes: 0,
        }),
    });

    render(<DataExportSection />);
    await user.click(screen.getByText("Demander l'export"));

    expect(await screen.findByText("Prêt")).toBeInTheDocument();
    expect(screen.getByText("Télécharger mes données")).toBeInTheDocument();
  });

  it("shows check status button when status is pending", async () => {
    const user = userEvent.setup();
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          requestId: "req-1",
          status: "pending",
          estimatedCompletionMinutes: 5,
        }),
    });

    render(<DataExportSection />);
    await user.click(screen.getByText("Demander l'export"));

    expect(await screen.findByText("Vérifier le statut")).toBeInTheDocument();
  });
});
