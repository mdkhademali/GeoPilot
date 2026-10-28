import { useMemo, useState } from 'react';
import { CopyButton, Field, Msg, Title } from '@/components/ui';
import { CoordError, ddToDms, dmsToDd, formatDms, latLonToUtm, parseDms, utmToLatLon, validateLatLon } from './coords';

type Mode = 'dd' | 'dms' | 'utm';
const EXAMPLES: { label: string; lat: string; lon: string }[] = [
  { label: 'Dhaka', lat: '23.8103', lon: '90.4125' },
  { label: 'Sydney', lat: '-33.8688', lon: '151.2093' },
];

export function CoordinateTool() {
  const [mode, setMode] = useState<Mode>('dd');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [latD, setLatD] = useState('');
  const [lonD, setLonD] = useState('');
  const [zone, setZone] = useState('');
  const [hemi, setHemi] = useState<'N' | 'S'>('N');
  const [e, setE] = useState('');
  const [n, setN] = useState('');

  const result = useMemo(() => {
    try {
      if (mode === 'dd') {
        if (lat === '' || lon === '') return null;
        const a = Number(lat),
          b = Number(lon);
        validateLatLon(a, b);
        const u = (() => {
          try {
            const x = latLonToUtm(a, b);
            return `${x.zone}${x.hemisphere}  E ${x.easting.toFixed(3)}  N ${x.northing.toFixed(3)}`;
          } catch (er) {
            return (er as Error).message;
          }
        })();
        return {
          lines: [
            ['DMS', `${formatDms(ddToDms(a, 'lat'))}, ${formatDms(ddToDms(b, 'lon'))}`],
            ['UTM (WGS 84)', u],
          ] as [string, string][],
        };
      }
      if (mode === 'dms') {
        if (!latD.trim() || !lonD.trim()) return null;
        const a = dmsToDd(parseDms(latD)),
          b = dmsToDd(parseDms(lonD));
        validateLatLon(a, b);
        return { lines: [['Decimal degrees', `${a.toFixed(8)}, ${b.toFixed(8)}`]] as [string, string][] };
      }
      if (!zone || !e || !n) return null;
      const p = utmToLatLon({ zone: Number(zone), hemisphere: hemi, easting: Number(e), northing: Number(n) });
      return {
        lines: [
          ['Decimal degrees', `${p.lat.toFixed(8)}, ${p.lon.toFixed(8)}`],
          ['DMS', `${formatDms(ddToDms(p.lat, 'lat'))}, ${formatDms(ddToDms(p.lon, 'lon'))}`],
        ] as [string, string][],
      };
    } catch (er) {
      return { error: er instanceof CoordError ? er.message : 'Invalid input.' };
    }
  }, [mode, lat, lon, latD, lonD, zone, hemi, e, n]);

  return (
    <section className="space-y-3 gp-fade">
      <Title sub="All calculations run locally (WGS 84).">Coordinate Converter</Title>
      <div role="tablist" aria-label="Conversion mode" className="flex gap-1">
        {(
          [
            ['dd', 'Decimal → DMS/UTM'],
            ['dms', 'DMS → Decimal'],
            ['utm', 'UTM → Lat/Lon'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={mode === k} className={`gp-btn ${mode === k ? 'gp-btn-primary' : ''}`} onClick={() => setMode(k)}>
            {l}
          </button>
        ))}
      </div>
      {mode === 'dd' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Latitude (−90…90)">
            <input className="gp-input" inputMode="decimal" value={lat} onChange={(x) => setLat(x.target.value)} />
          </Field>
          <Field label="Longitude (−180…180)">
            <input className="gp-input" inputMode="decimal" value={lon} onChange={(x) => setLon(x.target.value)} />
          </Field>
        </div>
      )}
      {mode === 'dms' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Latitude e.g. 23° 48′ 37.1″ N">
            <input className="gp-input" value={latD} onChange={(x) => setLatD(x.target.value)} />
          </Field>
          <Field label="Longitude e.g. 90° 24′ 45″ E">
            <input className="gp-input" value={lonD} onChange={(x) => setLonD(x.target.value)} />
          </Field>
        </div>
      )}
      {mode === 'utm' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Zone (1–60)">
            <input className="gp-input" inputMode="numeric" value={zone} onChange={(x) => setZone(x.target.value)} />
          </Field>
          <Field label="Hemisphere">
            <select className="gp-input" value={hemi} onChange={(x) => setHemi(x.target.value as 'N' | 'S')}>
              <option value="N">North</option>
              <option value="S">South</option>
            </select>
          </Field>
          <Field label="Easting (m)">
            <input className="gp-input" inputMode="decimal" value={e} onChange={(x) => setE(x.target.value)} />
          </Field>
          <Field label="Northing (m)">
            <input className="gp-input" inputMode="decimal" value={n} onChange={(x) => setN(x.target.value)} />
          </Field>
        </div>
      )}
      {mode === 'dd' && (
        <div className="flex gap-1 items-center">
          <span className="gp-muted">Examples:</span>
          {EXAMPLES.map((x) => (
            <button
              key={x.label}
              className="gp-btn"
              onClick={() => {
                setLat(x.lat);
                setLon(x.lon);
              }}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}
      {mode === 'utm' && (
        <button
          className="gp-btn"
          onClick={() => {
            setZone('46');
            setHemi('N');
            setE('239000');
            setN('2634000');
          }}
        >
          Example
        </button>
      )}
      {result && 'error' in result && result.error && <Msg kind="error">{result.error}</Msg>}
      {result && 'lines' in result && result.lines && (
        <div className="gp-card space-y-2">
          {result.lines.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-2">
              <div>
                <div className="gp-label">{k}</div>
                <div className="font-mono text-[12px] break-all">{v}</div>
              </div>
              <CopyButton text={v} />
            </div>
          ))}
        </div>
      )}
      <details className="gp-card">
        <summary className="cursor-pointer font-medium">Datum and CRS notes</summary>
        <p className="gp-muted mt-2">
          Geographic coordinates here use WGS 84 (EPSG:4326). UTM zones are 6° wide (EPSG:326xx north, 327xx south) with a false easting of 500,000 m and, in
          the southern hemisphere, a false northing of 10,000,000 m. UTM is defined for 80°S–84°N; polar regions use UPS. Coordinates in other datums (e.g.
          local national grids) must be transformed with a proper datum shift before using this tool.
        </p>
      </details>
    </section>
  );
}
