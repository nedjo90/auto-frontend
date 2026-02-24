import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeclarationStatus } from "@/components/listing/declaration-status";

const mockGetDeclarationSummary = vi.fn();
vi.mock("@/lib/api/declaration-api", () => ({
  getDeclarationSummary: (...args: unknown[]) => mockGetDeclarationSummary(...args),
}));

describe("DeclarationStatus", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("seller view - declared", () => {
    it("should show declaration signed message with date", async () => {
      mockGetDeclarationSummary.mockResolvedValueOnce({
        hasDeclared: true,
        signedAt: "2026-02-24T10:30:00.000Z",
        declarationVersion: "v1.0",
      });

      render(<DeclarationStatus listingId="listing-1" viewMode="seller" />);

      await waitFor(() => {
        expect(screen.getByTestId("declaration-status-declared")).toBeInTheDocument();
      });
      expect(screen.getByText(/Déclaration signée le/)).toBeInTheDocument();
    });
  });

  describe("seller view - not declared", () => {
    it("should show required message", async () => {
      mockGetDeclarationSummary.mockResolvedValueOnce({
        hasDeclared: false,
        signedAt: null,
        declarationVersion: null,
      });

      render(<DeclarationStatus listingId="listing-1" viewMode="seller" />);

      await waitFor(() => {
        expect(screen.getByTestId("declaration-status-required")).toBeInTheDocument();
      });
      expect(screen.getByText("Déclaration requise avant publication")).toBeInTheDocument();
    });

    it("should show CTA button when onDeclare is provided", async () => {
      const mockOnDeclare = vi.fn();
      mockGetDeclarationSummary.mockResolvedValueOnce({
        hasDeclared: false,
        signedAt: null,
        declarationVersion: null,
      });

      render(
        <DeclarationStatus listingId="listing-1" viewMode="seller" onDeclare={mockOnDeclare} />,
      );

      await waitFor(() => {
        expect(screen.getByTestId("declaration-cta-btn")).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId("declaration-cta-btn"));
      expect(mockOnDeclare).toHaveBeenCalled();
    });

    it("should not show CTA button when onDeclare is not provided", async () => {
      mockGetDeclarationSummary.mockResolvedValueOnce({
        hasDeclared: false,
        signedAt: null,
        declarationVersion: null,
      });

      render(<DeclarationStatus listingId="listing-1" viewMode="seller" />);

      await waitFor(() => {
        expect(screen.getByTestId("declaration-status-required")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("declaration-cta-btn")).not.toBeInTheDocument();
    });
  });

  describe("admin view", () => {
    it("should show full declaration details", async () => {
      mockGetDeclarationSummary.mockResolvedValueOnce({
        hasDeclared: true,
        signedAt: "2026-02-24T10:30:00.000Z",
        declarationVersion: "v1.0",
      });

      const adminData = {
        checkboxStates: [
          { label: "Attestation 1", checked: true },
          { label: "Attestation 2", checked: true },
        ],
        ipAddress: "192.168.1.100",
        declarationVersion: "v1.0",
        signedAt: "2026-02-24T10:30:00.000Z",
      };

      render(<DeclarationStatus listingId="listing-1" viewMode="admin" adminData={adminData} />);

      await waitFor(() => {
        expect(screen.getByTestId("declaration-admin-view")).toBeInTheDocument();
      });
      expect(screen.getByTestId("admin-declaration-version")).toHaveTextContent("v1.0");
      expect(screen.getByTestId("admin-declaration-ip")).toHaveTextContent("192.168.1.100");
      expect(screen.getByTestId("admin-declaration-checkboxes")).toBeInTheDocument();
    });

    it("should show all checkbox states with check/cross indicators", async () => {
      mockGetDeclarationSummary.mockResolvedValueOnce({
        hasDeclared: true,
        signedAt: "2026-02-24T10:30:00.000Z",
        declarationVersion: "v1.0",
      });

      const adminData = {
        checkboxStates: [
          { label: "Checked item", checked: true },
          { label: "Unchecked item", checked: false },
        ],
        ipAddress: "10.0.0.1",
        declarationVersion: "v1.0",
        signedAt: "2026-02-24T10:30:00.000Z",
      };

      render(<DeclarationStatus listingId="listing-1" viewMode="admin" adminData={adminData} />);

      await waitFor(() => {
        expect(screen.getByText("Checked item")).toBeInTheDocument();
      });
      expect(screen.getByText("Unchecked item")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
      expect(screen.getByText("✗")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("should show loading indicator while fetching", () => {
      mockGetDeclarationSummary.mockReturnValue(new Promise(() => {}));

      render(<DeclarationStatus listingId="listing-1" viewMode="seller" />);
      expect(screen.getByTestId("declaration-status-loading")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should show required state when API call fails", async () => {
      mockGetDeclarationSummary.mockRejectedValueOnce(new Error("Network error"));

      render(<DeclarationStatus listingId="listing-1" viewMode="seller" />);

      await waitFor(() => {
        expect(screen.getByTestId("declaration-status-required")).toBeInTheDocument();
      });
    });
  });
});
