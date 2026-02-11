"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const { hasRole } = useAuth();

  return (
    <aside className="hidden w-64 border-r bg-background md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-serif text-lg font-bold">
            Auto Dashboard
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <Link href="/dashboard" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Overview
          </Link>
          {hasRole("administrator") && (
            <>
              <Link
                href="/admin/config"
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                Configuration
              </Link>
              <Link
                href="/admin/alerts"
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                Alertes
              </Link>
              <Link
                href="/admin/users"
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                Utilisateurs
              </Link>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
