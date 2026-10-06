import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { readRegistryModule } from './read-registry.mjs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const guideFiles = (await readdir(new URL('src/content/toolGuides/', root))).filter(
  (file) => file.endsWith('.ts') && file !== 'index.ts' && file !== 'types.ts'
);
const guides = new Map();

for (const filename of guideFiles) {
  const source = await readFile(new URL(`src/content/toolGuides/${filename}`, root), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = { exports: {} };
  runInNewContext(outputText, context);
  for (const [key, localized] of Object.entries(Object.values(context.exports)[0])) {
    assert(!guides.has(key), `Duplicate guide: ${key}`);
    guides.set(key, localized);
    assert.deepEqual(Object.keys(localized).sort(), ['en', 'zh-Hans'], `${key}: locales`);
    for (const [locale, guide] of Object.entries(localized)) {
      const label = `${key}/${locale}`;
      assert(guide.steps.length >= 2, `${label}: at least two steps`);
      assert(guide.notes.length >= 1, `${label}: at least one note`);
      for (const value of [
        guide.summary,
        ...guide.steps,
        ...guide.notes,
        guide.example.input,
        guide.example.output,
      ]) {
        assert(typeof value === 'string' && value.trim().length > 0, `${label}: empty content`);
      }
    }
  }
}

const { TOOLS } = await readRegistryModule('registry');
const { LEGACY_ROUTES } = await readRegistryModule('legacyRoutes');
const keys = Array.from(TOOLS, (tool) => tool.key);
const ids = new Set(TOOLS.map((tool) => tool.id));
assert.equal(ids.size, TOOLS.length, 'Registry route IDs must be unique');
const folders = (await readdir(new URL('src/tools/', root), { withFileTypes: true }))
  .filter((item) => item.isDirectory())
  .map((item) => item.name);
assert.deepEqual(folders.sort(), [...ids].sort(), 'Every tool directory must be registered');
for (const [legacy, target] of Object.entries(LEGACY_ROUTES)) {
  assert(!ids.has(legacy), `Legacy route overlaps a tool: ${legacy}`);
  assert(ids.has(target.split('?')[0].slice(1)), `Missing legacy target: ${target}`);
}
assert.equal(new Set(keys).size, keys.length, 'Registry guide keys must be unique');
assert.deepEqual(
  [...guides.keys()].sort(),
  keys.sort(),
  'Guide coverage must match the tool registry'
);
console.log(`Verified ${keys.length} tool guides in English and Simplified Chinese.`);
