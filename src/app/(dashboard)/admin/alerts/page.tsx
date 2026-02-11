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
import { Loader2, Plus } from "lucide-react";
import type { IConfigAlert } from "@auto/shared";
import { fetchConfigEntities, createConfigEntity, updateConfigEntity } from "@/lib/api/config-api";
import { AlertFormDialog, type AlertFormData } from "@/components/admin/alert-form-dialog";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  warning: "default",
  info: "secondary",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critique",
  warning: "Warning",
  info: "Info",
};

const OPERATOR_LABEL: Record<string, string> = {
  above: ">",
  below: "<",
  equals: "=",
};

const METRIC_LABEL: Record<string, string> = {
  margin_per_listing: "Marge/annonce",
  api_availability: "Dispo. API",
  daily_registrations: "Inscriptions/j",
  daily_listings: "Annonces/j",
  daily_revenue: "Revenu/j",
};

export default function AlertsConfigPage() {
  const [alerts, setAlerts] = useState<IConfigAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<IConfigAlert | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigAlert>("ConfigAlerts");
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCreate = () => {
    setEditingAlert(null);
    setDialogOpen(true);
  };

  const handleEdit = (alert: IConfigAlert) => {
    setEditingAlert(alert);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: AlertFormData) => {
    try {
      setSaving(true);
      setError(null);
      if (editingAlert) {
        await updateConfigEntity("ConfigAlerts", editingAlert.ID, data);
      } else {
        await createConfigEntity("ConfigAlerts", data as Record<string, unknown>);
      }
      setDialogOpen(false);
      setEditingAlert(null);
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (alert: IConfigAlert) => {
    try {
      setSaving(true);
      setError(null);
      await updateConfigEntity("ConfigAlerts", alert.ID, {
        enabled: !alert.enabled,
      });
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise a jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" data-testid="alerts-loading">
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alertes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configurez les alertes de seuils pour les metriques metier.
          </p>
        </div>
        <Button onClick={handleCreate} data-testid="create-alert-btn">
          <Plus className="mr-2 size-4" />
          Nouvelle alerte
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="alerts-error">
          {error}
        </p>
      )}

      {alerts.length === 0 && !error && (
        <p className="text-sm text-muted-foreground" data-testid="alerts-empty">
          Aucune alerte configuree.
        </p>
      )}

      {alerts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Metrique</TableHead>
              <TableHead>Seuil</TableHead>
              <TableHead>Severite</TableHead>
              <TableHead>Notification</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernier declenchement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.ID} data-testid={`alert-row-${alert.ID}`}>
                <TableCell className="text-sm font-medium">{alert.name}</TableCell>
                <TableCell className="text-sm">
                  {METRIC_LABEL[alert.metric] || alert.metric}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {OPERATOR_LABEL[alert.comparisonOperator] || alert.comparisonOperator}{" "}
                  {alert.thresholdValue}
                </TableCell>
                <TableCell>
                  <Badge variant={SEVERITY_VARIANT[alert.severityLevel] || "outline"}>
                    {SEVERITY_LABEL[alert.severityLevel] || alert.severityLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{alert.notificationMethod}</TableCell>
                <TableCell>
                  <Button
                    variant={alert.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleEnabled(alert)}
                    disabled={saving}
                    data-testid={`alert-toggle-${alert.ID}`}
                  >
                    {alert.enabled ? "Actif" : "Inactif"}
                  </Button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {alert.lastTriggeredAt
                    ? new Date(alert.lastTriggeredAt).toLocaleString("fr-FR")
                    : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(alert)}
                    disabled={saving}
                    data-testid={`alert-edit-${alert.ID}`}
                  >
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAlert(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingAlert}
        loading={saving}
      />
    </div>
  );
}
