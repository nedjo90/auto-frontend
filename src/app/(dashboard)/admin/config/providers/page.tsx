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
import { Loader2 } from "lucide-react";
import type { IConfigApiProvider } from "@auto/shared";
import {
  fetchConfigEntities,
  switchProvider,
  fetchProviderAnalytics,
  type ProviderAnalytics,
} from "@/lib/api/config-api";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  deprecated: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  deprecated: "Obsolete",
};

export default function ProvidersConfigPage() {
  const [providers, setProviders] = useState<IConfigApiProvider[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, ProviderAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{
    provider: IConfigApiProvider;
    changes: ConfigChange[];
  } | null>(null);

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigApiProvider>("ConfigApiProviders");
      setProviders(data);

      // Load analytics for all providers in parallel
      const analyticsMap: Record<string, ProviderAnalytics> = {};
      const results = await Promise.allSettled(
        data.map((provider) => fetchProviderAnalytics(provider.key)),
      );
      for (let i = 0; i < data.length; i++) {
        const result = results[i];
        if (result.status === "fulfilled") {
          analyticsMap[data[i].key] = result.value;
        }
      }
      setAnalytics(analyticsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleActivate = (provider: IConfigApiProvider) => {
    if (provider.status === "active") return;

    const currentActive = providers.find(
      (p) => p.adapterInterface === provider.adapterInterface && p.status === "active",
    );

    const changes: ConfigChange[] = [];
    if (currentActive) {
      changes.push({
        field: `${currentActive.key} - Statut`,
        oldValue: "Actif",
        newValue: "Inactif",
      });
    }
    changes.push({
      field: `${provider.key} - Statut`,
      oldValue: STATUS_LABEL[provider.status] || provider.status,
      newValue: "Actif",
    });

    setPendingSwitch({ provider, changes });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingSwitch) return;
    try {
      setSaving(true);
      setError(null);
      await switchProvider(pendingSwitch.provider.adapterInterface, pendingSwitch.provider.key);
      setConfirmOpen(false);
      setPendingSwitch(null);
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de fournisseur");
    } finally {
      setSaving(false);
    }
  };

  // Group providers by adapter interface
  const interfaces = [...new Set(providers.map((p) => p.adapterInterface))];

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Gerez les fournisseurs API externes. Activez ou basculez entre les fournisseurs sans
        deploiement.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {providers.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucun fournisseur API configure.</p>
      )}

      {interfaces.map((iface) => {
        const ifaceProviders = providers.filter((p) => p.adapterInterface === iface);
        return (
          <div key={iface} className="space-y-2">
            <h3 className="text-sm font-semibold">{iface}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Cout/appel</TableHead>
                  <TableHead>Disponibilite</TableHead>
                  <TableHead>Dernier appel</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ifaceProviders.map((provider) => {
                  const provAnalytics = analytics[provider.key];
                  return (
                    <TableRow key={provider.ID}>
                      <TableCell className="text-sm font-mono">{provider.key}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANT[provider.status] || "outline"}>
                          {STATUS_LABEL[provider.status] || provider.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {provider.costPerCall.toFixed(4)} &euro;
                      </TableCell>
                      <TableCell className="text-sm">
                        {provAnalytics ? `${provAnalytics.successRate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {provAnalytics?.lastCallTimestamp
                          ? new Date(provAnalytics.lastCallTimestamp).toLocaleString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {provider.status !== "active" && provider.status !== "deprecated" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivate(provider)}
                            disabled={saving}
                          >
                            Activer
                          </Button>
                        )}
                        {provider.status === "active" && (
                          <span className="text-xs text-muted-foreground">Fournisseur actif</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}

      {pendingSwitch && (
        <ConfigChangeConfirmDialog
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setPendingSwitch(null);
          }}
          onConfirm={handleConfirm}
          changes={pendingSwitch.changes}
          impactMessage="Ce changement prendra effet immediatement pour tous les appels API futurs."
          loading={saving}
          title="Confirmer le changement de fournisseur"
        />
      )}
    </div>
  );
}
