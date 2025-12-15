import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHeaderComponent } from './dashboard-header.component';

describe('DashboardHeaderComponent', () => {
  let component: DashboardHeaderComponent;
  let fixture: ComponentFixture<DashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display username', () => {
    const compiled = fixture.nativeElement;
    const usernameElement = compiled.querySelector('.username');
    expect(usernameElement).toBeTruthy();
    expect(usernameElement.textContent).toContain('admin');
  });

  it('should display user icon', () => {
    const compiled = fixture.nativeElement;
    const userIcon = compiled.querySelector('.user-icon svg');
    expect(userIcon).toBeTruthy();
  });

  it('should display logout button', () => {
    const compiled = fixture.nativeElement;
    const logoutButton = compiled.querySelector('.logout-button');
    expect(logoutButton).toBeTruthy();
    expect(logoutButton.textContent).toContain('Logout');
  });

  it('should emit logoutClicked event when logout button is clicked', (done) => {
    component.logoutClicked.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const compiled = fixture.nativeElement;
    const logoutButton = compiled.querySelector('.logout-button');
    logoutButton.click();
  });

  it('should have proper header structure', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('.dashboard-header');
    const headerLeft = compiled.querySelector('.header-left');
    const headerRight = compiled.querySelector('.header-right');

    expect(header).toBeTruthy();
    expect(headerLeft).toBeTruthy();
    expect(headerRight).toBeTruthy();
  });

  it('should have user info section with icon and username', () => {
    const compiled = fixture.nativeElement;
    const userInfo = compiled.querySelector('.user-info');
    const userIcon = userInfo.querySelector('.user-icon');
    const username = userInfo.querySelector('.username');

    expect(userInfo).toBeTruthy();
    expect(userIcon).toBeTruthy();
    expect(username).toBeTruthy();
  });
});
