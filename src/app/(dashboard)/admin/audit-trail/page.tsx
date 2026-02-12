"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import {
  fetchAuditTrailEntries,
  exportAuditTrailCsv,
  type AuditTrailFilters,
} from "@/lib/api/audit-api";
import type { IAuditTrailEntry } from "@auto/shared";
import { AUDITABLE_ACTIONS, AUDIT_SEVERITY_LEVELS } from "@auto/shared";
import Link from "next/link";

const PAGE_SIZES = [25, 50, 100];

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// Extract unique action categories for the filter dropdown
const ACTION_TYPES = [...new Set(AUDITABLE_ACTIONS)];
const TARGET_TYPES = [
  "ConfigParameter",
  "ConfigText",
  "ConfigFeature",
  "ConfigApiProvider",
  "ConfigAlert",
  "ConfigSeoTemplate",
  "User",
  "Listing",
  "LegalDocument",
  "LegalDocumentVersion",
  "AlertEvent",
  "AuditTrailEntry",
  "ApiCallLog",
  "DataExportRequest",
  "AnonymizationRequest",
];

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<IAuditTrailEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Sorting
  const [orderBy, setOrderBy] = useState("timestamp desc");

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [targetIdFilter, setTargetIdFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  // Detail view
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const buildFilters = useCallback((): AuditTrailFilters => {
    const filters: AuditTrailFilters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (actionFilter) filters.action = actionFilter;
    if (actorFilter) filters.actorId = actorFilter;
    if (targetTypeFilter) filters.targetType = targetTypeFilter;
    if (targetIdFilter) filters.targetId = targetIdFilter;
    if (severityFilter) filters.severity = severityFilter;
    return filters;
  }, [
    dateFrom,
    dateTo,
    actionFilter,
    actorFilter,
    targetTypeFilter,
    targetIdFilter,
    severityFilter,
  ]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAuditTrailEntries(
        buildFilters(),
        orderBy,
        pageSize,
        page * pageSize,
      );
      setEntries(result.entries);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [buildFilters, orderBy, pageSize, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const csv = await exportAuditTrailCsv(buildFilters());
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'export");
    } finally {
      setExporting(false);
    }
  };

  const handleSort = (column: string) => {
    setOrderBy((prev) => {
      const [currentCol, currentDir] = prev.split(" ");
      if (currentCol === column) {
        return `${column} ${currentDir === "desc" ? "asc" : "desc"}`;
      }
      return `${column} desc`;
    });
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    loadData();
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setActionFilter("");
    setActorFilter("");
    setTargetTypeFilter("");
    setTargetIdFilter("");
    setSeverityFilter("");
    setPage(0);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDetails = (details: string | null): string => {
    if (!details) return "-";
    try {
      return JSON.stringify(JSON.parse(details), null, 2);
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-6" data-testid="audit-trail-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Piste d&apos;audit</h1>
          <p className="text-sm text-muted-foreground">
            Suivi de toutes les operations sensibles sur la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/audit-trail/api-calls">
            <Button variant="outline" size="sm" data-testid="api-calls-link">
              Appels API
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            data-testid="export-csv-btn"
          >
            {exporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="grid grid-cols-2 gap-4 rounded-md border p-4 sm:grid-cols-3 lg:grid-cols-4"
        data-testid="audit-filters"
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date debut</label>
          <Input
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            data-testid="filter-date-from"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date fin</label>
          <Input
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            data-testid="filter-date-to"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Action</label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger data-testid="filter-action">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Toutes</SelectItem>
              {ACTION_TYPES.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Acteur</label>
          <Input
            placeholder="ID acteur..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            data-testid="filter-actor"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Type cible</label>
          <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
            <SelectTrigger data-testid="filter-target-type">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Tous</SelectItem>
              {TARGET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">ID cible</label>
          <Input
            placeholder="ID cible..."
            value={targetIdFilter}
            onChange={(e) => setTargetIdFilter(e.target.value)}
            data-testid="filter-target-id"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Severite</label>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger data-testid="filter-severity">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Toutes</SelectItem>
              {AUDIT_SEVERITY_LEVELS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button size="sm" onClick={handleApplyFilters} data-testid="apply-filters-btn">
            Filtrer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetFilters}
            data-testid="reset-filters-btn"
          >
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="audit-error">
          {error}
        </p>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("timestamp")}
                  data-testid="sort-timestamp"
                >
                  Horodatage <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("action")}
                  data-testid="sort-action"
                >
                  Action <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>Acteur</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("targetType")}
                  data-testid="sort-target-type"
                >
                  Type cible <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>ID cible</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("severity")}
                  data-testid="sort-severity"
                >
                  Severite <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2
                    className="inline-block size-5 animate-spin"
                    data-testid="audit-loading"
                  />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                  data-testid="audit-empty"
                >
                  Aucune entree trouvee
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <>
                  <TableRow
                    key={entry.ID}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedRow(expandedRow === entry.ID ? null : entry.ID)}
                    data-testid={`audit-row-${entry.ID}`}
                  >
                    <TableCell className="text-xs font-mono">
                      {new Date(entry.timestamp).toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{entry.action}</code>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-mono">{entry.actorId?.substring(0, 8)}...</span>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {entry.actorRole}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{entry.targetType}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {entry.targetId ? `${entry.targetId.substring(0, 8)}...` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={SEVERITY_COLORS[entry.severity] || ""}>
                        {entry.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedRow === entry.ID && (
                    <TableRow key={`${entry.ID}-detail`}>
                      <TableCell
                        colSpan={6}
                        className="bg-muted/30"
                        data-testid={`audit-detail-${entry.ID}`}
                      >
                        <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                          <div>
                            <strong>Acteur ID:</strong> {entry.actorId}
                          </div>
                          <div>
                            <strong>Role:</strong> {entry.actorRole}
                          </div>
                          <div>
                            <strong>IP:</strong> {entry.ipAddress || "-"}
                          </div>
                          <div>
                            <strong>User-Agent:</strong>{" "}
                            <span className="text-xs break-all">{entry.userAgent || "-"}</span>
                          </div>
                          <div>
                            <strong>Request ID:</strong> {entry.requestId || "-"}
                          </div>
                          <div>
                            <strong>Target ID:</strong> {entry.targetId || "-"}
                          </div>
                          <div className="col-span-2">
                            <strong>Details:</strong>
                            <pre className="mt-1 max-h-60 overflow-auto rounded bg-muted p-2 text-xs">
                              {formatDetails(entry.details)}
                            </pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between" data-testid="audit-pagination">
        <div className="text-sm text-muted-foreground">
          {totalCount} entree{totalCount !== 1 ? "s" : ""} au total
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-20" data-testid="page-size-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              data-testid="prev-page-btn"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm px-2">
              {page + 1} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              data-testid="next-page-btn"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
