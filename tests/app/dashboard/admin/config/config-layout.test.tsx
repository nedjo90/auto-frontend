import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let mockPathname = "/admin/config";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import ConfigLayout from "@/app/(dashboard)/admin/config/layout";

describe("ConfigLayout", () => {
  it("should render page title and description", () => {
    render(<ConfigLayout>content</ConfigLayout>);
    expect(screen.getByText("Configuration de la plateforme")).toBeInTheDocument();
  });

  it("should render all navigation tabs", () => {
    render(<ConfigLayout>content</ConfigLayout>);
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(screen.getByText("Tarification")).toBeInTheDocument();
    expect(screen.getByText("Textes")).toBeInTheDocument();
    expect(screen.getByText("Fonctionnalites")).toBeInTheDocument();
    expect(screen.getByText("Inscription")).toBeInTheDocument();
    expect(screen.getByText("Affichage carte")).toBeInTheDocument();
    expect(screen.getByText("Fournisseurs API")).toBeInTheDocument();
    expect(screen.getByText("Couts API")).toBeInTheDocument();
  });

  it("should render children content", () => {
    render(
      <ConfigLayout>
        <div>Child content</div>
      </ConfigLayout>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should highlight active tab for exact match", () => {
    mockPathname = "/admin/config";
    render(<ConfigLayout>content</ConfigLayout>);
    const overviewLink = screen.getByText("Vue d'ensemble");
    expect(overviewLink.className).toContain("border-primary");
  });

  it("should highlight active tab for prefix match", () => {
    mockPathname = "/admin/config/pricing";
    render(<ConfigLayout>content</ConfigLayout>);
    const pricingLink = screen.getByText("Tarification");
    expect(pricingLink.className).toContain("border-primary");
  });
});
