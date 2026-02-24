import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-auto flex-col items-center gap-2 px-4 py-3 text-sm text-muted-foreground sm:h-14 sm:flex-row sm:justify-between sm:py-0">
        <p>&copy; {new Date().getFullYear()} Auto Platform</p>
        <nav className="flex gap-4">
          <Link href="/legal" className="hover:text-foreground">
            Legal
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
