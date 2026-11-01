import { apiGet } from "@/lib/api";
import type { NavItem } from '../types/navigation/NavItem';

export async function getNavItems(): Promise<NavItem[]> 
{
    return apiGet<NavItem[]>('NavItem');
}
export async function getNavItemById(id: number): Promise<NavItem> {
  return apiGet<NavItem>(`/api/navitem/${id}`);
}