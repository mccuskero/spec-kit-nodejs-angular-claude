import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Folder, MediaItem } from '../models/folder.model';
import { ContentItem, CreateFileRequest, UpdateFileRequest, BulkActionRequest } from '../models/content-item.model';
import { BreadcrumbItem, RepositoryLocation } from '../models/dashboard-state.model';

interface CreateFolderRequest {
  displayText: string;
  repository: RepositoryLocation;
  parentFolderId?: string;
}

interface FolderQueryResponse {
  folders: Folder[];
  totalCount: number;
}

interface ContentQueryResponse {
  items: ContentItem[];
  totalCount: number;
  totalSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly API_URL = environment.orchardApiUrl;
  private readonly MEDIA_API_URL = environment.orchardMediaApiUrl;
  private readonly GRAPHQL_URL = environment.orchardGraphQLUrl;
  private readonly MAX_BREADCRUMB_DEPTH = 10;

  constructor(private http: HttpClient) {}

  /**
   * Create a new folder in the specified repository
   * @param request Folder creation details
   * @returns Observable of created folder
   */
  createFolder(request: CreateFolderRequest): Observable<Folder> {
    const payload = {
      ContentType: 'Folder',
      DisplayText: request.displayText,
      Published: true,
      TaxonomyPart: {
        Repository: [request.repository]
      },
      ListPart: {},
      ...(request.parentFolderId && {
        ContainedPart: {
          ListContentItemId: request.parentFolderId,
          Order: 0
        }
      })
    };

    // Use /api/content endpoint (not /api/content/Folder) with ContentType in body
    return this.http.post<Folder>(this.API_URL, payload).pipe(
      catchError(error => {
        console.error('Error creating folder:', error);
        throw error;
      })
    );
  }

  /**
   * Query folders by repository and optional parent folder
   * @param repository Local or Shared repository
   * @param parentFolderId Optional parent folder ID to get subfolders
   * @returns Observable of folder query response
   */
  queryFolders(repository: RepositoryLocation, parentFolderId?: string): Observable<FolderQueryResponse> {
    // Use GraphQL 'folder' query - returns all folders, filter client-side
    const query = `
      query QueryFolders {
        folder {
          contentItemId
          displayText
          owner
          author
          createdUtc
          modifiedUtc
          published
        }
      }
    `;

    return this.http.post<{ data: { folder: Folder[] } }>(
      this.GRAPHQL_URL,
      { query }
    ).pipe(
      map(response => {
        let folders = response.data?.folder || [];

        // Client-side filtering for parent folder and repository
        if (parentFolderId) {
          folders = folders.filter(f =>
            (f as any).containedPart?.listContentItemId === parentFolderId
          );
        } else {
          // Filter for root folders (no parent)
          folders = folders.filter(f => !(f as any).containedPart?.listContentItemId);
        }

        return {
          folders,
          totalCount: folders.length
        };
      }),
      catchError(error => {
        console.error('Error querying folders:', error);
        return of({ folders: [], totalCount: 0 });
      })
    );
  }

  /**
   * Query content items within a folder
   * @param folderId Folder ID to query content from
   * @returns Observable of content query response
   */
  queryContent(folderId: string): Observable<ContentQueryResponse> {
    return this.getFolderById(folderId).pipe(
      map(folder => {
        if (!folder) {
          return { items: [], totalCount: 0, totalSize: 0 };
        }

        // Handle both camelCase (mediaItems) and PascalCase (MediaItems) from OrchardCore
        const mediaItems: MediaItem[] = folder.mediaItems || (folder as any).MediaItems || [];

        console.log('Folder data:', folder);
        console.log('MediaItems found:', mediaItems);

        if (mediaItems.length === 0) {
          return { items: [], totalCount: 0, totalSize: 0 };
        }

        // Transform MediaItems to ContentItem format
        const items: ContentItem[] = mediaItems.map((mediaItem, index) => ({
          contentItemId: mediaItem.path,
          contentType: 'MediaFile',
          displayText: mediaItem.name,
          owner: folder.owner || 'current-user',
          author: folder.author || folder.owner || 'current-user',
          createdUtc: mediaItem.createdUtc || new Date(),
          modifiedUtc: mediaItem.createdUtc || new Date(),
          published: true,
          containedPart: {
            listContentItemId: folderId,
            order: index
          },
          taxonomyPart: {
            repository: folder.taxonomyPart?.repository || 'Local'
          },
          contentSize: mediaItem.size,
          mimeType: mediaItem.mimeType,
          fileExtension: mediaItem.name?.split('.').pop() || '',
          mediaPath: mediaItem.path,
          mediaUrl: mediaItem.url
        }));

        // Calculate total size
        const totalSize = mediaItems.reduce((sum, item) => sum + (item.size || 0), 0);

        return { items, totalCount: items.length, totalSize };
      }),
      catchError(error => {
        console.error('Error querying content:', error);
        return of({ items: [], totalCount: 0, totalSize: 0 });
      })
    );
  }

  /**
   * Build breadcrumb trail by recursively fetching parent folders
   * @param folderId Starting folder ID
   * @param maxDepth Maximum depth to traverse (default 10)
   * @returns Observable of breadcrumb items array
   */
  buildBreadcrumb(folderId: string, maxDepth: number = this.MAX_BREADCRUMB_DEPTH): Observable<BreadcrumbItem[]> {
    return this.buildBreadcrumbRecursive(folderId, 0, maxDepth);
  }

  /**
   * Recursively build breadcrumb trail
   * @param folderId Current folder ID
   * @param currentLevel Current level in hierarchy
   * @param maxDepth Maximum depth to traverse
   * @returns Observable of breadcrumb items array
   */
  private buildBreadcrumbRecursive(
    folderId: string,
    currentLevel: number,
    maxDepth: number
  ): Observable<BreadcrumbItem[]> {
    return this.getFolderById(folderId).pipe(
      switchMap(folder => {
        if (!folder) {
          return of([]);
        }

        const currentItem: BreadcrumbItem = {
          contentItemId: folder.contentItemId,
          displayText: folder.displayText,
          level: currentLevel
        };

        // If no parent or max depth reached, return current item only
        if (!folder.containedPart?.listContentItemId || currentLevel >= maxDepth) {
          return of([currentItem]);
        }

        // Recursively get parent breadcrumbs
        return this.buildBreadcrumbRecursive(
          folder.containedPart.listContentItemId,
          currentLevel + 1,
          maxDepth
        ).pipe(
          map(parentBreadcrumbs => [...parentBreadcrumbs, currentItem])
        );
      }),
      catchError(error => {
        console.error('Error building breadcrumb:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a single folder by ID
   * @param folderId Folder content item ID
   * @returns Observable of folder
   */
  private getFolderById(folderId: string): Observable<Folder | null> {
    // Use REST API to get single item
    return this.http.get<Folder>(`${this.API_URL}/${folderId}`).pipe(
      map(folder => folder || null),
      catchError(error => {
        console.error('Error getting folder by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * Validate folder name
   * @param name Folder name to validate
   * @returns Validation result with error message if invalid
   */
  validateFolderName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Folder name is required' };
    }

    if (name.length > 255) {
      return { valid: false, error: 'Folder name must be 255 characters or less' };
    }

    const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNameRegex.test(name)) {
      return { valid: false, error: 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }

    return { valid: true };
  }

  /**
   * Check if folder depth limit is reached
   * @param breadcrumbPath Current breadcrumb path
   * @returns True if depth limit is reached
   */
  isMaxDepthReached(breadcrumbPath: BreadcrumbItem[]): boolean {
    return breadcrumbPath.length >= this.MAX_BREADCRUMB_DEPTH;
  }

  /**
   * Create a new file in the specified folder
   * @param request File creation details
   * @returns Observable of created file
   */
  createFile(request: CreateFileRequest): Observable<ContentItem> {
    const payload = {
      ContentType: request.contentType || 'File',
      DisplayText: request.displayText,
      Published: false, // Files start as draft
      TaxonomyPart: {
        Repository: [request.repository]
      },
      ContainedPart: {
        ListContentItemId: request.parentFolderId,
        Order: 0
      },
      ...(request.fileData && { FileData: request.fileData })
    };

    return this.http.post<ContentItem>(this.API_URL, payload).pipe(
      catchError(error => {
        console.error('Error creating file:', error);
        throw error;
      })
    );
  }

  /**
   * Upload a file with actual file data
   * @param file File to upload
   * @param displayText Display name for the file
   * @param repository Repository location
   * @param folderId Parent folder ID
   * @returns Observable of created content item
   */
  uploadFile(
    file: File,
    displayText: string,
    repository: RepositoryLocation,
    folderId: string
  ): Observable<ContentItem> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('path', folderId); // Upload to folder path

    // Use Media API endpoint directly (matches test-add-file.sh)
    console.log('Uploading to:', this.MEDIA_API_URL);
    return this.http.post<any>(this.MEDIA_API_URL, formData).pipe(
      switchMap(mediaResponse => {
        // Transform media response to ContentItem format
        const contentItem: ContentItem = {
          contentItemId: mediaResponse.path || `media-${Date.now()}`,
          contentType: 'MediaFile',
          displayText: displayText || mediaResponse.name,
          owner: 'current-user',
          author: 'current-user',
          createdUtc: new Date(mediaResponse.createdUtc || Date.now()),
          modifiedUtc: new Date(mediaResponse.createdUtc || Date.now()),
          published: false,
          containedPart: {
            listContentItemId: folderId,
            order: 0
          },
          taxonomyPart: {
            repository: repository
          },
          contentSize: mediaResponse.size || file.size,
          mimeType: mediaResponse.mimeType || file.type,
          fileExtension: mediaResponse.name?.split('.').pop() || '',
          mediaPath: mediaResponse.path,
          mediaUrl: mediaResponse.url
        };

        // Add media item to folder's MediaItems field
        const mediaItem = {
          path: mediaResponse.path,
          name: mediaResponse.name || file.name,
          url: mediaResponse.url,
          size: mediaResponse.size || file.size,
          mimeType: mediaResponse.mimeType || file.type,
          createdUtc: new Date(mediaResponse.createdUtc || Date.now())
        };

        return this.addMediaItemToFolder(folderId, mediaItem).pipe(
          map(() => contentItem)
        );
      }),
      catchError(error => {
        console.error('Error uploading file:', error);
        throw error;
      })
    );
  }

  /**
   * Add a media item to a folder's MediaItems field using 3-stage approach:
   * 1. Retrieve existing content item (folder) via GET
   * 2. Update the specific Media Field within the content item
   * 3. Send the complete updated content item back via POST (OrchardCore uses POST for updates)
   *
   * @param folderId Folder content item ID
   * @param mediaItem Media item to add
   * @returns Observable of updated folder
   */
  private addMediaItemToFolder(folderId: string, mediaItem: MediaItem): Observable<Folder> {
    // Step 1: Retrieve existing content item (folder) to ensure we have all current data
    // Note: OrchardCore uses /api/content/{id} not /api/contentitem/{id}
    // Use API_URL which points to localhost:8080 (OrchardCore backend)
    const contentItemUrl = `${this.API_URL}/${folderId}`;

    return this.http.get<any>(contentItemUrl).pipe(
      switchMap(contentItem => {
        if (!contentItem) {
          throw new Error(`Content item not found: ${folderId}`);
        }

        console.log('Step 1: Retrieved existing folder content item:', contentItem);

        // Step 2: Update the specific Media Field within the content item
        // OrchardCore may use different structures:
        // - MediaPart.MediaField.Paths (array of path strings)
        // - MediaItems (array of media item objects)
        if (contentItem.MediaPart?.MediaField) {
          // Structure: MediaPart.MediaField.Paths
          if (!contentItem.MediaPart.MediaField.Paths) {
            contentItem.MediaPart.MediaField.Paths = [];
          }
          contentItem.MediaPart.MediaField.Paths = [
            ...contentItem.MediaPart.MediaField.Paths,
            mediaItem.path
          ];
          console.log('Step 2: Updated MediaPart.MediaField.Paths:', contentItem.MediaPart.MediaField.Paths);
        } else if (contentItem.MediaItems) {
          // Structure: MediaItems array
          contentItem.MediaItems = [...contentItem.MediaItems, mediaItem];
          console.log('Step 2: Updated MediaItems field:', contentItem.MediaItems);
        } else {
          // Create new MediaItems field with the media item
          console.warn('MediaItems field not found. Creating a new one.');
          contentItem.MediaItems = [mediaItem];
          console.log('Step 2: Created new MediaItems field:', contentItem.MediaItems);
        }

        // Step 3: Send the complete updated content item back via POST
        // OrchardCore uses POST to /api/content for both create AND update
        // When ContentItemId is included in the body, it updates the existing item
        console.log('Step 3: Sending complete updated content item via POST to', this.API_URL);
        return this.http.post<Folder>(this.API_URL, contentItem).pipe(
          map(updatedFolder => {
            console.log('Step 3: Successfully updated content item via POST');
            return updatedFolder;
          }),
          catchError(error => {
            console.error('Error in Step 3 - POST request failed:', error);
            throw error;
          })
        );
      }),
      catchError(error => {
        console.error('Error in Step 1 - GET request failed:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing file
   * @param request File update details
   * @returns Observable of updated file
   */
  updateFile(request: UpdateFileRequest): Observable<ContentItem> {
    const payload: any = {};

    if (request.displayText !== undefined) {
      payload.DisplayText = request.displayText;
    }
    if (request.published !== undefined) {
      payload.Published = request.published;
    }
    if (request.fileData !== undefined) {
      payload.FileData = request.fileData;
    }

    return this.http.put<ContentItem>(
      `${this.API_URL}/${request.contentItemId}`,
      payload
    ).pipe(
      catchError(error => {
        console.error('Error updating file:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a file
   * @param contentItemId File ID to delete
   * @returns Observable of deletion result
   */
  deleteFile(contentItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${contentItemId}`).pipe(
      catchError(error => {
        console.error('Error deleting file:', error);
        throw error;
      })
    );
  }

  /**
   * Publish a file
   * @param contentItemId File ID to publish
   * @returns Observable of updated file
   */
  publishFile(contentItemId: string): Observable<ContentItem> {
    return this.updateFile({
      contentItemId,
      published: true
    });
  }

  /**
   * Unpublish a file
   * @param contentItemId File ID to unpublish
   * @returns Observable of updated file
   */
  unpublishFile(contentItemId: string): Observable<ContentItem> {
    return this.updateFile({
      contentItemId,
      published: false
    });
  }

  /**
   * Perform bulk action on multiple files
   * @param request Bulk action request
   * @returns Observable of action results
   */
  bulkAction(request: BulkActionRequest): Observable<any[]> {
    const actions: Observable<any>[] = request.contentItemIds.map(id => {
      switch (request.action) {
        case 'publish':
          return this.publishFile(id);
        case 'unpublish':
          return this.unpublishFile(id);
        case 'delete':
          return this.deleteFile(id);
        default:
          return of(null);
      }
    });

    return forkJoin(actions).pipe(
      catchError(error => {
        console.error('Error performing bulk action:', error);
        throw error;
      })
    );
  }

  /**
   * Get file size formatted as human-readable string
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number | undefined): string {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file type display name from MIME type or extension
   * @param mimeType File MIME type
   * @param extension File extension
   * @returns File type display name
   */
  getFileType(mimeType?: string, extension?: string): string {
    if (mimeType) {
      if (mimeType.startsWith('image/')) return 'Image';
      if (mimeType.startsWith('video/')) return 'Video';
      if (mimeType.startsWith('audio/')) return 'Audio';
      if (mimeType.includes('pdf')) return 'PDF';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
      if (mimeType.includes('text')) return 'Text';
    }

    if (extension) {
      const ext = extension.toLowerCase().replace('.', '');
      const typeMap: { [key: string]: string } = {
        'pdf': 'PDF',
        'doc': 'Document',
        'docx': 'Document',
        'xls': 'Spreadsheet',
        'xlsx': 'Spreadsheet',
        'ppt': 'Presentation',
        'pptx': 'Presentation',
        'jpg': 'Image',
        'jpeg': 'Image',
        'png': 'Image',
        'gif': 'Image',
        'svg': 'Image',
        'mp4': 'Video',
        'avi': 'Video',
        'mov': 'Video',
        'mp3': 'Audio',
        'wav': 'Audio',
        'txt': 'Text',
        'md': 'Markdown',
        'html': 'HTML',
        'css': 'CSS',
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'json': 'JSON',
        'xml': 'XML',
        'zip': 'Archive',
        'rar': 'Archive',
        '7z': 'Archive'
      };
      return typeMap[ext] || 'File';
    }

    return 'File';
  }
}
