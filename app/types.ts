export interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  cohort: string;
  location: string;
  tags: string[];
  crunchbaseLink: string;
  googleSearchLink: string;
  hasStartupsForRestOfUsContent?: boolean;
  startupsForRestOfUsSearchLink?: string | null;
  similarity?: number;
  embedding?: number[];
}

export interface SearchFilters {
  category?: string;
  cohort?: string;
  location?: string;
  showPodcastOnly?: boolean;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Company[];
  isLoading: boolean;
  sortBy: 'similarity' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface EmbeddingResponse {
  embedding: number[];
  error?: string;
}

export interface SimilarityResult {
  company: Company;
  similarity: number;
}

export type SortKey = keyof Company | 'similarity';
export type SortOrder = 'asc' | 'desc';

export interface TableColumn {
  key: SortKey;
  label: string;
  sortable?: boolean;
  width?: string;
}