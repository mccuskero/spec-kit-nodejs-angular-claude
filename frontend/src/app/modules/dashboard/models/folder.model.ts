import { RepositoryLocation } from './dashboard-state.model';

export interface ContainedPart {
  listContentItemId: string;
  order: number;
}

export interface ListPart {
  containedContentTypes: string[];
  enableOrdering: boolean;
}

export interface TaxonomyPart {
  repository: RepositoryLocation;
}

export interface MediaItem {
  path: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  createdUtc?: Date;
}

export interface Folder {
  contentItemId: string;
  displayText: string;
  owner: string;
  author?: string;
  createdUtc: Date;
  modifiedUtc: Date;
  published: boolean;
  containedPart: ContainedPart | null;
  listPart: ListPart;
  taxonomyPart: TaxonomyPart;
  mediaItems?: MediaItem[];
}
