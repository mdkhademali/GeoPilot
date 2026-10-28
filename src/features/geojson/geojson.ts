export const MAX_GEOJSON_BYTES = 5 * 1024 * 1024;
const GEOMS = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'] as const;
const TYPES = [...GEOMS, 'Feature', 'FeatureCollection'];

export interface GeoJsonReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  rootType?: string;
  featureCount: number;
  geometryCounts: Record<string, number>;
  bbox?: [number, number, number, number];
  nullGeometries: number;
}

export function analyzeGeoJson(text: string): GeoJsonReport {
  const r: GeoJsonReport = { ok: false, errors: [], warnings: [], featureCount: 0, geometryCounts: {}, nullGeometries: 0 };
  if (!text.trim()) {
    r.errors.push('Input is empty.');
    return r;
  }
  if (new Blob([text]).size > MAX_GEOJSON_BYTES) {
    r.errors.push('Input exceeds the 5 MB safety limit.');
    return r;
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    r.errors.push(`Invalid JSON: ${(e as Error).message}`);
    return r;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    r.errors.push('Root must be a JSON object.');
    return r;
  }
  const root = data as Record<string, unknown>;
  if (typeof root.type !== 'string' || !TYPES.includes(root.type)) {
    r.errors.push('Missing or unknown "type" member.');
    return r;
  }
  r.rootType = root.type;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let outOfRange = false;

  const pos = (c: unknown, path: string): void => {
    if (!Array.isArray(c) || c.length < 2 || !c.every((n) => typeof n === 'number' && Number.isFinite(n))) {
      r.errors.push(`${path}: position must be an array of at least two finite numbers.`);
      return;
    }
    const [x, y] = c as number[];
    if (x! < -180 || x! > 180 || y! < -90 || y! > 90) outOfRange = true;
    minX = Math.min(minX, x!);
    maxX = Math.max(maxX, x!);
    minY = Math.min(minY, y!);
    maxY = Math.max(maxY, y!);
  };
  const walk = (c: unknown, depth: number, path: string): void => {
    if (depth === 0) return pos(c, path);
    if (!Array.isArray(c)) {
      r.errors.push(`${path}: expected an array of coordinates.`);
      return;
    }
    c.forEach((x, i) => walk(x, depth - 1, `${path}[${i}]`));
  };
  const DEPTH: Record<string, number> = { Point: 0, MultiPoint: 1, LineString: 1, MultiLineString: 2, Polygon: 2, MultiPolygon: 3 };
  const geom = (g: unknown, path: string, level = 0): void => {
    if (g === null) {
      r.nullGeometries++;
      return;
    }
    if (level > 10) {
      r.errors.push(`${path}: geometry nesting too deep.`);
      return;
    }
    if (!g || typeof g !== 'object') {
      r.errors.push(`${path}: geometry must be an object or null.`);
      return;
    }
    const o = g as Record<string, unknown>;
    const t = o.type as string;
    if (!GEOMS.includes(t as (typeof GEOMS)[number])) {
      r.errors.push(`${path}: unknown geometry type "${String(t)}".`);
      return;
    }
    r.geometryCounts[t] = (r.geometryCounts[t] ?? 0) + 1;
    if (t === 'GeometryCollection') {
      if (!Array.isArray(o.geometries)) r.errors.push(`${path}: "geometries" must be an array.`);
      else o.geometries.forEach((x, i) => geom(x, `${path}.geometries[${i}]`, level + 1));
      return;
    }
    walk(o.coordinates, DEPTH[t]!, `${path}.coordinates`);
    if (t === 'Polygon' || t === 'MultiPolygon') {
      const rings = (t === 'Polygon' ? [o.coordinates] : ((o.coordinates as unknown[] | undefined) ?? [])) as unknown[];
      for (const poly of rings)
        for (const ring of (Array.isArray(poly) ? poly : []) as unknown[]) {
          if (Array.isArray(ring)) {
            if (ring.length < 4) r.errors.push(`${path}: polygon ring needs at least 4 positions.`);
            else if (JSON.stringify(ring[0]) !== JSON.stringify(ring[ring.length - 1])) r.errors.push(`${path}: polygon ring is not closed.`);
          }
        }
    }
  };
  const feature = (f: unknown, path: string): void => {
    if (!f || typeof f !== 'object' || (f as Record<string, unknown>).type !== 'Feature') {
      r.errors.push(`${path}: expected a Feature.`);
      return;
    }
    const o = f as Record<string, unknown>;
    r.featureCount++;
    if (!('geometry' in o)) r.errors.push(`${path}: missing "geometry" member.`);
    else geom(o.geometry, `${path}.geometry`);
    if (!('properties' in o)) r.warnings.push(`${path}: missing "properties" member.`);
  };

  if (root.type === 'FeatureCollection') {
    if (!Array.isArray(root.features)) r.errors.push('"features" must be an array.');
    else root.features.forEach((f, i) => feature(f, `features[${i}]`));
  } else if (root.type === 'Feature') feature(root, 'feature');
  else geom(root, 'geometry');

  if (outOfRange) r.warnings.push('Some coordinates fall outside lon ±180 / lat ±90; the data may be in a projected CRS (GeoJSON RFC 7946 requires WGS 84).');
  if ('crs' in root) r.warnings.push('"crs" member is not part of RFC 7946 and is ignored by most tools.');
  if (isFinite(minX)) r.bbox = [minX, minY, maxX, maxY];
  r.ok = r.errors.length === 0;
  r.warnings.push('Structural checks only; this is not a full OGC/RFC 7946 conformance validator.');
  return r;
}

export const formatJson = (text: string): string => JSON.stringify(JSON.parse(text), null, 2);
export const minifyJson = (text: string): string => JSON.stringify(JSON.parse(text));
