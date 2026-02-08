"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RegistrationWallProps {
  children?: React.ReactNode;
}

export function RegistrationWall({ children }: RegistrationWallProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      {children && (
        <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
          {children}
        </div>
      )}
      <div
        className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Connexion requise"
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-lg outline-none"
        >
          <p className="text-sm text-muted-foreground">
            Connectez-vous ou creez un compte pour acceder a cette fonctionnalite
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Creer un compte</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
