import { readRegistryModule } from './read-registry.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';

const html = await readFile(join(DIST, 'index.html'), 'utf8');
const { TOOLS } = await readRegistryModule('registry');
const { LEGACY_ROUTES } = await readRegistryModule('legacyRoutes');
const routes = [...TOOLS.map((tool) => tool.id), ...Object.keys(LEGACY_ROUTES)];
const manifest = JSON.parse(await readFile(join(DIST, '.vite/manifest.json'), 'utf8'));
const toolManifest = JSON.parse(await readFile(join(DIST, '.vite/tool-routes.json'), 'utf8'));
if (
  toolManifest.version !== 1 ||
  Object.keys(toolManifest.routes).length !== TOOLS.length ||
  TOOLS.some((tool) => !toolManifest.routes[tool.id])
) {
  throw new Error('Tool chunk manifest does not match the registered routes');
}

function routeHints(toolId) {
  const file = toolManifest.routes[toolId];
  const entries = Object.keys(manifest).filter((key) => manifest[key].file === file);
  if (entries.length !== 1) throw new Error(`Missing unique built tool entry: ${toolId}`);
  const entry = entries[0];
  const visited = new Set();
  const scripts = new Set();
  const styles = new Set();
  const visit = (key) => {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Missing built dependency: ${key}`);
    for (const dependency of chunk.imports ?? []) visit(dependency);
    if (key !== 'index.html') scripts.add(chunk.file);
    for (const stylesheet of chunk.css ?? []) {
      if (!(manifest['index.html'].css ?? []).includes(stylesheet)) styles.add(stylesheet);
    }
  };
  visit(entry);
  return [
    ...[...scripts].map((script) => `<link rel="modulepreload" href="/${script}" />`),
    ...[...styles].map((stylesheet) => `<link rel="stylesheet" href="/${stylesheet}" />`),
  ].join('');
}

for (const route of routes) {
  const canonical = LEGACY_ROUTES[route]?.split('?')[0] ?? `/${route}`;
  const toolId = canonical.slice(1);
  const page = html.replace(
    '</head>',
    `${routeHints(toolId)}<link rel="canonical" href="https://tools.lailai.one${canonical}" /></head>`
  );
  await writeFile(join(DIST, `${route}.html`), page);
}

// 404.html is served by Caddy's handle_errors with a real 404 status.
await writeFile(join(DIST, '404.html'), html);

console.log(
  `prerendered ${TOOLS.length} tools + ${Object.keys(LEGACY_ROUTES).length} merged routes + 404.html`
);
