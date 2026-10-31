import PageContainer from "./PageContainer";
import SideBar from "./Sidebar";
import TopNav from "./TopNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">

      {/* Left sidebar */}
      <SideBar />

      {/* Right section */}
      <div className="flex min-w-0 flex-1 flex-col">

        <TopNav />

        <PageContainer>
          {children}
        </PageContainer>

      </div>
    </div>
  );
}