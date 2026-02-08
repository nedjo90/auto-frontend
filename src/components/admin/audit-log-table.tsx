"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth/get-auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface AuditEntry {
  ID: string;
  userId: string;
  action: string;
  resource: string;
  details: string | null;
  ipAddress: string | null;
  timestamp: string;
}

interface AuditLogTableProps {
  refreshKey?: number;
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return ts;
  }
}

export function AuditLogTable({ refreshKey = 0 }: AuditLogTableProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(
          `${API_BASE}/api/rbac/AuditLogs?$orderby=timestamp desc&$top=50&$filter=startswith(action,'role.')`,
          { signal: controller.signal, headers: authHeaders },
        );
        if (!res.ok) throw new Error("Failed to fetch audit logs");
        const data = await res.json();
        if (!controller.signal.aborted) {
          setEntries(data.value ?? data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Impossible de charger le journal d'audit");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Chargement du journal...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune modification de role recente</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Ressource</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.ID}>
            <TableCell className="whitespace-nowrap">{formatTimestamp(entry.timestamp)}</TableCell>
            <TableCell>{entry.action}</TableCell>
            <TableCell>{entry.resource}</TableCell>
            <TableCell className="max-w-xs truncate">{entry.details ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
