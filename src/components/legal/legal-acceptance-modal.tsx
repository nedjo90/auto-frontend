"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { PendingLegalAcceptance } from "@/lib/api/legal-api";
import { acceptLegalDocument, getCurrentLegalVersion } from "@/lib/api/legal-api";

interface LegalAcceptanceModalProps {
  open: boolean;
  pendingDocuments: PendingLegalAcceptance[];
  onAllAccepted: () => void;
}

export function LegalAcceptanceModal({
  open,
  pendingDocuments,
  onAllAccepted,
}: LegalAcceptanceModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [content, setContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentDoc = pendingDocuments[currentIndex];

  // Reset state when pendingDocuments change or modal closes
  useEffect(() => {
    setCurrentIndex(0);
    setContent(null);
    setAccepted(false);
    setError(null);
  }, [pendingDocuments]);

  // Load content when current document changes (via useEffect, not render-phase)
  useEffect(() => {
    if (!currentDoc || !open) return;

    // Abort any pending fetch
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loadContent = async () => {
      try {
        setLoadingContent(true);
        const version = await getCurrentLegalVersion(currentDoc.documentKey);
        if (!controller.signal.aborted) {
          setContent(version.content);
        }
      } catch {
        if (!controller.signal.aborted) {
          setContent(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingContent(false);
        }
      }
    };

    loadContent();

    return () => {
      controller.abort();
    };
  }, [currentDoc, open]);

  const handleAccept = async () => {
    if (!currentDoc || !accepted) return;

    try {
      setSaving(true);
      setError(null);
      await acceptLegalDocument(currentDoc.documentId, currentDoc.version);

      if (currentIndex < pendingDocuments.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAccepted(false);
        setContent(null);
      } else {
        onAllAccepted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'acceptation");
    } finally {
      setSaving(false);
    }
  };

  if (!currentDoc) return null;

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="legal-acceptance-modal"
      >
        <DialogHeader>
          <DialogTitle>{currentDoc.title}</DialogTitle>
          <DialogDescription>
            {currentDoc.summary ||
              "Ce document a ete mis a jour. Veuillez le lire et l'accepter pour continuer."}{" "}
            ({currentIndex + 1}/{pendingDocuments.length})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingContent ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Chargement du document...
            </div>
          ) : content ? (
            <div
              className="prose prose-sm max-w-none max-h-[400px] overflow-y-auto rounded-md border bg-muted/30 p-4 whitespace-pre-wrap"
              data-testid="legal-acceptance-content"
            >
              {content}
            </div>
          ) : (
            <p className="text-muted-foreground">Document non disponible.</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" data-testid="legal-acceptance-error">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="legal-accept-checkbox"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            data-testid="legal-accept-checkbox"
          />
          <Label htmlFor="legal-accept-checkbox" className="text-sm">
            J&apos;ai lu et j&apos;accepte ce document
          </Label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={saving || !accepted}
            data-testid="legal-accept-btn"
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Accepter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
