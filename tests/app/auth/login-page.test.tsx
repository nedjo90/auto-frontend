import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Set Azure env var so loginRedirect path is taken (not dev mode redirect)
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID = "test-client-id";
});

vi.mock("@/lib/auth/auth-utils", () => ({
  loginRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/msal-instance", () => ({
  isAzureConfigured: true,
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import LoginPage from "@/app/(auth)/login/page";
import { loginRedirect } from "@/lib/auth/auth-utils";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login page with Se connecter button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
  });

  it("renders a link to register", () => {
    render(<LoginPage />);
    const links = screen.getAllByText(/Créer un compte/i);
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("calls loginRedirect when Se connecter is clicked", async () => {
    render(<LoginPage />);
    const buttons = screen.getAllByRole("button");
    const loginBtn = buttons.find((b) => b.textContent?.includes("Se connecter"));
    expect(loginBtn).toBeDefined();
    fireEvent.click(loginBtn!);
    expect(loginRedirect).toHaveBeenCalled();
  });
});
