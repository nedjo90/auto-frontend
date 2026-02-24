"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { getPaymentSessionStatus } from "@/lib/api/publish-api";
import type { IPaymentSessionStatus } from "@auto/shared";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30; // 60s max

export default function PublishSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<IPaymentSessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function fetchStatus() {
      try {
        const result = await getPaymentSessionStatus(sessionId!);
        if (cancelled) return;
        setStatus(result);

        if (result.status !== "Pending") {
          // Terminal state — stop polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        pollCountRef.current += 1;
        if (pollCountRef.current >= MAX_POLLS) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setError("Le délai de confirmation a expiré. Veuillez vérifier vos annonces.");
        }
      } catch (err) {
        if (cancelled) return;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setError(err instanceof Error ? err.message : "Erreur lors de la vérification du paiement");
      }
    }

    // Initial fetch
    fetchStatus();

    // Start polling
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="no-session">
        <XCircle className="size-12 text-destructive mb-4" />
        <p className="text-lg mb-4">Session de paiement invalide</p>
        <Button onClick={() => router.push("/seller/publish")} data-testid="go-publish-btn">
          Retour à la publication
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="payment-error">
        <XCircle className="size-12 text-destructive mb-4" />
        <p className="text-lg mb-2">Erreur</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push("/seller/publish")} data-testid="error-retry-btn">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!status || status.status === "Pending") {
    return (
      <div
        className="flex flex-col items-center justify-center py-16"
        data-testid="payment-pending"
      >
        <Loader2 className="size-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium mb-2">Confirmation du paiement en cours...</p>
        <p className="text-sm text-muted-foreground">
          Veuillez patienter, nous vérifions votre paiement.
        </p>
      </div>
    );
  }

  if (status.status === "Failed") {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="payment-failed">
        <XCircle className="size-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Le paiement a échoué</p>
        <p className="text-muted-foreground mb-4">
          Votre paiement n&apos;a pas pu être traité. Aucune annonce n&apos;a été publiée.
        </p>
        <Button onClick={() => router.push("/seller/publish")} data-testid="failed-retry-btn">
          Réessayer
        </Button>
      </div>
    );
  }

  // Succeeded
  return (
    <div data-testid="payment-success">
      <div className="flex flex-col items-center justify-center py-8 mb-6">
        <CheckCircle2 className="size-16 text-green-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Paiement confirmé !</h1>
        <p className="text-muted-foreground">
          {status.listingCount} annonce{status.listingCount > 1 ? "s" : ""}{" "}
          {status.listingCount > 1 ? "ont été publiées" : "a été publiée"} avec succès.
        </p>
      </div>

      {status.listings.length > 0 && (
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6"
          data-testid="published-listings"
        >
          {status.listings.map((listing) => (
            <Card key={listing.ID} data-testid={`published-listing-${listing.ID}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{listing.ID}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-green-600 font-medium" data-testid="listing-status">
                  {listing.status === "published" ? "Publiée" : listing.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/seller/drafts")}
          data-testid="go-drafts-btn"
        >
          <ArrowLeft className="mr-2 size-4" />
          Mes brouillons
        </Button>
        <Button onClick={() => router.push("/seller/publish")} data-testid="publish-more-btn">
          Publier d&apos;autres annonces
        </Button>
      </div>
    </div>
  );
}
