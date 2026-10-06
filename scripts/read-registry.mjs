import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

export async function readRegistryModule(filename) {
  const source = await readFile(new URL(`../src/tools/${filename}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = { exports: {} };
  runInNewContext(outputText, context);
  return context.exports;
}
