import { TestBed } from '@angular/core/testing';
import { DashboardStateService } from './dashboard-state.service';
import { NavigationSection, RepositoryLocation } from '../models/dashboard-state.model';

describe('DashboardStateService', () => {
  let service: DashboardStateService;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardStateService);
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(service.currentSection()).toBe('content');
      expect(service.repositoryLocation()).toBe('Local');
      expect(service.breadcrumbPath()).toEqual([]);
      expect(service.isLoading()).toBe(false);
      expect(service.sidebarCollapsed()).toBe(false);
      expect(service.theme()).toBe('light');
      expect(service.contentViewMode()).toBe('list');
    });

    it('should restore state from session storage', () => {
      sessionStorage.clear();
      localStorage.clear();

      const storedState = {
        currentSection: 'shared-blog' as NavigationSection,
        repositoryLocation: 'Shared' as RepositoryLocation,
        breadcrumbPath: [],
        isLoading: false,
        lastUpdated: new Date().toISOString()
      };
      sessionStorage.setItem('dashboard_session', JSON.stringify(storedState));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(DashboardStateService);

      expect(newService.currentSection()).toBe('shared-blog');
      expect(newService.repositoryLocation()).toBe('Shared');
    });

    it('should restore preferences from local storage', () => {
      sessionStorage.clear();
      localStorage.clear();

      const storedPrefs = {
        theme: 'dark',
        sidebarCollapsed: true,
        defaultRepository: 'Shared',
        defaultSection: 'change-logs',
        contentViewMode: 'grid'
      };
      localStorage.setItem('dashboard_preferences', JSON.stringify(storedPrefs));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(DashboardStateService);

      expect(newService.theme()).toBe('dark');
      expect(newService.sidebarCollapsed()).toBe(true);
      expect(newService.contentViewMode()).toBe('grid');
    });

    it('should handle corrupted session storage gracefully', () => {
      sessionStorage.setItem('dashboard_session', 'invalid-json');
      const newService = TestBed.inject(DashboardStateService);
      expect(newService.currentSection()).toBe('content');
    });

    it('should handle corrupted local storage gracefully', () => {
      localStorage.setItem('dashboard_preferences', 'invalid-json');
      const newService = TestBed.inject(DashboardStateService);
      expect(newService.theme()).toBe('light');
    });
  });

  describe('State Updates', () => {
    it('should update current section', () => {
      service.setCurrentSection('shared-blog');
      expect(service.currentSection()).toBe('shared-blog');
    });

    it('should reset breadcrumb when changing section', () => {
      service.setBreadcrumbPath([{ contentItemId: 'test', displayText: 'Test', level: 0 }]);
      service.setCurrentSection('change-logs');
      expect(service.breadcrumbPath()).toEqual([]);
    });

    it('should update repository location', () => {
      service.setRepositoryLocation('Shared');
      expect(service.repositoryLocation()).toBe('Shared');
    });

    it('should reset breadcrumb when changing repository', () => {
      service.setBreadcrumbPath([{ contentItemId: 'test', displayText: 'Test', level: 0 }]);
      service.setRepositoryLocation('Shared');
      expect(service.breadcrumbPath()).toEqual([]);
    });

    it('should update breadcrumb path', () => {
      const breadcrumbs = [
        { contentItemId: 'root', displayText: 'Root', level: 0 },
        { contentItemId: 'sub', displayText: 'Subfolder', level: 1 }
      ];
      service.setBreadcrumbPath(breadcrumbs);
      expect(service.breadcrumbPath()).toEqual(breadcrumbs);
    });

    it('should update loading state', () => {
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Preferences Updates', () => {
    it('should toggle sidebar state', () => {
      expect(service.sidebarCollapsed()).toBe(false);
      service.toggleSidebar();
      expect(service.sidebarCollapsed()).toBe(true);
      service.toggleSidebar();
      expect(service.sidebarCollapsed()).toBe(false);
    });

    it('should update theme', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
      service.setTheme('light');
      expect(service.theme()).toBe('light');
    });

    it('should update content view mode', () => {
      service.setContentViewMode('grid');
      expect(service.contentViewMode()).toBe('grid');
      service.setContentViewMode('list');
      expect(service.contentViewMode()).toBe('list');
    });
  });

  describe('Persistence', () => {
    it('should persist state to session storage', (done) => {
      service.setCurrentSection('change-logs');

      setTimeout(() => {
        const stored = sessionStorage.getItem('dashboard_session');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.currentSection).toBe('change-logs');
        done();
      }, 50);
    });

    it('should persist preferences to local storage', (done) => {
      service.setTheme('dark');

      setTimeout(() => {
        const stored = localStorage.getItem('dashboard_preferences');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.theme).toBe('dark');
        done();
      }, 50);
    });

    it('should persist sidebar toggle to local storage', (done) => {
      service.toggleSidebar();

      setTimeout(() => {
        const stored = localStorage.getItem('dashboard_preferences');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.sidebarCollapsed).toBe(true);
        done();
      }, 50);
    });
  });

  describe('State Restoration', () => {
    it('should maintain state across service re-instantiation', () => {
      service.setCurrentSection('shared-blog');
      service.setRepositoryLocation('Shared');

      const newService = TestBed.inject(DashboardStateService);

      setTimeout(() => {
        expect(newService.currentSection()).toBe('shared-blog');
        expect(newService.repositoryLocation()).toBe('Shared');
      }, 50);
    });

    it('should maintain preferences across service re-instantiation', () => {
      service.setTheme('dark');
      service.toggleSidebar();

      setTimeout(() => {
        const newService = TestBed.inject(DashboardStateService);
        expect(newService.theme()).toBe('dark');
        expect(newService.sidebarCollapsed()).toBe(true);
      }, 50);
    });
  });
});
