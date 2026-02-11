"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  const { isAuthenticated } = useCurrentUser();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl font-bold">
          Auto
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Se connecter
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
