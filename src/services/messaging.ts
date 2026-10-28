import type { Msg, PageCapture, Reply } from '@/types/messages';

export async function capturePage(): Promise<PageCapture> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) throw new Error('Page capture is only available inside the extension.');
  const r = (await chrome.runtime.sendMessage({ type: 'GP_CAPTURE_PAGE' } satisfies Msg)) as Reply<PageCapture> | undefined;
  if (!r) throw new Error('No response from the background service worker.');
  if (!r.ok) throw new Error(r.error);
  return r.data;
}
export async function openSidePanel(): Promise<void> {
  const w = await chrome.windows.getCurrent();
  if (w.id === undefined) throw new Error('No browser window found.');
  await chrome.sidePanel.open({ windowId: w.id });
}
