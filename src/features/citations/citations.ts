import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';
import type { CitationMeta, Creator } from '@/types';

void plugins;
type Csl = Record<string, unknown>;

export function toCsl(m: CitationMeta, id = 'ref'): Csl {
  const author = (m.authors ?? []).map((a: Creator) => (a.literal ? { literal: a.literal } : { given: a.given, family: a.family }));
  const csl: Csl = { id, type: m.type === 'book' ? 'book' : 'article-journal', title: m.title ?? 'Untitled' };
  if (author.length) csl.author = author;
  if (m.year) csl.issued = { 'date-parts': [[m.year]] };
  if (m.journal) csl['container-title'] = m.journal;
  if (m.doi) csl.DOI = m.doi;
  if (m.publisher) csl.publisher = m.publisher;
  if (m.volume) csl.volume = m.volume;
  if (m.issue) csl.issue = m.issue;
  if (m.pages) csl.page = m.pages;
  if (m.url) csl.URL = m.url;
  if (m.abstract) csl.abstract = m.abstract;
  return csl;
}

const keyFor = (m: CitationMeta, i: number): string => {
  const fam = (m.authors?.[0]?.family ?? m.authors?.[0]?.literal ?? 'ref').replace(/[^A-Za-z0-9]/g, '');
  return `${fam}${m.year ?? ''}${String.fromCharCode(97 + (i % 26))}`;
};

export const toBibtex = (items: CitationMeta[]): string => new Cite(items.map((m, i) => toCsl(m, keyFor(m, i)))).format('bibtex');
export const toRis = (items: CitationMeta[]): string => new Cite(items.map((m, i) => toCsl(m, keyFor(m, i)))).format('ris');
export const toJsonBib = (items: CitationMeta[]): string =>
  JSON.stringify(
    items.map((m, i) => toCsl(m, keyFor(m, i))),
    null,
    2,
  );

export function fromCsl(c: Csl): CitationMeta {
  const authors = Array.isArray(c.author)
    ? (c.author as Record<string, string>[]).map((a) => ({ given: a.given, family: a.family, literal: a.literal }))
    : undefined;
  const issued = c.issued as { 'date-parts'?: number[][] } | undefined;
  const year = issued?.['date-parts']?.[0]?.[0];
  const s = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);
  return {
    title: s(c.title),
    authors,
    year: typeof year === 'number' ? year : undefined,
    journal: s(c['container-title']),
    doi: s(c.DOI),
    publisher: s(c.publisher),
    volume: s(c.volume),
    issue: s(c.issue),
    pages: s(c.page),
    url: s(c.URL),
    abstract: s(c.abstract),
    type: s(c.type),
    source: 'user',
  };
}

export const MAX_BIB_CHARS = 2_000_000;
/** Parse BibTeX, RIS or CSL-JSON text. Throws a readable error on failure. */
export function parseBibliography(text: string): CitationMeta[] {
  if (!text.trim()) throw new Error('Nothing to import.');
  if (text.length > MAX_BIB_CHARS) throw new Error('Bibliography is too large to import.');
  let data: Csl[];
  try {
    data = new Cite(text).data as Csl[];
  } catch {
    throw new Error('Unsupported or malformed bibliography. Supported: BibTeX, RIS, CSL-JSON.');
  }
  const out = data.map(fromCsl).filter((m) => m.title);
  if (!out.length) throw new Error('No valid records with titles were found.');
  return out;
}
