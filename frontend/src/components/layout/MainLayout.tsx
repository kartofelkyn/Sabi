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
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={navItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav navItems={navItems} />

        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}