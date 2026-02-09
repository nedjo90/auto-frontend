import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnonymizationConfirmationDialog } from "@/components/settings/anonymization-confirmation-dialog";

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
    hasRole: vi.fn(() => false),
    isAuthenticated: true,
    user: null,
    roles: [],
    isLoading: false,
  }),
}));

describe("AnonymizationConfirmationDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const onOpenChange = vi.fn();

  it("renders step 1 with confirmation input", () => {
    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText("Confirmer l'anonymisation")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ANONYMISER")).toBeInTheDocument();
  });

  it("disables continue button until correct word is typed", () => {
    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);
    const continueBtn = screen.getByText("Continuer");
    expect(continueBtn).toBeDisabled();
  });

  it("enables continue button when correct word is typed", async () => {
    const user = userEvent.setup();
    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("ANONYMISER"), "ANONYMISER");
    const continueBtn = screen.getByText("Continuer");
    expect(continueBtn).not.toBeDisabled();
  });

  it("advances to step 2 on continue", async () => {
    const user = userEvent.setup();
    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("ANONYMISER"), "ANONYMISER");
    await user.click(screen.getByText("Continuer"));

    expect(screen.getByText("Dernière confirmation")).toBeInTheDocument();
    expect(screen.getByText("Anonymiser définitivement")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByText("Annuler"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not render when open is false", () => {
    render(<AnonymizationConfirmationDialog open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText("Confirmer l'anonymisation")).not.toBeInTheDocument();
  });
});
