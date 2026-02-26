"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", icon: Home, label: "Accueil", authRequired: false, matchExact: true },
  { href: "/search", icon: Search, label: "Recherche", authRequired: false, matchExact: false },
  { href: "/favorites", icon: Heart, label: "Favoris", authRequired: true, matchExact: false },
  {
    href: "/seller/chat",
    icon: MessageCircle,
    label: "Messages",
    authRequired: true,
    matchExact: false,
  },
  { href: "/profile", icon: User, label: "Profil", authRequired: true, matchExact: false },
] as const;

/**
 * Mobile-only fixed bottom tab bar for public pages.
 * Auth-protected tabs redirect to /login if not authenticated.
 */
export function PublicTabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      data-testid="public-tab-bar"
    >
      <div className="flex h-16 items-center justify-around">
        {TABS.map((tab) => {
          const isActive = tab.matchExact ? pathname === tab.href : pathname?.startsWith(tab.href);
          const resolvedHref = tab.authRequired && !isAuthenticated ? "/login" : tab.href;

          return (
            <Link
              key={tab.href}
              href={resolvedHref}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] transition-colors",
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-testid={`tab-${tab.label.toLowerCase()}`}
            >
              <tab.icon className="size-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
