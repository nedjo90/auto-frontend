import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SoldBadge } from "@/components/listing/sold-badge";

describe("SoldBadge", () => {
  it("should render Vendu text", () => {
    render(<SoldBadge />);
    expect(screen.getByTestId("sold-badge")).toBeInTheDocument();
    expect(screen.getByText("Vendu")).toBeInTheDocument();
  });

  it("should accept additional className", () => {
    render(<SoldBadge className="custom-class" />);
    const badge = screen.getByTestId("sold-badge");
    expect(badge.className).toContain("custom-class");
  });

  it("should have blue styling", () => {
    render(<SoldBadge />);
    const badge = screen.getByTestId("sold-badge");
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-800");
  });
});
