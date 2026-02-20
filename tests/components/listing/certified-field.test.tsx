import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CertifiedField } from "@/components/listing/certified-field";
import type { CertifiedFieldResult } from "@auto/shared";

describe("CertifiedField", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockField: CertifiedFieldResult = {
    fieldName: "make",
    fieldValue: "Renault",
    source: "SIV",
    sourceTimestamp: "2026-01-15T10:30:00.000Z",
    isCertified: true,
  };

  it("should render field name as French label", () => {
    render(<CertifiedField field={mockField} index={0} />);
    expect(screen.getByTestId("field-label")).toHaveTextContent("Marque");
  });

  it("should render field value", () => {
    render(<CertifiedField field={mockField} index={0} />);
    expect(screen.getByTestId("field-value")).toHaveTextContent("Renault");
  });

  it("should render certified badge with source and date", () => {
    render(<CertifiedField field={mockField} index={0} />);
    const badge = screen.getByTestId("certified-badge");
    expect(badge).toHaveTextContent("Certifie SIV");
    expect(badge).toHaveTextContent("15/01/2026");
  });

  it("should have accessible aria-label on badge", () => {
    render(<CertifiedField field={mockField} index={0} />);
    const badge = screen.getByTestId("certified-badge");
    expect(badge.getAttribute("aria-label")).toContain("Certifie par SIV");
  });

  it("should not render badge when isCertified is false", () => {
    const uncertified: CertifiedFieldResult = {
      ...mockField,
      isCertified: false,
    };
    render(<CertifiedField field={uncertified} index={0} />);
    expect(screen.queryByTestId("certified-badge")).not.toBeInTheDocument();
  });

  it("should apply animation delay based on index", () => {
    const { container } = render(<CertifiedField field={mockField} index={3} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.animationDelay).toBe("300ms");
  });

  it("should skip animation when reducedMotion is true", () => {
    const { container } = render(
      <CertifiedField field={mockField} index={3} reducedMotion={true} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.animationDelay).toBe("");
  });

  it("should render unknown field name as-is", () => {
    const unknownField: CertifiedFieldResult = {
      ...mockField,
      fieldName: "customField",
    };
    render(<CertifiedField field={unknownField} index={0} />);
    expect(screen.getByTestId("field-label")).toHaveTextContent("customField");
  });

  it("should use data-testid with field name", () => {
    render(<CertifiedField field={mockField} index={0} />);
    expect(screen.getByTestId("certified-field-make")).toBeInTheDocument();
  });
});
