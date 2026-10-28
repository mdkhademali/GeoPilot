import { useMemo, useState } from 'react';
import { CopyButton, Empty, Field, Title } from '@/components/ui';
import { SNIPPETS, SNIPPET_ATTRIBUTION } from '@/data/snippets';
import { useDebounce } from '@/hooks/useDebounce';
import { filterBy } from '@/utils/search';

export function SnippetsView() {
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('');
  const dq = useDebounce(q, 150);
  const langs = [...new Set(SNIPPETS.map((s) => s.language))];
  const list = useMemo(
    () =>
      filterBy(
        SNIPPETS.filter((s) => !lang || s.language === lang),
        dq,
        (s) => [s.title, s.topic, s.purpose, s.dependencies, s.language],
      ),
    [dq, lang],
  );
  return (
    <section className="space-y-3 gp-fade">
      <Title sub={SNIPPET_ATTRIBUTION}>Code &amp; Formula Library</Title>
      <div className="flex gap-2">
        <div className="flex-1">
          <Field label="Search">
            <input className="gp-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
        <Field label="Language">
          <select className="gp-input" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="">All</option>
            {langs.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
      {list.length === 0 ? (
        <Empty title="No snippets match" />
      ) : (
        list.map((s) => (
          <article key={s.id} className="gp-card space-y-1.5">
            <div className="flex justify-between gap-2">
              <div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="gp-muted">
                  {s.language} · {s.topic}
                </p>
              </div>
              <CopyButton text={s.code} />
            </div>
            <p>{s.purpose}</p>
            <pre className="overflow-x-auto rounded p-2 text-[11px] font-mono" style={{ background: 'var(--surface2)' }}>
              <code>{s.code}</code>
            </pre>
            <p className="gp-muted">
              <b>Dependencies:</b> {s.dependencies}
            </p>
            <p className="gp-muted">
              <b>Notes:</b> {s.notes}
            </p>
          </article>
        ))
      )}
    </section>
  );
}
