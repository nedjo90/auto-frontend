"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileHeaderNav } from "@/components/layout/mobile-header-nav";
import { cn } from "@/lib/utils";

const PUBLIC_NAV_LINKS = [
  { href: "/search", label: "Recherche" },
  { href: "/how-it-works", label: "Comment ça marche" },
  { href: "/trust", label: "Confiance" },
] as const;

export function Header() {
  const { isAuthenticated } = useCurrentUser();
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <Link href="/" className="font-serif text-lg font-bold sm:text-xl">
          Auto
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" data-testid="desktop-nav">
          {PUBLIC_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname?.startsWith(link.href)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
              data-testid={`nav-link-${link.href.slice(1)}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-4">
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
                  {"Créer un compte"}
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        <MobileHeaderNav />
      </div>
    </header>
  );
}
