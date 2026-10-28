import { useMemo, useState } from 'react';
import { BookmarkPlus, Moon, PanelRight, Search, Settings, Star, Sun } from 'lucide-react';
import { DataProvider, useData } from '@/storage/DataContext';
import { useApplyTheme } from '@/hooks/useTheme';
import { Logo, Msg } from '@/components/ui';
import { TOOLS } from '@/data/tools';
import { matches } from '@/utils/search';
import { capturePage, openSidePanel } from '@/services/messaging';

function Body() {
  const { data, setSettings, addItem, markToolUsed } = useData();
  useApplyTheme(data.settings.theme);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState<{ k: 'error' | 'ok'; t: string } | null>(null);
  const tools = TOOLS.filter((t) => t.id !== 'dashboard');
  const list = useMemo(() => tools.filter((t) => matches(q, t.label, t.blurb)), [q, tools]);
  const open = async (id: string) => {
    try {
      await markToolUsed(id);
      const w = await chrome.windows.getCurrent();
      await chrome.sidePanel.setOptions({ path: `sidepanel.html#${id}` });
      await chrome.sidePanel.open({ windowId: w.id! });
      window.close();
    } catch (e) {
      setMsg({ k: 'error', t: `Could not open side panel: ${(e as Error).message}` });
    }
  };
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const byId = (id: string) => TOOLS.find((t) => t.id === id);
  return (
    <div className="w-[340px] p-3 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <div>
            <div className="font-semibold leading-tight">GeoPilot</div>
            <div className="gp-muted text-[10px]">Navigate Data. Discover Insights.</div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="gp-btn !p-1.5" aria-label="Toggle theme" onClick={() => void setSettings({ theme: dark ? 'light' : 'dark' })}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button className="gp-btn !p-1.5" aria-label="Settings" onClick={() => void open('settings')}>
            <Settings size={14} />
          </button>
        </div>
      </header>
      <label className="relative block">
        <span className="sr-only">Search tools</span>
        <Search size={13} className="absolute left-2 top-2 gp-muted" />
        <input className="gp-input !pl-7" placeholder="Search tools…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {list.map((t) => (
          <button key={t.id} className="gp-btn !justify-start" onClick={() => void open(t.id)} title={t.blurb}>
            {data.favoriteTools.includes(t.id) && <Star size={11} fill="currentColor" />}
            <span className="truncate">{t.label}</span>
          </button>
        ))}
        {list.length === 0 && <p className="gp-muted col-span-2">No matching tools.</p>}
      </div>
      {data.recentTools.length > 0 && !q && (
        <div>
          <div className="gp-label">Recent</div>
          <div className="flex flex-wrap gap-1">
            {data.recentTools.slice(0, 4).map(
              (id) =>
                byId(id) && (
                  <button key={id} className="gp-tag" onClick={() => void open(id)}>
                    {byId(id)!.label}
                  </button>
                ),
            )}
          </div>
        </div>
      )}
      <div className="gp-card space-y-1.5">
        <div className="gp-label">Current page</div>
        <div className="flex gap-1.5">
          <button
            className="gp-btn"
            onClick={async () => {
              try {
                const p = await capturePage();
                await addItem({
                  kind: 'bookmark',
                  title: p.title || p.url,
                  url: p.url,
                  pageMeta: { description: p.description, author: p.author, siteName: p.siteName },
                });
                setMsg({ k: 'ok', t: 'Page saved.' });
              } catch (e) {
                setMsg({ k: 'error', t: (e as Error).message });
              }
            }}
          >
            <BookmarkPlus size={13} />
            Save page
          </button>
          <button
            className="gp-btn"
            onClick={async () => {
              try {
                const p = await capturePage();
                if (!p.selection.trim()) throw new Error('No text is selected on the page.');
                await addItem({ kind: 'selection', title: p.title || p.url, url: p.url, selectedText: p.selection });
                setMsg({ k: 'ok', t: 'Selection saved.' });
              } catch (e) {
                setMsg({ k: 'error', t: (e as Error).message });
              }
            }}
          >
            Save selection
          </button>
        </div>
      </div>
      {msg && <Msg kind={msg.k}>{msg.t}</Msg>}
      <button
        className="gp-btn gp-btn-primary w-full justify-center"
        onClick={async () => {
          try {
            await chrome.sidePanel.setOptions({ path: 'sidepanel.html#dashboard' });
            await openSidePanel();
            window.close();
          } catch (e) {
            setMsg({ k: 'error', t: (e as Error).message });
          }
        }}
      >
        <PanelRight size={13} />
        Open Side Panel
      </button>
    </div>
  );
}
export default function Popup() {
  return (
    <DataProvider>
      <Body />
    </DataProvider>
  );
}
