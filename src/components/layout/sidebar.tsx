"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Users,
  FileText,
  ShoppingCart,
  PenLine,
  BarChart3,
  Search,
  ScrollText,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  {
    href: "/seller/drafts",
    label: "Mes brouillons",
    icon: PenLine,
    roles: ["seller", "administrator"],
  },
  {
    href: "/seller/publish",
    label: "Publier",
    icon: ShoppingCart,
    roles: ["seller", "administrator"],
  },
  { href: "/admin", label: "Tableau de bord admin", icon: BarChart3, roles: ["administrator"] },
  { href: "/admin/config", label: "Configuration", icon: Settings, roles: ["administrator"] },
  { href: "/admin/alerts", label: "Alertes", icon: Bell, roles: ["administrator"] },
  { href: "/admin/users", label: "Utilisateurs", icon: Users, roles: ["administrator"] },
  { href: "/admin/legal", label: "Documents légaux", icon: FileText, roles: ["administrator"] },
  { href: "/admin/seo", label: "SEO", icon: Search, roles: ["administrator"] },
  { href: "/admin/audit-trail", label: "Audit", icon: ScrollText, roles: ["administrator"] },
];

export function Sidebar() {
  const { hasRole } = useAuth();
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r as Parameters<typeof hasRole>[0])),
  );

  return (
    <aside className="hidden w-64 border-r bg-background md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-serif text-lg font-bold">
            Auto Dashboard
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
