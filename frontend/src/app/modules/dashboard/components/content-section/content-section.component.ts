import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { ContentService } from '../../services/content.service';
import { FolderDialogComponent, FolderDialogData } from '../folder-dialog/folder-dialog.component';
import { FolderListComponent } from '../folder-list/folder-list.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Folder } from '../../models/folder.model';
import { ContentItem } from '../../models/content-item.model';
import { BreadcrumbItem } from '../../models/dashboard-state.model';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [CommonModule, FolderDialogComponent, FolderListComponent, BreadcrumbComponent],
  templateUrl: './content-section.component.html',
  styleUrl: './content-section.component.scss'
})
export class ContentSectionComponent implements OnInit {
  private stateService = inject(DashboardStateService);
  private contentService = inject(ContentService);

  repositoryLocation = this.stateService.repositoryLocation;
  breadcrumbPath = this.stateService.breadcrumbPath;

  folders = signal<Folder[]>([]);
  items = signal<ContentItem[]>([]);
  isLoading = signal<boolean>(false);
  showFolderDialog = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  currentFolderId = computed(() => {
    const path = this.breadcrumbPath();
    return path.length > 0 ? path[path.length - 1].contentItemId : null;
  });

  canCreateFolder = computed(() => {
    return !this.contentService.isMaxDepthReached(this.breadcrumbPath());
  });

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const repository = this.repositoryLocation();
    const currentFolder = this.currentFolderId();

    this.contentService.queryFolders(repository, currentFolder || undefined).subscribe({
      next: (response) => {
        this.folders.set(response.folders);

        // If we're inside a folder, also load content items
        if (currentFolder) {
          this.contentService.queryContent(currentFolder).subscribe({
            next: (contentResponse) => {
              this.items.set(contentResponse.items);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Error loading content items:', error);
              this.items.set([]);
              this.isLoading.set(false);
            }
          });
        } else {
          this.items.set([]);
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading folders:', error);
        this.errorMessage.set('Failed to load folders. Please try again.');
        this.folders.set([]);
        this.items.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onCreateFolderClick(): void {
    if (!this.canCreateFolder()) {
      this.errorMessage.set('Maximum folder depth reached (10 levels)');
      return;
    }
    this.showFolderDialog.set(true);
  }

  onFolderCreated(data: FolderDialogData): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.contentService.createFolder({
      displayText: data.folderName,
      repository: data.repository,
      parentFolderId: data.parentFolderId
    }).subscribe({
      next: (newFolder) => {
        this.showFolderDialog.set(false);

        // Add the new folder to the current list
        const currentFolders = this.folders();
        this.folders.set([...currentFolders, newFolder]);

        this.isLoading.set(false);
        console.log('Folder created successfully:', newFolder);
      },
      error: (error) => {
        console.error('Error creating folder:', error);
        this.errorMessage.set('Failed to create folder. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onFolderDialogCancelled(): void {
    this.showFolderDialog.set(false);
  }

  onFolderClick(folder: Folder): void {
    // Create a simple breadcrumb item for the clicked folder
    const currentPath = this.breadcrumbPath();
    const newBreadcrumbItem: BreadcrumbItem = {
      contentItemId: folder.contentItemId,
      displayText: folder.displayText,
      level: currentPath.length
    };

    // Add to breadcrumb path
    this.stateService.setBreadcrumbPath([...currentPath, newBreadcrumbItem]);

    // Load content for this folder (will be empty in mock mode)
    this.loadContent();
  }

  onItemClick(item: ContentItem): void {
    // TODO: Implement content item viewing/editing
    console.log('Content item clicked:', item);
  }

  onBreadcrumbClick(item: BreadcrumbItem): void {
    // Navigate to the clicked breadcrumb level
    const currentPath = this.breadcrumbPath();
    const clickedIndex = currentPath.findIndex(b => b.contentItemId === item.contentItemId);

    if (clickedIndex !== -1) {
      const newPath = currentPath.slice(0, clickedIndex + 1);
      this.stateService.setBreadcrumbPath(newPath);
      this.loadContent();
    }
  }

  onHomeClick(): void {
    // Navigate to root (clear breadcrumb)
    this.stateService.setBreadcrumbPath([]);
    this.loadContent();
  }
}
