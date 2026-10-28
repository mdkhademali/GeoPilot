import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Empty, FavButton, Field, Title } from '@/components/ui';
import { RESOURCES, RESOURCE_CATEGORIES } from '@/data/resources';
import { useData } from '@/storage/DataContext';
import { useDebounce } from '@/hooks/useDebounce';
import { filterBy } from '@/utils/search';

export function ResourcesView() {
  const { data, toggleFavResource } = useData();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [fav, setFav] = useState(false);
  const dq = useDebounce(q, 150);
  const list = useMemo(
    () =>
      filterBy(
        RESOURCES.filter((r) => (!cat || r.category === cat) && (!fav || data.favoriteResources.includes(r.id))),
        dq,
        (r) => [r.name, r.description, r.category],
      ),
    [dq, cat, fav, data.favoriteResources],
  );
  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Links go to the official project or provider sites.">Geospatial Resource Hub</Title>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[140px]">
          <Field label="Search">
            <input className="gp-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
        <Field label="Category">
          <select className="gp-input" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All</option>
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-1 pb-1.5">
          <input type="checkbox" checked={fav} onChange={(e) => setFav(e.target.checked)} />
          Favorites
        </label>
      </div>
      {list.length === 0 ? (
        <Empty title="No resources match" />
      ) : (
        <ul className="space-y-2">
          {list.map((r) => (
            <li key={r.id} className="gp-card flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{r.name}</p>
                <p className="gp-muted">{r.category}</p>
                <p>{r.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <FavButton active={data.favoriteResources.includes(r.id)} onClick={() => void toggleFavResource(r.id)} label={r.name} />
                <a className="gp-btn" href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${r.name}`}>
                  <ExternalLink size={13} />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
