import PageContainer from "./PageContainer";
import SideBar from "./Sidebar";
import TopNav from "./TopNav";
import type { NavItem } from "@/types/navigation/NavItem";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}
export default function MainLayout({
  children,
  sidebar,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">

      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col">

        <TopNav />

        <PageContainer>
          {children}
        </PageContainer>

      </div>
    </div>
  );
}