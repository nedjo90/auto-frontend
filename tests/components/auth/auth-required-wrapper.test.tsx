import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-feature-config", () => ({
  useFeatureConfig: vi.fn(),
}));

import { AuthRequiredWrapper } from "@/components/auth/auth-required-wrapper";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureConfig } from "@/hooks/use-feature-config";

const mockAuth = vi.mocked(useAuth);
const mockFeatureConfig = vi.mocked(useFeatureConfig);

function setupAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  mockAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    roles: [],
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: vi.fn(),
    ...overrides,
  });
}

function setupFeatureConfig(overrides: Partial<ReturnType<typeof useFeatureConfig>>) {
  mockFeatureConfig.mockReturnValue({
    isFeatureAuthRequired: vi.fn().mockReturnValue(false),
    isLoaded: true,
    error: null,
    ...overrides,
  });
}

describe("AuthRequiredWrapper", () => {
  beforeEach(() => {
    cleanup();
    mockAuth.mockReset();
    mockFeatureConfig.mockReset();
  });

  it("renders children when user is authenticated", () => {
    setupAuth({ isAuthenticated: true });
    setupFeatureConfig({
      isFeatureAuthRequired: vi.fn().mockReturnValue(true),
    });

    render(
      <AuthRequiredWrapper featureCode="favorites">
        <div>Protected Content</div>
      </AuthRequiredWrapper>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children when feature does not require auth", () => {
    setupAuth({ isAuthenticated: false });
    setupFeatureConfig({
      isFeatureAuthRequired: vi.fn().mockReturnValue(false),
    });

    render(
      <AuthRequiredWrapper featureCode="public-feature">
        <div>Public Content</div>
      </AuthRequiredWrapper>,
    );

    expect(screen.getByText("Public Content")).toBeInTheDocument();
  });

  it("renders registration wall when anonymous and feature requires auth", () => {
    setupAuth({ isAuthenticated: false });
    setupFeatureConfig({
      isFeatureAuthRequired: vi.fn().mockReturnValue(true),
    });

    render(
      <AuthRequiredWrapper featureCode="favorites">
        <div>Protected Content</div>
      </AuthRequiredWrapper>,
    );

    // Registration wall CTA should be present
    expect(
      screen.getByText(/Connectez-vous ou cr.+ez un compte pour acc.+der .+ cette fonctionnalit/),
    ).toBeInTheDocument();
    // Login link should be available
    expect(screen.getByRole("link", { name: /Se connecter/i })).toBeInTheDocument();
  });

  it("calls isFeatureAuthRequired with the correct feature code", () => {
    const mockIsRequired = vi.fn().mockReturnValue(false);
    setupAuth({ isAuthenticated: false });
    setupFeatureConfig({ isFeatureAuthRequired: mockIsRequired });

    render(
      <AuthRequiredWrapper featureCode="messaging">
        <div>Content</div>
      </AuthRequiredWrapper>,
    );

    expect(mockIsRequired).toHaveBeenCalledWith("messaging");
  });

  it("shows children as teaser content behind wall when anonymous", () => {
    setupAuth({ isAuthenticated: false });
    setupFeatureConfig({
      isFeatureAuthRequired: vi.fn().mockReturnValue(true),
    });

    render(
      <AuthRequiredWrapper featureCode="favorites">
        <div>Teaser Content</div>
      </AuthRequiredWrapper>,
    );

    // Children should be in the DOM as teaser (visible but blurred)
    expect(screen.getByText("Teaser Content")).toBeInTheDocument();
  });
});
