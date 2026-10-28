import { ZipArchive } from 'archiver';
import { createWriteStream, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
if (!existsSync('dist/manifest.json')) { console.error('Run npm run build first.'); process.exit(1); }
mkdirSync('release', { recursive: true });
const out = 'release/GeoPilot-v1.0.0.zip';
const ROOT = 'geopilot';
const skip = new Set(['node_modules', 'release', '.git', '.DS_Store']);
const output = createWriteStream(out); const zip = new ZipArchive({ zlib: { level: 9 } });
output.on('close', () => console.log(`${out}: ${zip.pointer()} bytes`));
zip.on('error', (e) => { throw e; }); zip.pipe(output);
(function add(dir) { for (const e of readdirSync(dir)) { if (skip.has(e) || e.endsWith('.log')) continue; const p = join(dir, e); statSync(p).isDirectory() ? add(p) : zip.file(p, { name: `${ROOT}/${p}` }); } })('.');
await zip.finalize();
