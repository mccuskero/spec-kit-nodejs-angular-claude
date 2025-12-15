import { Injectable, signal, computed, effect } from '@angular/core';
import {
  DashboardState,
  NavigationSection,
  RepositoryLocation,
  UserPreferences,
  BreadcrumbItem
} from '../models/dashboard-state.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private readonly SESSION_STORAGE_KEY = 'dashboard_session';
  private readonly LOCAL_STORAGE_KEY = 'dashboard_preferences';

  private state = signal<DashboardState>(this.getInitialState());
  private preferences = signal<UserPreferences>(this.getInitialPreferences());

  currentSection = computed(() => this.state().currentSection);
  repositoryLocation = computed(() => this.state().repositoryLocation);
  breadcrumbPath = computed(() => this.state().breadcrumbPath);
  isLoading = computed(() => this.state().isLoading);
  sidebarCollapsed = computed(() => this.preferences().sidebarCollapsed);
  theme = computed(() => this.preferences().theme);
  contentViewMode = computed(() => this.preferences().contentViewMode);

  constructor() {
    effect(() => {
      this.persistState(this.state());
    });

    effect(() => {
      this.persistPreferences(this.preferences());
    });
  }

  setCurrentSection(section: NavigationSection): void {
    this.state.update(s => ({
      ...s,
      currentSection: section,
      breadcrumbPath: [],
      lastUpdated: new Date()
    }));
  }

  setRepositoryLocation(location: RepositoryLocation): void {
    this.state.update(s => ({
      ...s,
      repositoryLocation: location,
      breadcrumbPath: [],
      lastUpdated: new Date()
    }));
  }

  setBreadcrumbPath(path: BreadcrumbItem[]): void {
    this.state.update(s => ({
      ...s,
      breadcrumbPath: path,
      lastUpdated: new Date()
    }));
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({
      ...s,
      isLoading: loading,
      lastUpdated: new Date()
    }));
  }

  toggleSidebar(): void {
    this.preferences.update(p => ({
      ...p,
      sidebarCollapsed: !p.sidebarCollapsed
    }));
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.preferences.update(p => ({
      ...p,
      theme
    }));
  }

  setContentViewMode(mode: 'list' | 'grid'): void {
    this.preferences.update(p => ({
      ...p,
      contentViewMode: mode
    }));
  }

  private getInitialState(): DashboardState {
    const stored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        };
      } catch (e) {
        console.warn('Failed to parse stored dashboard state, using defaults');
      }
    }

    const prefs = this.getInitialPreferences();
    return {
      currentSection: prefs.defaultSection,
      repositoryLocation: prefs.defaultRepository,
      breadcrumbPath: [],
      isLoading: false,
      lastUpdated: new Date()
    };
  }

  private getInitialPreferences(): UserPreferences {
    const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored preferences, using defaults');
      }
    }

    return {
      theme: 'light',
      sidebarCollapsed: false,
      defaultRepository: 'Local',
      defaultSection: 'file',
      contentViewMode: 'list'
    };
  }

  private persistState(state: DashboardState): void {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist dashboard state', e);
    }
  }

  private persistPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to persist preferences', e);
    }
  }
}
