import { describe, it, expect } from 'vitest';
import { defaultData, parseAppData, parseBackupText, serializeAppData, SCHEMA_VERSION } from '@/storage/schema';
import { filterBy, matches } from '@/utils/search';

describe('storage schema', () => {
  it('round-trips serialization', () => {
    const d = defaultData();
    d.items.push({ id: 'a', kind: 'note', title: 'Hello', tags: ['x'], favorite: true, createdAt: 1, updatedAt: 2 });
    const back = parseBackupText(serializeAppData(d));
    expect(back.items[0]).toMatchObject({ id: 'a', title: 'Hello', favorite: true, tags: ['x'] });
    expect(back.schemaVersion).toBe(SCHEMA_VERSION);
  });
  it('rejects invalid backups', () => {
    expect(() => parseBackupText('nope')).toThrow(/valid JSON/);
    expect(() => parseAppData([])).toThrow();
    expect(() => parseAppData({ schemaVersion: 1 })).toThrow(/items/);
    expect(() => parseAppData({ schemaVersion: 99, items: [] })).toThrow(/newer/);
  });
  it('sanitizes records and drops unsafe URLs', () => {
    const d = parseAppData({ schemaVersion: 1, items: [{ id: '1', title: 'T', url: 'javascript:alert(1)', kind: 'weird' }, { bad: true }, null] });
    expect(d.items).toHaveLength(1);
    expect(d.items[0]!.url).toBeUndefined();
    expect(d.items[0]!.kind).toBe('note');
  });
  it('migrates unversioned (v0) data', () => {
    expect(parseAppData({ items: [] }).schemaVersion).toBe(SCHEMA_VERSION);
  });
});

describe('search', () => {
  it('AND-matches tokens, accent/case insensitive', () => {
    expect(matches('google EARTH', 'Google Earth Engine')).toBe(true);
    expect(matches('google qgis', 'Google Earth Engine')).toBe(false);
    expect(matches('cafe', 'Café')).toBe(true);
    expect(matches('', 'x')).toBe(true);
  });
  it('filters collections', () => {
    expect(filterBy([{ t: 'NDVI' }, { t: 'SAVI' }], 'ndvi', (x) => [x.t])).toHaveLength(1);
  });
});
