export interface PageCapture {
  title: string;
  url: string;
  selection: string;
  description?: string;
  author?: string;
  siteName?: string;
}
export type Msg = { type: 'GP_CAPTURE_PAGE' } | { type: 'GP_OPEN_PANEL' };
export type Reply<T> = { ok: true; data: T } | { ok: false; error: string };
