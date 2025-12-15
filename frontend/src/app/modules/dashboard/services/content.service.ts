import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Folder } from '../models/folder.model';
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
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly API_URL = environment.orchardApiUrl;
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
    // Use GraphQL 'folder' query (not 'contentItems')
    const query = `
      query QueryFolders {
        folder(first: 100) {
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

        // Client-side filtering for parent folder (GraphQL doesn't expose containedPart in where clause)
        if (parentFolderId) {
          folders = folders.filter(f =>
            (f as any).containedPart?.listContentItemId === parentFolderId
          );
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
    // For now, return empty as we don't have a GraphQL query for generic content items
    // Files will be queried separately when that content type is defined in Orchard Core
    // TODO: Add proper content query when File content type is configured
    return of({ items: [], totalCount: 0 });
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
