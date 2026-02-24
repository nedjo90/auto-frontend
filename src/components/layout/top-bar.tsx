"use client";

import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:h-16 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h2 className="text-base font-semibold sm:text-lg">Tableau de bord</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
