import { describe, it, expect } from "vitest";
import {
  parseSearchParams,
  serializeSearchParams,
  countActiveFilters,
  removeFilter,
} from "@/lib/search-params";
import type { ISearchFilters } from "@auto/shared";

describe("search-params", () => {
  describe("parseSearchParams", () => {
    it("should parse empty params to empty filters", () => {
      const params = new URLSearchParams();
      expect(parseSearchParams(params)).toEqual({});
    });

    it("should parse search query", () => {
      const params = new URLSearchParams("q=Renault");
      expect(parseSearchParams(params).search).toBe("Renault");
    });

    it("should parse price range", () => {
      const params = new URLSearchParams("minPrice=5000&maxPrice=15000");
      const f = parseSearchParams(params);
      expect(f.minPrice).toBe(5000);
      expect(f.maxPrice).toBe(15000);
    });

    it("should parse make and model", () => {
      const params = new URLSearchParams("make=Peugeot&model=308");
      const f = parseSearchParams(params);
      expect(f.make).toBe("Peugeot");
      expect(f.model).toBe("308");
    });

    it("should parse year range", () => {
      const params = new URLSearchParams("minYear=2018&maxYear=2023");
      const f = parseSearchParams(params);
      expect(f.minYear).toBe(2018);
      expect(f.maxYear).toBe(2023);
    });

    it("should parse maxMileage", () => {
      const params = new URLSearchParams("maxMileage=100000");
      expect(parseSearchParams(params).maxMileage).toBe(100000);
    });

    it("should parse multi-value fuel types", () => {
      const params = new URLSearchParams("fuel=Essence&fuel=Diesel");
      expect(parseSearchParams(params).fuelType).toEqual(["Essence", "Diesel"]);
    });

    it("should parse multi-value gearbox", () => {
      const params = new URLSearchParams("gearbox=automatique");
      expect(parseSearchParams(params).gearbox).toEqual(["automatique"]);
    });

    it("should parse multi-value body types", () => {
      const params = new URLSearchParams("body=SUV&body=Berline");
      expect(parseSearchParams(params).bodyType).toEqual(["SUV", "Berline"]);
    });

    it("should parse multi-value colors", () => {
      const params = new URLSearchParams("color=Noir&color=Blanc");
      expect(parseSearchParams(params).color).toEqual(["Noir", "Blanc"]);
    });

    it("should parse valid sort option", () => {
      const params = new URLSearchParams("sort=price_asc");
      expect(parseSearchParams(params).sort).toBe("price_asc");
    });

    it("should ignore invalid sort option", () => {
      const params = new URLSearchParams("sort=invalid");
      expect(parseSearchParams(params).sort).toBeUndefined();
    });

    it("should ignore non-numeric price", () => {
      const params = new URLSearchParams("minPrice=abc");
      expect(parseSearchParams(params).minPrice).toBeUndefined();
    });

    it("should parse full set of filters", () => {
      const params = new URLSearchParams(
        "q=test&minPrice=5000&maxPrice=20000&make=Renault&model=Clio&minYear=2018&maxYear=2023&maxMileage=80000&fuel=Essence&gearbox=manuelle&body=Berline&color=Rouge&sort=price_asc",
      );
      const f = parseSearchParams(params);
      expect(f.search).toBe("test");
      expect(f.minPrice).toBe(5000);
      expect(f.maxPrice).toBe(20000);
      expect(f.make).toBe("Renault");
      expect(f.model).toBe("Clio");
      expect(f.minYear).toBe(2018);
      expect(f.maxYear).toBe(2023);
      expect(f.maxMileage).toBe(80000);
      expect(f.fuelType).toEqual(["Essence"]);
      expect(f.gearbox).toEqual(["manuelle"]);
      expect(f.bodyType).toEqual(["Berline"]);
      expect(f.color).toEqual(["Rouge"]);
      expect(f.sort).toBe("price_asc");
    });
  });

  describe("serializeSearchParams", () => {
    it("should serialize empty filters to empty string", () => {
      expect(serializeSearchParams({})).toBe("");
    });

    it("should serialize search query", () => {
      expect(serializeSearchParams({ search: "Renault" })).toBe("q=Renault");
    });

    it("should serialize price range", () => {
      const qs = serializeSearchParams({ minPrice: 5000, maxPrice: 15000 });
      expect(qs).toContain("minPrice=5000");
      expect(qs).toContain("maxPrice=15000");
    });

    it("should serialize multi-value arrays", () => {
      const qs = serializeSearchParams({ fuelType: ["Essence", "Diesel"] });
      expect(qs).toContain("fuel=Essence");
      expect(qs).toContain("fuel=Diesel");
    });

    it("should omit relevance sort (default)", () => {
      expect(serializeSearchParams({ sort: "relevance" })).toBe("");
    });

    it("should include non-default sort", () => {
      expect(serializeSearchParams({ sort: "price_asc" })).toContain("sort=price_asc");
    });
  });

  describe("round-trip", () => {
    it("should round-trip a full filter set", () => {
      const original: ISearchFilters = {
        search: "test",
        minPrice: 5000,
        maxPrice: 20000,
        make: "Renault",
        model: "Clio",
        minYear: 2018,
        maxYear: 2023,
        maxMileage: 80000,
        fuelType: ["Essence"],
        gearbox: ["manuelle"],
        bodyType: ["Berline"],
        color: ["Rouge"],
        sort: "price_asc",
      };

      const qs = serializeSearchParams(original);
      const params = new URLSearchParams(qs);
      const parsed = parseSearchParams(params);

      expect(parsed).toEqual(original);
    });

    it("should round-trip empty filters", () => {
      const qs = serializeSearchParams({});
      const parsed = parseSearchParams(new URLSearchParams(qs));
      expect(parsed).toEqual({});
    });
  });

  describe("countActiveFilters", () => {
    it("should return 0 for empty filters", () => {
      expect(countActiveFilters({})).toBe(0);
    });

    it("should not count search or sort", () => {
      expect(countActiveFilters({ search: "test", sort: "price_asc" })).toBe(0);
    });

    it("should count scalar filters", () => {
      expect(countActiveFilters({ minPrice: 5000, make: "Renault" })).toBe(2);
    });

    it("should count array items individually", () => {
      expect(countActiveFilters({ fuelType: ["Essence", "Diesel"] })).toBe(2);
    });

    it("should count all filter types", () => {
      expect(
        countActiveFilters({
          minPrice: 5000,
          maxPrice: 20000,
          make: "Renault",
          model: "Clio",
          minYear: 2018,
          maxYear: 2023,
          maxMileage: 80000,
          fuelType: ["Essence", "Diesel"],
          gearbox: ["manuelle"],
          bodyType: ["Berline", "SUV"],
          color: ["Rouge"],
        }),
      ).toBe(13);
    });
  });

  describe("removeFilter", () => {
    it("should remove a scalar filter", () => {
      const f: ISearchFilters = { make: "Renault", minPrice: 5000 };
      expect(removeFilter(f, "make")).toEqual({ minPrice: 5000 });
    });

    it("should remove a specific array value", () => {
      const f: ISearchFilters = { fuelType: ["Essence", "Diesel"] };
      expect(removeFilter(f, "fuelType", "Diesel")).toEqual({ fuelType: ["Essence"] });
    });

    it("should remove array key when last value removed", () => {
      const f: ISearchFilters = { fuelType: ["Essence"] };
      const result = removeFilter(f, "fuelType", "Essence");
      expect(result.fuelType).toBeUndefined();
    });

    it("should not mutate original filters", () => {
      const f: ISearchFilters = { make: "Renault", minPrice: 5000 };
      removeFilter(f, "make");
      expect(f.make).toBe("Renault");
    });
  });

  // ─── Advanced Filters (Story 4-3) ──────────────────────────────────

  describe("parseSearchParams - advanced filters", () => {
    it("should parse certificationLevel params", () => {
      const p = new URLSearchParams("cert=tres_documente&cert=bien_documente");
      expect(parseSearchParams(p).certificationLevel).toEqual(["tres_documente", "bien_documente"]);
    });

    it("should ignore invalid certification levels", () => {
      const p = new URLSearchParams("cert=invalid&cert=tres_documente");
      expect(parseSearchParams(p).certificationLevel).toEqual(["tres_documente"]);
    });

    it("should parse ctValid=true", () => {
      const p = new URLSearchParams("ctValid=true");
      expect(parseSearchParams(p).ctValid).toBe(true);
    });

    it("should not set ctValid for other values", () => {
      const p = new URLSearchParams("ctValid=false");
      expect(parseSearchParams(p).ctValid).toBeUndefined();
    });

    it("should parse marketPosition", () => {
      const p = new URLSearchParams("market=below");
      expect(parseSearchParams(p).marketPosition).toBe("below");
    });

    it("should ignore invalid marketPosition", () => {
      const p = new URLSearchParams("market=invalid");
      expect(parseSearchParams(p).marketPosition).toBeUndefined();
    });
  });

  describe("serializeSearchParams - advanced filters", () => {
    it("should serialize certificationLevel", () => {
      const s = serializeSearchParams({
        certificationLevel: ["tres_documente", "bien_documente"],
      });
      expect(s).toContain("cert=tres_documente");
      expect(s).toContain("cert=bien_documente");
    });

    it("should serialize ctValid=true", () => {
      const s = serializeSearchParams({ ctValid: true });
      expect(s).toContain("ctValid=true");
    });

    it("should not serialize ctValid when undefined", () => {
      const s = serializeSearchParams({});
      expect(s).not.toContain("ctValid");
    });

    it("should serialize marketPosition", () => {
      const s = serializeSearchParams({ marketPosition: "below" });
      expect(s).toContain("market=below");
    });
  });

  describe("countActiveFilters - advanced filters", () => {
    it("should count certificationLevel items", () => {
      expect(countActiveFilters({ certificationLevel: ["tres_documente", "bien_documente"] })).toBe(
        2,
      );
    });

    it("should count ctValid", () => {
      expect(countActiveFilters({ ctValid: true })).toBe(1);
    });

    it("should count marketPosition", () => {
      expect(countActiveFilters({ marketPosition: "below" })).toBe(1);
    });

    it("should count all advanced filters together", () => {
      expect(
        countActiveFilters({
          certificationLevel: ["tres_documente"],
          ctValid: true,
          marketPosition: "below",
        }),
      ).toBe(3);
    });
  });
});
