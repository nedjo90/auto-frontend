import { Search, BarChart3, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Parcourez des annonces verifiees avec des donnees certifiees",
    testId: "step-search",
  },
  {
    icon: BarChart3,
    title: "Comparez",
    description: "Consultez les donnees certifiees et le rapport d'historique",
    testId: "step-compare",
  },
  {
    icon: MessageCircle,
    title: "Contactez",
    description: "Echangez directement avec le vendeur par messagerie",
    testId: "step-contact",
  },
] as const;

/**
 * How it works section with 3 steps displayed as cards.
 */
export function HowItWorksSection() {
  return (
    <section
      className="bg-muted/20 px-4 py-10 sm:px-6 sm:py-14 lg:py-16"
      data-testid="how-it-works"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-lg font-bold sm:text-xl lg:text-2xl">Comment ca marche</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <Card key={step.testId} className="text-center" data-testid={step.testId}>
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="size-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Etape {i + 1}</span>
                <h3 className="text-base font-semibold sm:text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
