import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatPrice, formatMileage, buildImageUrl } from "@/lib/api/catalog-api";

describe("catalog-api utilities", () => {
  describe("formatPrice", () => {
    it("should format price in EUR", () => {
      const result = formatPrice(15000);
      expect(result).toBeTruthy();
      expect(result).toContain("15");
      // Should contain EUR symbol or EUR text
      expect(result).toMatch(/€|EUR/);
    });

    it("should return null for null price", () => {
      expect(formatPrice(null)).toBeNull();
    });

    it("should format zero price", () => {
      const result = formatPrice(0);
      expect(result).toBeTruthy();
      expect(result).toContain("0");
    });
  });

  describe("formatMileage", () => {
    it("should format mileage with km suffix", () => {
      const result = formatMileage(50000);
      expect(result).toBeTruthy();
      expect(result).toContain("km");
      expect(result).toContain("50");
    });

    it("should return null for null mileage", () => {
      expect(formatMileage(null)).toBeNull();
    });

    it("should format zero mileage", () => {
      const result = formatMileage(0);
      expect(result).toBe("0 km");
    });
  });

  describe("buildImageUrl", () => {
    it("should return URL as-is when provided", () => {
      expect(buildImageUrl("https://cdn.example.com/photo.jpg")).toBe(
        "https://cdn.example.com/photo.jpg",
      );
    });

    it("should return placeholder for null URL", () => {
      expect(buildImageUrl(null)).toBe("/placeholder-car.svg");
    });

    it("should return placeholder for empty string", () => {
      expect(buildImageUrl("")).toBe("/placeholder-car.svg");
    });
  });
});
