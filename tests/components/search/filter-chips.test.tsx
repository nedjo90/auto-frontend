import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterChips } from "@/components/search/filter-chips";
import type { ISearchFilters } from "@auto/shared";

describe("FilterChips", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when no filters active", () => {
    const { container } = render(<FilterChips filters={{}} onFiltersChange={onChange} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render chip for make filter", () => {
    render(<FilterChips filters={{ make: "Peugeot" }} onFiltersChange={onChange} />);
    expect(screen.getByText("Marque: Peugeot")).toBeInTheDocument();
  });

  it("should render chip for model filter", () => {
    render(<FilterChips filters={{ model: "308" }} onFiltersChange={onChange} />);
    expect(screen.getByText("Modèle: 308")).toBeInTheDocument();
  });

  it("should render chip for price range", () => {
    render(
      <FilterChips filters={{ minPrice: 5000, maxPrice: 15000 }} onFiltersChange={onChange} />,
    );
    // French formatted price
    expect(screen.getByTestId("filter-chip-minPrice")).toBeInTheDocument();
  });

  it("should render chip for minPrice only", () => {
    render(<FilterChips filters={{ minPrice: 5000 }} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-chip-minPrice")).toBeInTheDocument();
  });

  it("should render chip for maxPrice only", () => {
    render(<FilterChips filters={{ maxPrice: 15000 }} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-chip-maxPrice")).toBeInTheDocument();
  });

  it("should render chip for maxMileage", () => {
    render(<FilterChips filters={{ maxMileage: 100000 }} onFiltersChange={onChange} />);
    expect(screen.getByTestId("filter-chip-maxMileage")).toBeInTheDocument();
  });

  it("should render individual fuel type chips", () => {
    render(
      <FilterChips filters={{ fuelType: ["Essence", "Diesel"] }} onFiltersChange={onChange} />,
    );
    expect(screen.getByText("Essence")).toBeInTheDocument();
    expect(screen.getByText("Diesel")).toBeInTheDocument();
  });

  it("should render gearbox chip with label", () => {
    render(<FilterChips filters={{ gearbox: ["automatique"] }} onFiltersChange={onChange} />);
    expect(screen.getByText("Automatique")).toBeInTheDocument();
  });

  it("should render body type chips", () => {
    render(<FilterChips filters={{ bodyType: ["SUV", "Berline"] }} onFiltersChange={onChange} />);
    expect(screen.getByText("SUV")).toBeInTheDocument();
    expect(screen.getByText("Berline")).toBeInTheDocument();
  });

  it("should render color chips", () => {
    render(<FilterChips filters={{ color: ["Noir"] }} onFiltersChange={onChange} />);
    expect(screen.getByText("Noir")).toBeInTheDocument();
  });

  it("should remove make filter on chip click", () => {
    render(<FilterChips filters={{ make: "Peugeot" }} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-chip-make"));
    expect(onChange).toHaveBeenCalled();
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.make).toBeUndefined();
  });

  it("should also remove model when make chip is removed", () => {
    render(<FilterChips filters={{ make: "Peugeot", model: "308" }} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-chip-make"));
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.make).toBeUndefined();
    expect(called.model).toBeUndefined();
  });

  it("should remove specific fuel type from array on chip click", () => {
    render(
      <FilterChips filters={{ fuelType: ["Essence", "Diesel"] }} onFiltersChange={onChange} />,
    );
    // Click the "Essence" chip
    const essenceChip = screen.getByText("Essence").closest("button")!;
    fireEvent.click(essenceChip);
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.fuelType).toEqual(["Diesel"]);
  });

  it("should show 'Tout effacer' button when 2+ filters active", () => {
    render(
      <FilterChips filters={{ make: "Renault", minPrice: 5000 }} onFiltersChange={onChange} />,
    );
    expect(screen.getByTestId("filter-clear-all-chips")).toBeInTheDocument();
  });

  it("should not show 'Tout effacer' with only 1 filter", () => {
    render(<FilterChips filters={{ make: "Renault" }} onFiltersChange={onChange} />);
    expect(screen.queryByTestId("filter-clear-all-chips")).not.toBeInTheDocument();
  });

  it("should clear all filters when 'Tout effacer' clicked", () => {
    render(
      <FilterChips
        filters={{ make: "Renault", minPrice: 5000, search: "test", sort: "price_asc" }}
        onFiltersChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId("filter-clear-all-chips"));
    expect(onChange).toHaveBeenCalledWith({ search: "test", sort: "price_asc" });
  });

  it("should remove both min and max price when price range chip clicked", () => {
    render(
      <FilterChips filters={{ minPrice: 5000, maxPrice: 15000 }} onFiltersChange={onChange} />,
    );
    fireEvent.click(screen.getByTestId("filter-chip-minPrice"));
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.minPrice).toBeUndefined();
    expect(called.maxPrice).toBeUndefined();
  });

  it("should render year range chip", () => {
    render(<FilterChips filters={{ minYear: 2018, maxYear: 2023 }} onFiltersChange={onChange} />);
    expect(screen.getByText("2018 - 2023")).toBeInTheDocument();
  });

  it("should have accessible labels on chips", () => {
    render(<FilterChips filters={{ make: "Peugeot" }} onFiltersChange={onChange} />);
    const chip = screen.getByTestId("filter-chip-make");
    expect(chip).toHaveAttribute("aria-label", "Supprimer filtre Marque: Peugeot");
  });

  // ─── Advanced Filter Chips (Story 4-3) ────────────────────────────

  it("should render certification level chips", () => {
    render(
      <FilterChips
        filters={{ certificationLevel: ["tres_documente", "bien_documente"] }}
        onFiltersChange={onChange}
      />,
    );
    expect(screen.getByText("Très documenté")).toBeInTheDocument();
    expect(screen.getByText("Bien documenté")).toBeInTheDocument();
  });

  it("should render CT valid chip", () => {
    render(<FilterChips filters={{ ctValid: true }} onFiltersChange={onChange} />);
    expect(screen.getByText("CT valide")).toBeInTheDocument();
  });

  it("should render market position chip", () => {
    render(<FilterChips filters={{ marketPosition: "below" }} onFiltersChange={onChange} />);
    expect(screen.getByText("En dessous du marché")).toBeInTheDocument();
  });

  it("should remove certification level chip on click", () => {
    render(
      <FilterChips
        filters={{ certificationLevel: ["tres_documente", "bien_documente"] }}
        onFiltersChange={onChange}
      />,
    );
    const chips = screen.getAllByTestId("filter-chip-certificationLevel");
    fireEvent.click(chips[0]); // remove first
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.certificationLevel).toEqual(["bien_documente"]);
  });

  it("should remove CT valid chip on click", () => {
    render(<FilterChips filters={{ ctValid: true }} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-chip-ctValid"));
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.ctValid).toBeUndefined();
  });

  it("should remove market position chip on click", () => {
    render(<FilterChips filters={{ marketPosition: "below" }} onFiltersChange={onChange} />);
    fireEvent.click(screen.getByTestId("filter-chip-marketPosition"));
    const called = onChange.mock.calls[0][0] as ISearchFilters;
    expect(called.marketPosition).toBeUndefined();
  });
});
