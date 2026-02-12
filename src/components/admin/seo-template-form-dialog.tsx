"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { IConfigSeoTemplate, SeoPageType } from "@auto/shared";
import { SEO_PLACEHOLDERS, SEO_PAGE_TYPE_LABELS } from "@auto/shared";
import { SeoPreview } from "./seo-preview";

export interface SeoTemplateFormData {
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  ogTitleTemplate: string;
  ogDescriptionTemplate: string;
  canonicalUrlPattern: string;
}

interface SeoTemplateFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SeoTemplateFormData) => void;
  initialData: IConfigSeoTemplate | null;
  loading?: boolean;
}

export function SeoTemplateFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: SeoTemplateFormDialogProps) {
  const formKey = initialData?.ID ?? (open ? "create" : "closed");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <SeoTemplateFormFields
        key={formKey}
        initialData={initialData}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}

function SeoTemplateFormFields({
  initialData,
  loading,
  onClose,
  onSubmit,
}: {
  initialData: IConfigSeoTemplate | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: SeoTemplateFormData) => void;
}) {
  const [metaTitleTemplate, setMetaTitleTemplate] = useState(initialData?.metaTitleTemplate ?? "");
  const [metaDescriptionTemplate, setMetaDescriptionTemplate] = useState(
    initialData?.metaDescriptionTemplate ?? "",
  );
  const [ogTitleTemplate, setOgTitleTemplate] = useState(initialData?.ogTitleTemplate ?? "");
  const [ogDescriptionTemplate, setOgDescriptionTemplate] = useState(
    initialData?.ogDescriptionTemplate ?? "",
  );
  const [canonicalUrlPattern, setCanonicalUrlPattern] = useState(
    initialData?.canonicalUrlPattern ?? "",
  );

  const pageType = initialData?.pageType as SeoPageType | undefined;
  const placeholders = pageType ? SEO_PLACEHOLDERS[pageType] : [];

  const handleSubmit = () => {
    onSubmit({
      metaTitleTemplate: metaTitleTemplate.trim(),
      metaDescriptionTemplate: metaDescriptionTemplate.trim(),
      ogTitleTemplate: ogTitleTemplate.trim(),
      ogDescriptionTemplate: ogDescriptionTemplate.trim(),
      canonicalUrlPattern: canonicalUrlPattern.trim(),
    });
  };

  const isValid = metaTitleTemplate.trim().length > 0 && metaDescriptionTemplate.trim().length > 0;

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          Modifier le template SEO
          {pageType && ` — ${SEO_PAGE_TYPE_LABELS[pageType]}`}
        </DialogTitle>
        <DialogDescription>
          Modifiez les templates de meta tags pour ce type de page.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {placeholders.length > 0 && (
          <div className="rounded-md border bg-muted/50 p-3" data-testid="placeholder-reference">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Placeholders disponibles :
            </p>
            <div className="flex flex-wrap gap-1">
              {placeholders.map((p) => (
                <code key={p} className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">
                  {`{{${p}}}`}
                </code>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="seo-meta-title">Titre meta</Label>
          <Input
            id="seo-meta-title"
            value={metaTitleTemplate}
            onChange={(e) => setMetaTitleTemplate(e.target.value)}
            placeholder="{{brand}} {{model}} - Auto"
            data-testid="seo-meta-title-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="seo-meta-description">Description meta</Label>
          <Input
            id="seo-meta-description"
            value={metaDescriptionTemplate}
            onChange={(e) => setMetaDescriptionTemplate(e.target.value)}
            placeholder="Achetez {{brand}} {{model}} a {{price}} EUR"
            data-testid="seo-meta-description-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="seo-og-title">Titre Open Graph</Label>
          <Input
            id="seo-og-title"
            value={ogTitleTemplate}
            onChange={(e) => setOgTitleTemplate(e.target.value)}
            placeholder="{{brand}} {{model}} | Auto"
            data-testid="seo-og-title-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="seo-og-description">Description Open Graph</Label>
          <Input
            id="seo-og-description"
            value={ogDescriptionTemplate}
            onChange={(e) => setOgDescriptionTemplate(e.target.value)}
            placeholder="Decouvrez cette {{brand}} {{model}}"
            data-testid="seo-og-description-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="seo-canonical">URL canonique</Label>
          <Input
            id="seo-canonical"
            value={canonicalUrlPattern}
            onChange={(e) => setCanonicalUrlPattern(e.target.value)}
            placeholder="/annonces/{{id}}"
            data-testid="seo-canonical-input"
          />
        </div>

        {pageType && (
          <SeoPreview
            metaTitleTemplate={metaTitleTemplate}
            metaDescriptionTemplate={metaDescriptionTemplate}
            pageType={pageType}
          />
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !isValid}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
