import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnonymizationConfirmationDialog } from "@/components/settings/anonymization-confirmation-dialog";

const mockLogout = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    logout: mockLogout,
    hasRole: vi.fn(() => false),
    isAuthenticated: true,
    user: null,
    roles: [],
    isLoading: false,
  }),
}));

const { apiClient } = await import("@/lib/auth/api-client");
const mockApiClient = apiClient as ReturnType<typeof vi.fn>;

describe("AnonymizationConfirmationDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    mockLogout.mockReset();
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

  it("resets state when dialog reopens", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />,
    );

    // Advance to step 2
    await user.type(screen.getByPlaceholderText("ANONYMISER"), "ANONYMISER");
    await user.click(screen.getByText("Continuer"));
    expect(screen.getByText("Dernière confirmation")).toBeInTheDocument();

    // Close and reopen
    rerender(<AnonymizationConfirmationDialog open={false} onOpenChange={onOpenChange} />);
    rerender(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    // Should be back to step 1
    expect(screen.getByText("Confirmer l'anonymisation")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ANONYMISER")).toBeInTheDocument();
  });

  it("executes full anonymization flow with correct API calls", async () => {
    const user = userEvent.setup();

    // Mock requestAnonymization
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          requestId: "anon-req-1",
          status: "requested",
          confirmationCode: "123456",
          message: "Veuillez confirmer",
        }),
    });

    // Mock confirmAnonymization
    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          requestId: "anon-req-1",
          message: "Compte anonymisé",
        }),
    });

    mockLogout.mockResolvedValueOnce(undefined);

    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    // Step 1: type confirmation word
    await user.type(screen.getByPlaceholderText("ANONYMISER"), "ANONYMISER");
    await user.click(screen.getByText("Continuer"));

    // Step 2: confirm anonymization
    await user.click(screen.getByText("Anonymiser définitivement"));

    // Verify API calls
    await vi.waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledTimes(2);
    });

    // First call: requestAnonymization
    expect(mockApiClient).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/rgpd/requestAnonymization"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );

    // Second call: confirmAnonymization with correct confirmation code
    expect(mockApiClient).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/rgpd/confirmAnonymization"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: "anon-req-1",
          confirmationCode: "123456",
        }),
      },
    );

    // Verify logout was called
    expect(mockLogout).toHaveBeenCalled();
  });

  it("shows error when requestAnonymization fails", async () => {
    const user = userEvent.setup();

    mockApiClient.mockResolvedValueOnce({ ok: false });

    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("ANONYMISER"), "ANONYMISER");
    await user.click(screen.getByText("Continuer"));
    await user.click(screen.getByText("Anonymiser définitivement"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("shows error when confirmAnonymization fails", async () => {
    const user = userEvent.setup();

    mockApiClient.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          requestId: "anon-req-1",
          confirmationCode: "123456",
        }),
    });
    mockApiClient.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { message: "Code invalide" },
        }),
    });

    render(<AnonymizationConfirmationDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("ANONYMISER"), "ANONYMISER");
    await user.click(screen.getByText("Continuer"));
    await user.click(screen.getByText("Anonymiser définitivement"));

    expect(await screen.findByText("Code invalide")).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
