"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types/navigation/NavItem";
import { Menu, Settings, LogOut } from 'lucide-react';
import { DynamicIcon } from "lucide-react/dynamic";
import { useState } from "react";

interface SidebarProps {
    navItems: NavItem[];
}

export default function SideBar({ navItems }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <aside
            className={`sidebar hidden min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex 
                ${isCollapsed ? "w-20" : "w-56"
                }`}
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className={`main-menu flex shrink-0 flex-row pt-4 pb-3 px-3 items-center
                ${isCollapsed ? "justify-center" : "justify-start"}`}>
                <Menu />
                <span className={`ml-3 text-lg font-semibold ${isCollapsed ? "hidden" : "block"}`}>Main Menu</span>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-1.5 p-3 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            aria-current={isActive ? "page" : undefined}
                            className={`
                                flex flex-row gap-2 relative rounded-md px-3 py-1.5 text-sm transition-colors
                                ${isCollapsed ? "justify-center items-center" : "justify-start items-start"} 
                                ${isActive
                                    ? "bg-sidebar-active font-medium text-sidebar-active-foreground before:absolute before:left-[-12px] before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-sidebar-indicator before:content-['']"
                                    : "hover:bg-sidebar-hover hover:text-sidebar-active-foreground"
                                }`}
                        >
                            <DynamicIcon
                                name={(item.icon || "layout-dashboard") as React.ComponentProps<typeof DynamicIcon>["name"]}
                                size={18}
                            />
                            {!isCollapsed && (
                                <span>{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className={`footer flex flex-col shrink-0 gap-1 border-t border-sidebar-border p-3 text-xs text-muted-foreground mb-2
                ${isCollapsed ? "items-center" : "items-start"}`}>
                <Link
                    key="settings"
                    href="/settings"
                    className="relative items-center flex flex-row rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-hover hover:text-sidebar-active-foreground"
                >
                    <Settings size={18} />
                    {!isCollapsed && <span className="ml-2">Settings</span>}
                </Link>
                <Link
                    key="logout"
                    href="/logout"
                    className="relative items-center flex flex-row rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-hover hover:text-sidebar-active-foreground"
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span className="ml-2">Logout</span>}
                </Link>
                {!isCollapsed && (
                    <div className="mt-2 self-stretch text-center">
                        <span className="text-[9px] text-muted-foreground">
                            &copy; 2025 Sabi. All rights reserved.
                        </span>
                    </div>
                )}

            </div>
        </aside>
    );
}