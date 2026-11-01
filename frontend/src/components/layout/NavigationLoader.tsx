import { getNavItems } from "@/services/navigation.service";
import Sidebar from "./Sidebar";

export default async function NavigationLoader() {
  const navItems = await getNavItems();

  return <Sidebar navItems={navItems} />;
}