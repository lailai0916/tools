import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run this separately from performance sampling so browser work cannot contaminate timings.
// Capture: node perf/bench/guard.mjs --baseline http://localhost:5190 --out perf/results/guard
// Compare: add --candidate http://localhost:5191 (both builds stay available).
// Use --strict-http with the deployment-like static server, not Vite's SPA preview fallback.
// Add --all-guides to compare every registered tool's guide in both languages.
const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const argument = process.argv[i];
  if (argument === '--strict-http' || argument === '--all-guides') args.set(argument, true);
  else if (argument.startsWith('--')) args.set(argument, process.argv[++i]);
  else throw new Error(`Unexpected argument: ${argument}`);
}
const baseline = args.get('--baseline');
const candidate = args.get('--candidate');
assert.ok(baseline, '--baseline URL is required');
const outputDirectory = resolve(args.get('--out') ?? 'perf/results/guard');
const executablePath = args.get('--chromium') ?? '/usr/bin/chromium';
const directory = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(directory, '../../package.json'));
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const importedPixelmatch = require('pixelmatch');
const pixelmatch = importedPixelmatch.default ?? importedPixelmatch;
const iconFixture = await readFile(join(directory, 'fixtures/lucide.json'), 'utf8');
const report = {
  description: 'Functional, screenshot, privacy and SEO guard; never a timing benchmark.',
  strictHttp: Boolean(args.get('--strict-http')),
  allGuides: Boolean(args.get('--all-guides')),
  baseline,
  candidate: candidate ?? null,
  versions: {},
  comparisons: [],
  guideComparisons: [],
  failures: [],
};
const configurations = [
  { id: 'desktop-en-light', width: 1440, height: 1000, locale: 'en', theme: 'light' },
  { id: 'mobile-zh-dark', width: 390, height: 844, locale: 'zh-Hans', theme: 'dark' },
];
const routes = ['/', '/text-codec', '/data-workbench', '/qrcode', '/text-diff', '/unit-converter'];
const digest = (buffer) => createHash('sha256').update(buffer).digest('hex');
const textInput = 'hello 世界';
const encoded = 'aGVsbG8g5LiW55WM';
const dataInput = '[{"name":"Ada","score":3},{"name":"Lin","score":4}]';
const jsonOutput = JSON.stringify(JSON.parse(dataInput), null, 2);
const yamlOutput = '- name: Ada\n  score: 3\n- name: Lin\n  score: 4';
const csvOutput = 'name,score\nAda,3\nLin,4';
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
await mkdir(outputDirectory, { recursive: true });

async function check(version, name, operation) {
  try {
    await operation();
    version.checks.push(name);
  } catch (error) {
    const failure = { version: version.label, name, error: String(error).slice(0, 1800) };
    report.failures.push(failure);
    console.error(`FAIL ${version.label}: ${name}: ${failure.error}`);
  }
}

async function ready(page, pathname) {
  await page.locator('main h1').waitFor();
  if (pathname !== '/' && pathname !== '/404') {
    await page.locator('[data-tool="workspace"]').waitFor();
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.querySelectorAll('svg.iconify')].every((icon) => icon.children.length > 0)
  );
  // Observe committed DOM, then two paint frames; no network-idle dependency on analytics.
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  );
}

async function selectOption(page, fieldIndex, name) {
  await page.locator('[data-lk="dropdown-select-trigger"]').nth(fieldIndex).click();
  const popup = page.locator('[data-lk="dropdown-select-popup"][data-open]');
  await popup.getByRole('option', { name, exact: true }).click();
  await popup.waitFor({ state: 'detached' });
}

async function fieldEquals(field, value) {
  await field.page().waitForFunction(({ element, expected }) => element.value === expected, {
    element: await field.elementHandle(),
    expected: value,
  });
  assert.equal(await field.inputValue(), value);
}

async function visual(version, page, configuration, name) {
  await page.mouse.move(0, 0);
  await page
    .locator('[data-lk="action-hint"] [role="tooltip"]')
    .waitFor({ state: 'hidden' })
    .catch(() => {});
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  );
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    theme: document.documentElement.dataset.theme,
    lang: document.documentElement.lang,
    rawKeys: /\b(?:tools|common|site)\.[A-Za-z]/.test(document.body.innerText),
  }));
  assert.ok(
    layout.document <= layout.viewport + 1,
    `${name}: horizontal overflow ${JSON.stringify(layout)}`
  );
  assert.equal(layout.theme, configuration.theme);
  assert.equal(layout.lang, configuration.locale);
  assert.equal(layout.rawKeys, false);
  const key = `${configuration.id}-${name}`;
  const path = join(outputDirectory, version.label, `${key}.png`);
  await mkdir(dirname(path), { recursive: true });
  const screenshot = await page.screenshot({
    path,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
  version.screenshots[key] = { path, sha256: digest(screenshot), layout };
}

async function createContext(version, base, configuration) {
  const origin = new URL(base).origin;
  const context = await browser.newContext({
    viewport: { width: configuration.width, height: configuration.height },
    locale: configuration.locale === 'en' ? 'en-US' : 'zh-CN',
    colorScheme: configuration.theme,
    timezoneId: 'UTC',
    permissions: ['clipboard-read', 'clipboard-write'],
    acceptDownloads: true,
    serviceWorkers: 'block',
  });
  await context.addInitScript(({ locale, theme }) => {
    // Set each once per context. Reloads must preserve actual user changes.
    if (!sessionStorage.getItem('perf.guard.initialized')) {
      localStorage.setItem('locale', locale);
      localStorage.setItem('lailai.theme', theme);
      sessionStorage.setItem('perf.guard.initialized', '1');
    }
    window.__guardWorkers = 0;
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(...parameters) {
        super(...parameters);
        window.__guardWorkers++;
      }
    };
  }, configuration);
  // This route prevents all external tool data uploads and gives A/B identical icon responses.
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const entry = { method: request.method(), origin: url.origin, path: url.pathname };
    if (url.origin === origin || !/^https?:$/.test(url.protocol)) return route.continue();
    version.externalRequests.push(entry);
    if (['api.iconify.design', 'api.simplesvg.com', 'api.unisvg.com'].includes(url.hostname)) {
      assert.equal(request.method(), 'GET');
      return route.fulfill({ status: 200, contentType: 'application/json', body: iconFixture });
    }
    if (url.hostname === 'analytics.lailai.one') {
      // No real script runs, and no analytics events leave the browser.
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    }
    version.blockedExternalRequests.push(entry);
    return route.abort('blockedbyclient');
  });
  context.on('request', (request) => {
    const value = request.url() + (request.postData() ?? '');
    // User-generated values must never be included in any HTTP request, even same-origin.
    if (
      [textInput, encoded, dataInput, 'guard-private-qr'].some((marker) => value.includes(marker))
    ) {
      version.privacyFailures.push({ url: request.url(), method: request.method() });
    }
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => version.errors.push(String(error)));
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if (path.startsWith('/assets/') && response.status() >= 400) {
      version.errors.push(`Asset HTTP ${response.status()}: ${path}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) {
      version.errors.push(message.text());
    }
  });
  const goto = async (path) => {
    const response = await page.goto(new URL(path, base).href, { waitUntil: 'load' });
    await ready(page, path.split('?')[0]);
    return response;
  };
  return { context, page, goto };
}

async function runFunctional(version, base, configuration) {
  const { context, page, goto } = await createContext(version, base, configuration);
  const label = configuration.id;
  const english = configuration.locale === 'en';
  try {
    await check(version, `${label}: homepage and search`, async () => {
      await goto('/');
      assert.equal(await page.locator('main a[href="/text-codec"]').count(), 1);
      await visual(version, page, configuration, 'home');
      await page.keyboard.press('Control+k');
      const dialog = page.locator('dialog[open]');
      const search = dialog.getByRole('combobox');
      await search.fill('base64');
      const result = dialog.getByRole('option');
      assert.equal(await result.count(), 1);
      assert.equal(await result.getAttribute('href'), '/text-codec');
      await search.press('Enter');
      await page.waitForURL('**/text-codec');
      await ready(page, '/text-codec');
      assert.equal(await page.locator('dialog[open]').count(), 0);
    });
    await check(version, `${label}: Base64 Unicode encode/decode and invalid input`, async () => {
      await goto('/text-codec?format=base64&mode=encode');
      const input = page.locator('#text-codec-input');
      const output = page.locator('#text-codec-output');
      await input.fill(textInput);
      await fieldEquals(output, encoded);
      await page.getByRole('radio', { name: english ? 'Decode' : '解码', exact: true }).click();
      await input.fill(encoded);
      await fieldEquals(output, textInput);
      await selectOption(page, 0, 'Base64');
      await fieldEquals(output, textInput);
      await visual(version, page, configuration, 'codec');
      await input.fill('%%%');
      await page.getByRole('alert').waitFor();
      assert.equal(await output.inputValue(), '');
      const favorite = page.locator('[data-tool="page"] button[aria-pressed]');
      await favorite.click();
      assert.equal(await favorite.getAttribute('aria-pressed'), 'true');
      assert.deepEqual(
        await page.evaluate(() => JSON.parse(localStorage.getItem('tools.favorites'))),
        ['text-codec']
      );
      await page.reload({ waitUntil: 'load' });
      await ready(page, '/text-codec');
      assert.equal(await favorite.getAttribute('aria-pressed'), 'true');
      await goto('/?view=favorites');
      assert.equal(await page.locator('main a[href="/text-codec"]').count(), 1);
      assert.equal(await page.locator('main a[href="/data-workbench"]').count(), 0);
    });
    await check(version, `${label}: JSON formatting, YAML and CSV exact outputs`, async () => {
      await goto('/data-workbench?from=json&to=json');
      const input = page.locator('textarea:not([readonly])');
      const output = page.locator('textarea[readonly]');
      await input.fill(dataInput);
      await fieldEquals(output, jsonOutput);
      await selectOption(page, 1, 'YAML');
      await fieldEquals(output, yamlOutput);
      await selectOption(page, 1, 'CSV');
      await fieldEquals(output, csvOutput);
      await visual(version, page, configuration, 'data');
      await selectOption(page, 0, 'YAML');
      await selectOption(page, 1, 'JSON');
      await input.fill(yamlOutput);
      await fieldEquals(output, jsonOutput);
    });
    await check(version, `${label}: QR raster, SVG and actual downloaded bytes`, async () => {
      await goto('/qrcode');
      await page.locator('#qrcode-input').fill('guard-private-qr');
      const image = page.locator('[data-tool="workspace"] img');
      await image.waitFor();
      await page.waitForFunction(() => {
        const image = document.querySelector('[data-tool="workspace"] img');
        return image?.complete && image.naturalWidth === 512;
      });
      const pngSource = await image.getAttribute('src');
      const pngBuffer = Buffer.from(pngSource.split(',')[1], 'base64');
      const png = PNG.sync.read(pngBuffer);
      assert.equal(png.width, 512);
      assert.equal(png.height, 512);
      let blackPixels = 0;
      for (let index = 0; index < png.data.length; index += 4) {
        assert.ok(png.data[index] === 0 || png.data[index] === 255);
        assert.equal(png.data[index + 1], png.data[index]);
        assert.equal(png.data[index + 2], png.data[index]);
        assert.equal(png.data[index + 3], 255);
        if (png.data[index] === 0) blackPixels++;
      }
      assert.ok(blackPixels > 10_000 && blackPixels < 200_000);
      const svgLink = page.locator('a[download="qrcode.svg"]');
      const svgText = decodeURIComponent((await svgLink.getAttribute('href')).split(',')[1]);
      assert.match(svgText, /^<svg\s/);
      assert.match(svgText, /width="512"/);
      const downloadInfo = {};
      for (const [format, link] of [
        ['png', page.locator('a[download="qrcode-512.png"]')],
        ['svg', svgLink],
      ]) {
        const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
        const path = await download.path();
        const bytes = await readFile(path);
        assert.equal(await download.failure(), null);
        assert.equal(digest(bytes), digest(format === 'png' ? pngBuffer : Buffer.from(svgText)));
        downloadInfo[format] = { filename: download.suggestedFilename(), sha256: digest(bytes) };
      }
      version.outputs[`${label}-qr`] = downloadInfo;
      await visual(version, page, configuration, 'qr');
    });
    await check(version, `${label}: actual diff worker and copied exact output`, async () => {
      await goto('/text-diff');
      await page.locator('#diff-original').fill('alpha\nbeta\ngamma\n');
      await page.locator('#diff-modified').fill('alpha\ndelta\ngamma\n');
      const lines = page.locator('[data-tool="workspace"] div[class*="line_"]');
      await page.waitForFunction(
        () => document.querySelectorAll('[data-tool="workspace"] div[class*="line_"]').length === 4
      );
      const actual = await lines.evaluateAll((elements) =>
        elements.map((line) => ({
          sign: line.children[0].textContent,
          text: line.children[1].textContent,
        }))
      );
      assert.deepEqual(actual, [
        { sign: ' ', text: 'alpha' },
        { sign: '-', text: 'beta' },
        { sign: '+', text: 'delta' },
        { sign: ' ', text: 'gamma' },
      ]);
      assert.ok(await page.evaluate(() => window.__guardWorkers > 0));
      await visual(version, page, configuration, 'diff');
      await page.getByRole('button', { name: english ? 'Copy' : '复制', exact: true }).click();
      assert.equal(
        await page.evaluate(() => navigator.clipboard.readText()),
        '  alpha\n- beta\n+ delta\n  gamma'
      );
    });
    await check(
      version,
      `${label}: unit transitions retain input and controlled selection`,
      async () => {
        await goto('/unit-converter?dimension=length&unit=inch');
        await page.locator('#unit-converter-value').fill('37.5');
        const dimensionNames = english
          ? ['Temperature', 'Data size', 'Duration', 'Angle', 'Length']
          : ['温度', '数据大小', '时长', '角度', '长度'];
        for (const name of dimensionNames) {
          await page.getByRole('radio', { name, exact: true }).click();
          await page.locator('[data-tool="results"]').waitFor();
          assert.equal(await page.locator('#unit-converter-value').inputValue(), '37.5');
        }
        await page.waitForFunction(
          () => new URL(location.href).searchParams.get('unit') === 'meter'
        );
        const trigger = page.locator('[data-lk="dropdown-select-trigger"]');
        await trigger.click();
        await page
          .locator('[data-lk="dropdown-select-popup"][data-open]')
          .getByRole('option', { selected: true })
          .waitFor();
        await page.keyboard.press('Escape');
        await page
          .locator('[data-lk="dropdown-select-popup"][data-open]')
          .waitFor({ state: 'detached' });
        await page.waitForFunction(
          (element) => document.activeElement === element,
          await trigger.elementHandle()
        );
        assert.equal(new URL(page.url()).searchParams.get('unit'), 'meter');
        const metres = page.locator('[data-tool="results"] > div').first();
        assert.equal((await metres.locator('code').innerText()).trim(), '37.5');
        await visual(version, page, configuration, 'units');
      }
    );
    await check(version, `${label}: history, persistent language and system theme`, async () => {
      const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('tools.recent')));
      assert.deepEqual(recent.slice(0, 5), [
        'unit-converter',
        'text-diff',
        'qrcode',
        'data-workbench',
        'text-codec',
      ]);
      await goto('/?view=recent');
      assert.equal(await page.locator('main a[href="/unit-converter"]').count(), 1);
      await page.locator('[data-lk="language-button"]').click();
      const otherLocale = english ? 'zh-Hans' : 'en';
      await page.waitForFunction((locale) => document.documentElement.lang === locale, otherLocale);
      await page.locator('[data-lk="theme-button"]').click();
      const otherTheme = configuration.theme === 'light' ? 'dark' : 'light';
      await page.waitForFunction(
        (theme) => document.documentElement.dataset.theme === theme,
        otherTheme
      );
      await page.reload({ waitUntil: 'load' });
      await ready(page, '/');
      assert.equal(await page.locator('html').getAttribute('lang'), otherLocale);
      // Tools follows the system on reload; an explicit button choice lasts this document.
      assert.equal(await page.locator('html').getAttribute('data-theme'), configuration.theme);
      assert.equal(await page.evaluate(() => localStorage.getItem('locale')), otherLocale);
      assert.equal(
        await page.evaluate(() => localStorage.getItem('lailai.theme')),
        configuration.theme
      );
    });
  } finally {
    await context.close();
  }
}

async function runSeo(version, base) {
  const configuration = configurations[0];
  const { context, page, goto } = await createContext(version, base, configuration);
  try {
    await check(version, 'lossless logo pixels and original color metadata', async () => {
      const response = await context.request.get(new URL('/logo.svg', base).href);
      assert.equal(response.status(), 200);
      const svg = await response.text();
      const payload = svg.match(/data:image\/png;base64,([^\"]+)/)?.[1];
      assert.ok(payload);
      const pngBuffer = Buffer.from(payload.replaceAll('&#10;', '\n'), 'base64');
      const image = PNG.sync.read(pngBuffer);
      const metadata = [];
      for (let offset = 8; offset < pngBuffer.length;) {
        const length = pngBuffer.readUInt32BE(offset);
        const type = pngBuffer.toString('ascii', offset + 4, offset + 8);
        if (type === 'sRGB' || type === 'eXIf') {
          metadata.push({ type, sha256: digest(pngBuffer.subarray(offset, offset + length + 12)) });
        }
        offset += length + 12;
      }
      const provenance = JSON.parse(
        await readFile(join(directory, 'fixtures/logo-provenance.json'), 'utf8')
      );
      assert.equal(image.width, 1024);
      assert.equal(image.height, 1024);
      assert.equal(digest(image.data), provenance.rgbaHash);
      assert.deepEqual(
        metadata,
        provenance.ancillaryChunks.map((chunk) => ({ type: chunk.name, sha256: chunk.sha256 }))
      );
      version.outputs.logo = {
        width: image.width,
        height: image.height,
        rgbaSha256: digest(image.data),
        metadata,
      };
    });
    for (const route of routes) {
      await check(version, `SEO ${route}`, async () => {
        const response = await goto(route);
        assert.equal(response.status(), 200);
        const html = await response.text();
        if (route === '/') {
          assert.doesNotMatch(html, /<link\b[^>]*rel=["']modulepreload["']/);
        }
        const head = await page.evaluate(() => ({
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content ?? null,
          canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
          robots: document.querySelector('meta[name="robots"]')?.content ?? null,
          heading: document.querySelector('main h1')?.textContent ?? null,
          rawTitle: null,
        }));
        head.rawTitle = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null;
        assert.ok(head.title && head.heading && head.description && head.rawTitle);
        if (route !== '/') assert.equal(head.canonical, `https://tools.lailai.one${route}`);
        version.seo[route] = head;
      });
    }
    await check(version, 'legacy codec redirect retains query and hash', async () => {
      await goto('/base64?mode=decode&guard=keep#guide');
      await page.waitForURL('**/text-codec?format=base64&mode=decode&guard=keep#guide');
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute('href'),
        'https://tools.lailai.one/text-codec'
      );
      assert.equal(new URL(page.url()).searchParams.get('guard'), 'keep');
    });
    await check(version, 'legacy data redirect retains explicit operation', async () => {
      await goto('/json-to-yaml?to=csv');
      await page.waitForURL('**/data-workbench?from=json&to=csv');
    });
    for (const route of ['/sql-formatter', '/removed-tool-check']) {
      await check(version, `retired/unknown ${route}`, async () => {
        const response = await page.goto(new URL(route, base).href, { waitUntil: 'load' });
        await page.getByRole('heading', { name: '404', exact: true }).waitFor();
        version.seo[route] = { status: response.status(), title: await page.title() };
        assert.doesNotMatch(await response.text(), /<link\b[^>]*rel=["']modulepreload["']/);
        if (report.strictHttp) assert.equal(response.status(), 404);
      });
    }
  } finally {
    await context.close();
  }
}

async function runAllGuides(version, base) {
  const { readRegistryModule } = await import('../../scripts/read-registry.mjs');
  const { TOOLS } = await readRegistryModule('registry');
  const ids = Array.from(TOOLS, (tool) => tool.id);
  assert.equal(ids.length, new Set(ids).size, 'Duplicate registered tool ID');
  for (const locale of ['en', 'zh-Hans']) {
    const configuration = {
      ...configurations[0],
      id: `all-guides-${locale}`,
      locale,
    };
    const { context, page, goto } = await createContext(version, base, configuration);
    try {
      const manifestResponse = await context.request.get(
        new URL('/.vite/tool-routes.json', base).href
      );
      const toolManifest = manifestResponse.status() === 200 ? await manifestResponse.json() : null;
      for (const id of ids) {
        await check(version, `guide runtime ${locale}/${id}`, async () => {
          const response = await goto(`/${id}`);
          assert.equal(response.status(), 200);
          const guide = page.locator('[data-tool="guide"]');
          await guide.waitFor();
          assert.equal(await guide.count(), 1);
          const content = await guide.innerText();
          assert.ok(content.length > 100, 'Guide is unexpectedly empty');
          const headings = await guide.locator('h2, h3').allTextContents();
          assert.deepEqual(
            headings.map((heading) => heading.trim()),
            locale === 'en'
              ? ['Tool guide', 'How to use', 'Notes', 'Example']
              : ['工具指南', '如何使用', '注意事项', '示例']
          );
          assert.equal(await page.locator('html').getAttribute('lang'), locale);
          const rawHtml = await response.text();
          const assets = await page.evaluate((html) => {
            const head = new DOMParser().parseFromString(html, 'text/html').head;
            const modulePreloads = [...head.querySelectorAll('link[rel="modulepreload"]')].map(
              (link) => link.getAttribute('href')
            );
            const stylesheets = [...head.querySelectorAll('link[rel="stylesheet"]')].map((link) =>
              link.getAttribute('href')
            );
            const downloads = performance.getEntriesByType('resource').flatMap((entry) => {
              const url = new URL(entry.name);
              return url.origin === location.origin &&
                /^\/assets\/.*\.(?:js|css)$/.test(url.pathname)
                ? [url.pathname]
                : [];
            });
            return { modulePreloads, stylesheets, downloads };
          }, rawHtml);
          assert.equal(assets.modulePreloads.length, new Set(assets.modulePreloads).size);
          assert.equal(assets.stylesheets.length, new Set(assets.stylesheets).size);
          assert.equal(
            assets.downloads.length,
            new Set(assets.downloads).size,
            `Repeated JS/CSS downloads: ${JSON.stringify(assets.downloads)}`
          );
          if (toolManifest) {
            const ownChunk = `/${toolManifest.routes[id]}`;
            assert.ok(assets.modulePreloads.includes(ownChunk), 'Route entry was not preloaded');
            const otherEntries = new Set(
              Object.values(toolManifest.routes).map((path) => `/${path}`)
            );
            assert.deepEqual(
              assets.modulePreloads.filter((path) => otherEntries.has(path) && path !== ownChunk),
              [],
              'An unrelated tool entry was preloaded'
            );
          }
          version.routeAssets[`${locale}/${id}`] = assets;
          version.guides[`${locale}/${id}`] = {
            content,
            headings,
            pageHeading: await page.locator('main h1').innerText(),
            title: await page.title(),
            status: response.status(),
          };
        });
      }
    } finally {
      await context.close();
    }
  }
  await check(version, 'every registered tool has both guide languages', async () => {
    assert.equal(Object.keys(version.guides).length, ids.length * 2);
  });
}

async function runVersion(label, base) {
  const version = (report.versions[label] = {
    label,
    checks: [],
    outputs: {},
    screenshots: {},
    seo: {},
    guides: {},
    routeAssets: {},
    externalRequests: [],
    blockedExternalRequests: [],
    privacyFailures: [],
    errors: [],
  });
  for (const configuration of configurations) await runFunctional(version, base, configuration);
  // Also preserve the opposite homepage theme at both widths.
  for (const configuration of configurations) {
    const opposite = {
      ...configuration,
      id: `${configuration.id}-opposite`,
      theme: configuration.theme === 'light' ? 'dark' : 'light',
    };
    const { context, page, goto } = await createContext(version, base, opposite);
    await check(version, `${opposite.id}: homepage screenshot`, async () => {
      await goto('/');
      await visual(version, page, opposite, 'home');
    });
    await context.close();
  }
  await runSeo(version, base);
  if (report.allGuides) await runAllGuides(version, base);
  await check(version, 'privacy and browser errors', async () => {
    assert.deepEqual(version.blockedExternalRequests, []);
    assert.deepEqual(version.privacyFailures, []);
    assert.deepEqual(version.errors, []);
  });
  console.log(
    `${label}: ${version.checks.length} guards passed; ${Object.keys(version.screenshots).length} screenshots`
  );
}

try {
  await runVersion('baseline', baseline);
  if (candidate) {
    await runVersion('candidate', candidate);
    const reference = report.versions.baseline;
    const optimized = report.versions.candidate;
    await check(optimized, 'SEO and exported artifacts equal baseline', async () => {
      assert.deepEqual(optimized.seo, reference.seo);
      assert.deepEqual(optimized.outputs, reference.outputs);
    });
    if (report.allGuides) {
      for (const [name, guide] of Object.entries(reference.guides)) {
        await check(optimized, `guide content unchanged ${name}`, async () => {
          assert.deepEqual(optimized.guides[name], guide);
          report.guideComparisons.push({
            name,
            contentCharacters: guide.content.length,
            contentSha256: digest(Buffer.from(guide.content)),
            equal: true,
          });
        });
      }
    }
    for (const [name, screenshot] of Object.entries(reference.screenshots)) {
      await check(optimized, `visual regression ${name}`, async () => {
        const after = optimized.screenshots[name];
        assert.ok(after, `Missing candidate screenshot ${name}`);
        const first = PNG.sync.read(await readFile(screenshot.path));
        const second = PNG.sync.read(await readFile(after.path));
        assert.equal(first.width, second.width);
        assert.equal(first.height, second.height);
        const diff = new PNG({ width: first.width, height: first.height });
        const changed = pixelmatch(first.data, second.data, diff.data, first.width, first.height, {
          threshold: 0.1,
          includeAA: false,
        });
        const pixels = first.width * first.height;
        const comparison = {
          name,
          changedPixels: changed,
          pixels,
          ratio: changed / pixels,
          baseline: screenshot.path,
          candidate: after.path,
        };
        report.comparisons.push(comparison);
        if (changed) {
          comparison.diff = join(outputDirectory, `${name}-diff.png`);
          await writeFile(comparison.diff, PNG.sync.write(diff));
        }
        // Allow tiny antialiasing differences, but never silently accept changed geometry.
        assert.ok(
          changed / pixels <= 0.0001,
          `Visual changed: ${changed}/${pixels} pixels (${((changed / pixels) * 100).toFixed(4)}%)`
        );
      });
    }
  }
} finally {
  await browser.close();
  await writeFile(join(outputDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(
  JSON.stringify(
    {
      versions: Object.fromEntries(
        Object.entries(report.versions).map(([key, value]) => [key, value.checks.length])
      ),
      comparisons: report.comparisons.length,
      guideComparisons: report.guideComparisons.length,
      failures: report.failures,
    },
    null,
    2
  )
);
if (report.failures.length) process.exitCode = 1;
