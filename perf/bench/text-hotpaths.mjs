import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(resolve(root, 'package.json'));
const { chromium } = require('playwright');
const argumentsList = process.argv.slice(2);
const option = (name, fallback) => {
  const index = argumentsList.indexOf(name);
  return index < 0 ? fallback : argumentsList[index + 1];
};
const baselineRef = option('--baseline-ref', '2c10afcaf6b411cda5bbacd43f939e820865f93a');
const candidateRef = option('--candidate-ref', 'WORKTREE');
const samples = Number(option('--samples', '25'));
const baselineOnly = argumentsList.includes('--baseline-only');
const outputPath = resolve(root, option('--output', 'perf/results/text-hotpaths.json'));
assert(Number.isInteger(samples) && samples >= 5 && samples <= 100);

function moduleSource(name, ref) {
  const relative = `src/utils/${name}.ts`;
  const source =
    ref === 'WORKTREE'
      ? readFileSync(resolve(root, relative), 'utf8')
      : execFileSync('git', ['show', `${ref}:${relative}`], { cwd: root, encoding: 'utf8' });
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
}

const sources = {
  baseline: {
    codec: moduleSource('textCodec', baselineRef),
    text: moduleSource('textWorkbench', baselineRef),
  },
  ...(baselineOnly
    ? {}
    : {
        candidate: {
          codec: moduleSource('textCodec', candidateRef),
          text: moduleSource('textWorkbench', candidateRef),
        },
      }),
};
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  await page.evaluate(async (versions) => {
    globalThis.hotpathModules = {};
    for (const [version, modules] of Object.entries(versions)) {
      globalThis.hotpathModules[version] = {};
      for (const [name, source] of Object.entries(modules)) {
        const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
        globalThis.hotpathModules[version][name] = await import(url);
        URL.revokeObjectURL(url);
      }
    }
  }, sources);

  const golden = await page.evaluate(() => {
    const checks = [];
    const equal = (name, actual, expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${name}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
      }
      checks.push(name);
    };
    for (const [version, { codec, text }] of Object.entries(globalThis.hotpathModules)) {
      const decode = (input) => codec.decodeTextCodec(input, 'html');
      equal(
        `${version}: HTML preserves literal markup and CRLF without reparsing decoded markup`,
        decode('<b>&lt;/textarea&gt;</b>\r\n&amp;lt;'),
        '<b></textarea></b>\r\n&lt;'
      );
      equal(
        `${version}: HTML retains browser rules for missing semicolons and invalid references`,
        decode('&copy &COPY; &unknown; &notit; &#0; &#x80; &#128512; &amp;lt;'),
        '© © &unknown; ¬it; � € 😀 &lt;'
      );
      equal(
        `${version}: HTML isolates adjacent references and keeps control characters`,
        decode('&amp;&lt;&#13;&#10;&#xD800;&amp;&lt;'),
        '&<\r\n�&<'
      );
      equal(
        `${version}: HTML does not interpret input tags, scripts, or resource attributes`,
        decode('<script>window.incorrect=true</script><img src="https://example.invalid/x">&gt;'),
        '<script>window.incorrect=true</script><img src="https://example.invalid/x">>'
      );
      equal(
        `${version}: HTML performs exactly one decoding pass`,
        decode('&amp;lt;&amp;lt;'),
        '&lt;&lt;'
      );
      equal(
        `${version}: wrapping uses greedy word boundaries`,
        text.wrapTextGraphemes('Alpha beta gamma', 10),
        'Alpha beta\ngamma'
      );
      equal(
        `${version}: wrapping preserves a ZWJ family`,
        text.wrapTextGraphemes('a👨‍👩‍👧‍👦b', 1),
        'a\n👨‍👩‍👧‍👦\nb'
      );
      equal(
        `${version}: wrapping preserves combining accents`,
        text.wrapTextGraphemes('e\u0301a', 1),
        'e\u0301\na'
      );
      equal(
        `${version}: wrapping preserves Arabic words`,
        text.wrapTextGraphemes('مرحبا عالم', 5),
        'مرحبا\nعالم'
      );
      equal(
        `${version}: wrapping preserves CJK and blank lines`,
        text.wrapTextGraphemes(' 中文测试 \r\n\t\nabc ', 2),
        '中文\n测试\n\nabc'.replace('abc', 'ab\nc')
      );
      const frequency = text.textWordFrequency(
        'Ada ada ADA e\u0301 é 👨‍👩‍👧‍👦 中文 中文. 一 一 two TWO!',
        2
      );
      equal(
        `${version}: word frequency counts graphemes and excludes punctuation`,
        Object.fromEntries(frequency),
        { ada: 3, two: 2, 中文: 2 }
      );
      const unicodeFrequency = text.textWordFrequency('İ İSTANBUL ẞ SS ΟΣ ΟΣΑ A\u030A AA ÅA', 2);
      equal(
        `${version}: word frequency keeps Unicode lowercase expansions and final sigma`,
        Object.fromEntries(unicodeFrequency),
        { aa: 1, åa: 1, 'i\u0307stanbul': 1, ss: 1, ος: 1, οσα: 1 }
      );
      equal(
        `${version}: word frequency preserves locale tie order`,
        text.textWordFrequency('b a B A 10 2', 1),
        [
          ['a', 2],
          ['b', 2],
          ['10', 1],
          ['2', 1],
        ]
      );
      const originalSegmenter = Intl.Segmenter;
      try {
        Intl.Segmenter = undefined;
        equal(
          `${version}: whitespace-only wrapping needs no segmenter`,
          text.wrapTextGraphemes(' \n\t', 10),
          '\n'
        );
        let errorCode;
        try {
          text.textWordFrequency('', 1);
        } catch (error) {
          errorCode = error.code;
        }
        equal(
          `${version}: empty frequency retains unavailable-segmenter error`,
          errorCode,
          'unsupported'
        );
      } finally {
        Intl.Segmenter = originalSegmenter;
      }
      equal(`${version}: script was not evaluated`, globalThis.incorrect, undefined);
    }
    return checks;
  });

  const fixtures = [
    {
      id: 'html-references',
      input: '&lt;p title=&quot;item&quot;&gt;A&amp;B&lt;/p&gt;\n'.repeat(5000),
      operation: 'html',
      description: '5,000 escaped HTML fragments; 35,000 references and four distinct tokens.',
    },
    {
      id: 'grapheme-wrapping',
      input: 'alpha e\u0301clair 👨‍👩‍👧‍👦 中华人民共和国 beta '.repeat(2000),
      operation: 'wrap',
      description: '10,000 words including accents, ZWJ emoji and CJK; wrap width 80.',
    },
    {
      id: 'word-frequency',
      input: 'Ada ada banana BANANA café cafe\u0301 中文 中文. '.repeat(2000),
      operation: 'frequency',
      description: '16,000 word tokens with repeated Latin, combining-accent and CJK text.',
    },
  ];
  const runResult = await page.evaluate(
    ({ fixtures: cases, samples: repetitions }) => {
      const versions = Object.keys(globalThis.hotpathModules);
      const result = [];
      const run = (version, fixture) => {
        const { codec, text } = globalThis.hotpathModules[version];
        if (fixture.operation === 'html') return codec.decodeTextCodec(fixture.input, 'html');
        if (fixture.operation === 'wrap') return text.wrapTextGraphemes(fixture.input, 80);
        return JSON.stringify(text.textWordFrequency(fixture.input, 2));
      };
      for (const fixture of cases) {
        const outputs = Object.fromEntries(
          versions.map((version) => [version, run(version, fixture)])
        );
        if (versions.length === 2 && outputs.baseline !== outputs.candidate) {
          throw new Error(`${fixture.id}: output changed`);
        }
        const counts = {};
        for (const version of versions) {
          let parsedDocuments = 0;
          let segmenterConstructions = 0;
          const originalParse = DOMParser.prototype.parseFromString;
          const originalSegmenter = Intl.Segmenter;
          DOMParser.prototype.parseFromString = function (...args) {
            parsedDocuments++;
            return originalParse.apply(this, args);
          };
          Intl.Segmenter = new Proxy(originalSegmenter, {
            construct(target, args, newTarget) {
              segmenterConstructions++;
              return Reflect.construct(target, args, newTarget);
            },
          });
          try {
            run(version, fixture);
          } finally {
            DOMParser.prototype.parseFromString = originalParse;
            Intl.Segmenter = originalSegmenter;
          }
          counts[version] = { parsedDocuments, segmenterConstructions };
        }
        const timings = Object.fromEntries(versions.map((version) => [version, []]));
        // Warm both implementations before alternating their order for every paired trial.
        for (let warmup = 0; warmup < 2; warmup++) {
          for (const version of versions) run(version, fixture);
        }
        for (let iteration = 0; iteration < repetitions; iteration++) {
          const order = iteration % 2 ? [...versions].reverse() : versions;
          for (const version of order) {
            const start = performance.now();
            const output = run(version, fixture);
            timings[version].push(performance.now() - start);
            if (output !== outputs[version]) throw new Error(`${fixture.id}: unstable output`);
          }
        }
        result.push({
          id: fixture.id,
          description: fixture.description,
          inputCodeUnits: fixture.input.length,
          outputs,
          counts,
          timings,
        });
      }
      return result;
    },
    { fixtures, samples }
  );

  const percentile = (values, percent) =>
    [...values].sort((a, b) => a - b)[Math.ceil(values.length * percent) - 1];
  const report = {
    measuredAt: new Date().toISOString(),
    baselineRef,
    candidateRef: baselineOnly ? null : candidateRef,
    sourceSha256: Object.fromEntries(
      Object.entries(sources).map(([version, modules]) => [
        version,
        Object.fromEntries(
          Object.entries(modules).map(([name, source]) => [
            name,
            createHash('sha256').update(source).digest('hex'),
          ])
        ),
      ])
    ),
    browser: browser.version(),
    node: process.version,
    method:
      'Actual transpiled source in one isolated Chromium page; no CPU throttling; two warmups; paired alternating order; timing excludes count instrumentation and output checks.',
    samples,
    golden,
    fixtures: runResult.map(({ outputs, timings, ...fixture }) => {
      const metrics = Object.fromEntries(
        Object.entries(timings).map(([version, values]) => [
          version,
          {
            p50Ms: percentile(values, 0.5),
            p75Ms: percentile(values, 0.75),
            samplesMs: values,
            outputCodeUnits: outputs[version].length,
            outputSha256: createHash('sha256').update(outputs[version]).digest('hex'),
          },
        ])
      );
      return {
        ...fixture,
        metrics,
        ...(metrics.candidate
          ? {
              p75ReductionPercent: (1 - metrics.candidate.p75Ms / metrics.baseline.p75Ms) * 100,
            }
          : {}),
      };
    }),
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        outputPath,
        goldenChecks: golden.length,
        fixtures: report.fixtures.map(({ id, counts, metrics, p75ReductionPercent }) => ({
          id,
          counts,
          p75Ms: Object.fromEntries(
            Object.entries(metrics).map(([version, value]) => [version, value.p75Ms])
          ),
          p75ReductionPercent,
        })),
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
