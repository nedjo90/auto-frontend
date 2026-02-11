/**
 * Schema.org JSON-LD generators for SEO structured data.
 * Used in listing detail pages for rich search results.
 */

export interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage?: number;
  fuelType?: string;
  color?: string;
  vin?: string;
}

export interface OfferData {
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  seller?: {
    name: string;
    url?: string;
  };
}

export interface ListingData {
  id: string;
  title: string;
  description: string;
  url: string;
  images: string[];
  vehicle: VehicleData;
  offer: OfferData;
}

/**
 * Generate Vehicle schema (Schema.org/Vehicle).
 */
export function generateVehicleSchema(vehicle: VehicleData): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Vehicle",
    manufacturer: vehicle.make,
    model: vehicle.model,
    modelDate: String(vehicle.year),
    vehicleModelDate: String(vehicle.year),
  };

  if (vehicle.mileage !== undefined) {
    schema.mileageFromOdometer = {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    };
  }

  if (vehicle.fuelType) {
    schema.fuelType = vehicle.fuelType;
  }

  if (vehicle.color) {
    schema.color = vehicle.color;
  }

  if (vehicle.vin) {
    schema.vehicleIdentificationNumber = vehicle.vin;
  }

  return schema;
}

/**
 * Generate Offer schema (Schema.org/Offer).
 */
export function generateOfferSchema(offer: OfferData): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Offer",
    price: offer.price,
    priceCurrency: offer.currency || "EUR",
    availability: `https://schema.org/${offer.availability || "InStock"}`,
  };

  if (offer.seller) {
    schema.seller = {
      "@type": "Organization",
      name: offer.seller.name,
      ...(offer.seller.url && { url: offer.seller.url }),
    };
  }

  return schema;
}

/**
 * Generate Product schema with embedded Vehicle and Offer (Schema.org/Product).
 */
export function generateProductSchema(listing: ListingData): Record<string, unknown> {
  return {
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    url: listing.url,
    image: listing.images,
    offers: generateOfferSchema(listing.offer),
  };
}

/**
 * Generate complete JSON-LD for a listing detail page.
 * Combines Vehicle, Product, and Offer schemas.
 */
export function generateListingJsonLd(listing: ListingData): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [generateVehicleSchema(listing.vehicle), generateProductSchema(listing)],
  };

  // Escape </script> to prevent XSS when injected via dangerouslySetInnerHTML
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}
