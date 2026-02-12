"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil } from "lucide-react";
import type { IConfigSeoTemplate } from "@auto/shared";
import { SEO_PAGE_TYPE_LABELS } from "@auto/shared";
import { fetchConfigEntities, updateConfigEntity } from "@/lib/api/config-api";
import {
  SeoTemplateFormDialog,
  type SeoTemplateFormData,
} from "@/components/admin/seo-template-form-dialog";

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function SeoConfigPage() {
  const [templates, setTemplates] = useState<IConfigSeoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IConfigSeoTemplate | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigSeoTemplate>("ConfigSeoTemplates");
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleEdit = (template: IConfigSeoTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: SeoTemplateFormData) => {
    if (!editingTemplate) return;
    try {
      setSaving(true);
      setError(null);
      await updateConfigEntity(
        "ConfigSeoTemplates",
        editingTemplate.ID,
        data as unknown as Partial<Record<string, unknown>>,
      );
      setDialogOpen(false);
      setEditingTemplate(null);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (template: IConfigSeoTemplate) => {
    try {
      setSaving(true);
      setError(null);
      await updateConfigEntity("ConfigSeoTemplates", template.ID, {
        active: !template.active,
      });
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise a jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" data-testid="seo-loading">
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates SEO</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerez les meta tags et templates SEO par type de page.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="seo-error">
          {error}
        </p>
      )}

      {templates.length === 0 && !error && (
        <p className="text-sm text-muted-foreground" data-testid="seo-empty">
          Aucun template SEO configure.
        </p>
      )}

      {templates.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type de page</TableHead>
              <TableHead>Titre meta</TableHead>
              <TableHead>Description meta</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.ID} data-testid={`seo-row-${template.ID}`}>
                <TableCell className="text-sm font-medium">
                  {SEO_PAGE_TYPE_LABELS[template.pageType] || template.pageType}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-48">
                  {truncate(template.metaTitleTemplate, 50)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-64">
                  {truncate(template.metaDescriptionTemplate, 60)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{template.language}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant={template.active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleActive(template)}
                    disabled={saving}
                    data-testid={`seo-toggle-${template.ID}`}
                  >
                    {template.active ? "Actif" : "Inactif"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    disabled={saving}
                    data-testid={`seo-edit-${template.ID}`}
                  >
                    <Pencil className="mr-1 size-3" />
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SeoTemplateFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTemplate}
        loading={saving}
      />
    </div>
  );
}
