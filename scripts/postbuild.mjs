import { cpSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
cpSync('manifest.json', 'dist/manifest.json');
cpSync('public/icons', 'dist/icons', { recursive: true });
// Vite emits HTML under dist/ at the root already (inputs are root-level html files).
const m = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
for (const f of [m.action.default_popup, m.side_panel.default_path, m.background.service_worker, ...Object.values(m.icons)]) {
  if (!existsSync(join('dist', f))) { console.error('MISSING in dist:', f); process.exit(1); }
}
let total = 0, js = 0; const rows = [];
(function walk(d) { for (const e of readdirSync(d)) { const p = join(d, e); const s = statSync(p); if (s.isDirectory()) walk(p); else { total += s.size; if (p.endsWith('.js')) { js += s.size; rows.push([p, s.size]); } } } })('dist');
rows.sort((a, b) => b[1] - a[1]);
writeFileSync('dist/.bundle-report.txt', rows.map(([p, s]) => `${(s / 1024).toFixed(1)} KB  ${p}`).join('\n') + `\nTOTAL dist: ${(total / 1024).toFixed(1)} KB, JS: ${(js / 1024).toFixed(1)} KB\n`);
console.log(readFileSync('dist/.bundle-report.txt', 'utf8'));
