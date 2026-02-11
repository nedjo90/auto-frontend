import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchConfigEntities = vi.fn();
const mockUpdateConfigEntity = vi.fn();

vi.mock("@/lib/api/config-api", () => ({
  fetchConfigEntities: (...args: unknown[]) => mockFetchConfigEntities(...args),
  updateConfigEntity: (...args: unknown[]) => mockUpdateConfigEntity(...args),
}));

import SeoConfigPage from "@/app/(dashboard)/admin/seo/page";

const MANAGED = {
  createdAt: "2026-02-11T00:00:00Z",
  createdBy: "admin",
  modifiedAt: "2026-02-11T00:00:00Z",
  modifiedBy: "admin",
};

const mockTemplates = [
  {
    ID: "s1",
    pageType: "listing_detail",
    metaTitleTemplate: "{{brand}} {{model}} {{year}} - Auto",
    metaDescriptionTemplate: "Achetez {{brand}} {{model}} a {{price}} EUR",
    ogTitleTemplate: "OG Title",
    ogDescriptionTemplate: "OG Description",
    canonicalUrlPattern: "/annonces/{{id}}",
    language: "fr",
    active: true,
    ...MANAGED,
  },
  {
    ID: "s2",
    pageType: "search_results",
    metaTitleTemplate: "{{query}} - Recherche | Auto",
    metaDescriptionTemplate: "{{count}} annonces pour {{query}}",
    ogTitleTemplate: "",
    ogDescriptionTemplate: "",
    canonicalUrlPattern: "/recherche",
    language: "fr",
    active: false,
    ...MANAGED,
  },
];

describe("SeoConfigPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchConfigEntities.mockImplementation(() => new Promise(() => {}));
    render(<SeoConfigPage />);
    expect(screen.getByTestId("seo-loading")).toBeInTheDocument();
  });

  it("should render page title and description", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Templates SEO")).toBeInTheDocument();
      expect(screen.getByText(/Gerez les meta tags/)).toBeInTheDocument();
    });
  });

  it("should render template table with data", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Fiche annonce")).toBeInTheDocument();
      expect(screen.getByText("Resultats de recherche")).toBeInTheDocument();
    });
  });

  it("should show empty state when no templates", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seo-empty")).toBeInTheDocument();
    });
  });

  it("should show error on fetch failure", async () => {
    mockFetchConfigEntities.mockRejectedValue(new Error("Network error"));
    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seo-error")).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should display language badge", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    render(<SeoConfigPage />);
    await waitFor(() => {
      const badges = screen.getAllByText("fr");
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should display active/inactive status buttons", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Actif")).toBeInTheDocument();
      expect(screen.getByText("Inactif")).toBeInTheDocument();
    });
  });

  it("should toggle active status when clicking status button", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    mockUpdateConfigEntity.mockResolvedValue(undefined);

    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Actif")).toBeInTheDocument();
    });

    // Re-mock to return updated data
    mockFetchConfigEntities.mockResolvedValue(
      mockTemplates.map((t) => (t.ID === "s1" ? { ...t, active: false } : t)),
    );

    const user = userEvent.setup();
    await user.click(screen.getByTestId("seo-toggle-s1"));

    await waitFor(() => {
      expect(mockUpdateConfigEntity).toHaveBeenCalledWith("ConfigSeoTemplates", "s1", {
        active: false,
      });
    });
  });

  it("should open edit dialog when clicking edit button", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    render(<SeoConfigPage />);

    await waitFor(() => {
      expect(screen.getByTestId("seo-edit-s1")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId("seo-edit-s1"));

    await waitFor(() => {
      expect(screen.getByText(/Modifier le template SEO/)).toBeInTheDocument();
    });
  });

  it("should submit edit form and refresh data", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockTemplates);
    mockUpdateConfigEntity.mockResolvedValue(undefined);

    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seo-edit-s1")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId("seo-edit-s1"));

    await waitFor(() => {
      expect(screen.getByTestId("seo-meta-title-input")).toBeInTheDocument();
    });

    // Click submit
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));

    await waitFor(() => {
      expect(mockUpdateConfigEntity).toHaveBeenCalledWith(
        "ConfigSeoTemplates",
        "s1",
        expect.objectContaining({
          metaTitleTemplate: expect.any(String),
          metaDescriptionTemplate: expect.any(String),
        }),
      );
    });
  });

  it("should truncate long template text in table", async () => {
    const longTemplate = {
      ...mockTemplates[0],
      metaTitleTemplate: "A".repeat(100),
    };
    mockFetchConfigEntities.mockResolvedValue([longTemplate]);
    render(<SeoConfigPage />);
    await waitFor(() => {
      expect(screen.getByText(/A{50}\.\.\./)).toBeInTheDocument();
    });
  });
});
