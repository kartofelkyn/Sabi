export interface NavItem {
  id: number;
  parentId: number | null;
  label: string;
  path: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}