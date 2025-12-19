import { ContainedPart, TaxonomyPart } from './folder.model';

export interface ContentItem {
  contentItemId: string;
  contentType: string;
  displayText: string;
  owner: string;
  author?: string;
  createdUtc: Date;
  modifiedUtc: Date;
  published: boolean;
  containedPart: ContainedPart;
  taxonomyPart: TaxonomyPart;
  contentSize?: number; // File size in bytes
  mimeType?: string; // File MIME type
  fileExtension?: string; // File extension
  mediaPath?: string; // Media file path
  mediaUrl?: string; // Media file URL
  [key: string]: any;
}

export interface CreateFileRequest {
  displayText: string;
  repository: string;
  parentFolderId: string;
  contentType?: string;
  fileData?: any; // File content/upload data
}

export interface UpdateFileRequest {
  contentItemId: string;
  displayText?: string;
  published?: boolean;
  fileData?: any;
}

export interface BulkActionRequest {
  contentItemIds: string[];
  action: 'publish' | 'unpublish' | 'delete';
}
