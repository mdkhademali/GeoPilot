import type { AppData, ResearchItem } from '@/types';

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'geopilot';
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

export const defaultData = (): AppData => ({
  schemaVersion: SCHEMA_VERSION,
  items: [],
  collections: [],
  favoriteTools: [],
  favoriteResources: [],
  recentTools: [],
  activity: [],
  settings: { theme: 'system', sidebarCollapsed: false },
});

const str = (v: unknown, max = 20000): string | undefined => (typeof v === 'string' ? v.slice(0, max) : undefined);
const strArr = (v: unknown, max = 200): string[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === 'string')
        .slice(0, max)
        .map((s) => s.slice(0, 200))
    : [];

function sanitizeItem(raw: unknown): ResearchItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = str(o.id, 100);
  const title = str(o.title, 1000);
  if (!id || title === undefined) return null;
  const kind = ['bookmark', 'note', 'selection', 'reference'].includes(o.kind as string) ? (o.kind as ResearchItem['kind']) : 'note';
  const url = str(o.url, 2048);
  const safeUrl = url && /^https?:\/\//i.test(url) ? url : undefined;
  const now = Date.now();
  const item: ResearchItem = {
    id,
    kind,
    title,
    url: safeUrl,
    note: str(o.note),
    selectedText: str(o.selectedText),
    tags: strArr(o.tags),
    collection: str(o.collection, 200),
    favorite: o.favorite === true,
    createdAt: typeof o.createdAt === 'number' ? o.createdAt : now,
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : now,
  };
  if (o.citation && typeof o.citation === 'object') {
    const c = o.citation as Record<string, unknown>;
    item.citation = {
      title: str(c.title, 1000),
      journal: str(c.journal, 500),
      doi: str(c.doi, 200),
      publisher: str(c.publisher, 500),
      abstract: str(c.abstract, 20000),
      url: str(c.url, 2048),
      volume: str(c.volume, 50),
      issue: str(c.issue, 50),
      pages: str(c.pages, 50),
      type: str(c.type, 50),
      year: typeof c.year === 'number' ? c.year : undefined,
      authors: Array.isArray(c.authors)
        ? c.authors
            .slice(0, 500)
            .filter((a) => a && typeof a === 'object')
            .map((a) => ({
              given: str((a as Record<string, unknown>).given, 200),
              family: str((a as Record<string, unknown>).family, 200),
              literal: str((a as Record<string, unknown>).literal, 400),
            }))
        : undefined,
      source: c.source === 'crossref' || c.source === 'page' ? c.source : 'user',
    };
  }
  if (o.pageMeta && typeof o.pageMeta === 'object') {
    const p = o.pageMeta as Record<string, unknown>;
    item.pageMeta = { description: str(p.description, 2000), author: str(p.author, 300), siteName: str(p.siteName, 300) };
  }
  return item;
}

/** Validates and migrates arbitrary stored/imported data. Throws on unusable input. */
export function parseAppData(input: unknown): AppData {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Backup must be a JSON object.');
  const o = input as Record<string, unknown>;
  const v = typeof o.schemaVersion === 'number' ? o.schemaVersion : 0;
  if (v > SCHEMA_VERSION) throw new Error(`Backup uses schema v${v}, newer than this version (v${SCHEMA_VERSION}).`);
  if (!Array.isArray(o.items)) throw new Error('Backup is missing the "items" array.');
  const d = defaultData();
  d.items = o.items.map(sanitizeItem).filter((x): x is ResearchItem => x !== null);
  d.collections = strArr(o.collections);
  d.favoriteTools = strArr(o.favoriteTools);
  d.favoriteResources = strArr(o.favoriteResources);
  d.recentTools = strArr(o.recentTools, 12);
  if (Array.isArray(o.activity))
    d.activity = o.activity
      .slice(0, 200)
      .filter((a) => a && typeof a === 'object' && typeof (a as Record<string, unknown>).label === 'string')
      .map((a) => {
        const r = a as Record<string, unknown>;
        return {
          id: str(r.id, 100) ?? String(Math.random()),
          type: str(r.type, 50) ?? 'event',
          label: str(r.label, 300)!,
          at: typeof r.at === 'number' ? r.at : Date.now(),
        };
      });
  if (o.settings && typeof o.settings === 'object') {
    const s = o.settings as Record<string, unknown>;
    if (s.theme === 'light' || s.theme === 'dark' || s.theme === 'system') d.settings.theme = s.theme;
    d.settings.sidebarCollapsed = s.sidebarCollapsed === true;
  }
  return d;
}

export function parseBackupText(text: string): AppData {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) throw new Error('Backup file is larger than the 10 MB limit.');
  let j: unknown;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error('Backup is not valid JSON.');
  }
  return parseAppData(j);
}

export const serializeAppData = (d: AppData): string => JSON.stringify({ ...d, exportedAt: new Date().toISOString(), app: 'GeoPilot' }, null, 2);
