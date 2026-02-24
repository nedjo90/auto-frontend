import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeclarationStep } from "@/components/listing/declaration-step";

const mockHandleSubmit = vi.fn();
const mockReset = vi.fn();

let mockState = {
  isSubmitting: false,
  isSubmitted: false,
  declarationId: null as string | null,
  signedAt: null as string | null,
  error: null as string | null,
};

vi.mock("@/hooks/use-declaration-submit", () => ({
  useDeclarationSubmit: () => ({
    ...mockState,
    handleSubmit: mockHandleSubmit,
    reset: mockReset,
  }),
}));

const mockTemplate = {
  version: "v1.0",
  checkboxItems: ["Item 1", "Item 2"],
  introText: "Intro text",
  legalNotice: "Legal text",
};

vi.mock("@/lib/api/declaration-api", () => ({
  getDeclarationTemplate: () => Promise.resolve(mockTemplate),
}));

describe("DeclarationStep", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockState = {
      isSubmitting: false,
      isSubmitted: false,
      declarationId: null,
      signedAt: null,
      error: null,
    };
  });

  it("should render the declaration form", async () => {
    render(<DeclarationStep />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });
  });

  it("should show confirmation dialog when form is submitted", async () => {
    const user = userEvent.setup();
    render(<DeclarationStep />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    // Check all checkboxes
    await user.click(screen.getByTestId("declaration-checkbox-0"));
    await user.click(screen.getByTestId("declaration-checkbox-1"));
    await user.click(screen.getByTestId("declaration-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("declaration-confirm-dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Confirmer la signature")).toBeInTheDocument();
  });

  it("should call handleSubmit when confirmed", async () => {
    const user = userEvent.setup();
    render(<DeclarationStep />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("declaration-checkbox-0"));
    await user.click(screen.getByTestId("declaration-checkbox-1"));
    await user.click(screen.getByTestId("declaration-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("declaration-confirm-dialog")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("declaration-confirm-btn"));

    expect(mockHandleSubmit).toHaveBeenCalledWith([
      { label: "Item 1", checked: true },
      { label: "Item 2", checked: true },
    ]);
  });

  it("should close dialog when cancelled", async () => {
    const user = userEvent.setup();
    render(<DeclarationStep />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("declaration-checkbox-0"));
    await user.click(screen.getByTestId("declaration-checkbox-1"));
    await user.click(screen.getByTestId("declaration-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("declaration-confirm-dialog")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("declaration-cancel-btn"));

    await waitFor(() => {
      expect(screen.queryByTestId("declaration-confirm-dialog")).not.toBeInTheDocument();
    });
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it("should show success state when submitted", async () => {
    mockState = {
      isSubmitting: false,
      isSubmitted: true,
      declarationId: "decl-1",
      signedAt: "2026-02-24T10:30:00.000Z",
      error: null,
    };

    render(<DeclarationStep />);

    expect(screen.getByTestId("declaration-success")).toBeInTheDocument();
    expect(screen.getByText("Déclaration signée")).toBeInTheDocument();
    expect(screen.getByTestId("declaration-signed-date")).toBeInTheDocument();
  });

  it("should show error state", async () => {
    mockState = {
      isSubmitting: false,
      isSubmitted: false,
      declarationId: null,
      signedAt: null,
      error: "Erreur de soumission",
    };

    render(<DeclarationStep />);

    await waitFor(() => {
      expect(screen.getByTestId("declaration-submit-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Erreur de soumission")).toBeInTheDocument();
  });

  it("should disable form when submitting", async () => {
    mockState = {
      isSubmitting: true,
      isSubmitted: false,
      declarationId: null,
      signedAt: null,
      error: null,
    };

    render(<DeclarationStep />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    expect(screen.getByText("Signature en cours...")).toBeInTheDocument();
  });
});
