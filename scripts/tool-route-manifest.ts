import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

export function toolRouteManifest(): Plugin {
  const directory = fileURLToPath(new URL('../src/tools/', import.meta.url)).replaceAll('\\', '/');
  return {
    name: 'tools-route-manifest',
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((entry) => entry.type === 'chunk');
      const resolveChunk = (id: string, visited = new Set<string>()): string => {
        if (visited.has(id)) return this.error(`Circular tool entry: ${id}`);
        visited.add(id);
        const matches = chunks.filter(
          (chunk) => chunk.facadeModuleId === id || id in chunk.modules
        );
        if (matches.length === 1) return matches[0].fileName;
        const module = this.getModuleInfo(id);
        // Rollup can fold a pure default re-export into its single imported module.
        if (!matches.length && module?.importedIds.length === 1) {
          return resolveChunk(module.importedIds[0], visited);
        }
        return this.error(`Cannot resolve a unique tool chunk: ${id}`);
      };
      const routes: Record<string, string> = {};
      for (const id of this.getModuleIds()) {
        const normalized = id.replaceAll('\\', '/');
        if (!normalized.startsWith(directory) || !normalized.endsWith('/index.tsx')) continue;
        const toolId = normalized.slice(directory.length, -'/index.tsx'.length);
        if (toolId.includes('/')) continue;
        routes[toolId] = resolveChunk(id);
      }
      this.emitFile({
        type: 'asset',
        fileName: '.vite/tool-routes.json',
        source: JSON.stringify({ version: 1, routes }, null, 2),
      });
    },
  };
}
