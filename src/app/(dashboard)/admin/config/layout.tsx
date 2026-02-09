"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const CONFIG_TABS = [
  { href: "/admin/config", label: "Vue d'ensemble", exact: true },
  { href: "/admin/config/pricing", label: "Tarification" },
  { href: "/admin/config/texts", label: "Textes" },
  { href: "/admin/config/features", label: "Fonctionnalites" },
  { href: "/admin/config/registration", label: "Inscription" },
  { href: "/admin/config/card-display", label: "Affichage carte" },
] as const;

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (tab: (typeof CONFIG_TABS)[number]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuration de la plateforme</h1>
        <p className="text-muted-foreground mt-1">
          Gerez les parametres, textes, fonctionnalites et regles de la plateforme.
        </p>
      </div>

      <nav className="flex gap-1 border-b" aria-label="Configuration sections">
        {CONFIG_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              isActive(tab)
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div>{children}</div>
    </div>
  );
}
