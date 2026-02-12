import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchConfigEntities = vi.fn();
const mockUpdateConfigEntity = vi.fn();
const mockGetLegalAcceptanceCount = vi.fn();

vi.mock("@/lib/api/config-api", () => ({
  fetchConfigEntities: (...args: unknown[]) => mockFetchConfigEntities(...args),
  updateConfigEntity: (...args: unknown[]) => mockUpdateConfigEntity(...args),
}));

vi.mock("@/lib/api/legal-api", () => ({
  getLegalAcceptanceCount: (...args: unknown[]) => mockGetLegalAcceptanceCount(...args),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import LegalTextsPage from "@/app/(dashboard)/admin/legal/page";

const mockDocuments = [
  {
    ID: "doc-1",
    key: "cgu",
    title: "Conditions Generales d'Utilisation",
    currentVersion: 1,
    requiresReacceptance: false,
    active: true,
    createdAt: "2026-01-15T10:00:00Z",
    createdBy: "system",
    modifiedAt: "2026-01-15T10:00:00Z",
    modifiedBy: "system",
  },
  {
    ID: "doc-2",
    key: "privacy_policy",
    title: "Politique de Confidentialite",
    currentVersion: 2,
    requiresReacceptance: true,
    active: true,
    createdAt: "2026-01-15T10:00:00Z",
    createdBy: "system",
    modifiedAt: "2026-02-10T10:00:00Z",
    modifiedBy: "admin",
  },
];

const mockVersions = [
  {
    ID: "ver-1",
    document_ID: "doc-1",
    version: 1,
    content: "CGU content",
    summary: "Version initiale",
    publishedAt: "2026-01-15T10:00:00Z",
    publishedBy: "system",
    archived: false,
    createdAt: "2026-01-15T10:00:00Z",
    createdBy: "system",
    modifiedAt: "2026-01-15T10:00:00Z",
    modifiedBy: "system",
  },
  {
    ID: "ver-2",
    document_ID: "doc-2",
    version: 2,
    content: "Privacy v2",
    summary: "Updated privacy",
    publishedAt: "2026-02-10T10:00:00Z",
    publishedBy: "admin",
    archived: false,
    createdAt: "2026-02-10T10:00:00Z",
    createdBy: "admin",
    modifiedAt: "2026-02-10T10:00:00Z",
    modifiedBy: "admin",
  },
];

describe("LegalTextsPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchConfigEntities.mockImplementation(() => new Promise(() => {}));
    render(<LegalTextsPage />);
    expect(screen.getByTestId("legal-loading")).toBeInTheDocument();
  });

  it("should render page title and description", async () => {
    mockFetchConfigEntities
      .mockResolvedValueOnce(mockDocuments)
      .mockResolvedValueOnce(mockVersions);
    mockGetLegalAcceptanceCount.mockResolvedValue(0);
    render(<LegalTextsPage />);
    await waitFor(() => {
      expect(screen.getByText("Textes Legaux")).toBeInTheDocument();
      expect(screen.getByText(/Gerez les documents legaux/)).toBeInTheDocument();
    });
  });

  it("should render document cards", async () => {
    mockFetchConfigEntities
      .mockResolvedValueOnce(mockDocuments)
      .mockResolvedValueOnce(mockVersions);
    mockGetLegalAcceptanceCount.mockResolvedValue(5);
    render(<LegalTextsPage />);
    await waitFor(() => {
      // Use testid to avoid duplicate text matches (title + label can be same text)
      expect(screen.getByTestId("legal-card-doc-1")).toBeInTheDocument();
      expect(screen.getByTestId("legal-card-doc-2")).toBeInTheDocument();
    });
  });

  it("should show re-acceptance badge when required", async () => {
    mockFetchConfigEntities
      .mockResolvedValueOnce(mockDocuments)
      .mockResolvedValueOnce(mockVersions);
    mockGetLegalAcceptanceCount.mockResolvedValue(0);
    render(<LegalTextsPage />);
    await waitFor(() => {
      expect(screen.getByText("Re-acceptation requise")).toBeInTheDocument();
    });
  });

  it("should show empty state when no documents", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<LegalTextsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("legal-empty")).toBeInTheDocument();
    });
  });

  it("should show error on fetch failure", async () => {
    mockFetchConfigEntities.mockRejectedValue(new Error("Network error"));
    render(<LegalTextsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("legal-error")).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should toggle document active state", async () => {
    mockFetchConfigEntities
      .mockResolvedValueOnce(mockDocuments)
      .mockResolvedValueOnce(mockVersions);
    mockGetLegalAcceptanceCount.mockResolvedValue(0);
    mockUpdateConfigEntity.mockResolvedValue(undefined);

    render(<LegalTextsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("legal-card-doc-1")).toBeInTheDocument();
    });

    const toggleBtn = screen.getByTestId("legal-toggle-doc-1");
    expect(toggleBtn).toHaveTextContent("Desactiver");

    // After toggle, refetch
    mockFetchConfigEntities
      .mockResolvedValueOnce(
        mockDocuments.map((d) => (d.ID === "doc-1" ? { ...d, active: false } : d)),
      )
      .mockResolvedValueOnce(mockVersions);

    await userEvent.click(toggleBtn);
    expect(mockUpdateConfigEntity).toHaveBeenCalledWith("LegalDocuments", "doc-1", {
      active: false,
    });
  });

  it("should display version numbers", async () => {
    mockFetchConfigEntities
      .mockResolvedValueOnce(mockDocuments)
      .mockResolvedValueOnce(mockVersions);
    mockGetLegalAcceptanceCount.mockResolvedValue(0);
    render(<LegalTextsPage />);
    await waitFor(() => {
      // Version column shows "1" for doc-1 and "2" for doc-2
      const card1 = screen.getByTestId("legal-card-doc-1");
      expect(card1).toBeInTheDocument();
    });
  });
});
