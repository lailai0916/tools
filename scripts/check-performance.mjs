import { readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { readRegistryModule } from './read-registry.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const defaults = {
  dist: resolve(repository, 'dist'),
  budgets: resolve(repository, 'perf/bench/budgets.json'),
};
const format = { version: 1, metric: 'gzip-bytes', compression: { level: 9 } };

function argumentsFor(argv) {
  const options = { ...defaults, mode: 'check', help: false };
  let mode;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      options.help = true;
    } else if (argument === '--init' || argument === '--update') {
      if (mode) throw new Error('Choose either --init or --update, once.');
      mode = argument.slice(2);
      options.mode = mode;
    } else if (argument === '--dist' || argument === '--budgets' || argument === '--report') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a path.`);
      options[argument.slice(2)] = resolve(value);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (options.report) {
    if (options.report === options.budgets) {
      throw new Error('--report must not overwrite the budget ceilings file.');
    }
    if (!mode) options.mode = 'report';
  }
  return options;
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readJson(path, description) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read ${description} at ${path}: ${error.message}`, { cause: error });
  }
}

function sourceEntry(manifest, source, emittedFile) {
  const direct = record(manifest[source]) ? source : undefined;
  const matches = direct
    ? [direct]
    : Object.keys(manifest).filter((key) => manifest[key]?.src === source);
  if (matches.length === 0 && emittedFile) {
    const emitted = Object.keys(manifest).filter((key) => manifest[key]?.file === emittedFile);
    if (emitted.length !== 1) {
      throw new Error(
        `Expected one manifest chunk for ${source} (${emittedFile}); found ${emitted.length}.`
      );
    }
    return emitted[0];
  }
  if (matches.length !== 1) {
    throw new Error(
      `Expected one manifest entry for ${source}; found ${matches.length}. Flattened routes require a generated .vite/tool-routes.json mapping.`
    );
  }
  if (emittedFile && manifest[matches[0]].file !== emittedFile) {
    throw new Error(`Tool route mapping disagrees with manifest for ${source}.`);
  }
  return matches[0];
}

async function readRouteMap(dist, tools) {
  const path = resolve(dist, '.vite/tool-routes.json');
  let contents;
  try {
    contents = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  const mapping = JSON.parse(contents);
  if (!record(mapping) || mapping.version !== 1 || !record(mapping.routes)) {
    throw new Error(`Invalid generated tool route mapping: ${path}`);
  }
  const expected = Array.from(tools, (tool) => tool.id).sort();
  if (JSON.stringify(Object.keys(mapping.routes).sort()) !== JSON.stringify(expected)) {
    throw new Error('Generated tool route mapping must match every registered tool.');
  }
  for (const [id, file] of Object.entries(mapping.routes)) {
    if (typeof file !== 'string' || !file.endsWith('.js')) {
      throw new Error(`Invalid generated chunk filename for tool ${id}.`);
    }
  }
  return mapping.routes;
}

function initialFiles(manifest, roots) {
  const visited = new Set();
  const files = { js: new Set(), css: new Set() };
  const queue = [...roots];
  while (queue.length > 0) {
    const key = queue.pop();
    if (visited.has(key)) continue;
    visited.add(key);
    const chunk = manifest[key];
    if (!record(chunk) || typeof chunk.file !== 'string') {
      throw new Error(`Missing or invalid manifest chunk: ${key}`);
    }
    if (chunk.file.endsWith('.js')) files.js.add(chunk.file);
    if (chunk.file.endsWith('.css')) files.css.add(chunk.file);
    for (const property of ['css', 'imports']) {
      const entries = chunk[property] ?? [];
      if (!Array.isArray(entries) || entries.some((entry) => typeof entry !== 'string')) {
        throw new Error(`Invalid ${property} in manifest chunk: ${key}`);
      }
      if (property === 'imports') queue.push(...entries);
      else {
        for (const file of entries) {
          if (!file.endsWith('.css')) throw new Error(`Invalid CSS asset in ${key}: ${file}`);
          files.css.add(file);
        }
      }
    }
    // dynamicImports are navigation opportunities, not this route's initial payload.
  }
  return files;
}

async function measureRoutes(dist) {
  const manifest = await readJson(resolve(dist, '.vite/manifest.json'), 'Vite manifest');
  if (!record(manifest)) throw new Error('Vite manifest must be an object.');
  const home = sourceEntry(manifest, 'index.html');
  if (manifest[home].isEntry !== true) throw new Error('index.html is not a Vite entry.');
  const { TOOLS } = await readRegistryModule('registry');
  const mapping = await readRouteMap(dist, TOOLS);
  const roots = new Map([
    ['/', [home]],
    ...Array.from(TOOLS, (tool) => [
      `/${tool.id}`,
      [home, sourceEntry(manifest, `src/tools/${tool.id}/index.tsx`, mapping?.[tool.id])],
    ]),
  ]);
  if (roots.size !== TOOLS.length + 1) throw new Error('Duplicate registered tool route.');
  const sizes = new Map();
  const routes = {};
  for (const [route, entries] of roots) {
    const files = initialFiles(manifest, entries);
    const totals = { js: 0, css: 0 };
    for (const kind of ['js', 'css']) {
      for (const file of files[kind]) {
        if (!sizes.has(file)) {
          const path = resolve(dist, file);
          if (!path.startsWith(`${dist}${sep}`)) {
            throw new Error(`Manifest asset leaves dist: ${file}`);
          }
          let bytes;
          try {
            bytes = await readFile(path);
          } catch (error) {
            throw new Error(`Missing built asset ${file}: ${error.message}`, { cause: error });
          }
          sizes.set(file, gzipSync(bytes, { level: format.compression.level }).byteLength);
        }
        totals[kind] += sizes.get(file);
      }
    }
    routes[route] = totals;
  }
  return { ...format, routes };
}

function validateBudgets(budgets, measured) {
  if (
    !record(budgets) ||
    budgets.version !== format.version ||
    budgets.metric !== format.metric ||
    budgets.compression?.level !== format.compression.level ||
    !record(budgets.routes)
  ) {
    throw new Error('Unsupported performance budget format.');
  }
  const wanted = Object.keys(measured.routes).sort();
  const present = Object.keys(budgets.routes).sort();
  if (JSON.stringify(wanted) !== JSON.stringify(present)) {
    const missing = wanted.filter((route) => !present.includes(route));
    const stale = present.filter((route) => !wanted.includes(route));
    throw new Error(
      `Budget routes must match the current registry. Missing: ${missing.join(', ') || 'none'}. Stale: ${stale.join(', ') || 'none'}. Review route additions or removals explicitly.`
    );
  }
  const failures = [];
  for (const [route, actual] of Object.entries(measured.routes)) {
    const ceiling = budgets.routes[route];
    for (const kind of ['js', 'css']) {
      if (!Number.isSafeInteger(ceiling?.[kind]) || ceiling[kind] < 0) {
        throw new Error(`Invalid ${kind} budget for ${route}.`);
      }
      if (actual[kind] > ceiling[kind]) {
        failures.push(
          `${route} ${kind}: ${actual[kind]} > ${ceiling[kind]} gzip bytes (+${actual[kind] - ceiling[kind]})`
        );
      }
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `Initial asset budgets exceeded:\n${failures.join('\n')}\n--update never raises ceilings. Review and justify any necessary allowance explicitly.`
    );
  }
}

async function writeBudgets(path, value, mode) {
  await mkdir(dirname(path), { recursive: true });
  const contents = `${JSON.stringify(value, null, 2)}\n`;
  if (mode === 'init') {
    await writeFile(path, contents, { flag: 'wx' });
    return;
  }
  const temporary = `${path}.tmp-${process.pid}`;
  try {
    await writeFile(temporary, contents, { flag: 'wx' });
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

async function main() {
  const options = argumentsFor(process.argv.slice(2));
  if (options.help) {
    console.log(`Check deterministic initial JavaScript/CSS budgets from a production build.

node scripts/check-performance.mjs                 Check existing ceilings.
node scripts/check-performance.mjs --init          Create first ceilings; refuses an existing file.
node scripts/check-performance.mjs --update        Lower ceilings after a validated improvement.
node scripts/check-performance.mjs --report PATH   Write measured JSON without changing ceilings.

Optional --dist PATH and --budgets PATH select comparison artifacts.
--report can also accompany --init or --update.
Static imports only; shared assets count once per route; gzip level 9; no timing gate.`);
    return;
  }
  const measured = await measureRoutes(options.dist);
  if (options.report) {
    await writeBudgets(options.report, measured, 'report');
    if (options.mode === 'report') {
      console.log(
        `Reported initial asset measurements for ${Object.keys(measured.routes).length} routes.`
      );
      return;
    }
  }
  if (options.mode === 'init') {
    await writeBudgets(options.budgets, measured, options.mode);
    console.log(`Initialized ${Object.keys(measured.routes).length} initial asset budgets.`);
    return;
  }
  const budgets = await readJson(options.budgets, 'performance budgets (use --init once)');
  validateBudgets(budgets, measured);
  if (options.mode === 'update') {
    const lowered = Object.entries(measured.routes).reduce(
      (count, [route, value]) =>
        count + ['js', 'css'].filter((kind) => value[kind] < budgets.routes[route][kind]).length,
      0
    );
    await writeBudgets(options.budgets, measured, options.mode);
    console.log(
      `Lowered ${lowered} ceilings across ${Object.keys(measured.routes).length} routes.`
    );
  } else {
    console.log(
      `Verified initial JS/CSS budgets for ${Object.keys(measured.routes).length} routes (gzip level 9; zero byte tolerance).`
    );
  }
}

await main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
