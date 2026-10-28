import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Braces,
  Code2,
  Compass,
  Globe,
  LayoutDashboard,
  Library,
  Menu,
  Quote,
  Search,
  Settings as Cog,
  Workflow,
  FlaskConical,
  Star,
} from 'lucide-react';
import { DataProvider, useData } from '@/storage/DataContext';
import { useApplyTheme } from '@/hooks/useTheme';
import { Logo, Msg } from '@/components/ui';
import { TOOLS } from '@/data/tools';
import { matches } from '@/utils/search';
import { Dashboard } from '@/features/Dashboard';

const views: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  resources: lazy(() => import('@/features/resources/ResourcesView').then((m) => ({ default: m.ResourcesView }))),
  coordinates: lazy(() => import('@/features/coordinates/CoordinateTool').then((m) => ({ default: m.CoordinateTool }))),
  indices: lazy(() => import('@/features/spectral-indices/IndexLab').then((m) => ({ default: m.IndexLab }))),
  geojson: lazy(() => import('@/features/geojson/GeoJsonTool').then((m) => ({ default: m.GeoJsonTool }))),
  research: lazy(() => import('@/features/research/ResearchView').then((m) => ({ default: m.ResearchView }))),
  citations: lazy(() => import('@/features/citations/CitationsView').then((m) => ({ default: m.CitationsView }))),
  snippets: lazy(() => import('@/features/snippets/SnippetsView').then((m) => ({ default: m.SnippetsView }))),
  workflows: lazy(() => import('@/features/workflows/WorkflowsView').then((m) => ({ default: m.WorkflowsView }))),
  settings: lazy(() => import('@/features/Settings').then((m) => ({ default: m.Settings }))),
};
const ICONS: Record<string, typeof Globe> = {
  dashboard: LayoutDashboard,
  resources: Globe,
  coordinates: Compass,
  indices: FlaskConical,
  geojson: Braces,
  research: BookOpen,
  citations: Quote,
  snippets: Code2,
  workflows: Workflow,
  settings: Cog,
};

function Shell() {
  const { data, ready, error, setSettings, markToolUsed, toggleFavTool } = useData();
  useApplyTheme(data.settings.theme);
  const [tool, setTool] = useState(() => (location.hash.slice(1) in views || location.hash === '#dashboard' ? location.hash.slice(1) : 'dashboard'));
  const [palette, setPalette] = useState(false);
  const [pq, setPq] = useState('');
  const pref = useRef<HTMLInputElement>(null);
  const go = (id: string) => {
    setTool(id);
    setPalette(false);
    setPq('');
    history.replaceState(null, '', `#${id}`);
    void markToolUsed(id);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === 'Escape') setPalette(false);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  useEffect(() => {
    if (palette) pref.current?.focus();
  }, [palette]);
  const results = useMemo(() => TOOLS.filter((t) => matches(pq, t.label, t.blurb, t.group)), [pq]);
  const collapsed = data.settings.sidebarCollapsed;
  const View = views[tool];
  const groups = [...new Set(TOOLS.map((t) => t.group))];
  return (
    <div className="flex h-screen">
      <nav
        aria-label="Main"
        className={`${collapsed ? 'w-12' : 'w-48'} shrink-0 border-r overflow-y-auto p-2 space-y-2`}
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2">
          <button
            className="gp-btn !p-1.5"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => void setSettings({ sidebarCollapsed: !collapsed })}
          >
            <Menu size={14} />
          </button>
          {!collapsed && (
            <>
              <Logo />
              <span className="font-semibold">GeoPilot</span>
            </>
          )}
        </div>
        <button className="gp-btn w-full" onClick={() => setPalette(true)} aria-label="Search and command palette">
          <Search size={13} />
          {!collapsed && (
            <span className="flex-1 text-left">
              Search… <kbd className="gp-muted">Ctrl K</kbd>
            </span>
          )}
        </button>
        {groups.map((g) => (
          <div key={g}>
            {!collapsed && <div className="gp-label mt-2">{g}</div>}
            {TOOLS.filter((t) => t.group === g).map((t) => {
              const I = ICONS[t.id] ?? Library;
              return (
                <div key={t.id} className="flex items-center">
                  <button
                    className={`gp-btn w-full !border-transparent ${tool === t.id ? 'gp-btn-primary' : ''}`}
                    aria-current={tool === t.id ? 'page' : undefined}
                    title={t.label}
                    onClick={() => go(t.id)}
                  >
                    <I size={14} />
                    {!collapsed && t.label}
                  </button>
                  {!collapsed && t.id !== 'dashboard' && t.id !== 'settings' && (
                    <button
                      className="p-1"
                      aria-label={`Favorite ${t.label}`}
                      aria-pressed={data.favoriteTools.includes(t.id)}
                      onClick={() => void toggleFavTool(t.id)}
                    >
                      <Star size={12} fill={data.favoriteTools.includes(t.id) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <main className="flex-1 overflow-y-auto p-4" id="main">
        {error && <Msg kind="error">{error}</Msg>}
        {!ready ? (
          <p className="gp-muted" role="status">
            Loading…
          </p>
        ) : tool === 'dashboard' ? (
          <Dashboard go={go} />
        ) : View ? (
          <Suspense
            fallback={
              <p className="gp-muted" role="status">
                Loading…
              </p>
            }
          >
            <View />
          </Suspense>
        ) : (
          <Msg kind="error">Unknown tool.</Msg>
        )}
      </main>
      {palette && (
        <div className="fixed inset-0 flex items-start justify-center pt-16 z-50" style={{ background: 'rgba(0,0,0,.4)' }} onClick={() => setPalette(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="gp-card w-[min(420px,92vw)] space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={pref}
              className="gp-input"
              placeholder="Search tools…"
              aria-label="Search tools"
              value={pq}
              onChange={(e) => setPq(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) go(results[0].id);
              }}
            />
            <ul className="max-h-64 overflow-auto">
              {results.length ? (
                results.map((t) => (
                  <li key={t.id}>
                    <button className="gp-btn w-full !border-transparent justify-between" onClick={() => go(t.id)}>
                      <span>{t.label}</span>
                      <span className="gp-muted">{t.blurb}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="gp-muted p-2">No matches</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}
