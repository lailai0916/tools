import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const require = createRequire(new URL('../../package.json', import.meta.url));
const { chromium } = require('playwright');
const options = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, args) => {
    if (value.startsWith('--')) pairs.push([value.slice(2), args[index + 1]]);
    return pairs;
  }, [])
);
const runs = Number(options.runs ?? 10);
const cpu = Number(options.cpu ?? 1);
const width = Number(options.width ?? 1440);
const urls = { A: options.a ?? 'http://127.0.0.1:5190', ...(options.b ? { B: options.b } : {}) };
const cases = {
  home: { path: '/', selector: 'main a[href="/text-codec"]' },
  codec: { path: '/text-codec', selector: '#text-codec-input', output: '#text-codec-output' },
  data: {
    path: '/data-workbench',
    selector: 'textarea:not([readonly])',
    output: 'textarea[readonly]',
  },
  qr: { path: '/qrcode', selector: 'textarea:not([readonly])' },
};
const selected = (options.cases ?? Object.keys(cases).join(',')).split(',');
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const result = {
  started: new Date().toISOString(),
  profile: {
    network: 'Fast 4G',
    latencyMs: 20,
    downBytesPerSecond: 524288,
    upBytesPerSecond: 393216,
    cpu,
    width,
    height: 900,
    runs,
  },
  paired: Boolean(options.b),
  results: {},
};

function percentile(values, p) {
  const sorted = values.toSorted((a, b) => a - b);
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  return (
    Math.round((sorted[low] + (sorted[Math.ceil(index)] - sorted[low]) * (index - low)) * 10) / 10
  );
}

async function measure(baseUrl, scenario) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    locale: 'en-US',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 20,
    downloadThroughput: 524288,
    uploadThroughput: 393216,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  // External services cannot receive benchmark tool inputs or inject measurement noise.
  await page.route('https://analytics.lailai.one/**', (route) => route.abort());
  await page.route(
    /^https:\/\/(api\.iconify\.design|api\.simplesvg\.com|api\.unisvg\.com)\//,
    (route) => route.abort()
  );
  await page.addInitScript((selector) => {
    localStorage.setItem('locale', 'en');
    window.__perf = { mounted: null, lcp: null, longtasks: [], shifts: [] };
    for (const [type, key] of [
      ['largest-contentful-paint', 'lcp'],
      ['longtask', 'longtasks'],
      ['layout-shift', 'shifts'],
    ]) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (key === 'lcp') window.__perf.lcp = entry.startTime;
          else if (key === 'longtasks') window.__perf.longtasks.push(entry.duration);
          else if (!entry.hadRecentInput) window.__perf.shifts.push(entry.value);
        }
      }).observe({ type, buffered: true });
    }
    const observe = () => {
      const element = document.querySelector(selector);
      if (element && element.getBoundingClientRect().height > 0)
        window.__perf.mounted = performance.now();
      else requestAnimationFrame(observe);
    };
    requestAnimationFrame(observe);
  }, scenario.selector);
  const observation = { ok: true };
  try {
    const response = await page.goto(`${baseUrl}${scenario.path}`, {
      waitUntil: 'commit',
      timeout: 30000,
    });
    if (response.status() !== 200) throw new Error(`Unexpected HTTP ${response.status()}`);
    await page.waitForFunction(() => window.__perf.mounted !== null);
    await page.locator(scenario.selector).first().waitFor({ state: 'visible' });
    if (scenario.path === '/') {
      await page.keyboard.press('Control+k');
      await page.getByRole('combobox').fill('Base64');
      await page.waitForFunction(() => {
        const options = [...document.querySelectorAll('dialog[open] [role="option"]')];
        return (
          options.length > 0 && options.some((item) => item.getAttribute('href') === '/text-codec')
        );
      });
    } else if (scenario.path === '/text-codec') {
      await page.locator(scenario.selector).fill('Hello');
      await page.waitForFunction(
        (selector) => document.querySelector(selector).value === 'SGVsbG8=',
        scenario.output
      );
    } else if (scenario.path === '/data-workbench') {
      await page.locator(scenario.selector).fill('{"a":1,"b":[true,false]}');
      await page.waitForFunction(
        (selector) =>
          document.querySelector(selector).value ===
          '{\n  "a": 1,\n  "b": [\n    true,\n    false\n  ]\n}',
        scenario.output
      );
    } else {
      await page.locator(scenario.selector).fill('https://lailai.one/');
      await page.waitForFunction(() =>
        [...document.querySelectorAll('main img')].some(
          (image) =>
            image.src.startsWith('data:image/png') && image.complete && image.naturalWidth > 0
        )
      );
    }
    observation.usable = await page.evaluate(() => performance.now());
    await page.waitForTimeout(200);
    Object.assign(
      observation,
      await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        const sameOrigin = resources.filter(
          (entry) => new URL(entry.name).origin === location.origin
        );
        return {
          mounted: window.__perf.mounted,
          lcp: window.__perf.lcp,
          longtaskMs: window.__perf.longtasks.reduce((sum, duration) => sum + duration, 0),
          cls: window.__perf.shifts.reduce((sum, value) => sum + value, 0),
          ttfb: navigation.responseStart,
          requests: sameOrigin.length + 1,
          transferBytes: sameOrigin.reduce(
            (sum, entry) => sum + entry.transferSize,
            navigation.transferSize
          ),
          jsBytes: sameOrigin
            .filter((entry) => new URL(entry.name).pathname.endsWith('.js'))
            .reduce((sum, entry) => sum + entry.encodedBodySize, 0),
          resources: sameOrigin.map((entry) => ({
            path: new URL(entry.name).pathname,
            bytes: entry.encodedBodySize,
            start: Math.round(entry.startTime),
            end: Math.round(entry.responseEnd),
          })),
        };
      })
    );
    if (errors.length) throw new Error(errors.join('; '));
  } catch (error) {
    observation.ok = false;
    observation.error = String(error);
  } finally {
    await context.close();
  }
  return observation;
}

try {
  for (const key of selected) {
    if (!cases[key]) throw new Error(`Unknown case ${key}`);
    const observations = Object.fromEntries(Object.keys(urls).map((variant) => [variant, []]));
    for (let iteration = 0; iteration < runs; iteration++) {
      const order = iteration % 2 ? Object.keys(urls).reverse() : Object.keys(urls);
      for (const variant of order) {
        const observation = await measure(urls[variant], cases[key]);
        observations[variant].push(observation);
        console.log(
          `${key} ${iteration + 1}/${runs} ${variant}: ${observation.ok ? Math.round(observation.usable) + 'ms' : observation.error}`
        );
      }
    }
    result.results[key] = Object.fromEntries(
      Object.entries(observations).map(([variant, observations]) => [
        variant,
        {
          url: `${urls[variant]}${cases[key].path}`,
          summary: Object.fromEntries(
            [
              'mounted',
              'usable',
              'lcp',
              'longtaskMs',
              'cls',
              'requests',
              'transferBytes',
              'jsBytes',
            ].map((metric) => [
              metric,
              Object.fromEntries(
                [
                  ['p50', 0.5],
                  ['p75', 0.75],
                  ['p95', 0.95],
                ].map(([label, percentileValue]) => [
                  label,
                  percentile(
                    observations
                      .filter((item) => item.ok && typeof item[metric] === 'number')
                      .map((item) => item[metric]),
                    percentileValue
                  ),
                ])
              ),
            ])
          ),
          passed: observations.filter((item) => item.ok).length,
          observations,
        },
      ])
    );
  }
} finally {
  await browser.close();
}
result.finished = new Date().toISOString();
const output = options.output ?? 'perf/bench/results/baseline.json';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + '\n');
for (const [key, variants] of Object.entries(result.results)) {
  console.log(
    key,
    Object.fromEntries(
      Object.entries(variants).map(([variant, data]) => [
        variant,
        { passed: data.passed, p75: data.summary.usable.p75, jsBytes: data.summary.jsBytes.p75 },
      ])
    )
  );
}
if (
  Object.values(result.results).some((variants) =>
    Object.values(variants).some((data) => data.passed !== runs)
  )
)
  process.exitCode = 1;
