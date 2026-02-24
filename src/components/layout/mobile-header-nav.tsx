"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logoutRedirect } from "@/lib/auth/auth-utils";

export function MobileHeaderNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, displayName } = useCurrentUser();

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="size-10"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-lg font-bold">Auto</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
              >
                <X className="size-4" />
              </Button>
            </div>
          </SheetHeader>
          <nav className="flex flex-col p-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Accueil
            </Link>
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Recherche
            </Link>

            <div className="my-2 border-t" />

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Mon profil
                </Link>
                <Link
                  href="/settings/security"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Paramètres
                </Link>
                <div className="my-2 border-t" />
                <button
                  onClick={() => {
                    setOpen(false);
                    logoutRedirect().catch(console.error);
                  }}
                  className="rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-accent"
                >
                  Se déconnecter
                </button>
                <p className="mt-3 px-3 text-xs text-muted-foreground">{displayName}</p>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-primary px-3 py-2.5 text-center text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
