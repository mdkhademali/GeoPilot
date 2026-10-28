import { describe, it, expect } from 'vitest';
import { toBibtex, toRis, toJsonBib, parseBibliography } from '@/features/citations/citations';
import { normalizeDoi, lookupDoi, mapCrossref, DoiError } from '@/services/crossref';
import type { CitationMeta } from '@/types';

const meta: CitationMeta = {
  title: 'Mapping floods',
  authors: [{ given: 'Ada', family: 'Lovelace' }],
  year: 2020,
  journal: 'Remote Sensing',
  doi: '10.1234/abc',
  source: 'user',
};

describe('citations', () => {
  it('exports BibTeX/RIS/JSON preserving fields', () => {
    const bib = toBibtex([meta]);
    expect(bib).toMatch(/Mapping floods/);
    expect(bib).toMatch(/Lovelace/);
    expect(bib).toMatch(/10\.1234\/abc/);
    expect(toRis([meta])).toMatch(/TY {2}- JOUR/);
    expect(JSON.parse(toJsonBib([meta]))[0].DOI).toBe('10.1234/abc');
  });
  it('round-trips BibTeX import', () => {
    const [back] = parseBibliography(toBibtex([meta]));
    expect(back).toMatchObject({ title: 'Mapping floods', year: 2020, doi: '10.1234/abc' });
    expect(back!.authors![0]!.family).toBe('Lovelace');
  });
  it('round-trips RIS import', () => {
    const [back] = parseBibliography(toRis([meta]));
    expect(back!.title).toBe('Mapping floods');
  });
  it('rejects garbage and empty input', () => {
    expect(() => parseBibliography('')).toThrow();
    expect(() => parseBibliography('this is not a bibliography')).toThrow();
  });
});

describe('crossref', () => {
  it('normalizes DOI forms', () => {
    expect(normalizeDoi('https://doi.org/10.1000/xyz123')).toBe('10.1000/xyz123');
    expect(normalizeDoi('doi: 10.1000/xyz123')).toBe('10.1000/xyz123');
    expect(() => normalizeDoi('abc')).toThrow(DoiError);
  });
  it('maps a response and flags provenance', async () => {
    const f = (async () =>
      new Response(
        JSON.stringify({
          message: {
            title: ['T'],
            author: [{ given: 'A', family: 'B' }],
            issued: { 'date-parts': [[2019]] },
            'container-title': ['J'],
            DOI: '10.1/x',
            abstract: '<jats:p>Hi</jats:p>',
          },
        }),
      )) as typeof fetch;
    const m = await lookupDoi('10.1000/abc', f);
    expect(m).toMatchObject({ title: 'T', year: 2019, journal: 'J', source: 'crossref', abstract: 'Hi' });
    expect(mapCrossref({}).source).toBe('crossref');
  });
  it('handles 404, 429, 500, network and bad JSON', async () => {
    const mk = (s: number) => (async () => new Response('{}', { status: s })) as typeof fetch;
    await expect(lookupDoi('10.1000/a', mk(404))).rejects.toThrow(/not found/);
    await expect(lookupDoi('10.1000/a', mk(429))).rejects.toThrow(/rate limit/);
    await expect(lookupDoi('10.1000/a', mk(500))).rejects.toThrow(/HTTP 500/);
    await expect(
      lookupDoi('10.1000/a', (async () => {
        throw new Error('x');
      }) as typeof fetch),
    ).rejects.toThrow(/Network/);
    await expect(lookupDoi('10.1000/a', (async () => new Response('<html>')) as typeof fetch)).rejects.toThrow(/unreadable/);
  });
});
