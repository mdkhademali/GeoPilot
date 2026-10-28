import proj4 from 'proj4';

export interface LatLon {
  lat: number;
  lon: number;
}
export interface Dms {
  deg: number;
  min: number;
  sec: number;
  hemi: 'N' | 'S' | 'E' | 'W';
}
export interface Utm {
  zone: number;
  hemisphere: 'N' | 'S';
  easting: number;
  northing: number;
}

export class CoordError extends Error {}

export function validateLatLon(lat: number, lon: number): void {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new CoordError('Latitude and longitude must be finite numbers.');
  if (lat < -90 || lat > 90) throw new CoordError('Latitude must be between -90 and 90 degrees.');
  if (lon < -180 || lon > 180) throw new CoordError('Longitude must be between -180 and 180 degrees.');
}

export function ddToDms(value: number, axis: 'lat' | 'lon'): Dms {
  if (!Number.isFinite(value)) throw new CoordError('Value must be a finite number.');
  const max = axis === 'lat' ? 90 : 180;
  if (Math.abs(value) > max) throw new CoordError(`${axis === 'lat' ? 'Latitude' : 'Longitude'} must be within ±${max}°.`);
  const hemi = axis === 'lat' ? (value < 0 ? 'S' : 'N') : value < 0 ? 'W' : 'E';
  const abs = Math.abs(value);
  let deg = Math.floor(abs);
  let min = Math.floor((abs - deg) * 60);
  let sec = Math.round(((abs - deg) * 60 - min) * 60 * 1e6) / 1e6;
  if (sec >= 60) {
    sec -= 60;
    min += 1;
  }
  if (min >= 60) {
    min -= 60;
    deg += 1;
  }
  return { deg, min, sec, hemi };
}

export function dmsToDd(d: Dms): number {
  const { deg, min, sec, hemi } = d;
  if (![deg, min, sec].every(Number.isFinite)) throw new CoordError('DMS parts must be finite numbers.');
  if (deg < 0 || min < 0 || sec < 0) throw new CoordError('Use the hemisphere letter instead of negative DMS parts.');
  if (min >= 60 || sec >= 60) throw new CoordError('Minutes and seconds must be below 60.');
  const dd = deg + min / 60 + sec / 3600;
  const isLat = hemi === 'N' || hemi === 'S';
  if (dd > (isLat ? 90 : 180)) throw new CoordError(`${isLat ? 'Latitude' : 'Longitude'} out of range.`);
  return hemi === 'S' || hemi === 'W' ? -dd : dd;
}

export function formatDms(d: Dms, digits = 4): string {
  return `${d.deg}° ${d.min}′ ${d.sec.toFixed(digits)}″ ${d.hemi}`;
}

/** Parse e.g. 23° 41′ 04.2″ N, or "23 41 04.2 N". */
export function parseDms(text: string): Dms {
  const m = text.trim().match(/^(\d+(?:\.\d+)?)\s*[°\s]\s*(\d+(?:\.\d+)?)?\s*['′\s]?\s*(\d+(?:\.\d+)?)?\s*["″]?\s*([NSEW])$/i);
  if (!m) throw new CoordError('Could not parse DMS. Example: 23° 41′ 04.2″ N');
  return { deg: Number(m[1]), min: Number(m[2] ?? 0), sec: Number(m[3] ?? 0), hemi: m[4]!.toUpperCase() as Dms['hemi'] };
}

export function utmZoneFor(lon: number): number {
  return Math.min(60, Math.max(1, Math.floor((lon + 180) / 6) + 1));
}

function utmDef(zone: number, hemi: 'N' | 'S'): string {
  return `+proj=utm +zone=${zone} ${hemi === 'S' ? '+south ' : ''}+datum=WGS84 +units=m +no_defs`;
}

export function latLonToUtm(lat: number, lon: number): Utm {
  validateLatLon(lat, lon);
  if (lat < -80 || lat > 84) throw new CoordError('UTM is defined for latitudes between 80°S and 84°N. Use UPS near the poles.');
  const zone = utmZoneFor(lon);
  const hemisphere = lat < 0 ? 'S' : 'N';
  const [easting, northing] = proj4('EPSG:4326', utmDef(zone, hemisphere), [lon, lat]) as [number, number];
  return { zone, hemisphere, easting, northing };
}

export function utmToLatLon(u: Utm): LatLon {
  if (!Number.isInteger(u.zone) || u.zone < 1 || u.zone > 60) throw new CoordError('UTM zone must be an integer from 1 to 60.');
  if (u.hemisphere !== 'N' && u.hemisphere !== 'S') throw new CoordError('Hemisphere must be N or S.');
  if (!Number.isFinite(u.easting) || !Number.isFinite(u.northing)) throw new CoordError('Easting and northing must be numbers.');
  if (u.easting < 100000 || u.easting > 900000) throw new CoordError('Easting should be within 100,000–900,000 m.');
  if (u.northing < 0 || u.northing > 10000000) throw new CoordError('Northing must be within 0–10,000,000 m.');
  const [lon, lat] = proj4(utmDef(u.zone, u.hemisphere), 'EPSG:4326', [u.easting, u.northing]) as [number, number];
  validateLatLon(lat, lon);
  return { lat, lon };
}
