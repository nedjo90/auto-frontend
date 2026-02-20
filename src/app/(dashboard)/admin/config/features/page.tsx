"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { IConfigFeature } from "@auto/shared";
import { fetchConfigEntities, updateConfigEntity } from "@/lib/api/config-api";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

export default function FeaturesConfigPage() {
  const [features, setFeatures] = useState<IConfigFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    feature: IConfigFeature;
    newActive: boolean;
    changes: ConfigChange[];
  } | null>(null);

  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigFeature>("ConfigFeatures");
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggle = (feature: IConfigFeature) => {
    setPendingChange({
      feature,
      newActive: !feature.isActive,
      changes: [
        {
          field: feature.name,
          oldValue: feature.isActive ? "Active" : "Desactive",
          newValue: !feature.isActive ? "Active" : "Desactive",
        },
      ],
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingChange) return;
    try {
      setSaving(true);
      await updateConfigEntity("ConfigFeatures", pendingChange.feature.ID, {
        isActive: pendingChange.newActive,
      });
      setConfirmOpen(false);
      setPendingChange(null);
      await loadFeatures();
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
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Activer ou desactiver les fonctionnalites de la plateforme.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {features.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucune fonctionnalite configuree.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.ID}>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <Checkbox
                checked={feature.isActive}
                onCheckedChange={() => handleToggle(feature)}
                disabled={saving}
                aria-label={`Activer ${feature.name}`}
              />
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">{feature.name}</CardTitle>
                <CardDescription className="font-mono text-xs">{feature.code}</CardDescription>
                <div className="mt-2 flex gap-1">
                  <Badge variant={feature.isActive ? "default" : "secondary"}>
                    {feature.isActive ? "Active" : "Desactive"}
                  </Badge>
                  {feature.requiresAuth && <Badge variant="outline">Auth requise</Badge>}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

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
