"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types/navigation/NavItem";

interface SidebarProps {
    navItems: NavItem[];
}
export default function SideBar({ navItems }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="sidebar hidden w-50 shrink-0 bg-sidebar text-sidebar-foreground md:block">
            <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`rounded-md px-3 py-2 ${isActive ? "bg-accent font-medium" : "hover:bg-accent/50"
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}