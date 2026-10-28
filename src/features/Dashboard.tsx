import { Title, Empty } from '@/components/ui';
import { useData } from '@/storage/DataContext';
import { TOOLS } from '@/data/tools';
import { fmtDate } from '@/utils/misc';

export function Dashboard({ go }: { go: (id: string) => void }) {
  const { data } = useData();
  const n = (k: string) => data.items.filter((i) => i.kind === k).length;
  const stats: [string, number][] = [
    ['Saved research items', data.items.length],
    ['Notes', n('note')],
    ['Bookmarks', n('bookmark')],
    ['Favorite items', data.items.filter((i) => i.favorite).length + data.favoriteTools.length + data.favoriteResources.length],
    ['Recently used tools', data.recentTools.length],
  ];
  const tool = (id: string) => TOOLS.find((t) => t.id === id);
  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Counts below come from data stored on this device.">Dashboard</Title>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map(([l, v]) => (
          <div key={l} className="gp-card">
            <div className="text-xl font-semibold">{v}</div>
            <div className="gp-muted">{l}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="gp-label">Recently used tools</h3>
        {data.recentTools.length ? (
          <div className="flex flex-wrap gap-1.5">
            {data.recentTools.map(
              (id) =>
                tool(id) && (
                  <button key={id} className="gp-btn" onClick={() => go(id)}>
                    {tool(id)!.label}
                  </button>
                ),
            )}
          </div>
        ) : (
          <Empty title="No tools used yet" hint="Open a tool from the sidebar to see it here." />
        )}
      </div>
      <div>
        <h3 className="gp-label">Recent activity</h3>
        {data.activity.length ? (
          <ul className="space-y-1">
            {data.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="gp-card !py-1.5 flex justify-between gap-2">
                <span>{a.label}</span>
                <span className="gp-muted shrink-0">{fmtDate(a.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="No activity yet" />
        )}
      </div>
    </section>
  );
}
