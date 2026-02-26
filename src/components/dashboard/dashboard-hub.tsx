"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card, CardContent } from "@/components/ui/card";
import { getChatUnreadCount } from "@/lib/api/chat-api";
import { getMyFavorites } from "@/lib/api/favorites-api";
import {
  Search,
  Heart,
  MessageCircle,
  PenLine,
  ShoppingCart,
  Eye,
  BarChart3,
  Shield,
  Settings,
  Bell,
  Users,
  FileText,
  ScrollText,
} from "lucide-react";

interface QuickLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const BUYER_LINKS: QuickLink[] = [
  {
    href: "/search",
    label: "Rechercher",
    icon: Search,
    description: "Trouver un véhicule",
  },
  {
    href: "/favorites",
    label: "Mes favoris",
    icon: Heart,
    description: "Annonces sauvegardées",
  },
  {
    href: "/seller/chat",
    label: "Messages",
    icon: MessageCircle,
    description: "Conversations récentes",
  },
];

const SELLER_LINKS: QuickLink[] = [
  {
    href: "/seller/drafts",
    label: "Mes brouillons",
    icon: PenLine,
    description: "Annonces en cours",
  },
  {
    href: "/seller/publish",
    label: "Publier",
    icon: ShoppingCart,
    description: "Créer une annonce",
  },
  {
    href: "/seller/chat",
    label: "Messages",
    icon: MessageCircle,
    description: "Conversations",
  },
  {
    href: "/seller/market",
    label: "Suivi marché",
    icon: Eye,
    description: "Position et tendances",
  },
];

const MODERATOR_LINKS: QuickLink[] = [
  {
    href: "/moderator",
    label: "Modération",
    icon: Shield,
    description: "Signalements en attente",
  },
];

const ADMIN_LINKS: QuickLink[] = [
  { href: "/admin", label: "KPIs", icon: BarChart3, description: "Tableau de bord" },
  { href: "/admin/config", label: "Configuration", icon: Settings, description: "Paramètres" },
  { href: "/admin/alerts", label: "Alertes", icon: Bell, description: "Notifications système" },
  { href: "/admin/users", label: "Utilisateurs", icon: Users, description: "Gestion comptes" },
  { href: "/admin/legal", label: "Légal", icon: FileText, description: "Documents juridiques" },
  { href: "/admin/seo", label: "SEO", icon: Search, description: "Référencement" },
  { href: "/admin/audit-trail", label: "Audit", icon: ScrollText, description: "Journal" },
];

function QuickLinksGrid({
  title,
  links,
  testId,
}: {
  title: string;
  links: QuickLink[];
  testId: string;
}) {
  return (
    <section data-testid={testId}>
      <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <link.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  testId,
}: {
  label: string;
  value: number | null;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-primary">{value ?? "—"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardHub() {
  const { hasRole } = useAuth();
  const { displayName } = useCurrentUser();

  const isAdmin = hasRole("administrator");
  const isModerator = hasRole("moderator");
  const isSeller = hasRole("seller");

  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number | null>(null);

  useEffect(() => {
    getMyFavorites({ skip: 0, top: 1 })
      .then((res) => setFavoritesCount(res.total))
      .catch(() => setFavoritesCount(0));
    getChatUnreadCount()
      .then(setUnreadMessages)
      .catch(() => setUnreadMessages(0));
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="dashboard-hub">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-xl font-bold sm:text-2xl lg:text-3xl">
          {"Bienvenue"}
          {displayName ? `, ${displayName}` : ""} !
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {"Votre espace personnel sur Auto"}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="hub-stats">
        <StatCard label="Favoris" value={favoritesCount} testId="stat-favorites" />
        <StatCard label="Messages non lus" value={unreadMessages} testId="stat-messages" />
      </div>

      {/* Admin section */}
      {isAdmin && <QuickLinksGrid title="Administration" links={ADMIN_LINKS} testId="hub-admin" />}

      {/* Moderator section */}
      {isModerator && !isAdmin && (
        <QuickLinksGrid title="Modération" links={MODERATOR_LINKS} testId="hub-moderator" />
      )}

      {/* Seller section */}
      {isSeller && (
        <QuickLinksGrid title="Espace vendeur" links={SELLER_LINKS} testId="hub-seller" />
      )}

      {/* Buyer section (always shown) */}
      <QuickLinksGrid title="Acheteur" links={BUYER_LINKS} testId="hub-buyer" />
    </div>
  );
}
