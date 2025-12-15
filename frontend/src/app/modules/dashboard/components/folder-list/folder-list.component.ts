import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../models/folder.model';
import { ContentItem } from '../../models/content-item.model';
import { ContentService } from '../../services/content.service';

export type ListItem = Folder | ContentItem;
export type ActionType = 'edit' | 'publish' | 'unpublish' | 'delete';

@Component({
  selector: 'app-folder-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-list.component.html',
  styleUrl: './folder-list.component.scss'
})
export class FolderListComponent {
  private contentService = inject(ContentService);

  folders = input<Folder[]>([]);
  items = input<ContentItem[]>([]);
  isLoading = input<boolean>(false);
  emptyMessage = input<string>('No folders or items found');

  folderClicked = output<Folder>();
  itemClicked = output<ContentItem>();
  actionPerformed = output<{ action: ActionType; items: ListItem[] }>();

  // Selection state
  selectedItems = signal<Set<string>>(new Set());

  // Computed properties
  allItems = computed(() => {
    return [...this.folders(), ...this.items()];
  });

  hasSelection = computed(() => this.selectedItems().size > 0);

  allSelected = computed(() => {
    const all = this.allItems();
    return all.length > 0 && this.selectedItems().size === all.length;
  });

  someSelected = computed(() => {
    return this.hasSelection() && !this.allSelected();
  });

  onFolderClick(folder: Folder): void {
    this.folderClicked.emit(folder);
  }

  onItemClick(item: ContentItem): void {
    this.itemClicked.emit(item);
  }

  toggleSelectAll(): void {
    const all = this.allItems();
    if (this.allSelected()) {
      this.selectedItems.set(new Set());
    } else {
      this.selectedItems.set(new Set(all.map(item => item.contentItemId)));
    }
  }

  toggleSelect(itemId: string): void {
    const selected = new Set(this.selectedItems());
    if (selected.has(itemId)) {
      selected.delete(itemId);
    } else {
      selected.add(itemId);
    }
    this.selectedItems.set(selected);
  }

  isSelected(itemId: string): boolean {
    return this.selectedItems().has(itemId);
  }

  performAction(action: ActionType, item: ListItem): void {
    this.actionPerformed.emit({ action, items: [item] });
  }

  performBulkAction(action: ActionType): void {
    const selected = this.getSelectedItems();
    if (selected.length > 0) {
      this.actionPerformed.emit({ action, items: selected });
      this.selectedItems.set(new Set()); // Clear selection after action
    }
  }

  getSelectedItems(): ListItem[] {
    const all = this.allItems();
    return all.filter(item => this.selectedItems().has(item.contentItemId));
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileSize(item: ContentItem): string {
    return this.contentService.formatFileSize(item.contentSize);
  }

  getFileType(item: ContentItem | Folder): string {
    if ('listPart' in item) {
      return 'Folder';
    }
    const contentItem = item as ContentItem;
    return this.contentService.getFileType(contentItem.mimeType, contentItem.fileExtension);
  }

  getPublishedStatus(item: ListItem): string {
    return item.published ? 'Published' : 'Draft';
  }
}
