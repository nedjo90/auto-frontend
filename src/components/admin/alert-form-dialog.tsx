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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { IConfigAlert } from "@auto/shared";
import {
  ALERT_METRICS,
  ALERT_COMPARISON_OPERATORS,
  ALERT_NOTIFICATION_METHODS,
  ALERT_SEVERITY_LEVELS,
} from "@auto/shared";

const METRIC_LABELS: Record<string, string> = {
  margin_per_listing: "Marge par annonce",
  api_availability: "Disponibilite API (%)",
  daily_registrations: "Inscriptions quotidiennes",
  daily_listings: "Annonces quotidiennes",
  daily_revenue: "Revenu quotidien",
};

const OPERATOR_LABELS: Record<string, string> = {
  above: "Superieur a",
  below: "Inferieur a",
  equals: "Egal a",
};

const METHOD_LABELS: Record<string, string> = {
  in_app: "In-app",
  email: "Email",
  both: "Les deux",
};

const SEVERITY_LABELS: Record<string, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

export interface AlertFormData {
  name: string;
  metric: string;
  thresholdValue: number;
  comparisonOperator: string;
  notificationMethod: string;
  severityLevel: string;
  cooldownMinutes: number;
  enabled: boolean;
}

interface AlertFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AlertFormData) => void;
  initialData?: IConfigAlert | null;
  loading?: boolean;
}

export function AlertFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: AlertFormDialogProps) {
  // Use key-based reset: the Dialog re-renders AlertFormFields when initialData/open changes
  const formKey = initialData?.ID ?? (open ? "create" : "closed");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <AlertFormFields
        key={formKey}
        initialData={initialData}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}

function AlertFormFields({
  initialData,
  loading,
  onClose,
  onSubmit,
}: {
  initialData?: IConfigAlert | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: AlertFormData) => void;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [metric, setMetric] = useState(initialData?.metric ?? ALERT_METRICS[0]);
  const [thresholdValue, setThresholdValue] = useState(
    initialData ? String(initialData.thresholdValue) : "0",
  );
  const [comparisonOperator, setComparisonOperator] = useState(
    initialData?.comparisonOperator ?? ALERT_COMPARISON_OPERATORS[0],
  );
  const [notificationMethod, setNotificationMethod] = useState(
    initialData?.notificationMethod ?? ALERT_NOTIFICATION_METHODS[0],
  );
  const [severityLevel, setSeverityLevel] = useState(
    initialData?.severityLevel ?? ALERT_SEVERITY_LEVELS[0],
  );
  const [cooldownMinutes, setCooldownMinutes] = useState(
    initialData ? String(initialData.cooldownMinutes) : "60",
  );

  const handleSubmit = () => {
    onSubmit({
      name: name.trim(),
      metric,
      thresholdValue: parseFloat(thresholdValue) || 0,
      comparisonOperator,
      notificationMethod,
      severityLevel,
      cooldownMinutes: parseInt(cooldownMinutes, 10) || 60,
      enabled: initialData?.enabled ?? true,
    });
  };

  const isValid = name.trim().length > 0 && !isNaN(parseFloat(thresholdValue));

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{initialData ? "Modifier l'alerte" : "Nouvelle alerte"}</DialogTitle>
        <DialogDescription>
          {initialData
            ? "Modifiez les parametres de l'alerte."
            : "Configurez une nouvelle alerte de seuil."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-1">
          <Label htmlFor="alert-name">Nom</Label>
          <Input
            id="alert-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'alerte"
            data-testid="alert-name-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="alert-metric">Metrique</Label>
          <Select value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
            <SelectTrigger data-testid="alert-metric-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALERT_METRICS.map((m) => (
                <SelectItem key={m} value={m}>
                  {METRIC_LABELS[m] || m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="alert-operator">Operateur</Label>
            <Select
              value={comparisonOperator}
              onValueChange={(v) => setComparisonOperator(v as typeof comparisonOperator)}
            >
              <SelectTrigger data-testid="alert-operator-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_COMPARISON_OPERATORS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op] || op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="alert-threshold">Seuil</Label>
            <Input
              id="alert-threshold"
              type="number"
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value)}
              data-testid="alert-threshold-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="alert-notification">Notification</Label>
            <Select
              value={notificationMethod}
              onValueChange={(v) => setNotificationMethod(v as typeof notificationMethod)}
            >
              <SelectTrigger data-testid="alert-notification-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_NOTIFICATION_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {METHOD_LABELS[m] || m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="alert-severity">Severite</Label>
            <Select
              value={severityLevel}
              onValueChange={(v) => setSeverityLevel(v as typeof severityLevel)}
            >
              <SelectTrigger data-testid="alert-severity-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_SEVERITY_LEVELS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_LABELS[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="alert-cooldown">Cooldown (minutes)</Label>
          <Input
            id="alert-cooldown"
            type="number"
            min={1}
            max={10080}
            value={cooldownMinutes}
            onChange={(e) => setCooldownMinutes(e.target.value)}
            data-testid="alert-cooldown-input"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !isValid}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData ? "Enregistrer" : "Creer"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
