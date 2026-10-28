import type { CitationMeta } from '@/types';

export class DoiError extends Error {}
const DOI_RE = /^10\.\d{4,9}\/[^\s]+$/i;

export function normalizeDoi(input: string): string {
  const d = input
    .trim()
    .replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '');
  if (!DOI_RE.test(d)) throw new DoiError('That does not look like a valid DOI (expected format 10.xxxx/suffix).');
  return d;
}

interface CrossrefWork {
  title?: string[];
  author?: { given?: string; family?: string; name?: string }[];
  issued?: { 'date-parts'?: number[][] };
  'container-title'?: string[];
  DOI?: string;
  publisher?: string;
  abstract?: string;
  volume?: string;
  issue?: string;
  page?: string;
  URL?: string;
  type?: string;
}

export function mapCrossref(w: CrossrefWork): CitationMeta {
  return {
    title: w.title?.[0],
    authors: w.author?.map((a) => (a.name ? { literal: a.name } : { given: a.given, family: a.family })),
    year: w.issued?.['date-parts']?.[0]?.[0],
    journal: w['container-title']?.[0],
    doi: w.DOI,
    publisher: w.publisher,
    abstract: w.abstract?.replace(/<[^>]+>/g, '').trim(),
    volume: w.volume,
    issue: w.issue,
    pages: w.page,
    url: w.URL,
    type: w.type,
    source: 'crossref',
  };
}

export async function lookupDoi(input: string, fetchFn: typeof fetch = fetch): Promise<CitationMeta> {
  const doi = normalizeDoi(input);
  let res: Response;
  try {
    res = await fetchFn(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new DoiError('Network error: could not reach Crossref. Check your connection and try again.');
  }
  if (res.status === 404) throw new DoiError('DOI not found in Crossref.');
  if (res.status === 429) throw new DoiError('Crossref rate limit reached. Please wait a moment and retry.');
  if (!res.ok) throw new DoiError(`Crossref returned an error (HTTP ${res.status}).`);
  let json: { message?: CrossrefWork };
  try {
    json = (await res.json()) as { message?: CrossrefWork };
  } catch {
    throw new DoiError('Crossref returned an unreadable response.');
  }
  if (!json.message) throw new DoiError('Crossref returned no metadata for this DOI.');
  return mapCrossref(json.message);
}
