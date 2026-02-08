"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RegistrationWallProps {
  children?: React.ReactNode;
}

export function RegistrationWall({ children }: RegistrationWallProps) {
  return (
    <div className="relative">
      {children && (
        <div className="pointer-events-none select-none blur-sm" aria-hidden>
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-lg">
          <p className="text-sm text-muted-foreground">
            Connectez-vous ou cr&eacute;ez un compte pour acc&eacute;der &agrave; cette
            fonctionnalit&eacute;
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Cr&eacute;er un compte</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
