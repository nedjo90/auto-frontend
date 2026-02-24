import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Non autorise - Auto",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-12 sm:py-16 text-center">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Acces non autorise</h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Vous n&apos;avez pas les droits necessaires pour acceder a cette page.
      </p>
      <Link
        href="/dashboard"
        className="text-primary underline hover:no-underline min-h-11 flex items-center sm:min-h-0"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
