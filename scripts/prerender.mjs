import { readRegistryModule } from './read-registry.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';

const html = await readFile(join(DIST, 'index.html'), 'utf8');
const { TOOLS } = await readRegistryModule('registry');
const { LEGACY_ROUTES } = await readRegistryModule('legacyRoutes');
const routes = [...TOOLS.map((tool) => tool.id), ...Object.keys(LEGACY_ROUTES)];

for (const route of routes) {
  const canonical = LEGACY_ROUTES[route]?.split('?')[0] ?? `/${route}`;
  const page = html.replace(
    '</head>',
    `<link rel="canonical" href="https://tools.lailai.one${canonical}" /></head>`
  );
  await writeFile(join(DIST, `${route}.html`), page);
}

// 404.html is served by Caddy's handle_errors with a real 404 status.
await writeFile(join(DIST, '404.html'), html);

console.log(
  `prerendered ${TOOLS.length} tools + ${Object.keys(LEGACY_ROUTES).length} merged routes + 404.html`
);
