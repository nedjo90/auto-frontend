import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAcceptLegalDocument = vi.fn();
const mockGetCurrentLegalVersion = vi.fn();

vi.mock("@/lib/api/legal-api", () => ({
  acceptLegalDocument: (...args: unknown[]) => mockAcceptLegalDocument(...args),
  getCurrentLegalVersion: (...args: unknown[]) => mockGetCurrentLegalVersion(...args),
}));

import { LegalAcceptanceModal } from "@/components/legal/legal-acceptance-modal";

const mockPendingDocuments = [
  {
    documentId: "doc-1",
    documentKey: "cgu",
    title: "CGU",
    version: 2,
    summary: "Updated terms",
  },
  {
    documentId: "doc-2",
    documentKey: "privacy_policy",
    title: "Politique de Confidentialite",
    version: 1,
    summary: "New privacy policy",
  },
];

describe("LegalAcceptanceModal", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render nothing when no pending documents", () => {
    const { container } = render(
      <LegalAcceptanceModal open={true} pendingDocuments={[]} onAllAccepted={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("should render the first pending document title", async () => {
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Document content here" });
    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={mockPendingDocuments}
        onAllAccepted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("CGU")).toBeInTheDocument();
      expect(screen.getByText(/1\/2/)).toBeInTheDocument();
    });
  });

  it("should load and display document content", async () => {
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Legal content text" });
    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={mockPendingDocuments}
        onAllAccepted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("legal-acceptance-content")).toBeInTheDocument();
      expect(screen.getByText("Legal content text")).toBeInTheDocument();
    });
  });

  it("should disable accept button until checkbox is checked", async () => {
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Content" });
    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={mockPendingDocuments}
        onAllAccepted={vi.fn()}
      />,
    );

    await waitFor(() => {
      const acceptBtn = screen.getByTestId("legal-accept-btn");
      expect(acceptBtn).toBeDisabled();
    });
  });

  it("should enable accept button when checkbox is checked", async () => {
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Content" });
    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={mockPendingDocuments}
        onAllAccepted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("legal-accept-checkbox")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("legal-accept-checkbox"));

    await waitFor(() => {
      expect(screen.getByTestId("legal-accept-btn")).not.toBeDisabled();
    });
  });

  it("should call acceptLegalDocument and advance to next document", async () => {
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Content" });
    mockAcceptLegalDocument.mockResolvedValue({ success: true });

    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={mockPendingDocuments}
        onAllAccepted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("legal-accept-checkbox")).toBeInTheDocument();
    });

    // Check checkbox and accept
    await userEvent.click(screen.getByTestId("legal-accept-checkbox"));
    await userEvent.click(screen.getByTestId("legal-accept-btn"));

    await waitFor(() => {
      expect(mockAcceptLegalDocument).toHaveBeenCalledWith("doc-1", 2);
    });

    // Should advance to next document
    await waitFor(() => {
      expect(screen.getByText("Politique de Confidentialite")).toBeInTheDocument();
      expect(screen.getByText(/2\/2/)).toBeInTheDocument();
    });
  });

  it("should call onAllAccepted when all documents are accepted", async () => {
    const onAllAccepted = vi.fn();
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Content" });
    mockAcceptLegalDocument.mockResolvedValue({ success: true });

    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={[mockPendingDocuments[0]]}
        onAllAccepted={onAllAccepted}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("legal-accept-checkbox")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("legal-accept-checkbox"));
    await userEvent.click(screen.getByTestId("legal-accept-btn"));

    await waitFor(() => {
      expect(onAllAccepted).toHaveBeenCalled();
    });
  });

  it("should show error on acceptance failure", async () => {
    mockGetCurrentLegalVersion.mockResolvedValue({ content: "Content" });
    mockAcceptLegalDocument.mockRejectedValue(new Error("Server error"));

    render(
      <LegalAcceptanceModal
        open={true}
        pendingDocuments={[mockPendingDocuments[0]]}
        onAllAccepted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("legal-accept-checkbox")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("legal-accept-checkbox"));
    await userEvent.click(screen.getByTestId("legal-accept-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("legal-acceptance-error")).toBeInTheDocument();
    });
  });
});
