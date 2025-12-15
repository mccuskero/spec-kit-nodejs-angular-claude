import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { NavigationSection, RepositoryLocation } from '../../models/dashboard-state.model';

interface NavigationItem {
  id: NavigationSection;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.scss'
})
export class NavigationMenuComponent {
  private stateService = inject(DashboardStateService);
  private router = inject(Router);

  currentSection = this.stateService.currentSection;
  repositoryLocation = this.stateService.repositoryLocation;
  sidebarCollapsed = this.stateService.sidebarCollapsed;

  navigationItems: NavigationItem[] = [
    {
      id: 'shared-blog',
      label: 'Shared Blog',
      icon: 'article',
      route: '/dashboard/shared-blog'
    },
    {
      id: 'file',
      label: 'File',
      icon: 'folder',
      route: '/dashboard/file'
    },
    {
      id: 'change-logs',
      label: 'Change Logs',
      icon: 'history',
      route: '/dashboard/change-logs'
    }
  ];

  navigateToSection(section: NavigationSection): void {
    this.stateService.setCurrentSection(section);
    const item = this.navigationItems.find(i => i.id === section);
    if (item) {
      this.router.navigate([item.route]);
    }
  }

  setRepositoryLocation(location: RepositoryLocation): void {
    this.stateService.setRepositoryLocation(location);
  }

  isActive(section: NavigationSection): boolean {
    return this.currentSection() === section;
  }
}
