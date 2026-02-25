import type { ISearchFilters, SearchSortOption } from "@auto/shared";

/** URL parameter keys for search filters. */
const PARAM_KEYS = {
  search: "q",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  make: "make",
  model: "model",
  minYear: "minYear",
  maxYear: "maxYear",
  maxMileage: "maxMileage",
  fuelType: "fuel",
  gearbox: "gearbox",
  bodyType: "body",
  color: "color",
  sort: "sort",
} as const;

const VALID_SORTS = new Set<string>([
  "price_asc",
  "price_desc",
  "date_desc",
  "mileage_asc",
  "relevance",
]);

/** Deserialize URL search parameters into ISearchFilters. */
export function parseSearchParams(params: URLSearchParams): ISearchFilters {
  const filters: ISearchFilters = {};

  const q = params.get(PARAM_KEYS.search);
  if (q) filters.search = q;

  const minPrice = params.get(PARAM_KEYS.minPrice);
  if (minPrice) {
    const n = Number(minPrice);
    if (!isNaN(n)) filters.minPrice = n;
  }

  const maxPrice = params.get(PARAM_KEYS.maxPrice);
  if (maxPrice) {
    const n = Number(maxPrice);
    if (!isNaN(n)) filters.maxPrice = n;
  }

  const make = params.get(PARAM_KEYS.make);
  if (make) filters.make = make;

  const model = params.get(PARAM_KEYS.model);
  if (model) filters.model = model;

  const minYear = params.get(PARAM_KEYS.minYear);
  if (minYear) {
    const n = Number(minYear);
    if (!isNaN(n) && Number.isInteger(n)) filters.minYear = n;
  }

  const maxYear = params.get(PARAM_KEYS.maxYear);
  if (maxYear) {
    const n = Number(maxYear);
    if (!isNaN(n) && Number.isInteger(n)) filters.maxYear = n;
  }

  const maxMileage = params.get(PARAM_KEYS.maxMileage);
  if (maxMileage) {
    const n = Number(maxMileage);
    if (!isNaN(n) && Number.isInteger(n)) filters.maxMileage = n;
  }

  const fuel = params.getAll(PARAM_KEYS.fuelType);
  if (fuel.length > 0) filters.fuelType = fuel;

  const gearbox = params.getAll(PARAM_KEYS.gearbox);
  if (gearbox.length > 0) filters.gearbox = gearbox;

  const body = params.getAll(PARAM_KEYS.bodyType);
  if (body.length > 0) filters.bodyType = body;

  const color = params.getAll(PARAM_KEYS.color);
  if (color.length > 0) filters.color = color;

  const sort = params.get(PARAM_KEYS.sort);
  if (sort && VALID_SORTS.has(sort)) filters.sort = sort as SearchSortOption;

  return filters;
}

/** Serialize ISearchFilters into URL search parameters string. */
export function serializeSearchParams(filters: ISearchFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set(PARAM_KEYS.search, filters.search);
  if (filters.minPrice != null) params.set(PARAM_KEYS.minPrice, String(filters.minPrice));
  if (filters.maxPrice != null) params.set(PARAM_KEYS.maxPrice, String(filters.maxPrice));
  if (filters.make) params.set(PARAM_KEYS.make, filters.make);
  if (filters.model) params.set(PARAM_KEYS.model, filters.model);
  if (filters.minYear != null) params.set(PARAM_KEYS.minYear, String(filters.minYear));
  if (filters.maxYear != null) params.set(PARAM_KEYS.maxYear, String(filters.maxYear));
  if (filters.maxMileage != null) params.set(PARAM_KEYS.maxMileage, String(filters.maxMileage));
  filters.fuelType?.forEach((v) => params.append(PARAM_KEYS.fuelType, v));
  filters.gearbox?.forEach((v) => params.append(PARAM_KEYS.gearbox, v));
  filters.bodyType?.forEach((v) => params.append(PARAM_KEYS.bodyType, v));
  filters.color?.forEach((v) => params.append(PARAM_KEYS.color, v));
  if (filters.sort && filters.sort !== "relevance") params.set(PARAM_KEYS.sort, filters.sort);

  return params.toString();
}

/** Count how many active filters are set (excluding search and sort). */
export function countActiveFilters(filters: ISearchFilters): number {
  let count = 0;
  if (filters.minPrice != null) count++;
  if (filters.maxPrice != null) count++;
  if (filters.make) count++;
  if (filters.model) count++;
  if (filters.minYear != null) count++;
  if (filters.maxYear != null) count++;
  if (filters.maxMileage != null) count++;
  if (filters.fuelType?.length) count += filters.fuelType.length;
  if (filters.gearbox?.length) count += filters.gearbox.length;
  if (filters.bodyType?.length) count += filters.bodyType.length;
  if (filters.color?.length) count += filters.color.length;
  return count;
}

/** Remove a specific filter key (or array value) from filters. Returns a new object. */
export function removeFilter(
  filters: ISearchFilters,
  key: keyof ISearchFilters,
  value?: string,
): ISearchFilters {
  const next = { ...filters };

  if (value && Array.isArray(next[key])) {
    const arr = (next[key] as string[]).filter((v) => v !== value);
    if (arr.length === 0) {
      delete next[key];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[key] = arr;
    }
  } else {
    delete next[key];
  }

  return next;
}
