import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#0b1b33"/><circle cx="64" cy="66" r="34" fill="none" stroke="#2dd4bf" stroke-width="6"/><ellipse cx="64" cy="66" rx="14" ry="34" fill="none" stroke="#5b9bff" stroke-width="4"/><path d="M30 66h68M36 52h56M36 80h56" stroke="#5b9bff" stroke-width="3" fill="none"/><path d="M64 12l11 25-11-6-11 6z" fill="#2dd4bf"/></svg>`;
mkdirSync('public/icons', { recursive: true }); mkdirSync('branding', { recursive: true });
writeFileSync('branding/geopilot-icon.svg', svg);
for (const s of [16, 32, 48, 128]) await sharp(Buffer.from(svg), { density: 384 }).resize(s, s).png().toFile(`public/icons/icon${s}.png`);
console.log('icons written');
