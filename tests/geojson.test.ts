import { describe, it, expect } from 'vitest';
import { analyzeGeoJson, formatJson, minifyJson } from '@/features/geojson/geojson';

const fc = (g: unknown) => JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: g }] });
describe('geojson', () => {
  it('summarizes a valid collection', () => {
    const r = analyzeGeoJson(fc({ type: 'Point', coordinates: [90.4, 23.7] }));
    expect(r.ok).toBe(true);
    expect(r.featureCount).toBe(1);
    expect(r.geometryCounts.Point).toBe(1);
    expect(r.bbox).toEqual([90.4, 23.7, 90.4, 23.7]);
  });
  it('rejects malformed JSON, empty and non-objects', () => {
    expect(analyzeGeoJson('{').ok).toBe(false);
    expect(analyzeGeoJson('').errors[0]).toMatch(/empty/);
    expect(analyzeGeoJson('[1]').ok).toBe(false);
  });
  it('flags unknown types and bad positions', () => {
    expect(analyzeGeoJson('{"type":"Nope"}').ok).toBe(false);
    expect(analyzeGeoJson(fc({ type: 'Point', coordinates: ['a', 1] })).ok).toBe(false);
  });
  it('detects unclosed polygon rings', () => {
    const r = analyzeGeoJson(
      fc({
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        ],
      }),
    );
    expect(r.ok).toBe(false);
  });
  it('accepts a closed polygon and warns on projected coordinates', () => {
    const ok = analyzeGeoJson(
      fc({
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      }),
    );
    expect(ok.ok).toBe(true);
    const proj = analyzeGeoJson(fc({ type: 'Point', coordinates: [500000, 2600000] }));
    expect(proj.warnings.some((w) => /outside/.test(w))).toBe(true);
  });
  it('rejects oversized input', () => {
    expect(analyzeGeoJson('"' + 'x'.repeat(5 * 1024 * 1024 + 10) + '"').errors[0]).toMatch(/5 MB/);
  });
  it('format and minify', () => {
    expect(minifyJson('{ "a": 1 }')).toBe('{"a":1}');
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });
});
