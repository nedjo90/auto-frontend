import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock getSeoMeta
vi.mock("@/lib/seo/get-seo-meta", () => ({
  getSeoMeta: vi.fn().mockResolvedValue(null),
}));

describe("Static Landing Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HowItWorksPage", () => {
    it("renders all 4 steps", async () => {
      const { default: HowItWorksPage } = await import("@/app/(public)/how-it-works/page");
      const page = await HowItWorksPage();
      render(page);

      expect(screen.getByText("Comment ca marche")).toBeDefined();
      expect(screen.getByTestId("step-1")).toBeDefined();
      expect(screen.getByTestId("step-2")).toBeDefined();
      expect(screen.getByTestId("step-3")).toBeDefined();
      expect(screen.getByTestId("step-4")).toBeDefined();
    });

    it("renders step titles", async () => {
      const { default: HowItWorksPage } = await import("@/app/(public)/how-it-works/page");
      const page = await HowItWorksPage();
      render(page);

      expect(screen.getByText("Recherchez")).toBeDefined();
      expect(screen.getByText("Verifiez")).toBeDefined();
      expect(screen.getByText("Contactez")).toBeDefined();
      expect(screen.getByText("Achetez")).toBeDefined();
    });
  });

  describe("AboutPage", () => {
    it("renders about page with mission and values", async () => {
      const { default: AboutPage } = await import("@/app/(public)/about/page");
      const page = await AboutPage();
      render(page);

      expect(screen.getByText(/A propos/)).toBeDefined();
      expect(screen.getByTestId("about-mission")).toBeDefined();
      expect(screen.getByTestId("about-values")).toBeDefined();
    });

    it("renders value list items", async () => {
      const { default: AboutPage } = await import("@/app/(public)/about/page");
      const page = await AboutPage();
      render(page);

      expect(screen.getByText(/Transparence/)).toBeDefined();
      expect(screen.getByText(/Securite/)).toBeDefined();
      expect(screen.getByText(/Simplicite/)).toBeDefined();
      expect(screen.getByText(/Confiance/)).toBeDefined();
    });
  });

  describe("TrustPage", () => {
    it("renders trust page with security features", async () => {
      const { default: TrustPage } = await import("@/app/(public)/trust/page");
      const page = await TrustPage();
      render(page);

      expect(screen.getByText(/Confiance/)).toBeDefined();
      expect(screen.getByText("Certification automatique")).toBeDefined();
      expect(screen.getByText(/Declaration sur l'honneur/)).toBeDefined();
      expect(screen.getByText("Donnees protegees")).toBeDefined();
      expect(screen.getByText("Score de visibilite")).toBeDefined();
    });
  });
});
