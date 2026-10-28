import { useMemo, useState } from 'react';
import { ExternalLink, Trash2, BookmarkPlus, Quote, Search } from 'lucide-react';
import { Empty, FavButton, Field, Msg, Title, CopyButton } from '@/components/ui';
import { useData } from '@/storage/DataContext';
import { capturePage } from '@/services/messaging';
import { lookupDoi } from '@/services/crossref';
import { useDebounce } from '@/hooks/useDebounce';
import { filterBy } from '@/utils/search';
import { fmtDate } from '@/utils/misc';
import { toBibtex } from '@/features/citations/citations';
import type { CitationMeta, ResearchItem } from '@/types';

const authorsStr = (c?: CitationMeta) => (c?.authors ?? []).map((a) => a.literal ?? [a.given, a.family].filter(Boolean).join(' ')).join(', ');

export function ResearchView() {
  const { data, addItem, updateItem, deleteItem, addCollection } = useData();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 200);
  const [tag, setTag] = useState('');
  const [col, setCol] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [msg, setMsg] = useState<{ k: 'error' | 'ok'; t: string } | null>(null);
  const [note, setNote] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [doi, setDoi] = useState('');
  const [busy, setBusy] = useState(false);
  const [fetched, setFetched] = useState<CitationMeta | null>(null);
  const [newCol, setNewCol] = useState('');

  const allTags = useMemo(() => [...new Set(data.items.flatMap((i) => i.tags))].sort(), [data.items]);
  const items = useMemo(
    () =>
      filterBy(
        data.items.filter((i) => (!tag || i.tags.includes(tag)) && (!col || i.collection === col) && (!favOnly || i.favorite)),
        dq,
        (i) => [i.title, i.url, i.note, i.selectedText, i.tags.join(' '), i.citation?.title, authorsStr(i.citation), i.citation?.doi],
      ),
    [data.items, dq, tag, col, favOnly],
  );

  const parseTags = (s: string) =>
    s
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  const savePage = async (withSel: boolean) => {
    try {
      const p = await capturePage();
      if (withSel && !p.selection.trim()) {
        setMsg({ k: 'error', t: 'No text is selected on the page.' });
        return;
      }
      await addItem({
        kind: withSel ? 'selection' : 'bookmark',
        title: p.title || p.url,
        url: p.url,
        selectedText: withSel ? p.selection : undefined,
        pageMeta: { description: p.description, author: p.author, siteName: p.siteName },
        collection: col || undefined,
      });
      setMsg({ k: 'ok', t: withSel ? 'Selection saved with its source.' : 'Page saved.' });
    } catch (e) {
      setMsg({ k: 'error', t: (e as Error).message });
    }
  };
  const saveNote = async () => {
    if (!note.trim()) return;
    await addItem({
      kind: 'note',
      title: note.trim().split('\n')[0]!.slice(0, 80),
      note: note.trim(),
      tags: parseTags(noteTags),
      collection: col || undefined,
    });
    setNote('');
    setNoteTags('');
    setMsg({ k: 'ok', t: 'Note saved.' });
  };
  const doLookup = async () => {
    setBusy(true);
    setMsg(null);
    setFetched(null);
    try {
      setFetched(await lookupDoi(doi));
    } catch (e) {
      setMsg({ k: 'error', t: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };
  const saveRef = async () => {
    if (!fetched) return;
    await addItem({
      kind: 'reference',
      title: fetched.title ?? fetched.doi ?? 'Untitled',
      url: fetched.doi ? `https://doi.org/${fetched.doi}` : undefined,
      citation: fetched,
      collection: col || undefined,
    });
    setFetched(null);
    setDoi('');
    setMsg({ k: 'ok', t: 'Reference saved.' });
  };

  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Everything is stored on this device only.">Research Companion</Title>
      <div className="flex flex-wrap gap-1.5">
        <button className="gp-btn gp-btn-primary" onClick={() => void savePage(false)}>
          <BookmarkPlus size={13} />
          Save current page
        </button>
        <button className="gp-btn" onClick={() => void savePage(true)}>
          <Quote size={13} />
          Save selected text
        </button>
      </div>
      <div className="gp-card space-y-2">
        <Field label="Quick note">
          <textarea className="gp-input h-16" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Field label="Tags (comma-separated)">
              <input className="gp-input" value={noteTags} onChange={(e) => setNoteTags(e.target.value)} />
            </Field>
          </div>
          <button className="gp-btn gp-btn-primary" onClick={() => void saveNote()}>
            Add note
          </button>
        </div>
      </div>
      <div className="gp-card space-y-2">
        <Field label="DOI lookup (Crossref)">
          <div className="flex gap-2">
            <input
              className="gp-input"
              placeholder="10.xxxx/xxxxx or https://doi.org/…"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void doLookup();
              }}
            />
            <button className="gp-btn" disabled={busy || !doi.trim()} onClick={() => void doLookup()}>
              <Search size={13} />
              {busy ? 'Looking up…' : 'Look up'}
            </button>
          </div>
        </Field>
        {fetched && (
          <div className="space-y-1">
            <span className="gp-tag">Retrieved from Crossref</span>
            <p className="font-medium">{fetched.title}</p>
            <p className="gp-muted">
              {authorsStr(fetched)} · {fetched.year} · {fetched.journal}
            </p>
            <p className="gp-muted">
              DOI {fetched.doi}
              {fetched.publisher ? ` · ${fetched.publisher}` : ''}
            </p>
            {fetched.abstract && <p className="gp-muted line-clamp-4">{fetched.abstract}</p>}
            <button className="gp-btn gp-btn-primary" onClick={() => void saveRef()}>
              Save reference
            </button>
          </div>
        )}
      </div>
      {msg && <Msg kind={msg.k}>{msg.t}</Msg>}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[140px]">
          <Field label="Search saved items">
            <input className="gp-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
        <Field label="Collection">
          <select className="gp-input" value={col} onChange={(e) => setCol(e.target.value)}>
            <option value="">All</option>
            {data.collections.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Tag">
          <select className="gp-input" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">All</option>
            {allTags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-1 pb-1.5">
          <input type="checkbox" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} />
          Favorites
        </label>
      </div>
      <div className="flex gap-2">
        <input
          className="gp-input"
          placeholder="New collection name"
          aria-label="New collection name"
          value={newCol}
          onChange={(e) => setNewCol(e.target.value)}
        />
        <button
          className="gp-btn"
          onClick={() => {
            void addCollection(newCol);
            setNewCol('');
          }}
        >
          Add collection
        </button>
      </div>
      {items.length === 0 ? (
        <Empty
          title={data.items.length ? 'No items match your filters' : 'Nothing saved yet'}
          hint={data.items.length ? undefined : 'Save a page, a selection, a note, or look up a DOI.'}
        />
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              it={it}
              collections={data.collections}
              onFav={() => void updateItem(it.id, { favorite: !it.favorite })}
              onDelete={() => void deleteItem(it.id)}
              onUpdate={(p) => void updateItem(it.id, p)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemCard({
  it,
  collections,
  onFav,
  onDelete,
  onUpdate,
}: {
  it: ResearchItem;
  collections: string[];
  onFav: () => void;
  onDelete: () => void;
  onUpdate: (p: Partial<ResearchItem>) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <li className="gp-card space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="gp-tag mr-1">{it.kind}</span>
          {it.citation && <span className="gp-tag mr-1">{it.citation.source === 'crossref' ? 'Crossref-verified' : 'user-entered'}</span>}
          <p className="font-medium break-words mt-1">{it.title}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <FavButton active={it.favorite} onClick={onFav} label={it.title} />
          {it.url && (
            <a className="gp-btn" href={it.url} target="_blank" rel="noopener noreferrer" aria-label="Open link">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
      {it.citation && (
        <p className="gp-muted">
          {authorsStr(it.citation)} {it.citation.year ? `(${it.citation.year})` : ''} {it.citation.journal}
        </p>
      )}
      {it.selectedText && (
        <blockquote className="border-l-2 pl-2 gp-muted whitespace-pre-wrap line-clamp-6" style={{ borderColor: 'var(--teal)' }}>
          {it.selectedText}
        </blockquote>
      )}
      {it.note && <p className="whitespace-pre-wrap">{it.note}</p>}
      <div className="flex flex-wrap items-center gap-1">
        {it.tags.map((t) => (
          <span key={t} className="gp-tag">
            #{t}
          </span>
        ))}
        <select
          aria-label="Collection"
          className="gp-input !w-auto"
          value={it.collection ?? ''}
          onChange={(e) => onUpdate({ collection: e.target.value || undefined })}
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {it.citation && <CopyButton text={toBibtex([it.citation])} label="BibTeX" />}
        {confirm ? (
          <>
            <button className="gp-btn gp-btn-danger" onClick={onDelete}>
              Confirm delete
            </button>
            <button className="gp-btn" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="gp-btn" aria-label="Delete item" onClick={() => setConfirm(true)}>
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <p className="gp-muted text-[11px]">{fmtDate(it.createdAt)}</p>
    </li>
  );
}
