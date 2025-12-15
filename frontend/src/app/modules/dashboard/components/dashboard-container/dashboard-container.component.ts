import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DashboardHeaderComponent } from '../header/dashboard-header.component';
import { NavigationMenuComponent } from '../navigation-menu/navigation-menu.component';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardHeaderComponent, NavigationMenuComponent],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
  animations: [
    trigger('sidebarState', [
      state('expanded', style({
        width: '30%',
        minWidth: '280px'
      })),
      state('collapsed', style({
        width: '5%',
        minWidth: '60px'
      })),
      transition('expanded <=> collapsed', [
        animate('250ms ease-in-out')
      ])
    ]),
    trigger('workspaceState', [
      state('normal', style({
        width: '70%'
      })),
      state('expanded', style({
        width: '95%'
      })),
      transition('normal <=> expanded', [
        animate('250ms ease-in-out')
      ])
    ])
  ]
})
export class DashboardContainerComponent {
  private stateService = inject(DashboardStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = this.stateService.sidebarCollapsed;

  getSidebarState(): string {
    return this.sidebarCollapsed() ? 'collapsed' : 'expanded';
  }

  getWorkspaceState(): string {
    return this.sidebarCollapsed() ? 'expanded' : 'normal';
  }

  toggleSidebar(): void {
    this.stateService.toggleSidebar();
  }

  handleLogout(): void {
    // Clear authentication
    this.authService.logout();

    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
