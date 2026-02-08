import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockHandleRedirectPromise = vi.fn();
const mockSetActiveAccount = vi.fn();

vi.mock("@azure/msal-react", () => ({
  useMsal: () => ({
    instance: {
      handleRedirectPromise: mockHandleRedirectPromise,
      setActiveAccount: mockSetActiveAccount,
    },
    accounts: [],
  }),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    getAllAccounts: vi.fn(() => []),
  },
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...originalLocation, href: "" },
  });
});

import AuthCallbackPage from "@/app/(auth)/callback/page";

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = "";
  });

  it("shows loading state while processing", () => {
    mockHandleRedirectPromise.mockReturnValue(new Promise(() => {}));
    render(<AuthCallbackPage />);
    expect(screen.getByText("Authentification en cours...")).toBeInTheDocument();
  });

  it("redirects to /dashboard on successful auth", async () => {
    mockHandleRedirectPromise.mockResolvedValue({
      account: { name: "Test", username: "test@test.com" },
      state: undefined,
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
    expect(mockSetActiveAccount).toHaveBeenCalled();
  });

  it("uses safe return URL from state parameter", async () => {
    mockHandleRedirectPromise.mockResolvedValue({
      account: { name: "Test", username: "test@test.com" },
      state: "/settings/security",
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/settings/security");
    });
  });

  it("rejects protocol-relative return URL (open redirect)", async () => {
    mockHandleRedirectPromise.mockResolvedValue({
      account: { name: "Test", username: "test@test.com" },
      state: "//evil.com",
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("rejects absolute return URL (open redirect)", async () => {
    mockHandleRedirectPromise.mockResolvedValue({
      account: { name: "Test", username: "test@test.com" },
      state: "https://evil.com/steal",
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("rejects empty return URL", async () => {
    mockHandleRedirectPromise.mockResolvedValue({
      account: { name: "Test", username: "test@test.com" },
      state: "",
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("redirects to /login when no account in response and no cached accounts", async () => {
    mockHandleRedirectPromise.mockResolvedValue(null);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/login");
    });
  });

  it("shows error and redirects to /login on auth failure", async () => {
    mockHandleRedirectPromise.mockRejectedValue(new Error("Auth failed"));

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Échec de l'authentification/)).toBeInTheDocument();
    });
  });
});
