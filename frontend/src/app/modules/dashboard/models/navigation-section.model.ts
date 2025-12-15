import { NavigationSection } from './dashboard-state.model';

export interface NavigationMenuItem {
  id: NavigationSection;
  label: string;
  icon: string;
  route: string;
  order: number;
}

export const NAVIGATION_ITEMS: NavigationMenuItem[] = [
  {
    id: 'shared-blog',
    label: 'Shared Blog',
    icon: 'blog',
    route: '/dashboard/shared-blog',
    order: 1
  },
  {
    id: 'file',
    label: 'File',
    icon: 'folder',
    route: '/dashboard/file',
    order: 2
  },
  {
    id: 'change-logs',
    label: 'Change Logs',
    icon: 'history',
    route: '/dashboard/change-logs',
    order: 3
  }
];
