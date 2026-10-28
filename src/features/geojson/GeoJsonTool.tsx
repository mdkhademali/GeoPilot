import { useMemo, useState } from 'react';
import { CopyButton, Msg, Title } from '@/components/ui';
import { downloadText } from '@/utils/misc';
import { analyzeGeoJson, formatJson, minifyJson } from './geojson';

export function GeoJsonTool() {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const report = useMemo(() => (text.trim() ? analyzeGeoJson(text) : null), [text]);
  const apply = (fn: (t: string) => string) => {
    try {
      setText(fn(text));
      setErr('');
    } catch {
      setErr('Cannot reformat: the input is not valid JSON.');
    }
  };
  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Processed locally. Input limit: 5 MB.">GeoJSON Toolkit</Title>
      <textarea
        className="gp-input font-mono h-40"
        spellCheck={false}
        aria-label="GeoJSON input"
        placeholder="Paste GeoJSON here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-1.5">
        <button className="gp-btn" onClick={() => apply(formatJson)}>
          Format
        </button>
        <button className="gp-btn" onClick={() => apply(minifyJson)}>
          Minify
        </button>
        <CopyButton text={text} />
        <button className="gp-btn" disabled={!text} onClick={() => downloadText('data.geojson', text, 'application/geo+json')}>
          Download
        </button>
        <button
          className="gp-btn"
          onClick={() =>
            setText(
              '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Dhaka"},"geometry":{"type":"Point","coordinates":[90.4125,23.8103]}}]}',
            )
          }
        >
          Example
        </button>
      </div>
      {err && <Msg kind="error">{err}</Msg>}
      {report && (
        <div className="gp-card space-y-1.5">
          <Msg kind={report.ok ? 'ok' : 'error'}>{report.ok ? 'Structure looks valid.' : `${report.errors.length} problem(s) found.`}</Msg>
          {report.rootType && (
            <p>
              <span className="gp-muted">Root: </span>
              {report.rootType} · <span className="gp-muted">Features: </span>
              {report.featureCount} · <span className="gp-muted">Null geometries: </span>
              {report.nullGeometries}
            </p>
          )}
          {Object.keys(report.geometryCounts).length > 0 && (
            <p>
              <span className="gp-muted">Geometries: </span>
              {Object.entries(report.geometryCounts)
                .map(([k, v]) => `${k} ×${v}`)
                .join(', ')}
            </p>
          )}
          {report.bbox && (
            <p className="font-mono text-[11px]">
              <span className="gp-muted font-sans">BBox: </span>
              {report.bbox.map((n) => n.toFixed(5)).join(', ')}
            </p>
          )}
          {report.errors.slice(0, 10).map((e, i) => (
            <p key={i} className="gp-err">
              • {e}
            </p>
          ))}
          {report.errors.length > 10 && <p className="gp-muted">…and {report.errors.length - 10} more.</p>}
          {report.warnings.map((w, i) => (
            <p key={i} className="gp-muted">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
