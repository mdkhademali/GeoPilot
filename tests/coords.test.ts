import { describe, it, expect } from 'vitest';
import { ddToDms, dmsToDd, latLonToUtm, utmToLatLon, parseDms, CoordError, utmZoneFor } from '@/features/coordinates/coords';

describe('coordinates', () => {
  it('DD to DMS and back', () => {
    const d = ddToDms(23.684, 'lat');
    expect(d).toMatchObject({ deg: 23, min: 41, hemi: 'N' });
    expect(d.sec).toBeCloseTo(2.4, 3);
    expect(dmsToDd(d)).toBeCloseTo(23.684, 8);
  });
  it('handles hemispheres', () => {
    expect(dmsToDd({ deg: 33, min: 52, sec: 0, hemi: 'S' })).toBeLessThan(0);
    expect(ddToDms(-0.5, 'lon').hemi).toBe('W');
  });
  it('rejects out-of-range values', () => {
    expect(() => ddToDms(91, 'lat')).toThrow(CoordError);
    expect(() => dmsToDd({ deg: 10, min: 60, sec: 0, hemi: 'N' })).toThrow(CoordError);
    expect(() => latLonToUtm(85, 0)).toThrow(CoordError);
  });
  it('parses DMS text', () => {
    expect(parseDms('23° 41′ 04.2″ N')).toEqual({ deg: 23, min: 41, sec: 4.2, hemi: 'N' });
    expect(() => parseDms('garbage')).toThrow(CoordError);
  });
  it('zone calculation', () => {
    expect(utmZoneFor(90)).toBe(46);
    expect(utmZoneFor(-180)).toBe(1);
    expect(utmZoneFor(180)).toBe(60);
  });
  // Reference: lon 0, lat 0 -> zone 31N, E 166021.443, N 0 (WGS84)
  it('matches reference UTM at equator', () => {
    const u = latLonToUtm(0, 0);
    expect(u.zone).toBe(31);
    expect(u.easting).toBeCloseTo(166021.443, 2);
    expect(u.northing).toBeCloseTo(0, 2);
  });
  // Reference: central meridian lon 3, lat 0 -> E 500000
  it('central meridian gives 500000 m easting', () => {
    expect(latLonToUtm(10, 3).easting).toBeCloseTo(500000, 3);
  });
  it('southern hemisphere false northing', () => {
    const u = latLonToUtm(-33.8688, 151.2093);
    expect(u.hemisphere).toBe('S');
    expect(u.zone).toBe(56);
    expect(u.northing).toBeGreaterThan(6_000_000);
  });
  it('round-trips within a millimetre scale', () => {
    const pts: [number, number][] = [
      [23.684, 90.4],
      [-33.8688, 151.2093],
      [64.1, -21.9],
      [-1.29, 36.82],
    ];
    for (const [lat, lon] of pts) {
      const back = utmToLatLon(latLonToUtm(lat, lon));
      expect(back.lat).toBeCloseTo(lat, 8);
      expect(back.lon).toBeCloseTo(lon, 8);
    }
  });
  it('validates UTM input', () => {
    expect(() => utmToLatLon({ zone: 0, hemisphere: 'N', easting: 500000, northing: 100 })).toThrow(CoordError);
    expect(() => utmToLatLon({ zone: 31, hemisphere: 'N', easting: 50, northing: 100 })).toThrow(CoordError);
  });
});
