import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchFilters } from "@/components/search/search-filters";
import type { ISearchFilters } from "@auto/shared";

// Mock useIsMobile
let mockIsMobile = false;
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

describe("SearchFilters", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile = false;
  });

  it("should render desktop sidebar", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("search-filter-sidebar")).toBeInTheDocument();
  });

  it("should render mobile trigger button when mobile", () => {
    mockIsMobile = true;
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-mobile-trigger")).toBeInTheDocument();
  });

  it("should render filter form in desktop sidebar", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("search-filter-form")).toBeInTheDocument();
    expect(screen.getByTestId("filter-min-price")).toBeInTheDocument();
    expect(screen.getByTestId("filter-max-price")).toBeInTheDocument();
    expect(screen.getByTestId("filter-make")).toBeInTheDocument();
    expect(screen.getByTestId("filter-model")).toBeInTheDocument();
    expect(screen.getByTestId("filter-min-year")).toBeInTheDocument();
    expect(screen.getByTestId("filter-max-year")).toBeInTheDocument();
    expect(screen.getByTestId("filter-max-mileage")).toBeInTheDocument();
  });

  it("should render fuel type chip options", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-fuel-essence")).toBeInTheDocument();
    expect(screen.getByTestId("filter-fuel-diesel")).toBeInTheDocument();
    expect(screen.getByTestId("filter-fuel-electrique")).toBeInTheDocument();
    expect(screen.getByTestId("filter-fuel-hybride")).toBeInTheDocument();
    expect(screen.getByTestId("filter-fuel-gpl")).toBeInTheDocument();
  });

  it("should render body type chip options", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-body-berline")).toBeInTheDocument();
    expect(screen.getByTestId("filter-body-suv")).toBeInTheDocument();
    expect(screen.getByTestId("filter-body-break")).toBeInTheDocument();
  });

  it("should render color chip options", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-color-noir")).toBeInTheDocument();
    expect(screen.getByTestId("filter-color-blanc")).toBeInTheDocument();
    expect(screen.getByTestId("filter-color-rouge")).toBeInTheDocument();
  });

  it("should call onFiltersChange when min price changes", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    fireEvent.change(screen.getByTestId("filter-min-price"), { target: { value: "5000" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minPrice: 5000 }));
  });

  it("should call onFiltersChange when max price changes", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    fireEvent.change(screen.getByTestId("filter-max-price"), { target: { value: "20000" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ maxPrice: 20000 }));
  });

  it("should call onFiltersChange when make changes", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    fireEvent.change(screen.getByTestId("filter-make"), { target: { value: "Peugeot" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ make: "Peugeot" }));
  });

  it("should disable model input when no make selected", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-model")).toBeDisabled();
  });

  it("should enable model input when make is selected", () => {
    render(<SearchFilters filters={{ make: "Peugeot" }} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-model")).not.toBeDisabled();
  });

  it("should toggle fuel type on click", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-fuel-essence"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fuelType: ["Essence"] }));
  });

  it("should remove fuel type on second click", () => {
    render(<SearchFilters filters={{ fuelType: ["Essence"] }} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-fuel-essence"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fuelType: [] }));
  });

  it("should show clear all button when filters are active", () => {
    render(
      <SearchFilters filters={{ make: "Renault", minPrice: 5000 }} onFiltersChange={onChange} />,
    );
    expect(screen.getByTestId("filter-clear-all")).toBeInTheDocument();
  });

  it("should not show clear all button when no filters are active", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.queryByTestId("filter-clear-all")).not.toBeInTheDocument();
  });

  it("should clear all filters when clear all is clicked", () => {
    const filters: ISearchFilters = {
      search: "test",
      sort: "price_asc",
      make: "Renault",
      minPrice: 5000,
    };
    render(<SearchFilters filters={filters} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-clear-all"));
    // Should preserve search and sort but clear everything else
    expect(onChange).toHaveBeenCalledWith({ search: "test", sort: "price_asc" });
  });

  it("should show active filter count on mobile trigger", () => {
    mockIsMobile = true;
    render(
      <SearchFilters
        filters={{ make: "Renault", fuelType: ["Essence", "Diesel"] }}
        onFiltersChange={onChange}
      />,
    );
    // 1 (make) + 2 (fuel types) = 3
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should handle clearing min price to undefined", () => {
    render(<SearchFilters filters={{ minPrice: 5000 }} onFiltersChange={onChange} />);
    fireEvent.change(screen.getByTestId("filter-min-price"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minPrice: undefined }));
  });

  it("should render gearbox select", () => {
    render(<SearchFilters filters={{}} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-gearbox")).toBeInTheDocument();
  });

  it("should preserve existing filters when toggling body type", () => {
    const filters: ISearchFilters = { make: "Renault", bodyType: ["Berline"] };
    render(<SearchFilters filters={filters} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-body-suv"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        make: "Renault",
        bodyType: ["Berline", "SUV"],
      }),
    );
  });
});
