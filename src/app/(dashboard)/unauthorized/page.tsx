import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Non autorise - Auto",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h1 className="text-2xl font-bold">Acces non autorise</h1>
      <p className="text-muted-foreground">
        Vous n&apos;avez pas les droits necessaires pour acceder a cette page.
      </p>
      <Link href="/dashboard" className="text-primary underline hover:no-underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
