import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
const head = (w, h, t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Inter,Segoe UI,Arial,sans-serif"><defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#52627a"/></marker></defs><rect width="${w}" height="${h}" fill="#f6f8fb"/><text x="24" y="34" font-size="18" font-weight="600" fill="#0b1b33">${t}</text>`;
const box = (x, y, w, h, t, fill = '#ffffff', stroke = '#1d5fd1', sub = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + h / 2 + (sub ? -2 : 4)}" font-size="12.5" text-anchor="middle" fill="#0b1b33" font-weight="600">${t}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" font-size="10.5" text-anchor="middle" fill="#52627a">${sub}</text>` : ''}`;
const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#52627a" stroke-width="1.5" marker-end="url(#a)"/>`;
const T = '#0d9488', B = '#1d5fd1', N = '#0b1b33';
const figs = {
  architecture: head(760, 400, 'GeoPilot architecture (Manifest V3)') +
    box(30, 70, 200, 60, 'Popup (React)', '#fff', B, 'popup.html') + box(30, 170, 200, 60, 'Side Panel (React)', '#fff', B, 'sidepanel.html, lazy-loaded tools') +
    box(300, 120, 200, 70, 'Service worker', '#e6f6f4', T, 'page capture only (messages)') + box(560, 70, 170, 60, 'chrome.storage.local', '#fff', N, 'versioned, validated') + box(560, 170, 170, 60, 'Active tab', '#fff', N, 'activeTab + scripting') +
    box(300, 260, 200, 60, 'Local logic and services', '#fff', T, 'coords, indices, GeoJSON, citations, DOI') + box(560, 270, 170, 50, 'api.crossref.org', '#fff7ed', '#c2410c', 'only on DOI lookup') +
    arrow(230, 100, 300, 140) + arrow(230, 200, 300, 175) + arrow(230, 90, 560, 90) + arrow(500, 160, 560, 195) + arrow(230, 210, 300, 285) + arrow(500, 290, 560, 295) + '</svg>',
  workflow: head(760, 220, 'Research workflow') +
    box(24, 80, 130, 60, 'Find', '#fff', B, 'Resource Hub') + box(174, 80, 130, 60, 'Capture', '#fff', B, 'page / selection / DOI') + box(324, 80, 130, 60, 'Organize', '#fff', T, 'tags, collections') + box(474, 80, 130, 60, 'Analyze', '#fff', T, 'indices, coords, GeoJSON') + box(624, 80, 112, 60, 'Cite', '#fff', B, 'BibTeX / RIS') +
    arrow(154, 110, 174, 110) + arrow(304, 110, 324, 110) + arrow(454, 110, 474, 110) + arrow(604, 110, 624, 110) + '</svg>',
  'feature-map': head(760, 330, 'Feature map') +
    box(300, 60, 160, 50, 'GeoPilot', '#0b1b33', N).replace('fill="#0b1b33">GeoPilot', 'fill="#ffffff">GeoPilot') +
    ['Resource Hub', 'Coordinate Converter', 'Spectral Indices', 'GeoJSON Toolkit'].map((t, i) => box(24 + i * 180, 160, 160, 44, t, '#fff', B)).join('') +
    ['Research Companion', 'Citations', 'Code Library', 'Workflow Guides'].map((t, i) => box(24 + i * 180, 240, 160, 44, t, '#fff', T)).join('') +
    [0, 1, 2, 3].map((i) => arrow(380, 110, 104 + i * 180, 160)).join('') + '</svg>',
  'data-flow': head(760, 300, 'Data flow and privacy boundaries') +
    '<rect x="20" y="55" width="520" height="225" rx="10" fill="#e6f6f4" stroke="#0d9488" stroke-dasharray="5 4"/><text x="34" y="75" font-size="11" fill="#0d9488">Local to this device</text>' +
    box(40, 100, 150, 56, 'User input', '#fff', B, 'coords, bands, GeoJSON') + box(240, 100, 150, 56, 'Pure TS functions', '#fff', T, 'no network') + box(440, 100, 90, 56, 'Result', '#fff', B) +
    box(40, 200, 150, 56, 'Notes and bookmarks', '#fff', B) + box(240, 200, 150, 56, 'chrome.storage.local', '#fff', N) +
    '<rect x="580" y="130" width="160" height="80" rx="10" fill="#fff7ed" stroke="#c2410c"/>' + `<text x="660" y="160" font-size="12" font-weight="600" text-anchor="middle" fill="#0b1b33">Crossref API</text><text x="660" y="178" font-size="10.5" text-anchor="middle" fill="#52627a">DOI sent only on</text><text x="660" y="192" font-size="10.5" text-anchor="middle" fill="#52627a">user-triggered lookup</text>` +
    arrow(190, 128, 240, 128) + arrow(390, 128, 440, 128) + arrow(190, 228, 240, 228) + arrow(540, 170, 580, 170) + '</svg>',
};
for (const [n, s] of Object.entries(figs)) { writeFileSync(`docs/figures/${n}.svg`, s); await sharp(Buffer.from(s), { density: 192 }).png().toFile(`docs/figures/${n}.png`); }
console.log('figures written');
