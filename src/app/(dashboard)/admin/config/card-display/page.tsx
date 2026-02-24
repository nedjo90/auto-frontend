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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import type { IConfigProfileField } from "@auto/shared";
import { fetchConfigEntities, updateConfigEntity } from "@/lib/api/config-api";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

export default function CardDisplayConfigPage() {
  const [fields, setFields] = useState<IConfigProfileField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    fieldId: string;
    updates: Record<string, unknown>;
    swapFieldId?: string;
    swapUpdates?: Record<string, unknown>;
    changes: ConfigChange[];
  } | null>(null);

  const loadFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigProfileField>("ConfigProfileFields");
      setFields(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleToggleVisibility = (field: IConfigProfileField) => {
    setPendingChange({
      fieldId: field.ID,
      updates: { isVisibleToPublic: !field.isVisibleToPublic },
      changes: [
        {
          field: `${field.fieldName} - Visibilite`,
          oldValue: field.isVisibleToPublic ? "Visible" : "Masque",
          newValue: !field.isVisibleToPublic ? "Visible" : "Masque",
        },
      ],
    });
    setConfirmOpen(true);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const field = fields[index];
    const aboveField = fields[index - 1];
    setPendingChange({
      fieldId: field.ID,
      updates: { displayOrder: aboveField.displayOrder },
      swapFieldId: aboveField.ID,
      swapUpdates: { displayOrder: field.displayOrder },
      changes: [
        {
          field: `${field.fieldName} - Ordre`,
          oldValue: String(field.displayOrder),
          newValue: String(aboveField.displayOrder),
        },
        {
          field: `${aboveField.fieldName} - Ordre`,
          oldValue: String(aboveField.displayOrder),
          newValue: String(field.displayOrder),
        },
      ],
    });
    setConfirmOpen(true);
  };

  const handleMoveDown = (index: number) => {
    if (index >= fields.length - 1) return;
    const field = fields[index];
    const belowField = fields[index + 1];
    setPendingChange({
      fieldId: field.ID,
      updates: { displayOrder: belowField.displayOrder },
      swapFieldId: belowField.ID,
      swapUpdates: { displayOrder: field.displayOrder },
      changes: [
        {
          field: `${field.fieldName} - Ordre`,
          oldValue: String(field.displayOrder),
          newValue: String(belowField.displayOrder),
        },
        {
          field: `${belowField.fieldName} - Ordre`,
          oldValue: String(belowField.displayOrder),
          newValue: String(field.displayOrder),
        },
      ],
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingChange) return;
    try {
      setSaving(true);
      setError(null);
      await updateConfigEntity("ConfigProfileFields", pendingChange.fieldId, pendingChange.updates);
      if (pendingChange.swapFieldId && pendingChange.swapUpdates) {
        await updateConfigEntity(
          "ConfigProfileFields",
          pendingChange.swapFieldId,
          pendingChange.swapUpdates,
        );
      }
      setConfirmOpen(false);
      setPendingChange(null);
      await loadFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-muted-foreground text-sm">
        Configurez les champs affiches sur les cartes d&apos;annonces et leur ordre.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {fields.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucun champ configure.</p>
      )}

      {fields.length > 0 && (
        <div className="overflow-x-auto rounded-md border [&_td]:whitespace-normal [&_td]:text-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordre</TableHead>
                <TableHead>Champ</TableHead>
                <TableHead>Visible au public</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.ID}>
                  <TableCell>{field.displayOrder}</TableCell>
                  <TableCell className="font-mono text-sm">{field.fieldName}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={field.isVisibleToPublic}
                      onCheckedChange={() => handleToggleVisibility(field)}
                      disabled={saving}
                      aria-label={`${field.fieldName} visible au public`}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={field.contributesToCompletion}
                      disabled
                      aria-label="completion"
                    />
                  </TableCell>
                  <TableCell>{field.weight}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || saving}
                        aria-label="Monter"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === fields.length - 1 || saving}
                        aria-label="Descendre"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pendingChange && (
        <ConfigChangeConfirmDialog
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setPendingChange(null);
          }}
          onConfirm={handleConfirm}
          changes={pendingChange.changes}
          loading={saving}
        />
      )}
    </div>
  );
}
