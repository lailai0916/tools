import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const categories = [
  'converter',
  'text',
  'crypto',
  'web',
  'development',
  'math',
  'generator',
  'fun',
];
const guides = new Map();

for (const category of categories) {
  const source = await readFile(new URL(`src/content/toolGuides/${category}.ts`, root), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = { exports: {} };
  runInNewContext(outputText, context);
  for (const [key, localized] of Object.entries(context.exports[`${category}Guides`])) {
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

const registry = ts.createSourceFile(
  'registry.ts',
  await readFile(new URL('src/tools/registry.ts', root), 'utf8'),
  ts.ScriptTarget.Latest,
  true
);
const keys = [];
function visit(node) {
  if (
    ts.isPropertyAssignment(node) &&
    node.name.getText(registry) === 'key' &&
    ts.isStringLiteral(node.initializer)
  ) {
    keys.push(node.initializer.text);
  }
  ts.forEachChild(node, visit);
}
visit(registry);
assert.equal(new Set(keys).size, keys.length, 'Registry guide keys must be unique');
assert.deepEqual(
  [...guides.keys()].sort(),
  keys.sort(),
  'Guide coverage must match the tool registry'
);
console.log(`Verified ${keys.length} tool guides in English and Simplified Chinese.`);
