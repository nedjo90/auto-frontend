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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { IConfigParameter } from "@auto/shared";
import {
  fetchConfigEntities,
  updateConfigEntity,
  estimateConfigImpact,
} from "@/lib/api/config-api";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

export default function PricingConfigPage() {
  const [params, setParams] = useState<IConfigParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    param: IConfigParameter;
    newValue: string;
    changes: ConfigChange[];
    impactMessage: string | null;
  } | null>(null);

  const loadParams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await fetchConfigEntities<IConfigParameter>("ConfigParameters");
      const pricing = all.filter((p) => p.category === "pricing");
      setParams(pricing);
      const values: Record<string, string> = {};
      for (const p of pricing) values[p.ID] = p.value;
      setEditValues(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParams();
  }, [loadParams]);

  const handleSave = async (param: IConfigParameter) => {
    const newValue = editValues[param.ID];
    if (newValue === param.value) return;

    // Validate numeric input
    const num = Number(newValue);
    if (isNaN(num) || num < 0) {
      setError("La valeur doit etre un nombre positif");
      return;
    }

    // Estimate impact
    let impactMessage: string | null = null;
    try {
      const impact = await estimateConfigImpact(param.key);
      impactMessage = impact.message;
    } catch {
      // Non-blocking: proceed without impact message
    }

    setPendingChange({
      param,
      newValue,
      changes: [{ field: param.key, oldValue: param.value, newValue }],
      impactMessage,
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingChange) return;
    try {
      setSaving(true);
      await updateConfigEntity("ConfigParameters", pendingChange.param.ID, {
        value: pendingChange.newValue,
      });
      setConfirmOpen(false);
      setPendingChange(null);
      await loadParams();
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
      <p className="text-muted-foreground text-sm">Parametres de tarification de la plateforme.</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {params.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucun parametre de tarification configure.</p>
      )}

      {params.length > 0 && (
        <div className="overflow-x-auto rounded-md border [&_td]:whitespace-normal [&_td]:text-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parametre</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.map((param) => (
                <TableRow key={param.ID}>
                  <TableCell className="font-mono text-sm">{param.key}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {param.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={editValues[param.ID] ?? param.value}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, [param.ID]: e.target.value }))
                      }
                      className="w-32"
                      min={0}
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSave(param)}
                      disabled={editValues[param.ID] === param.value || saving}
                    >
                      Enregistrer
                    </Button>
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
          impactMessage={pendingChange.impactMessage}
          loading={saving}
        />
      )}
    </div>
  );
}
