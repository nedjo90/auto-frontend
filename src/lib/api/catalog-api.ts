import type {
  IPublicListingCard,
  IListingPage,
  IPublicListingDetail,
  IConfigListingCard,
  ISearchFilters,
} from "@auto/shared";
import { LISTING_PAGE_SIZE } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Build the request body from pagination + filter params. */
function buildListingsBody(options?: {
  skip?: number;
  top?: number;
  filters?: ISearchFilters;
}): Record<string, unknown> {
  const f = options?.filters;
  const body: Record<string, unknown> = {
    skip: options?.skip || 0,
    top: options?.top || LISTING_PAGE_SIZE,
  };
  if (f?.search) body.search = f.search;
  if (f?.minPrice != null) body.minPrice = f.minPrice;
  if (f?.maxPrice != null) body.maxPrice = f.maxPrice;
  if (f?.make) body.make = f.make;
  if (f?.model) body.model = f.model;
  if (f?.minYear != null) body.minYear = f.minYear;
  if (f?.maxYear != null) body.maxYear = f.maxYear;
  if (f?.maxMileage != null) body.maxMileage = f.maxMileage;
  if (f?.fuelType?.length) body.fuelType = JSON.stringify(f.fuelType);
  if (f?.gearbox?.length) body.gearbox = JSON.stringify(f.gearbox);
  if (f?.bodyType?.length) body.bodyType = JSON.stringify(f.bodyType);
  if (f?.color?.length) body.color = JSON.stringify(f.color);
  if (f?.certificationLevel?.length) body.certificationLevel = JSON.stringify(f.certificationLevel);
  if (f?.ctValid === true) body.ctValid = true;
  if (f?.marketPosition) body.marketPosition = f.marketPosition;
  if (f?.sort && f.sort !== "relevance") body.sort = f.sort;
  return body;
}

/** Fetch paginated published listings with optional filters. */
export async function getListings(options?: {
  skip?: number;
  top?: number;
  search?: string;
  filters?: ISearchFilters;
}): Promise<IListingPage> {
  // Support legacy `search` param alongside new filters
  const filters: ISearchFilters = {
    ...options?.filters,
    search: options?.filters?.search || options?.search || undefined,
  };
  const body = buildListingsBody({ skip: options?.skip, top: options?.top, filters });

  const res = await fetch(`${API_BASE}/api/catalog/getListings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch listings: ${res.status}`);
  }

  const data = await res.json();
  return {
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items || [],
    total: data.total || 0,
    skip: data.skip || 0,
    top: data.top || LISTING_PAGE_SIZE,
    hasMore: data.hasMore || false,
  };
}

/** Fetch a single listing with full detail. */
export async function getListingDetail(listingId: string): Promise<IPublicListingDetail | null> {
  const res = await fetch(`${API_BASE}/api/catalog/getListingDetail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch listing detail: ${res.status}`);
  }

  const data = await res.json();
  return typeof data.listing === "string" ? JSON.parse(data.listing) : data.listing;
}

/** Fetch card configuration (which fields to display on cards). */
export async function getCardConfig(): Promise<IConfigListingCard[]> {
  const res = await fetch(
    `${API_BASE}/api/catalog/ConfigListingCards?$orderby=displayOrder asc&$filter=isVisible eq true`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.value || [];
}

/** Format price for display (French locale). */
export function formatPrice(price: number | null): string | null {
  if (price == null) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Format mileage for display. */
export function formatMileage(mileage: number | null): string | null {
  if (mileage == null) return null;
  return new Intl.NumberFormat("fr-FR").format(mileage) + " km";
}

/** Build image URL with CDN transformations. */
export function buildImageUrl(
  url: string | null,
  options?: { width?: number; height?: number; format?: "webp" | "jpeg" },
): string {
  if (!url) return "/placeholder-car.svg";
  // For Azure CDN URLs, we can add query params for transformation
  // For now return as-is since CDN transformation is provider-dependent
  return url;
}
