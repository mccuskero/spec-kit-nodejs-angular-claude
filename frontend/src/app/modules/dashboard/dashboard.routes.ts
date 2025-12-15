import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard-container/dashboard-container.component')
      .then(m => m.DashboardContainerComponent),
    children: [
      {
        path: 'shared-blog',
        loadComponent: () => import('./components/workspace/workspace.component')
          .then(m => m.WorkspaceComponent)
      },
      {
        path: 'file',
        loadComponent: () => import('./components/workspace/workspace.component')
          .then(m => m.WorkspaceComponent)
      },
      {
        path: 'change-logs',
        loadComponent: () => import('./components/workspace/workspace.component')
          .then(m => m.WorkspaceComponent)
      },
      {
        path: '',
        redirectTo: 'file',
        pathMatch: 'full'
      }
    ]
  }
];
