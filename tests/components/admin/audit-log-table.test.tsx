import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import { AuditLogTable } from "@/components/admin/audit-log-table";

const mockAuditResponse = {
  value: [
    {
      ID: "a1",
      actorId: "admin-1",
      action: "role.assign",
      targetType: "User",
      details: "Assigned role 'seller' to user u1",
      ipAddress: "127.0.0.1",
      timestamp: "2026-02-08T10:00:00Z",
    },
    {
      ID: "a2",
      actorId: "admin-1",
      action: "role.remove",
      targetType: "User",
      details: "Removed role 'buyer' from user u2",
      ipAddress: null,
      timestamp: "2026-02-08T09:00:00Z",
    },
  ],
};

describe("AuditLogTable", () => {
  beforeEach(() => {
    cleanup();
    mockApiClient.mockReset();
  });

  it("renders audit entries", async () => {
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAuditResponse),
    });

    render(<AuditLogTable />);

    await waitFor(() => {
      expect(screen.getByText("role.assign")).toBeInTheDocument();
      expect(screen.getByText("role.remove")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockApiClient.mockImplementation(() => new Promise(() => {}));
    render(<AuditLogTable />);
    expect(screen.getByText(/Chargement du journal/i)).toBeInTheDocument();
  });

  it("shows error on fetch failure", async () => {
    mockApiClient.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<AuditLogTable />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });

  it("shows empty state when no entries", async () => {
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ value: [] }),
    });
    render(<AuditLogTable />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune modification/i)).toBeInTheDocument();
    });
  });

  it("renders table headers", async () => {
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAuditResponse),
    });
    render(<AuditLogTable />);

    await waitFor(() => {
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Cible")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
    });
  });
});
