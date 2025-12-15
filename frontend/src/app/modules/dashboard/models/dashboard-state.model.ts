export type NavigationSection = 'shared-blog' | 'file' | 'change-logs';
export type RepositoryLocation = 'Local' | 'Shared';
export type ThemeMode = 'light' | 'dark';

export interface BreadcrumbItem {
  contentItemId: string;
  displayText: string;
  level: number;
}

export interface DashboardState {
  currentSection: NavigationSection;
  repositoryLocation: RepositoryLocation;
  breadcrumbPath: BreadcrumbItem[];
  isLoading: boolean;
  lastUpdated: Date;
}

export interface UserPreferences {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  defaultRepository: RepositoryLocation;
  defaultSection: NavigationSection;
  contentViewMode: 'list' | 'grid';
}
