import { describe, it, expect } from 'vitest';
import { INDICES, calculateIndex } from '@/features/spectral-indices/indices';
const get = (id: string) => INDICES.find((i) => i.id === id)!;

describe('spectral indices', () => {
  it('NDVI known value', () => {
    const r = calculateIndex(get('ndvi'), { nir: 0.5, red: 0.1 });
    expect(r.ok && r.value).toBeCloseTo(0.6667, 4);
  });
  it('EVI known value', () => {
    const r = calculateIndex(get('evi'), { nir: 0.4, red: 0.1, blue: 0.05 });
    expect(r.ok && r.value).toBeCloseTo((2.5 * 0.3) / (0.4 + 0.6 - 0.375 + 1), 6);
  });
  it('SAVI, MNDWI, NDWI, NDBI, NBR, BSI compute', () => {
    expect(calculateIndex(get('savi'), { nir: 0.5, red: 0.1 })).toMatchObject({ ok: true });
    expect(calculateIndex(get('mndwi'), { green: 0.2, swir1: 0.1 })).toMatchObject({ ok: true });
    expect(calculateIndex(get('ndwi'), { green: 0.2, nir: 0.1 })).toMatchObject({ ok: true });
    expect(calculateIndex(get('ndbi'), { swir1: 0.3, nir: 0.2 })).toMatchObject({ ok: true });
    expect(calculateIndex(get('nbr'), { nir: 0.3, swir2: 0.1 })).toMatchObject({ ok: true });
    const b = calculateIndex(get('bsi'), { swir1: 0.3, red: 0.2, nir: 0.3, blue: 0.1 });
    expect(b.ok && b.value).toBeCloseTo(0.1 / 0.9, 6);
  });
  it('division by zero is an error, not Infinity', () => {
    expect(calculateIndex(get('ndvi'), { nir: 0, red: 0 })).toEqual({ ok: false, error: 'Undefined result: the denominator is zero.' });
    expect(calculateIndex(get('ndvi'), { nir: 0.3, red: -0.3 }).ok).toBe(false);
  });
  it('missing and invalid input', () => {
    expect(calculateIndex(get('ndvi'), { nir: 0.5 }).ok).toBe(false);
    expect(calculateIndex(get('ndvi'), { nir: 'abc', red: 1 }).ok).toBe(false);
    expect(calculateIndex(get('ndvi'), { nir: Infinity, red: 1 }).ok).toBe(false);
  });
});
