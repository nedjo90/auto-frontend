import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AutoFillTrigger,
  detectFormat,
  formatPlate,
  isValidIdentifier,
} from "@/components/listing/auto-fill-trigger";

describe("auto-fill-trigger", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("detectFormat", () => {
    it("should return 'unknown' for less than 3 characters", () => {
      expect(detectFormat("AB")).toBe("unknown");
      expect(detectFormat("")).toBe("unknown");
      expect(detectFormat("A")).toBe("unknown");
    });

    it("should detect plate format", () => {
      expect(detectFormat("AB1")).toBe("plate");
      expect(detectFormat("AB-123")).toBe("plate");
      expect(detectFormat("AB-123-CD")).toBe("plate");
      expect(detectFormat("AB123CD")).toBe("plate");
    });

    it("should detect VIN format", () => {
      expect(detectFormat("VF1RFB0")).toBe("vin");
      expect(detectFormat("VF1RFB00X56789012")).toBe("vin");
      expect(detectFormat("WVWZZZ3CZWE123456")).toBe("vin");
    });
  });

  describe("formatPlate", () => {
    it("should auto-format plate with dashes", () => {
      expect(formatPlate("AB123CD")).toBe("AB-123-CD");
    });

    it("should handle partial input", () => {
      expect(formatPlate("AB")).toBe("AB");
      expect(formatPlate("AB1")).toBe("AB-1");
      expect(formatPlate("AB123")).toBe("AB-123");
      expect(formatPlate("AB123C")).toBe("AB-123-C");
    });

    it("should strip non-alphanumeric characters", () => {
      expect(formatPlate("AB-123-CD")).toBe("AB-123-CD");
      expect(formatPlate("ab 123 cd")).toBe("AB-123-CD");
    });

    it("should convert to uppercase", () => {
      expect(formatPlate("ab123cd")).toBe("AB-123-CD");
    });
  });

  describe("isValidIdentifier", () => {
    it("should validate correct plate format", () => {
      expect(isValidIdentifier("AB-123-CD", "plate")).toBe(true);
    });

    it("should reject incomplete plate", () => {
      expect(isValidIdentifier("AB-123", "plate")).toBe(false);
    });

    it("should validate correct VIN format", () => {
      expect(isValidIdentifier("VF1RFB00X56789012", "vin")).toBe(true);
    });

    it("should reject VIN with I, O, or Q", () => {
      expect(isValidIdentifier("VF1RFB00I56789012", "vin")).toBe(false);
      expect(isValidIdentifier("VF1RFB00O56789012", "vin")).toBe(false);
      expect(isValidIdentifier("VF1RFB00Q56789012", "vin")).toBe(false);
    });

    it("should reject short VIN", () => {
      expect(isValidIdentifier("VF1RFB", "vin")).toBe(false);
    });

    it("should return false for unknown format", () => {
      expect(isValidIdentifier("AB-123-CD", "unknown")).toBe(false);
    });
  });

  describe("AutoFillTrigger component", () => {
    it("should render with initial label and placeholder", () => {
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      expect(screen.getByTestId("auto-fill-label")).toHaveTextContent("Identifiez votre vehicule");
      expect(screen.getByTestId("auto-fill-input")).toHaveAttribute(
        "placeholder",
        "AA-123-BB ou numero VIN",
      );
    });

    it("should display help text", () => {
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      expect(screen.getByTestId("auto-fill-help")).toBeInTheDocument();
    });

    it("should update label to 'Plaque detectee' when plate format detected", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const input = screen.getByTestId("auto-fill-input");
      await user.type(input, "AB1");

      expect(screen.getByTestId("auto-fill-label")).toHaveTextContent("Plaque detectee");
    });

    it("should update label to 'VIN detecte' when VIN format detected", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const input = screen.getByTestId("auto-fill-input");
      await user.type(input, "VF1RFB0");

      expect(screen.getByTestId("auto-fill-label")).toHaveTextContent("VIN detecte");
    });

    it("should auto-format plate input with dashes", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const input = screen.getByTestId("auto-fill-input");
      await user.type(input, "AB123CD");

      expect(input).toHaveValue("AB-123-CD");
    });

    it("should disable search button until valid format detected", () => {
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const button = screen.getByTestId("auto-fill-search-button");
      expect(button).toBeDisabled();
    });

    it("should enable search button when valid plate entered", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const input = screen.getByTestId("auto-fill-input");
      await user.type(input, "AB123CD");

      const button = screen.getByTestId("auto-fill-search-button");
      expect(button).not.toBeDisabled();
    });

    it("should call onSearch with plate when search button clicked", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const input = screen.getByTestId("auto-fill-input");
      await user.type(input, "AB123CD");

      const button = screen.getByTestId("auto-fill-search-button");
      await user.click(button);

      expect(onSearch).toHaveBeenCalledWith("AB-123-CD", "plate");
    });

    it("should call onSearch when Enter key pressed", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} />);

      const input = screen.getByTestId("auto-fill-input");
      await user.type(input, "AB123CD{Enter}");

      expect(onSearch).toHaveBeenCalledWith("AB-123-CD", "plate");
    });

    it("should show loading state", () => {
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} loading={true} />);

      expect(screen.getByText("Recherche en cours...")).toBeInTheDocument();
      expect(screen.getByTestId("auto-fill-input")).toBeDisabled();
    });

    it("should disable input and button when disabled prop is true", () => {
      const onSearch = vi.fn();
      render(<AutoFillTrigger onSearch={onSearch} disabled={true} />);

      expect(screen.getByTestId("auto-fill-input")).toBeDisabled();
      expect(screen.getByTestId("auto-fill-search-button")).toBeDisabled();
    });
  });
});
