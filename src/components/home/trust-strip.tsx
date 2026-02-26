import { Shield, FileCheck, Lock, BarChart3 } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, label: "Données certifiées", testId: "trust-certified" },
  { icon: FileCheck, label: "Historique vérifié", testId: "trust-history" },
  { icon: Lock, label: "Paiement sécurisé", testId: "trust-payment" },
  { icon: BarChart3, label: "Prix du marché", testId: "trust-market" },
] as const;

/**
 * Trust strip showing 4 trust indicators below the hero section.
 */
export function TrustStrip() {
  return (
    <section className="border-y bg-muted/30 px-4 py-6 sm:px-6 sm:py-8" data-testid="trust-strip">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.testId}
            className="flex flex-col items-center gap-2 text-center"
            data-testid={item.testId}
          >
            <item.icon className="size-6 text-primary sm:size-7" />
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
