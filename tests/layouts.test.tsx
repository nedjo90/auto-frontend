import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TopBar } from "@/components/layout/top-bar";

vi.mock("@azure/msal-react", () => ({
  useMsal: vi.fn(() => ({
    instance: {},
    accounts: [],
    inProgress: "none",
  })),
}));

vi.mock("@/lib/auth/auth-utils", () => ({
  logoutRedirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

describe("Layout components", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Header", () => {
    it("should render the Auto brand link", () => {
      render(<Header />);
      expect(screen.getByText("Auto")).toBeInTheDocument();
    });

    it("should render a Se connecter link when unauthenticated", () => {
      render(<Header />);
      expect(screen.getByText("Se connecter")).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("should render legal and privacy links", () => {
      render(<Footer />);
      expect(screen.getByText("Mentions légales")).toBeInTheDocument();
      expect(screen.getByText("Politique de confidentialité")).toBeInTheDocument();
    });
  });

  describe("TopBar", () => {
    it("should render Tableau de bord title", () => {
      render(<TopBar />);
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    });
  });
});
