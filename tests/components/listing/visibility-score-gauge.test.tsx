import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { VisibilityScoreGauge } from "@/components/listing/visibility-score-gauge";

let mockReducedMotion = false;
vi.mock("@/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => mockReducedMotion,
}));

describe("VisibilityScoreGauge", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockReducedMotion = false;
  });

  describe("rendering", () => {
    it("should render the gauge container", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.getByTestId("visibility-score-gauge")).toBeInTheDocument();
    });

    it("should render the SVG gauge", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.getByTestId("gauge-svg")).toBeInTheDocument();
    });

    it("should display the score number", () => {
      render(<VisibilityScoreGauge score={72} />);
      expect(screen.getByTestId("gauge-score")).toHaveTextContent("72");
    });

    it("should display /100 denominator", () => {
      render(<VisibilityScoreGauge score={72} />);
      expect(screen.getByText("/100")).toBeInTheDocument();
    });

    it("should render the value arc for non-zero scores", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.getByTestId("gauge-value-arc")).toBeInTheDocument();
    });

    it("should not render value arc for zero score", () => {
      render(<VisibilityScoreGauge score={0} />);
      expect(screen.queryByTestId("gauge-value-arc")).not.toBeInTheDocument();
    });
  });

  describe("score labels", () => {
    it("should show 'Partiellement documente' for score 0-33", () => {
      render(<VisibilityScoreGauge score={20} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("Partiellement document");
    });

    it("should show 'Bien documente' for score 34-66", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("Bien document");
    });

    it("should show 'Tres documente' for score 67-100", () => {
      render(<VisibilityScoreGauge score={80} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("document");
    });

    it("should show low label at threshold boundary (33)", () => {
      render(<VisibilityScoreGauge score={33} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("Partiellement document");
    });

    it("should show medium label at threshold boundary (34)", () => {
      render(<VisibilityScoreGauge score={34} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("Bien document");
    });

    it("should show high label at threshold boundary (67)", () => {
      render(<VisibilityScoreGauge score={67} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("document");
    });

    it("should prefer backend-provided label over client-side default", () => {
      render(<VisibilityScoreGauge score={20} label="Custom Backend Label" />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("Custom Backend Label");
    });

    it("should fall back to client-side label when label prop is not provided", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.getByTestId("gauge-label")).toHaveTextContent("Bien document");
    });
  });

  describe("score clamping", () => {
    it("should clamp score above 100 to 100", () => {
      render(<VisibilityScoreGauge score={150} />);
      expect(screen.getByTestId("gauge-score")).toHaveTextContent("100");
    });

    it("should clamp score below 0 to 0", () => {
      render(<VisibilityScoreGauge score={-10} />);
      expect(screen.getByTestId("gauge-score")).toHaveTextContent("0");
    });

    it("should round decimal scores", () => {
      render(<VisibilityScoreGauge score={72.7} />);
      expect(screen.getByTestId("gauge-score")).toHaveTextContent("73");
    });
  });

  describe("delta display", () => {
    it("should show positive delta when score increased", () => {
      render(<VisibilityScoreGauge score={80} previousScore={70} />);
      const delta = screen.getByTestId("gauge-delta");
      expect(delta).toHaveTextContent("+10 pts");
    });

    it("should show negative delta when score decreased", () => {
      render(<VisibilityScoreGauge score={60} previousScore={80} />);
      const delta = screen.getByTestId("gauge-delta");
      expect(delta).toHaveTextContent("-20 pts");
    });

    it("should not show delta when score unchanged", () => {
      render(<VisibilityScoreGauge score={50} previousScore={50} />);
      expect(screen.queryByTestId("gauge-delta")).not.toBeInTheDocument();
    });

    it("should not show delta when previousScore is not provided", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.queryByTestId("gauge-delta")).not.toBeInTheDocument();
    });
  });

  describe("normalization message", () => {
    it("should display normalization message when provided", () => {
      render(
        <VisibilityScoreGauge
          score={65}
          normalizationMessage="Bon score pour un vehicule de 2015"
        />,
      );
      expect(screen.getByTestId("gauge-normalization")).toHaveTextContent(
        "Bon score pour un vehicule de 2015",
      );
    });

    it("should not display normalization message when not provided", () => {
      render(<VisibilityScoreGauge score={65} />);
      expect(screen.queryByTestId("gauge-normalization")).not.toBeInTheDocument();
    });
  });

  describe("animation and reduced motion", () => {
    it("should apply CSS transitions when reduced motion is not active", () => {
      render(<VisibilityScoreGauge score={50} />);
      const arc = screen.getByTestId("gauge-value-arc");
      expect(arc.style.transition).toContain("500ms");
    });

    it("should not apply CSS transitions when reduced motion is active", () => {
      mockReducedMotion = true;
      render(<VisibilityScoreGauge score={50} />);
      const arc = screen.getByTestId("gauge-value-arc");
      expect(arc.style.transition).toBe("");
    });

    it("should apply transition on score text color when reduced motion is not active", () => {
      render(<VisibilityScoreGauge score={50} />);
      const scoreEl = screen.getByTestId("gauge-score");
      expect(scoreEl.style.transition).toContain("500ms");
    });

    it("should not apply transition on score text when reduced motion is active", () => {
      mockReducedMotion = true;
      render(<VisibilityScoreGauge score={50} />);
      const scoreEl = screen.getByTestId("gauge-score");
      expect(scoreEl.style.transition).toBe("");
    });
  });

  describe("accessibility", () => {
    it("should have role meter", () => {
      render(<VisibilityScoreGauge score={50} />);
      expect(screen.getByRole("meter")).toBeInTheDocument();
    });

    it("should have aria-valuenow set to score", () => {
      render(<VisibilityScoreGauge score={72} />);
      const gauge = screen.getByRole("meter");
      expect(gauge).toHaveAttribute("aria-valuenow", "72");
    });

    it("should have aria-valuemin and aria-valuemax", () => {
      render(<VisibilityScoreGauge score={50} />);
      const gauge = screen.getByRole("meter");
      expect(gauge).toHaveAttribute("aria-valuemin", "0");
      expect(gauge).toHaveAttribute("aria-valuemax", "100");
    });

    it("should have descriptive aria-label", () => {
      render(<VisibilityScoreGauge score={72} />);
      const gauge = screen.getByRole("meter");
      expect(gauge).toHaveAttribute("aria-label", "Score de visibilite: 72 sur 100");
    });

    it("should have aria-label on delta indicating direction", () => {
      render(<VisibilityScoreGauge score={80} previousScore={70} />);
      const delta = screen.getByTestId("gauge-delta");
      expect(delta).toHaveAttribute("aria-label", "Plus 10 points");
    });

    it("should have aria-label on negative delta", () => {
      render(<VisibilityScoreGauge score={60} previousScore={80} />);
      const delta = screen.getByTestId("gauge-delta");
      expect(delta).toHaveAttribute("aria-label", "Moins 20 points");
    });
  });

  describe("sticky positioning", () => {
    it("should have sticky class", () => {
      render(<VisibilityScoreGauge score={50} />);
      const gauge = screen.getByTestId("visibility-score-gauge");
      expect(gauge.className).toContain("sticky");
      expect(gauge.className).toContain("top-4");
    });
  });

  describe("custom className", () => {
    it("should accept and apply custom className", () => {
      render(<VisibilityScoreGauge score={50} className="my-custom-class" />);
      const gauge = screen.getByTestId("visibility-score-gauge");
      expect(gauge.className).toContain("my-custom-class");
    });
  });
});
