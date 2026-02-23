import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScoreSuggestions } from "@/components/listing/score-suggestions";
import type { ScoreSuggestion } from "@auto/shared";

// Mock scrollIntoView and focus
const mockScrollIntoView = vi.fn();
const mockFocus = vi.fn();

describe("ScoreSuggestions", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockScrollIntoView.mockReset();
    mockFocus.mockReset();
  });

  const mockSuggestions: ScoreSuggestion[] = [
    { field: "description", message: "Ajoutez une description detaillee", boost: 5 },
    { field: "photo", message: "Ajoutez des photos", boost: 8 },
    { field: "mileage", message: "Renseignez le kilometrage", boost: 3 },
  ];

  describe("rendering", () => {
    it("should render the suggestions container", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByTestId("score-suggestions")).toBeInTheDocument();
    });

    it("should render the title", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByTestId("suggestions-title")).toHaveTextContent(
        "Ameliorez votre visibilite",
      );
    });

    it("should render all suggestions", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByTestId("suggestion-description")).toBeInTheDocument();
      expect(screen.getByTestId("suggestion-photo")).toBeInTheDocument();
      expect(screen.getByTestId("suggestion-mileage")).toBeInTheDocument();
    });

    it("should display suggestion messages", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByText("Ajoutez une description detaillee")).toBeInTheDocument();
      expect(screen.getByText("Ajoutez des photos")).toBeInTheDocument();
      expect(screen.getByText("Renseignez le kilometrage")).toBeInTheDocument();
    });

    it("should display boost points for each suggestion", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByTestId("suggestion-boost-description")).toHaveTextContent("+5 pts");
      expect(screen.getByTestId("suggestion-boost-photo")).toHaveTextContent("+8 pts");
      expect(screen.getByTestId("suggestion-boost-mileage")).toHaveTextContent("+3 pts");
    });
  });

  describe("sorting", () => {
    it("should sort suggestions by highest boost first", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      const suggestions = screen.getAllByRole("listitem");

      // Photo (8) should be first, then description (5), then mileage (3)
      expect(suggestions[0]).toHaveAttribute("data-testid", "suggestion-photo");
      expect(suggestions[1]).toHaveAttribute("data-testid", "suggestion-description");
      expect(suggestions[2]).toHaveAttribute("data-testid", "suggestion-mileage");
    });
  });

  describe("empty state", () => {
    it("should show congratulations message when no suggestions", () => {
      render(<ScoreSuggestions suggestions={[]} />);
      expect(screen.getByTestId("score-suggestions-empty")).toBeInTheDocument();
      expect(screen.getByText(/parfaitement documentee/i)).toBeInTheDocument();
    });

    it("should not render suggestion list when empty", () => {
      render(<ScoreSuggestions suggestions={[]} />);
      expect(screen.queryByTestId("score-suggestions")).not.toBeInTheDocument();
    });
  });

  describe("scroll to field", () => {
    it("should scroll to section when suggestion is clicked", async () => {
      const user = userEvent.setup();

      // Create a mock section element in the DOM
      const sectionEl = document.createElement("section");
      sectionEl.id = "section-condition_description";
      sectionEl.scrollIntoView = mockScrollIntoView;
      document.body.appendChild(sectionEl);

      render(<ScoreSuggestions suggestions={mockSuggestions} />);

      await user.click(screen.getByTestId("suggestion-description"));

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });

      document.body.removeChild(sectionEl);
    });

    it("should try to focus the field input after scrolling", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Spy on HTMLElement.prototype.focus
      const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

      // Create mock section and input elements
      const sectionEl = document.createElement("section");
      sectionEl.id = "section-condition_description";
      sectionEl.scrollIntoView = mockScrollIntoView;
      document.body.appendChild(sectionEl);

      const inputEl = document.createElement("input");
      inputEl.setAttribute("data-testid", "input-description");
      document.body.appendChild(inputEl);

      render(<ScoreSuggestions suggestions={mockSuggestions} />);

      await user.click(screen.getByTestId("suggestion-description"));

      // Advance timer to trigger delayed focus
      vi.advanceTimersByTime(500);

      expect(focusSpy).toHaveBeenCalled();

      document.body.removeChild(sectionEl);
      document.body.removeChild(inputEl);
      focusSpy.mockRestore();
      vi.useRealTimers();
    });

    it("should handle missing section gracefully", async () => {
      const user = userEvent.setup();

      render(
        <ScoreSuggestions
          suggestions={[{ field: "unknownField", message: "Unknown suggestion", boost: 1 }]}
        />,
      );

      // Should not throw
      await user.click(screen.getByTestId("suggestion-unknownField"));
    });
  });

  describe("accessibility", () => {
    it("should have role list on container", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should have aria-label on container", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      const list = screen.getByRole("list");
      expect(list).toHaveAttribute("aria-label", "Suggestions pour ameliorer votre score");
    });

    it("should have role listitem on each suggestion", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);
    });

    it("should have descriptive aria-label on each suggestion", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} />);
      const photoSuggestion = screen.getByTestId("suggestion-photo");
      expect(photoSuggestion).toHaveAttribute("aria-label", "Ajoutez des photos - plus 8 points");
    });
  });

  describe("custom className", () => {
    it("should accept and apply custom className", () => {
      render(<ScoreSuggestions suggestions={mockSuggestions} className="my-custom" />);
      const container = screen.getByTestId("score-suggestions");
      expect(container.className).toContain("my-custom");
    });

    it("should apply className to empty state", () => {
      render(<ScoreSuggestions suggestions={[]} className="my-custom" />);
      const container = screen.getByTestId("score-suggestions-empty");
      expect(container.className).toContain("my-custom");
    });
  });

  describe("single suggestion", () => {
    it("should render correctly with a single suggestion", () => {
      render(
        <ScoreSuggestions
          suggestions={[{ field: "price", message: "Indiquez le prix", boost: 10 }]}
        />,
      );
      expect(screen.getByTestId("suggestion-price")).toBeInTheDocument();
      expect(screen.getByTestId("suggestion-boost-price")).toHaveTextContent("+10 pts");
    });
  });
});
