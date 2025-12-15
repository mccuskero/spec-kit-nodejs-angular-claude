import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardContainerComponent } from './dashboard-container.component';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardContainerComponent', () => {
  let component: DashboardContainerComponent;
  let fixture: ComponentFixture<DashboardContainerComponent>;
  let stateService: DashboardStateService;

  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [
        DashboardContainerComponent,
        RouterModule.forRoot([]),
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardContainerComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(DashboardStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header component', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('app-dashboard-header');
    expect(header).toBeTruthy();
  });

  it('should render navigation sidebar', () => {
    const compiled = fixture.nativeElement;
    const sidebar = compiled.querySelector('.navigation-sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should render workspace', () => {
    const compiled = fixture.nativeElement;
    const workspace = compiled.querySelector('.workspace');
    expect(workspace).toBeTruthy();
  });

  it('should have expanded sidebar state by default', () => {
    expect(component.getSidebarState()).toBe('expanded');
    expect(component.getWorkspaceState()).toBe('normal');
  });

  it('should toggle sidebar when toggle button is clicked', () => {
    const compiled = fixture.nativeElement;
    const toggleButton = compiled.querySelector('.toggle-button');

    expect(component.sidebarCollapsed()).toBe(false);

    toggleButton.click();
    fixture.detectChanges();

    expect(component.sidebarCollapsed()).toBe(true);
    expect(component.getSidebarState()).toBe('collapsed');
    expect(component.getWorkspaceState()).toBe('expanded');
  });

  it('should persist sidebar state to localStorage', (done) => {
    const compiled = fixture.nativeElement;
    const toggleButton = compiled.querySelector('.toggle-button');

    toggleButton.click();
    fixture.detectChanges();

    setTimeout(() => {
      const stored = localStorage.getItem('dashboard_preferences');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.sidebarCollapsed).toBe(true);
      done();
    }, 100);
  });

  it('should restore sidebar state from localStorage', (done) => {
    localStorage.setItem('dashboard_preferences', JSON.stringify({
      theme: 'light',
      sidebarCollapsed: true,
      defaultRepository: 'Local',
      defaultSection: 'content',
      contentViewMode: 'list'
    }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        DashboardContainerComponent,
        RouterModule.forRoot([]),
        BrowserAnimationsModule
      ]
    });

    const newFixture = TestBed.createComponent(DashboardContainerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    setTimeout(() => {
      expect(newComponent.sidebarCollapsed()).toBe(true);
      expect(newComponent.getSidebarState()).toBe('collapsed');
      done();
    }, 50);
  });

  it('should handle logout event from header', () => {
    spyOn(console, 'log');
    component.handleLogout();
    expect(console.log).toHaveBeenCalledWith('Logout clicked');
  });
});
