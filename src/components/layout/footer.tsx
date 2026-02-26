import Link from "next/link";

const PLATFORM_LINKS = [
  { href: "/search", label: "Recherche" },
  { href: "/how-it-works", label: "Comment ça marche" },
  { href: "/trust", label: "Confiance & Transparence" },
  { href: "/about", label: "À propos" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/cgu", label: "Mentions légales" },
  { href: "/legal/privacy-policy", label: "Politique de confidentialité" },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-background" data-testid="footer">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg font-bold">Auto</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Annonces véhicules vérifiées avec données certifiées."}
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold">Plateforme</h3>
            <nav className="mt-2 flex flex-col gap-1.5" data-testid="footer-platform-links">
              {PLATFORM_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  data-testid={`footer-link-${link.href.slice(1).replace(/\//g, "-")}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-sm font-semibold">{"Légal"}</h3>
            <nav className="mt-2 flex flex-col gap-1.5" data-testid="footer-legal-links">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  data-testid={`footer-link-${link.href.slice(1).replace(/\//g, "-")}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground sm:text-sm">
          &copy; {new Date().getFullYear()} Auto Platform
        </div>
      </div>
    </footer>
  );
}
