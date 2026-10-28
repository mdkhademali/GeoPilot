import { useState } from 'react';
import { CopyButton, Field, Msg, Title } from '@/components/ui';
import { INDICES, SENSOR_BANDS, calculateIndex, type BandKey } from './indices';

export function IndexLab() {
  const [id, setId] = useState('ndvi');
  const [vals, setVals] = useState<Partial<Record<BandKey, string>>>({});
  const def = INDICES.find((i) => i.id === id)!;
  const any = def.bands.some((b) => vals[b] !== undefined && vals[b] !== '');
  const res = any ? calculateIndex(def, vals) : null;
  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Enter surface-reflectance values (already scaled). Calculated locally.">Spectral Index Laboratory</Title>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Index">
        {INDICES.map((i) => (
          <button key={i.id} role="tab" aria-selected={i.id === id} className={`gp-btn ${i.id === id ? 'gp-btn-primary' : ''}`} onClick={() => setId(i.id)}>
            {i.id.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="gp-card space-y-1">
        <div className="font-medium">{def.name}</div>
        <div className="font-mono text-[12px]">{def.formula}</div>
        <p>
          <span className="gp-muted">Applications: </span>
          {def.applications}
        </p>
        <p>
          <span className="gp-muted">Limitations: </span>
          {def.limitations}
        </p>
        <p>
          <span className="gp-muted">Reference: </span>
          {def.reference}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {def.bands.map((b) => (
          <Field key={b} label={`${b.toUpperCase()} (reflectance)`}>
            <input className="gp-input" inputMode="decimal" value={vals[b] ?? ''} onChange={(e) => setVals({ ...vals, [b]: e.target.value })} />
          </Field>
        ))}
      </div>
      {res &&
        (res.ok ? (
          <div className="gp-card flex items-center justify-between">
            <div>
              <div className="gp-label">{def.id.toUpperCase()}</div>
              <div className="text-lg font-semibold font-mono">{res.value.toFixed(6)}</div>
            </div>
            <CopyButton text={res.value.toFixed(6)} />
          </div>
        ) : (
          <Msg kind="error">{res.error}</Msg>
        ))}
      <Msg kind="info">Thresholds and interpretation are not universal; calibrate to your sensor, season and study area.</Msg>
      <details className="gp-card">
        <summary className="cursor-pointer font-medium">Sensor band mappings and preprocessing</summary>
        <div className="mt-2 space-y-2">
          {SENSOR_BANDS.map((s) => (
            <div key={s.sensor}>
              <div className="font-medium">{s.sensor}</div>
              <div className="font-mono text-[11px] gp-muted">
                Blue {s.blue} · Green {s.green} · Red {s.red} · NIR {s.nir} · SWIR1 {s.swir1} · SWIR2 {s.swir2}
              </div>
              <div className="gp-muted">{s.note}</div>
            </div>
          ))}
          <p className="gp-muted">
            Always apply the product’s scale factor and offset, mask clouds/shadows/snow, and use atmospherically corrected reflectance for comparisons across
            dates. Verify details in the official product documentation.
          </p>
        </div>
      </details>
    </section>
  );
}
