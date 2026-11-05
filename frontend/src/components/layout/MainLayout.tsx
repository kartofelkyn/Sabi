import PageContainer from "./PageContainer";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import type { NavItem } from "@/types/navigation/NavItem";

interface MainLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

export default function MainLayout({
  children,
  navItems,
}: MainLayoutProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar navItems={navItems} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav navItems={navItems} />

        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}