import { STORAGE_KEY, defaultData, parseAppData } from './schema';
import type { AppData } from '@/types';

const area = (): chrome.storage.StorageArea | null => (typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null);
let memory: unknown;

export async function loadData(): Promise<AppData> {
  try {
    const a = area();
    const raw = a ? (await a.get(STORAGE_KEY))[STORAGE_KEY] : memory;
    return raw ? parseAppData(raw) : defaultData();
  } catch {
    return defaultData();
  }
}
export async function saveData(d: AppData): Promise<void> {
  const a = area();
  if (a) await a.set({ [STORAGE_KEY]: d });
  else memory = d;
}
export async function clearData(): Promise<void> {
  const a = area();
  if (a) await a.remove(STORAGE_KEY);
  else memory = undefined;
}
export function onDataChanged(cb: () => void): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return () => undefined;
  const h = (c: Record<string, chrome.storage.StorageChange>, n: string) => {
    if (n === 'local' && c[STORAGE_KEY]) cb();
  };
  chrome.storage.onChanged.addListener(h);
  return () => chrome.storage.onChanged.removeListener(h);
}
