import { useRef, useState } from 'react';
import { Msg, Title } from '@/components/ui';
import { useData } from '@/storage/DataContext';
import { downloadText } from '@/utils/misc';
import { parseBackupText, serializeAppData } from '@/storage/schema';

export function Settings() {
  const { data, setSettings, replaceAll, wipe } = useData();
  const [msg, setMsg] = useState<{ k: 'error' | 'ok'; t: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const restore = async (f: File) => {
    try {
      const d = parseBackupText(await f.text());
      await replaceAll(d);
      setMsg({ k: 'ok', t: `Restored ${d.items.length} item(s). Existing data was replaced.` });
    } catch (e) {
      setMsg({ k: 'error', t: (e as Error).message });
    }
  };
  return (
    <section className="space-y-3 gp-fade">
      <Title>Settings &amp; Help</Title>
      <div className="gp-card space-y-2">
        <label className="gp-label" htmlFor="theme">
          Theme
        </label>
        <select
          id="theme"
          className="gp-input"
          value={data.settings.theme}
          onChange={(e) => void setSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="gp-card space-y-2">
        <h3 className="font-medium">Backup &amp; restore</h3>
        <div className="flex flex-wrap gap-1.5">
          <button className="gp-btn" onClick={() => downloadText(`geopilot-backup-${new Date().toISOString().slice(0, 10)}.json`, serializeAppData(data))}>
            Export JSON backup
          </button>
          <button className="gp-btn" onClick={() => file.current?.click()}>
            Restore from backup…
          </button>
          <input
            ref={file}
            type="file"
            accept=".json,application/json"
            hidden
            aria-label="Backup file"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await restore(f);
              e.target.value = '';
            }}
          />
        </div>
        <p className="gp-muted">Restoring replaces your current data after validating the file.</p>
      </div>
      <div className="gp-card space-y-2">
        <h3 className="font-medium">Clear all data</h3>
        {confirm ? (
          <div className="flex gap-1.5 items-center">
            <span>This permanently deletes everything stored by GeoPilot.</span>
            <button
              className="gp-btn gp-btn-danger"
              onClick={async () => {
                await wipe();
                setConfirm(false);
                setMsg({ k: 'ok', t: 'All data cleared.' });
              }}
            >
              Yes, delete
            </button>
            <button className="gp-btn" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="gp-btn gp-btn-danger" onClick={() => setConfirm(true)}>
            Clear all data…
          </button>
        )}
      </div>
      {msg && <Msg kind={msg.k}>{msg.t}</Msg>}
      <div className="gp-card space-y-1">
        <h3 className="font-medium">Privacy &amp; help</h3>
        <p className="gp-muted">
          Notes, bookmarks, selections and settings stay in chrome.storage.local on this device. GeoPilot has no telemetry. The only network request it makes is
          a DOI lookup to api.crossref.org when you press “Look up”.
        </p>
        <p className="gp-muted">
          Shortcuts: Ctrl/⌘+K opens the command palette. Alt+G opens the popup. Page capture needs you to click the toolbar icon on the page first (activeTab).
        </p>
        <p className="gp-muted">GeoPilot v1.0.0</p>
      </div>
    </section>
  );
}
