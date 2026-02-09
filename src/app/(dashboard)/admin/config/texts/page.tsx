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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Check, X } from "lucide-react";
import type { IConfigText } from "@auto/shared";
import { fetchConfigEntities, updateConfigEntity } from "@/lib/api/config-api";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

export default function TextsConfigPage() {
  const [texts, setTexts] = useState<IConfigText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    text: IConfigText;
    newValue: string;
    changes: ConfigChange[];
  } | null>(null);

  const loadTexts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfigEntities<IConfigText>("ConfigTexts");
      setTexts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTexts();
  }, [loadTexts]);

  const languages = [...new Set(texts.map((t) => t.language))].sort();

  const filtered = texts.filter((t) => {
    if (langFilter !== "all" && t.language !== langFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.key.toLowerCase().includes(q) ||
      t.value.toLowerCase().includes(q) ||
      (t.category ?? "").toLowerCase().includes(q)
    );
  });

  const handleEdit = (text: IConfigText) => {
    setEditingId(text.ID);
    setEditValue(text.value);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = (text: IConfigText) => {
    if (editValue === text.value) {
      handleCancelEdit();
      return;
    }
    setPendingChange({
      text,
      newValue: editValue,
      changes: [
        { field: `${text.key} (${text.language})`, oldValue: text.value, newValue: editValue },
      ],
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingChange) return;
    try {
      setSaving(true);
      await updateConfigEntity("ConfigTexts", pendingChange.text.ID, {
        value: pendingChange.newValue,
      });
      setConfirmOpen(false);
      setPendingChange(null);
      handleCancelEdit();
      await loadTexts();
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
      <p className="text-muted-foreground text-sm">Textes d&apos;interface multilingues.</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Input
          placeholder="Rechercher par cle, texte ou categorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucun texte trouve.</p>
      )}

      {filtered.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cle</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead className="min-w-[300px]">Valeur</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((text) => (
              <TableRow key={text.ID}>
                <TableCell className="font-mono text-sm">{text.key}</TableCell>
                <TableCell>{text.language.toUpperCase()}</TableCell>
                <TableCell className="text-muted-foreground">{text.category || "-"}</TableCell>
                <TableCell>
                  {editingId === text.ID ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-md border p-2 text-sm"
                      rows={3}
                    />
                  ) : (
                    <span className="text-sm">{text.value}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === text.ID ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveEdit(text)}
                        disabled={saving}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(text)}>
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
