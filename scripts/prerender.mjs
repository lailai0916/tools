import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// The app is a client-rendered SPA, but the route list is known at build time.
// Writing one real .html per route is what lets the server return a true 404 for
// anything else — the usual SPA fallback (`try_files ... /index.html`) would answer
// 200 for every made-up URL and get them indexed as duplicate pages.
//
// Each file is a copy of index.html; react-router picks the tool from the URL.

const DIST = 'dist';

async function readRoutes() {
  try {
    const entries = await readdir('src/tools', { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return []; // No tools yet — 404.html alone is still worth writing.
  }
}

const html = await readFile(join(DIST, 'index.html'), 'utf8');
const routes = await readRoutes();

for (const route of routes) {
  await writeFile(join(DIST, `${route}.html`), html);
}

// 404.html is served by Caddy's handle_errors with a real 404 status.
await writeFile(join(DIST, '404.html'), html);

console.log(`prerendered ${routes.length} route(s) + 404.html`);
