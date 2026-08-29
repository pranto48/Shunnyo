import fs from 'fs';
import path from 'path';

// 1x1 transparent PNG buffer fallback expanded to valid PNG chunk
// or simple SVG copied for icon references
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#070a12" />
  <circle cx="256" cy="256" r="160" stroke="#6366f1" stroke-width="28" stroke-linecap="round" />
  <circle cx="256" cy="256" r="120" stroke="#4f46e5" stroke-width="16" />
  <circle cx="256" cy="256" r="32" fill="#06b6d4" />
</svg>`;

// Minimal 1x1 pixel PNG bytes
const minPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), minPng);
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), minPng);
console.log('Icons generated successfully.');
