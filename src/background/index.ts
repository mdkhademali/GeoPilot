import type { Msg, PageCapture, Reply } from '@/types/messages';

function pageScript(): PageCapture {
  const m = (n: string) => (document.querySelector(`meta[name="${n}"],meta[property="${n}"]`) as HTMLMetaElement | null)?.content || undefined;
  return {
    title: document.title,
    url: location.href,
    selection: String(getSelection() ?? '').slice(0, 20000),
    description: m('description') ?? m('og:description'),
    author: m('author') ?? m('citation_author'),
    siteName: m('og:site_name'),
  };
}

async function capture(): Promise<Reply<PageCapture>> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id || !tab.url || !/^https?:/i.test(tab.url)) return { ok: false, error: 'This page cannot be captured (only http/https pages are supported).' };
  try {
    const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: pageScript });
    return res?.result ? { ok: true, data: res.result as PageCapture } : { ok: false, error: 'No data returned from the page.' };
  } catch {
    return { ok: false, error: 'Access to this tab was not granted. Click the GeoPilot toolbar icon on the page you want to capture, then try again.' };
  }
}

chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  if (msg?.type === 'GP_CAPTURE_PAGE') {
    void capture().then(sendResponse);
    return true;
  }
  if (msg?.type === 'GP_OPEN_PANEL') {
    sendResponse({ ok: true, data: null });
    return false;
  }
  return false;
});
