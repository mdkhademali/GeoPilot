import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ActivityEntry, AppData, ResearchItem, Settings } from '@/types';
import { clearData, loadData, onDataChanged, saveData } from './store';
import { defaultData } from './schema';

interface Ctx {
  data: AppData;
  ready: boolean;
  error: string | null;
  addItem: (
    i: Omit<ResearchItem, 'id' | 'createdAt' | 'updatedAt' | 'favorite' | 'tags'> & Partial<Pick<ResearchItem, 'tags' | 'favorite'>>,
  ) => Promise<string>;
  updateItem: (id: string, patch: Partial<ResearchItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavTool: (id: string) => Promise<void>;
  toggleFavResource: (id: string) => Promise<void>;
  markToolUsed: (id: string) => Promise<void>;
  log: (type: string, label: string) => Promise<void>;
  setSettings: (s: Partial<Settings>) => Promise<void>;
  addCollection: (name: string) => Promise<void>;
  replaceAll: (d: AppData) => Promise<void>;
  wipe: () => Promise<void>;
}
const C = createContext<Ctx | null>(null);
export const useData = (): Ctx => {
  const c = useContext(C);
  if (!c) throw new Error('DataProvider missing');
  return c;
};
const uid = (): string => crypto.randomUUID();

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef(data);
  ref.current = data;

  const reload = useCallback(async () => {
    setData(await loadData());
    setReady(true);
  }, []);
  useEffect(() => {
    void reload();
    return onDataChanged(() => void reload());
  }, [reload]);

  const commit = useCallback(async (fn: (d: AppData) => AppData) => {
    const fresh = await loadData();
    const next = fn(fresh);
    setData(next);
    try {
      await saveData(next);
      setError(null);
    } catch (e) {
      setError(`Could not save: ${(e as Error).message}`);
    }
  }, []);
  const entry = (type: string, label: string): ActivityEntry => ({ id: uid(), type, label, at: Date.now() });
  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const value = useMemo<Ctx>(
    () => ({
      data,
      ready,
      error,
      addItem: async (i) => {
        const id = uid();
        const now = Date.now();
        await commit((d) => ({
          ...d,
          items: [{ tags: [], favorite: false, ...i, id, createdAt: now, updatedAt: now }, ...d.items],
          activity: [entry('save', `Saved ${i.kind}: ${i.title}`), ...d.activity].slice(0, 100),
        }));
        return id;
      },
      updateItem: (id, p) => commit((d) => ({ ...d, items: d.items.map((x) => (x.id === id ? { ...x, ...p, updatedAt: Date.now() } : x)) })),
      deleteItem: (id) => commit((d) => ({ ...d, items: d.items.filter((x) => x.id !== id) })),
      toggleFavTool: (id) => commit((d) => ({ ...d, favoriteTools: toggle(d.favoriteTools, id) })),
      toggleFavResource: (id) => commit((d) => ({ ...d, favoriteResources: toggle(d.favoriteResources, id) })),
      markToolUsed: (id) => commit((d) => ({ ...d, recentTools: [id, ...d.recentTools.filter((x) => x !== id)].slice(0, 8) })),
      log: (t, l) => commit((d) => ({ ...d, activity: [entry(t, l), ...d.activity].slice(0, 100) })),
      setSettings: (s) => commit((d) => ({ ...d, settings: { ...d.settings, ...s } })),
      addCollection: (n) => commit((d) => (n.trim() && !d.collections.includes(n.trim()) ? { ...d, collections: [...d.collections, n.trim()] } : d)),
      replaceAll: (nd) => commit(() => nd),
      wipe: async () => {
        await clearData();
        setData(defaultData());
      },
    }),
    [data, ready, error, commit],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
