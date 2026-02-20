import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeoTemplateFormDialog } from "@/components/admin/seo-template-form-dialog";
import type { IConfigSeoTemplate } from "@auto/shared";

const MANAGED = {
  createdAt: "2026-02-11T00:00:00Z",
  createdBy: "admin",
  modifiedAt: "2026-02-11T00:00:00Z",
  modifiedBy: "admin",
};

const mockTemplate: IConfigSeoTemplate = {
  ID: "s1",
  pageType: "listing_detail",
  metaTitleTemplate: "{{brand}} {{model}} - Auto",
  metaDescriptionTemplate: "Achetez {{brand}} {{model}} a {{price}} EUR",
  ogTitleTemplate: "OG Title",
  ogDescriptionTemplate: "OG Desc",
  canonicalUrlPattern: "/annonces/{{id}}",
  language: "fr",
  active: true,
  ...MANAGED,
};

describe("SeoTemplateFormDialog", () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render dialog with page type label in title", () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    expect(screen.getByText(/Modifier le template SEO/)).toBeInTheDocument();
    expect(screen.getByText(/Fiche annonce/)).toBeInTheDocument();
  });

  it("should populate fields with initial data", () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    expect(screen.getByTestId("seo-meta-title-input")).toHaveValue("{{brand}} {{model}} - Auto");
    expect(screen.getByTestId("seo-meta-description-input")).toHaveValue(
      "Achetez {{brand}} {{model}} a {{price}} EUR",
    );
    expect(screen.getByTestId("seo-og-title-input")).toHaveValue("OG Title");
    expect(screen.getByTestId("seo-og-description-input")).toHaveValue("OG Desc");
    expect(screen.getByTestId("seo-canonical-input")).toHaveValue("/annonces/{{id}}");
  });

  it("should show available placeholders for the page type", () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    const placeholderRef = screen.getByTestId("placeholder-reference");
    expect(placeholderRef).toHaveTextContent("{{brand}}");
    expect(placeholderRef).toHaveTextContent("{{model}}");
    expect(placeholderRef).toHaveTextContent("{{year}}");
    expect(placeholderRef).toHaveTextContent("{{price}}");
    expect(placeholderRef).toHaveTextContent("{{city}}");
  });

  it("should show SEO preview", () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    expect(screen.getByTestId("seo-preview")).toBeInTheDocument();
    expect(screen.getByTestId("seo-preview-title")).toHaveTextContent("Peugeot 308 - Auto");
  });

  it("should call onSubmit with form data", async () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));

    expect(onSubmit).toHaveBeenCalledWith({
      metaTitleTemplate: "{{brand}} {{model}} - Auto",
      metaDescriptionTemplate: "Achetez {{brand}} {{model}} a {{price}} EUR",
      ogTitleTemplate: "OG Title",
      ogDescriptionTemplate: "OG Desc",
      canonicalUrlPattern: "/annonces/{{id}}",
    });
  });

  it("should call onClose when cancel clicked", async () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Annuler/ }));

    expect(onClose).toHaveBeenCalled();
  });

  it("should disable submit when title is empty", async () => {
    const emptyTemplate = { ...mockTemplate, metaTitleTemplate: "", metaDescriptionTemplate: "" };
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={emptyTemplate}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: /Enregistrer/ });
    expect(submitBtn).toBeDisabled();
  });

  it("should disable buttons when loading", () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
        loading={true}
      />,
    );

    expect(screen.getByRole("button", { name: /Annuler/ })).toBeDisabled();
  });

  it("should render all form fields", () => {
    render(
      <SeoTemplateFormDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockTemplate}
      />,
    );

    expect(screen.getByLabelText("Titre meta")).toBeInTheDocument();
    expect(screen.getByLabelText("Description meta")).toBeInTheDocument();
    expect(screen.getByLabelText("Titre Open Graph")).toBeInTheDocument();
    expect(screen.getByLabelText("Description Open Graph")).toBeInTheDocument();
    expect(screen.getByLabelText("URL canonique")).toBeInTheDocument();
  });
});
