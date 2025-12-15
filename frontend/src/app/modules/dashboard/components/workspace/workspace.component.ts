import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { ContentSectionComponent } from '../content-section/content-section.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, ContentSectionComponent],
  template: `
    <div class="workspace-content">
      <div class="workspace-header">
        <h1>{{ getSectionTitle() }}</h1>
        <div class="repository-badge">
          <span class="badge">{{ repositoryLocation() }} Repository</span>
        </div>
      </div>

      <div class="workspace-body">
        @switch (currentSection()) {
          @case ('shared-blog') {
            <div class="section-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <h2>Shared Blog Posts</h2>
              <p>View and manage blog posts from the {{ repositoryLocation() }} repository.</p>
              <p class="coming-soon">Blog management coming soon...</p>
            </div>
          }
          @case ('file') {
            <app-content-section />
          }
          @case ('change-logs') {
            <div class="section-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              <h2>Change Logs</h2>
              <p>Track changes and updates from the {{ repositoryLocation() }} repository.</p>
              <p class="coming-soon">Change log tracking coming soon...</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .workspace-content {
      padding: 2rem;
      height: 100%;
      overflow-y: auto;
    }

    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e9ecef;
    }

    h1 {
      font-size: 1.875rem;
      font-weight: 600;
      color: #212529;
      margin: 0;
    }

    .repository-badge {
      .badge {
        display: inline-block;
        padding: 0.375rem 0.75rem;
        background: #007bff;
        color: white;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
      }
    }

    .workspace-body {
      padding: 1rem 0;
    }

    .section-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      background: #f8f9fa;
      border-radius: 0.5rem;
      min-height: 400px;

      svg {
        width: 80px;
        height: 80px;
        color: #adb5bd;
        margin-bottom: 1.5rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #495057;
        margin-bottom: 0.75rem;
      }

      p {
        color: #6c757d;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }

      .coming-soon {
        color: #adb5bd;
        font-style: italic;
        margin-top: 1rem;
      }
    }

    @media (max-width: 768px) {
      .workspace-content {
        padding: 1rem;
      }

      .workspace-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class WorkspaceComponent {
  private stateService = inject(DashboardStateService);
  private router = inject(Router);

  currentSection = this.stateService.currentSection;
  repositoryLocation = this.stateService.repositoryLocation;

  getSectionTitle(): string {
    const section = this.currentSection();
    switch (section) {
      case 'shared-blog':
        return 'Shared Blog';
      case 'file':
        return 'File';
      case 'change-logs':
        return 'Change Logs';
      default:
        return 'Dashboard';
    }
  }
}
