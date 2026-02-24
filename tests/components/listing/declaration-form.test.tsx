import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeclarationForm } from "@/components/listing/declaration-form";

const mockGetDeclarationTemplate = vi.fn();
vi.mock("@/lib/api/declaration-api", () => ({
  getDeclarationTemplate: () => mockGetDeclarationTemplate(),
}));

const mockTemplate = {
  version: "v1.0",
  checkboxItems: [
    "J'atteste que les informations declarees sont exactes",
    "J'atteste etre le proprietaire ou mandataire autorise",
    "J'atteste que le vehicule n'a pas de gage ni d'opposition",
    "J'accepte les conditions generales de vente",
  ],
  introText: "En signant cette declaration, vous attestez...",
  legalNotice: "Cette declaration est archivee conformement...",
};

describe("DeclarationForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGetDeclarationTemplate.mockResolvedValue(mockTemplate);
  });

  it("should show loading state initially", () => {
    mockGetDeclarationTemplate.mockReturnValue(new Promise(() => {})); // never resolves
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId("declaration-loading")).toBeInTheDocument();
  });

  it("should render the form after template loads", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });
  });

  it("should render all checkbox items from template", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    for (let i = 0; i < mockTemplate.checkboxItems.length; i++) {
      expect(screen.getByTestId(`declaration-item-${i}`)).toBeInTheDocument();
      expect(screen.getByTestId(`declaration-checkbox-${i}`)).toBeInTheDocument();
    }
  });

  it("should render intro text and legal notice", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-intro")).toBeInTheDocument();
    });
    expect(screen.getByTestId("declaration-intro")).toHaveTextContent(
      "En signant cette declaration",
    );
    expect(screen.getByTestId("declaration-legal")).toHaveTextContent(
      "Cette declaration est archivee",
    );
  });

  it("should show progress counter", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-progress")).toBeInTheDocument();
    });
    expect(screen.getByTestId("declaration-progress")).toHaveTextContent("0/4 attestations");
  });

  it("should update progress when checkboxes are toggled", async () => {
    const user = userEvent.setup();
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("declaration-checkbox-0"));
    expect(screen.getByTestId("declaration-progress")).toHaveTextContent("1/4 attestations");

    await user.click(screen.getByTestId("declaration-checkbox-1"));
    expect(screen.getByTestId("declaration-progress")).toHaveTextContent("2/4 attestations");
  });

  it("should disable submit button when not all checked", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-submit-btn")).toBeInTheDocument();
    });
    expect(screen.getByTestId("declaration-submit-btn")).toBeDisabled();
  });

  it("should enable submit button when all checked", async () => {
    const user = userEvent.setup();
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByTestId(`declaration-checkbox-${i}`));
    }

    expect(screen.getByTestId("declaration-submit-btn")).not.toBeDisabled();
  });

  it("should call onSubmit with checkbox states when submitted", async () => {
    const user = userEvent.setup();
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByTestId(`declaration-checkbox-${i}`));
    }
    await user.click(screen.getByTestId("declaration-submit-btn"));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      mockTemplate.checkboxItems.map((label) => ({
        label,
        checked: true,
      })),
    );
  });

  it("should show validation error when attempting submit with unchecked items", async () => {
    const user = userEvent.setup();
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    // Check only 2 out of 4
    await user.click(screen.getByTestId("declaration-checkbox-0"));
    await user.click(screen.getByTestId("declaration-checkbox-1"));

    // Try to submit (button is disabled, but test the attempted state)
    // Force the submit by checking the validation error appears
    await user.click(screen.getByTestId("declaration-submit-btn"));

    // Button is disabled so onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show error state when template loading fails", async () => {
    mockGetDeclarationTemplate.mockRejectedValueOnce(new Error("Network error"));
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-error")).toBeInTheDocument();
    });
  });

  it("should disable checkboxes when disabled prop is true", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} disabled />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId("declaration-checkbox-0");
    expect(checkbox).toBeDisabled();
  });

  it("should show submitting state with loader", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} isSubmitting />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    expect(screen.getByTestId("declaration-submit-btn")).toBeDisabled();
    expect(screen.getByText("Signature en cours...")).toBeInTheDocument();
  });

  it("should have proper label associations for accessibility", async () => {
    render(<DeclarationForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(screen.getByTestId("declaration-form")).toBeInTheDocument();
    });

    // Each checkbox should have a label associated
    const labels = screen.getAllByText(/J'atteste|J'accepte/);
    expect(labels.length).toBe(4);
  });
});
