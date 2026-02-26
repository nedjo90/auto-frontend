import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyStateCockpit } from "@/components/dashboard/empty-state-cockpit";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("EmptyStateCockpit", () => {
  it("should render the welcome message", () => {
    render(<EmptyStateCockpit />);
    expect(screen.getByTestId("empty-state-cockpit")).toBeInTheDocument();
    expect(screen.getByText(/Bienvenue dans votre espace vendeur/)).toBeInTheDocument();
  });

  it("should render the value proposition text", () => {
    render(<EmptyStateCockpit />);
    expect(screen.getByText(/Suivez vos performances/)).toBeInTheDocument();
  });

  it("should render primary CTA linking to drafts", () => {
    render(<EmptyStateCockpit />);
    const cta = screen.getByTestId("cta-create-listing");
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent("Publiez votre premier véhicule");
    expect(cta.closest("a")).toHaveAttribute("href", "/seller/drafts");
  });

  it("should render secondary CTA linking to search", () => {
    render(<EmptyStateCockpit />);
    const cta = screen.getByTestId("cta-explore-market");
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent("Explorez le marché");
    expect(cta.closest("a")).toHaveAttribute("href", "/search");
  });
});
