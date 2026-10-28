# GeoPilot v1.0.0 — Release Report

Date: 2026-10-28 · Environment: Node 22, Linux container, **no Chrome available**.

## Executed checks (real results)
| Check | Result |
|---|---|
| `npm run typecheck` (tsc strict) | pass, 0 errors |
| `npm run lint` (ESLint) | pass, 0 errors/warnings |
| `npm run format:check` (Prettier on src, tests) | pass |
| `npm test` (Vitest) | 6 files, 39 tests, all passed |
| `npm run build` | success; postbuild confirmed manifest-referenced files exist |
| Bundle scan for `eval` / `new Function` | none found (MV3 CSP-compatible by inspection) |
| Icons | PNG 16/32/48/128 verified by header dimensions |
| Figures | 4 SVGs parse as valid XML; PNG versions rendered |

## Measured bundle size (minified, uncompressed, from `dist/`)
- Total `dist/`: 543.6 KB; JavaScript: 523.0 KB.
- Popup initial load: popup 4.6 KB + shared chunk 151.1 KB (React, Lucide, shared code) + messaging 0.8 KB ≈ 156.5 KB JS, plus 11.1 KB CSS. Runtime load time was **not** measured.
- Side panel initial: 11.6 KB entry + the same 151.1 KB shared chunk; tool views are lazy-loaded.
- Largest chunks: Citation.js bundle (citations) 167.6 KB, proj4 (coordinates) 133.7 KB. Whether each loads only on demand was not verified beyond the build output.
- Caveat: the 167.6 KB "citations" chunk is shared by Research and Citations views; it was not split further.

## Not verified
- Loading as an unpacked extension in Chrome; popup, side panel and page capture behaviour in a live browser.
- Opening the side panel to a specific tool from the popup: implemented via `sidePanel.setOptions` (path with hash) + `sidePanel.open` after async calls; the user-gesture requirement and hash handling are untested.
- Alt+G shortcut, storage change events across popup/side panel, backup file picker in a real browser.
- Live Crossref requests (tests use mocked responses).
- Accessibility audit beyond labelled controls, focus styles and ARIA roles in code.
- No real screenshots were captured; none are included.

## Known limitations
See README. Dependency license review is still required before store submission.

## Deliverable
`GeoPilot-v1.0.0.zip` with root folder `geopilot/` (source, docs, figures, icons, tests, `dist/` build). Excludes node_modules, release and caches.
