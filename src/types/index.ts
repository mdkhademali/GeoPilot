export type ItemKind = 'bookmark' | 'note' | 'selection' | 'reference';
export type Provenance = 'user' | 'page' | 'crossref';

export interface Creator {
  given?: string;
  family?: string;
  literal?: string;
}
export interface CitationMeta {
  title?: string;
  authors?: Creator[];
  year?: number;
  journal?: string;
  doi?: string;
  publisher?: string;
  abstract?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  type?: string;
  /** where the metadata came from: retrieved from Crossref vs typed by the user */
  source: Provenance;
}
export interface ResearchItem {
  id: string;
  kind: ItemKind;
  title: string;
  url?: string;
  note?: string;
  selectedText?: string;
  tags: string[];
  collection?: string;
  favorite: boolean;
  citation?: CitationMeta;
  pageMeta?: { description?: string; author?: string; siteName?: string };
  createdAt: number;
  updatedAt: number;
}
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
}
export interface ActivityEntry {
  id: string;
  type: string;
  label: string;
  at: number;
}
export interface AppData {
  schemaVersion: number;
  items: ResearchItem[];
  collections: string[];
  favoriteTools: string[];
  favoriteResources: string[];
  recentTools: string[];
  activity: ActivityEntry[];
  settings: Settings;
}
