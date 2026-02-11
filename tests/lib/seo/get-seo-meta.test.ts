import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSeoMeta, getSampleData, renderSeoTemplate } from "@/lib/seo/get-seo-meta";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("get-seo-meta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSeoMeta", () => {
    it("returns SEO meta from API on success", async () => {
      const mockMeta = {
        metaTitle: "Renault Clio 2020 occasion",
        metaDescription: "Achetez une Renault Clio 2020",
        ogTitle: "Renault Clio 2020",
        ogDescription: "Belle Clio en excellent état",
        canonicalUrl: "/listings/123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMeta),
      });

      const result = await getSeoMeta("listing_detail", { id: "123", brand: "Renault" });

      expect(result).toEqual(mockMeta);
      expect(mockFetch).toHaveBeenCalledOnce();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/api/seo/resolve?");
      expect(calledUrl).toContain("pageType=listing_detail");
      expect(calledUrl).toContain("language=fr");
      expect(calledUrl).toContain("id=123");
      expect(calledUrl).toContain("brand=Renault");
    });

    it("passes custom language parameter", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metaTitle: "test" }),
      });

      await getSeoMeta("listing_detail", { id: "1" }, "en");

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("language=en");
    });

    it("returns null on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getSeoMeta("search_results", { query: "test" });

      expect(result).toBeNull();
    });

    it("returns null on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getSeoMeta("brand_page", { brand: "BMW" });

      expect(result).toBeNull();
    });

    it("uses revalidation cache option", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metaTitle: "test" }),
      });

      await getSeoMeta("listing_detail", { id: "1" });

      const fetchOptions = mockFetch.mock.calls[0][1] as { next: { revalidate: number } };
      expect(fetchOptions.next.revalidate).toBe(3600);
    });

    it("defaults to French language", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metaTitle: "test" }),
      });

      await getSeoMeta("city_page", { city: "Paris" });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("language=fr");
    });

    it("prevents data keys from overwriting pageType and language", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metaTitle: "test" }),
      });

      await getSeoMeta("listing_detail", { pageType: "hacked", language: "hacked", id: "1" });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("pageType=listing_detail");
      expect(calledUrl).toContain("language=fr");
      expect(calledUrl).not.toContain("hacked");
      expect(calledUrl).toContain("id=1");
    });
  });

  describe("getSampleData", () => {
    it("returns sample data for listing_detail", () => {
      const data = getSampleData("listing_detail");

      expect(data).toBeDefined();
      expect(typeof data).toBe("object");
    });

    it("returns sample data for search_results", () => {
      const data = getSampleData("search_results");

      expect(data).toBeDefined();
    });

    it("returns a copy (not reference)", () => {
      const data1 = getSampleData("brand_page");
      const data2 = getSampleData("brand_page");

      expect(data1).toEqual(data2);
      expect(data1).not.toBe(data2);
    });
  });

  describe("renderSeoTemplate", () => {
    it("replaces placeholders with data values", () => {
      const result = renderSeoTemplate("{{brand}} {{model}} occasion", {
        brand: "Renault",
        model: "Clio",
      });

      expect(result).toBe("Renault Clio occasion");
    });

    it("replaces unknown placeholders with empty string", () => {
      const result = renderSeoTemplate("{{brand}} {{unknown}}", {
        brand: "Renault",
      });

      expect(result).toBe("Renault ");
    });

    it("returns empty string for empty template", () => {
      const result = renderSeoTemplate("", { brand: "Renault" });

      expect(result).toBe("");
    });

    it("handles template with no placeholders", () => {
      const result = renderSeoTemplate("Static text", {});

      expect(result).toBe("Static text");
    });
  });
});
