"use client";

import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import type { NavItem } from "@/types/navigation/NavItem";
import SearchBar from "@/components/common/SearchBar";
import ExportButton from "@/components/common/ExportButton";
import NotificationButton from "@/components/common/NotificationButton";
import ProfileContainer from "@/components/layout/UserProfile";
import UserProfile from "@/components/layout/UserProfile";

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
    <header className="grid grid-cols-[22%_63%_15%] h-16 items-center justify-between border-b border-border bg-topbar px-6">
      <div>
        <h1 className="text-xl font-semibold">
          {currentItem?.label ?? "Sabi"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {currentItem?.description ?? ""}
        </p>
      </div>
      <div className="flex flex-row gap-4 px-6 justify-between border-l border-border">
        <SearchBar className="w-100 h-9" />
        <div className="flex flex-row gap-2">
          <ExportButton />
          <NotificationButton />
          <ThemeSwitcher />
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-start border-l border-border pl-5 px-6">
        <UserProfile role="Admin" name="Warren Paul Quiambao" />
      </div>
    </header>
  );
}