import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { ContentService } from '../../services/content.service';
import { FolderDialogComponent, FolderDialogData } from '../folder-dialog/folder-dialog.component';
import { FileUploadDialogComponent, FileUploadData } from '../file-upload-dialog/file-upload-dialog.component';
import { FolderListComponent, ListItem, ActionType } from '../folder-list/folder-list.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Folder } from '../../models/folder.model';
import { ContentItem } from '../../models/content-item.model';
import { BreadcrumbItem } from '../../models/dashboard-state.model';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [CommonModule, FolderDialogComponent, FileUploadDialogComponent, FolderListComponent, BreadcrumbComponent],
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
  totalSize = signal<number>(0);
  isLoading = signal<boolean>(false);
  showFolderDialog = signal<boolean>(false);
  showFileDialog = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  currentFolderId = computed(() => {
    const path = this.breadcrumbPath();
    return path.length > 0 ? path[path.length - 1].contentItemId : null;
  });

  isInsideFolder = computed(() => {
    return this.breadcrumbPath().length > 0;
  });

  canCreateFolder = computed(() => {
    return !this.contentService.isMaxDepthReached(this.breadcrumbPath());
  });

  // Show "+ File" button only after at least one folder exists and we're inside a folder
  showFileButton = computed(() => {
    // Check if we're inside a folder (breadcrumb path has items)
    return this.breadcrumbPath().length > 0;
  });

  canCreateFile = computed(() => {
    // Can create file when inside a folder
    return this.currentFolderId() !== null;
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
              this.totalSize.set(contentResponse.totalSize || 0);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Error loading content items:', error);
              this.items.set([]);
              this.totalSize.set(0);
              this.isLoading.set(false);
            }
          });
        } else {
          this.items.set([]);
          this.totalSize.set(0);
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

  onCreateFileClick(): void {
    if (!this.canCreateFile()) {
      this.errorMessage.set('You must be inside a folder to create files');
      return;
    }
    this.showFileDialog.set(true);
  }

  onFileUploaded(data: FileUploadData): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.contentService.uploadFile(
      data.file,
      data.displayText,
      data.repository,
      data.folderId
    ).subscribe({
      next: (uploadedFile) => {
        this.showFileDialog.set(false);
        this.isLoading.set(false);

        // Reload content to show the newly uploaded file
        this.loadContent();

        console.log('File uploaded successfully:', uploadedFile);
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.errorMessage.set('Failed to upload file. Please try again.');
        this.showFileDialog.set(false);
        this.isLoading.set(false);
      }
    });
  }

  onFileDialogCancelled(): void {
    this.showFileDialog.set(false);
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

  onActionPerformed(event: { action: ActionType; items: ListItem[] }): void {
    const { action, items } = event;

    switch (action) {
      case 'edit':
        this.handleEdit(items[0]);
        break;
      case 'publish':
        this.handlePublish(items);
        break;
      case 'unpublish':
        this.handleUnpublish(items);
        break;
      case 'delete':
        this.handleDelete(items);
        break;
    }
  }

  private handleEdit(item: ListItem): void {
    // TODO: Implement edit dialog
    console.log('Edit item:', item);
    this.errorMessage.set('Edit functionality coming soon');
  }

  private handlePublish(items: ListItem[]): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const contentItemIds = items.map(item => item.contentItemId);

    this.contentService.bulkAction({
      action: 'publish',
      contentItemIds
    }).subscribe({
      next: () => {
        console.log('Items published successfully');
        this.loadContent();
      },
      error: (error) => {
        console.error('Error publishing items:', error);
        this.errorMessage.set('Failed to publish items. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private handleUnpublish(items: ListItem[]): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const contentItemIds = items.map(item => item.contentItemId);

    this.contentService.bulkAction({
      action: 'unpublish',
      contentItemIds
    }).subscribe({
      next: () => {
        console.log('Items unpublished successfully');
        this.loadContent();
      },
      error: (error) => {
        console.error('Error unpublishing items:', error);
        this.errorMessage.set('Failed to unpublish items. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private handleDelete(items: ListItem[]): void {
    // Confirm before deleting
    const confirmMessage = items.length === 1
      ? `Are you sure you want to delete "${items[0].displayText}"?`
      : `Are you sure you want to delete ${items.length} items?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const contentItemIds = items.map(item => item.contentItemId);

    this.contentService.bulkAction({
      action: 'delete',
      contentItemIds
    }).subscribe({
      next: () => {
        console.log('Items deleted successfully');
        this.loadContent();
      },
      error: (error) => {
        console.error('Error deleting items:', error);
        this.errorMessage.set('Failed to delete items. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
