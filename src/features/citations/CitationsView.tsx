import { useRef, useState } from 'react';
import { CopyButton, Msg, Title } from '@/components/ui';
import { useData } from '@/storage/DataContext';
import { downloadText } from '@/utils/misc';
import { parseBibliography, toBibtex, toJsonBib, toRis } from './citations';

export function CitationsView() {
  const { data, addItem } = useData();
  const refs = data.items.filter((i) => i.citation).map((i) => i.citation!);
  const [msg, setMsg] = useState<{ k: 'error' | 'ok'; t: string } | null>(null);
  const [paste, setPaste] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const exp = (name: string, fn: (m: typeof refs) => string, mime: string) => {
    try {
      downloadText(name, fn(refs), mime);
    } catch (e) {
      setMsg({ k: 'error', t: `Export failed: ${(e as Error).message}` });
    }
  };
  const doImport = async (text: string) => {
    try {
      const recs = parseBibliography(text);
      for (const m of recs)
        await addItem({ kind: 'reference', title: m.title ?? 'Untitled', url: m.doi ? `https://doi.org/${m.doi}` : m.url, citation: { ...m, source: 'user' } });
      setMsg({ k: 'ok', t: `Imported ${recs.length} record(s) as user-entered references.` });
      setPaste('');
    } catch (e) {
      setMsg({ k: 'error', t: (e as Error).message });
    }
  };
  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Exports use the references saved in your workspace.">Citation Utilities</Title>
      <div className="gp-card space-y-2">
        <p>{refs.length} reference(s) available.</p>
        <div className="flex flex-wrap gap-1.5">
          <button className="gp-btn" disabled={!refs.length} onClick={() => exp('references.bib', toBibtex, 'text/plain')}>
            Export BibTeX
          </button>
          <button className="gp-btn" disabled={!refs.length} onClick={() => exp('references.ris', toRis, 'text/plain')}>
            Export RIS
          </button>
          <button className="gp-btn" disabled={!refs.length} onClick={() => exp('references.json', toJsonBib, 'application/json')}>
            Export JSON
          </button>
          {refs.length > 0 && <CopyButton text={toBibtex(refs)} label="Copy BibTeX" />}
        </div>
      </div>
      <div className="gp-card space-y-2">
        <label className="gp-label" htmlFor="bib">
          Import BibTeX, RIS or CSL-JSON
        </label>
        <textarea id="bib" className="gp-input font-mono h-28" value={paste} onChange={(e) => setPaste(e.target.value)} />
        <div className="flex gap-1.5">
          <button className="gp-btn gp-btn-primary" disabled={!paste.trim()} onClick={() => void doImport(paste)}>
            Import pasted text
          </button>
          <button className="gp-btn" onClick={() => file.current?.click()}>
            Import file…
          </button>
          <input
            ref={file}
            type="file"
            accept=".bib,.ris,.json,.txt"
            hidden
            aria-label="Bibliography file"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await doImport(await f.text());
              e.target.value = '';
            }}
          />
        </div>
      </div>
      {msg && <Msg kind={msg.k}>{msg.t}</Msg>}
      <p className="gp-muted">
        Limitations: exports cover core bibliographic fields (title, authors, year, journal, DOI, publisher, volume, issue, pages, URL, abstract). Imported
        records are validated for a title but not verified against any external source.
      </p>
    </section>
  );
}
