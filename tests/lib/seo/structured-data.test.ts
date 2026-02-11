import { describe, it, expect } from "vitest";
import {
  generateVehicleSchema,
  generateOfferSchema,
  generateProductSchema,
  generateListingJsonLd,
  type VehicleData,
  type OfferData,
  type ListingData,
} from "@/lib/seo/structured-data";

describe("structured-data", () => {
  const baseVehicle: VehicleData = {
    make: "Renault",
    model: "Clio",
    year: 2020,
  };

  const fullVehicle: VehicleData = {
    ...baseVehicle,
    mileage: 45000,
    fuelType: "Essence",
    color: "Rouge",
    vin: "VF1RFB00123456789",
  };

  const baseOffer: OfferData = {
    price: 15000,
  };

  const fullOffer: OfferData = {
    price: 15000,
    currency: "EUR",
    availability: "InStock",
    seller: {
      name: "Garage Martin",
      url: "https://garage-martin.fr",
    },
  };

  const baseListing: ListingData = {
    id: "abc-123",
    title: "Renault Clio 2020",
    description: "Belle Renault Clio en excellent état",
    url: "/listings/abc-123",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    vehicle: baseVehicle,
    offer: baseOffer,
  };

  describe("generateVehicleSchema", () => {
    it("generates minimal vehicle schema", () => {
      const schema = generateVehicleSchema(baseVehicle);

      expect(schema["@type"]).toBe("Vehicle");
      expect(schema.manufacturer).toBe("Renault");
      expect(schema.model).toBe("Clio");
      expect(schema.modelDate).toBe("2020");
      expect(schema.vehicleModelDate).toBe("2020");
      expect(schema.mileageFromOdometer).toBeUndefined();
      expect(schema.fuelType).toBeUndefined();
      expect(schema.color).toBeUndefined();
      expect(schema.vehicleIdentificationNumber).toBeUndefined();
    });

    it("generates full vehicle schema with all optional fields", () => {
      const schema = generateVehicleSchema(fullVehicle);

      expect(schema["@type"]).toBe("Vehicle");
      expect(schema.manufacturer).toBe("Renault");
      expect(schema.model).toBe("Clio");
      expect(schema.mileageFromOdometer).toEqual({
        "@type": "QuantitativeValue",
        value: 45000,
        unitCode: "KMT",
      });
      expect(schema.fuelType).toBe("Essence");
      expect(schema.color).toBe("Rouge");
      expect(schema.vehicleIdentificationNumber).toBe("VF1RFB00123456789");
    });

    it("handles zero mileage", () => {
      const schema = generateVehicleSchema({ ...baseVehicle, mileage: 0 });

      expect(schema.mileageFromOdometer).toEqual({
        "@type": "QuantitativeValue",
        value: 0,
        unitCode: "KMT",
      });
    });
  });

  describe("generateOfferSchema", () => {
    it("generates minimal offer schema with defaults", () => {
      const schema = generateOfferSchema(baseOffer);

      expect(schema["@type"]).toBe("Offer");
      expect(schema.price).toBe(15000);
      expect(schema.priceCurrency).toBe("EUR");
      expect(schema.availability).toBe("https://schema.org/InStock");
      expect(schema.seller).toBeUndefined();
    });

    it("generates full offer schema", () => {
      const schema = generateOfferSchema(fullOffer);

      expect(schema["@type"]).toBe("Offer");
      expect(schema.price).toBe(15000);
      expect(schema.priceCurrency).toBe("EUR");
      expect(schema.availability).toBe("https://schema.org/InStock");
      expect(schema.seller).toEqual({
        "@type": "Organization",
        name: "Garage Martin",
        url: "https://garage-martin.fr",
      });
    });

    it("generates offer with custom currency and availability", () => {
      const schema = generateOfferSchema({
        price: 20000,
        currency: "USD",
        availability: "OutOfStock",
      });

      expect(schema.priceCurrency).toBe("USD");
      expect(schema.availability).toBe("https://schema.org/OutOfStock");
    });

    it("generates seller without url", () => {
      const schema = generateOfferSchema({
        price: 10000,
        seller: { name: "Particulier" },
      });

      expect(schema.seller).toEqual({
        "@type": "Organization",
        name: "Particulier",
      });
    });
  });

  describe("generateProductSchema", () => {
    it("generates product schema with embedded offer", () => {
      const schema = generateProductSchema(baseListing);

      expect(schema["@type"]).toBe("Product");
      expect(schema.name).toBe("Renault Clio 2020");
      expect(schema.description).toBe("Belle Renault Clio en excellent état");
      expect(schema.url).toBe("/listings/abc-123");
      expect(schema.image).toEqual([
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
      ]);
      expect(schema.offers).toBeDefined();
      expect((schema.offers as Record<string, unknown>)["@type"]).toBe("Offer");
    });
  });

  describe("generateListingJsonLd", () => {
    it("generates valid JSON-LD string", () => {
      const jsonLd = generateListingJsonLd(baseListing);
      const parsed = JSON.parse(jsonLd);

      expect(parsed["@context"]).toBe("https://schema.org");
      expect(parsed["@graph"]).toHaveLength(2);
    });

    it("includes Vehicle and Product schemas in @graph", () => {
      const jsonLd = generateListingJsonLd(baseListing);
      const parsed = JSON.parse(jsonLd);

      const types = parsed["@graph"].map((s: Record<string, unknown>) => s["@type"]);
      expect(types).toContain("Vehicle");
      expect(types).toContain("Product");
    });

    it("produces parseable JSON", () => {
      const jsonLd = generateListingJsonLd(baseListing);

      expect(() => JSON.parse(jsonLd)).not.toThrow();
    });

    it("escapes < characters to prevent XSS", () => {
      const xssListing: ListingData = {
        ...baseListing,
        title: '</script><script>alert("xss")</script>',
        description: '<img onerror="alert(1)">',
      };
      const jsonLd = generateListingJsonLd(xssListing);

      expect(jsonLd).not.toContain("</script>");
      expect(jsonLd).not.toContain("<script>");
      expect(jsonLd).not.toContain("<img");
      expect(jsonLd).toContain("\\u003c");

      // Should still be valid JSON when unescaped
      expect(() => JSON.parse(jsonLd)).not.toThrow();
    });
  });
});
