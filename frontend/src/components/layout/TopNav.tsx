"use client";

import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import type { NavItem } from "@/types/navigation/NavItem";

export default function TopNav({
  navItems,
}: {
  navItems: NavItem[];
}) {
  const pathname = usePathname();

  const currentItem = navItems.find(
    (item) => item.path === pathname
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-topbar px-6">
      <div>
        <h1 className="text-xl font-semibold">
          {currentItem?.label ?? "Sabi"}
        </h1>

        <p className="text-xs text-muted-foreground">
          {currentItem?.description ?? ""}
        </p>
      </div>

      <ThemeSwitcher />
    </header>
  );
}