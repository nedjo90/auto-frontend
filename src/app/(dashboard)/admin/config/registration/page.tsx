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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { IConfigRegistrationField } from "@auto/shared";
import { fetchConfigEntities, updateConfigEntity } from "@/lib/api/config-api";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

export default function RegistrationConfigPage() {
  const [fields, setFields] = useState<IConfigRegistrationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    field: IConfigRegistrationField;
    property: "isRequired" | "isVisible";
    newValue: boolean;
    changes: ConfigChange[];
  } | null>(null);

  const loadFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigRegistrationField>("ConfigRegistrationFields");
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

  const handleToggle = (field: IConfigRegistrationField, property: "isRequired" | "isVisible") => {
    const currentValue = field[property];
    const label = property === "isRequired" ? "Obligatoire" : "Visible";
    setPendingChange({
      field,
      property,
      newValue: !currentValue,
      changes: [
        {
          field: `${field.fieldName} - ${label}`,
          oldValue: currentValue ? "Oui" : "Non",
          newValue: !currentValue ? "Oui" : "Non",
        },
      ],
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingChange) return;
    try {
      setSaving(true);
      await updateConfigEntity("ConfigRegistrationFields", pendingChange.field.ID, {
        [pendingChange.property]: pendingChange.newValue,
      });
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
        Champs du formulaire d&apos;inscription et leurs regles de validation.
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
                <TableHead>Type</TableHead>
                <TableHead>Obligatoire</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.ID}>
                  <TableCell>{field.displayOrder}</TableCell>
                  <TableCell className="font-mono text-sm">{field.fieldName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{field.fieldType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={field.isRequired}
                      onCheckedChange={() => handleToggle(field, "isRequired")}
                      disabled={saving}
                      aria-label={`${field.fieldName} obligatoire`}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={field.isVisible}
                      onCheckedChange={() => handleToggle(field, "isVisible")}
                      disabled={saving}
                      aria-label={`${field.fieldName} visible`}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {field.validationPattern || "-"}
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
