"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  HistoryResponse,
  HistoryMileageRecord,
  HistoryAccident,
  HistoryRegistration,
} from "@auto/shared";

export interface HistoryReportProps {
  report: HistoryResponse;
  source: string;
  fetchedAt: string;
  isMockData?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMileage(km: number): string {
  return km.toLocaleString("fr-FR") + " km";
}

function CertifiedBadge({ source }: { source: string }) {
  return (
    <Badge
      variant="default"
      className="bg-green-600 text-white text-xs dark:bg-green-700"
      data-testid="certified-badge"
    >
      Certifié {source}
    </Badge>
  );
}

function SectionEmpty() {
  return (
    <p className="text-sm text-muted-foreground italic" data-testid="section-empty">
      Information non disponible
    </p>
  );
}

function OwnershipSection({ report, source }: { report: HistoryResponse; source: string }) {
  return (
    <Card data-testid="section-ownership">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Historique des propriétaires</CardTitle>
          <CertifiedBadge source={source} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Nombre de propriétaires</p>
            <p className="text-lg font-semibold" data-testid="owner-count">{report.ownerCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Première immatriculation</p>
            <p className="font-medium" data-testid="first-registration">
              {formatDate(report.firstRegistrationDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dernière immatriculation</p>
            <p className="font-medium" data-testid="last-registration">
              {formatDate(report.lastRegistrationDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AccidentSection({ accidents, source }: { accidents: HistoryAccident[]; source: string }) {
  return (
    <Card data-testid="section-accidents">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Historique des sinistres</CardTitle>
          <CertifiedBadge source={source} />
        </div>
      </CardHeader>
      <CardContent>
        {accidents.length === 0 ? (
          <p className="text-sm text-green-600 font-medium" data-testid="no-accidents">
            Aucun accident signalé
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Gravité</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accidents.map((accident, i) => (
                <TableRow key={i} data-testid={`accident-row-${i}`}>
                  <TableCell>{formatDate(accident.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={accident.severity === "minor" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {accident.severity === "minor" ? "Mineur" : accident.severity === "moderate" ? "Modéré" : "Grave"}
                    </Badge>
                  </TableCell>
                  <TableCell>{accident.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function MileageSection({ records, source }: { records: HistoryMileageRecord[]; source: string }) {
  return (
    <Card data-testid="section-mileage">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Relevés kilométriques</CardTitle>
          <CertifiedBadge source={source} />
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <SectionEmpty />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Kilométrage</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, i) => (
                <TableRow key={i} data-testid={`mileage-row-${i}`}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell className="font-medium">{formatMileage(record.mileageKm)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatMileageSource(record.source)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RegistrationSection({ history, source }: { history: HistoryRegistration[]; source: string }) {
  return (
    <Card data-testid="section-registration">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Historique des immatriculations</CardTitle>
          <CertifiedBadge source={source} />
        </div>
      </CardHeader>
      <CardContent>
        {!history || history.length === 0 ? (
          <SectionEmpty />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Région</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((reg, i) => (
                <TableRow key={i} data-testid={`registration-row-${i}`}>
                  <TableCell>{formatDate(reg.date)}</TableCell>
                  <TableCell className="font-medium">{reg.department}</TableCell>
                  <TableCell>{reg.region}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function StatusSection({ report, source }: { report: HistoryResponse; source: string }) {
  return (
    <Card data-testid="section-status">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Vérifications</CardTitle>
          <CertifiedBadge source={source} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "size-3 rounded-full",
                report.stolen ? "bg-red-500" : "bg-green-500",
              )}
              data-testid="stolen-indicator"
            />
            <span className="text-sm" data-testid="stolen-status">
              {report.stolen ? "Véhicule signalé volé" : "Véhicule non signalé volé"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "size-3 rounded-full",
                report.outstandingFinance ? "bg-orange-500" : "bg-green-500",
              )}
              data-testid="finance-indicator"
            />
            <span className="text-sm" data-testid="finance-status">
              {report.outstandingFinance ? "Gage financier en cours" : "Aucun gage financier"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMileageSource(source: string): string {
  const labels: Record<string, string> = {
    controle_technique: "Contrôle technique",
    revision_constructeur: "Révision constructeur",
    garage_independant: "Garage indépendant",
  };
  return labels[source] || source;
}

export function HistoryReport({ report, source, fetchedAt, isMockData = false }: HistoryReportProps) {
  return (
    <div className="space-y-4" data-testid="history-report">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rapport historique du véhicule</h3>
        <span className="text-xs text-muted-foreground" data-testid="report-date">
          Généré le {formatDate(fetchedAt)}
        </span>
      </div>

      {isMockData && (
        <div
          className="rounded-md border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-600"
          data-testid="mock-indicator"
        >
          Données de démonstration — rapport réel disponible prochainement
        </div>
      )}

      <div className="space-y-4">
        <OwnershipSection report={report} source={source} />
        <AccidentSection accidents={report.accidents} source={source} />
        <MileageSection records={report.mileageRecords} source={source} />
        <RegistrationSection history={report.registrationHistory} source={source} />
        <StatusSection report={report} source={source} />
      </div>
    </div>
  );
}
