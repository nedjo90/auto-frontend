import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("should render footer", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should display platform links", () => {
    render(<Footer />);

    expect(screen.getByTestId("footer-link-search")).toHaveAttribute("href", "/search");
    expect(screen.getByTestId("footer-link-how-it-works")).toHaveAttribute("href", "/how-it-works");
    expect(screen.getByTestId("footer-link-trust")).toHaveAttribute("href", "/trust");
    expect(screen.getByTestId("footer-link-about")).toHaveAttribute("href", "/about");
  });

  it("should display legal links with correct routes", () => {
    render(<Footer />);

    expect(screen.getByTestId("footer-link-legal-cgu")).toHaveAttribute("href", "/legal/cgu");
    expect(screen.getByTestId("footer-link-legal-privacy-policy")).toHaveAttribute(
      "href",
      "/legal/privacy-policy",
    );
  });

  it("should display platform link labels", () => {
    render(<Footer />);

    expect(screen.getByText("Recherche")).toBeInTheDocument();
    expect(screen.getByText("Confiance & Transparence")).toBeInTheDocument();
    expect(screen.getByText("À propos")).toBeInTheDocument();
  });

  it("should display legal link labels", () => {
    render(<Footer />);

    expect(screen.getByText("Mentions légales")).toBeInTheDocument();
    expect(screen.getByText("Politique de confidentialité")).toBeInTheDocument();
  });

  it("should display copyright notice", () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Auto Platform`)).toBeInTheDocument();
  });

  it("should have organized columns", () => {
    render(<Footer />);

    expect(screen.getByTestId("footer-platform-links")).toBeInTheDocument();
    expect(screen.getByTestId("footer-legal-links")).toBeInTheDocument();
  });
});
