"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  Bell,
  Users,
  FileText,
  Shield,
  ShoppingCart,
  PenLine,
  Eye,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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
  {
    href: "/seller/market",
    label: "Suivi marché",
    icon: Eye,
    roles: ["seller", "administrator"],
  },
  {
    href: "/moderator",
    label: "Moderation",
    icon: Shield,
    roles: ["moderator", "administrator"],
  },
  { href: "/admin", label: "Administration", icon: Shield, roles: ["administrator"] },
  { href: "/admin/config", label: "Configuration", icon: Settings, roles: ["administrator"] },
  { href: "/admin/alerts", label: "Alertes", icon: Bell, roles: ["administrator"] },
  { href: "/admin/users", label: "Utilisateurs", icon: Users, roles: ["administrator"] },
  { href: "/admin/legal", label: "Documents légaux", icon: FileText, roles: ["administrator"] },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { hasRole } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r as Parameters<typeof hasRole>[0])),
  );

  return (
    <div className="md:hidden">
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
        <SheetContent side="left" showCloseButton={false} className="w-72 p-0">
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
          <nav className="flex-1 space-y-1 p-3">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
