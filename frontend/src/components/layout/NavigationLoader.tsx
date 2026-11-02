import { getNavItems } from "@/services/navigation.service";
import MainLayout from "./MainLayout";

export default async function NavigationLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await getNavItems();

  return (
    <MainLayout navItems={navItems}>
      {children}
    </MainLayout>
  );
}