import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const modules = new Map();

// Execute the actual TypeScript helpers without a build or extra test dependency.
// The wrapper shares this realm, including Object.prototype and Web Crypto buffers.
function loadHelper(name) {
  const filename = fileURLToPath(new URL(`src/utils/${name}.ts`, root));
  if (modules.has(filename)) return modules.get(filename);
  const source = readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  modules.set(filename, module.exports);
  const wrapper = runInThisContext(
    `(function (exports, require, module, __filename, __dirname, crypto) {\n${outputText}\n})`,
    { filename }
  );
  const nativeRequire = createRequire(filename);
  const helperRequire = (specifier) =>
    specifier.startsWith('@/utils/')
      ? loadHelper(specifier.slice('@/utils/'.length))
      : nativeRequire(specifier);
  wrapper(module.exports, helperRequire, module, filename, dirname(filename), webcrypto);
  return module.exports;
}

const data = loadHelper('dataWorkbench');
const codec = loadHelper('textCodec');
const text = loadHelper('textWorkbench');
const crypto = loadHelper('curatedCrypto');
const web = loadHelper('curatedWeb');
const time = loadHelper('curatedTimeUnits');
const { utilityDefinitions } = loadHelper('utilityDefinitions');
const media = loadHelper('mediaGeneration');
const statistics = loadHelper('statistics');
const unicode = loadHelper('unicodeInspector');
const diff = loadHelper('textDiff');
const cases = [];
const test = (name, run) => cases.push({ name, run });
const hasCode = (code) => (error) => error?.code === code;

test('Statistics preserves every digit of safe integers in displayed results', () => {
  for (const input of ['1234567890123456', '9007199254740991', '-9007199254740991']) {
    const result = statistics.computeStatistics(input);
    assert.equal(result.kind, 'ok');
    for (const key of ['sum', 'mean', 'median', 'min', 'max']) {
      assert.equal(statistics.formatStatisticNumber(result.values[key]), input);
    }
  }
});
test('Statistics retains a small addend when large positive and negative values cancel', () => {
  const result = statistics.computeStatistics('1e150 1 -1e150');
  assert.equal(result.kind, 'ok');
  assert.equal(result.values.sum, 1);
  assert.equal(result.values.mean, 1 / 3);
});
test('Statistics scales variance without losing small differences at large offsets', () => {
  const adjacent = statistics.computeStatistics('9007199254740990 9007199254740991');
  assert.equal(adjacent.kind, 'ok');
  assert.equal(adjacent.values.variance, 0.25);
  assert.equal(adjacent.values.stddev, 0.5);
  const tiny = statistics.computeStatistics('1e-150 2e-150');
  assert.equal(tiny.kind, 'ok');
  assert.ok(Math.abs(tiny.values.variance / 2.5e-301 - 1) < 1e-14);
  assert.ok(Math.abs(tiny.values.stddev / 5e-151 - 1) < 1e-14);
});
test('Statistics reports underflow and invalid syntax rather than inventing zero results', () => {
  for (const input of ['1e-324', '1e-200 2e-200', '1e309', '1e308 1e308']) {
    assert.deepEqual(statistics.computeStatistics(input), { kind: 'invalid', reason: 'range' });
  }
  assert.deepEqual(statistics.computeStatistics('0x10'), { kind: 'invalid', reason: 'syntax' });
  const subnormal = statistics.computeStatistics('5e-324 5e-324');
  assert.equal(subnormal.kind, 'ok');
  assert.equal(subnormal.values.median, 5e-324);
  assert.equal(subnormal.values.variance, 0);
  assert.equal(statistics.computeStatistics('1', 'sample').values.stddev, null);
});
test('Unicode distinguishes lone surrogates from the actual replacement character', () => {
  for (const input of ['\uD800', '\uDC00']) {
    const result = unicode.inspectUnicode(input);
    assert.equal(result.hasUnpairedSurrogate, true);
    assert.equal(result.rows[0].utf8, null);
  }
  assert.equal(unicode.inspectUnicode('\uFFFD').rows[0].utf8, 'EF BF BD');
  assert.equal(unicode.inspectUnicode('😀').rows[0].utf8, 'F0 9F 98 80');
});
test('Text diff preserves the edited lines and their copy markers', () => {
  const result = diff.computeTextDiff('hello\n', 'world\n');
  assert.equal(result.ok, true);
  assert.equal(diff.textDiffCopyText(result.lines), '- hello\n+ world');
  assert.deepEqual(diff.computeTextDiff('', ''), { ok: true, lines: [] });
});
test('Text diff rejects oversized inputs instead of returning an identical or truncated result', () => {
  assert.deepEqual(diff.computeTextDiff('x'.repeat(500001), ''), { ok: false, error: 'size' });
  assert.deepEqual(diff.computeTextDiff('a\n'.repeat(10001), 'b\n'.repeat(10000)), {
    ok: false,
    error: 'size',
  });
});
test('Text diff either completes a large edit accurately or reports its computation timeout', () => {
  const original = Array.from({ length: 5000 }, (_, index) => `old-${index}`).join('\n');
  const modified = Array.from({ length: 5000 }, (_, index) => `new-${index}`).join('\n');
  const result = diff.computeTextDiff(original, modified);
  if (result.ok) {
    assert.equal(result.lines.filter((line) => line.type === 'del').length, 5000);
    assert.equal(result.lines.filter((line) => line.type === 'add').length, 5000);
  } else {
    assert.equal(result.error, 'timeout');
  }
});

test('Placeholder image dimensions reject invalid values instead of generating a fallback', () => {
  for (const input of ['', ' ', '0', '-1', '1.5', '4097', '1e3', '1.0000000000000001']) {
    assert.equal(media.parseImageDimension(input), null, input);
  }
  assert.equal(media.parseImageDimension('1'), 1);
  assert.equal(media.parseImageDimension('4096'), 4096);
  assert.equal(media.parseImageDimension('600.0'), 600);
});
test('QR raster boundaries fill the exact selected size with whole pixels', () => {
  for (const modules of [21, 49, 53, 177, 193]) {
    for (const size of [256, 512, 1024]) {
      const edges = media.qrPixelBoundaries(modules, size);
      const widths = edges.slice(1).map((edge, index) => edge - edges[index]);
      assert.equal(edges[0], 0);
      assert.equal(edges.at(-1), size);
      assert.ok(widths.every((width) => Number.isInteger(width) && width >= 1));
      assert.ok(Math.max(...widths) - Math.min(...widths) <= 1);
      assert.equal(
        widths.reduce((total, width) => total + width, 0),
        size
      );
    }
  }
  assert.throws(() => media.qrPixelBoundaries(257, 256), RangeError);
});

const randomNumber = loadHelper('randomNumber');

test('Random Number rejects decimals before floating-point rounding', () => {
  for (const input of [
    '1.0000000000000001',
    '9007199254740990.1',
    '9007199254740991.1',
    '1000.00000000000001',
    '1e-999',
    '1e3',
  ]) {
    assert.equal(randomNumber.parseDecimalInteger(input), null);
  }
  assert.equal(
    randomNumber.buildRandomNumbers('9007199254740990.1', '9007199254740990', '1', false),
    ''
  );
  assert.equal(randomNumber.buildRandomNumbers('1', '1', '1.0000000000000001', false), '');
  assert.equal(randomNumber.buildRandomNumbers('1', '1', '1000.00000000000001', false), '');
});
test('Random Number accepts decimal safe integers and rejects unsafe bounds and range widths', () => {
  assert.equal(randomNumber.parseDecimalInteger('+001'), 1);
  assert.equal(randomNumber.parseDecimalInteger('-9007199254740991'), -9007199254740991);
  assert.equal(randomNumber.parseDecimalInteger('9007199254740991'), 9007199254740991);
  assert.equal(randomNumber.parseDecimalInteger('9007199254740992'), null);
  assert.equal(randomNumber.validateRandomNumberParams('0', '9007199254740991', '1'), null);
  assert.equal(
    randomNumber.validateRandomNumberParams('1', '9007199254740991', '1').size,
    9007199254740991
  );
  assert.equal(
    randomNumber.buildRandomNumbers('9007199254740991', '9007199254740991', '2', false),
    '9007199254740991\n9007199254740991'
  );
});
test('Random Number unique output preserves inclusive endpoints and the requested count', () => {
  const values = randomNumber
    .buildRandomNumbers('-2', '2', '5', true)
    .split('\n')
    .map(Number)
    .sort((a, b) => a - b);
  assert.deepEqual(values, [-2, -1, 0, 1, 2]);
  assert.equal(randomNumber.buildRandomNumbers('-2', '2', '6', true), '');
  for (const [min, max] of [
    [-100000, 0],
    [9007199254739992, 9007199254740991],
    [-9007199254740991, -9007199254739992],
  ]) {
    const output = randomNumber
      .buildRandomNumbers(String(min), String(max), '1000', true)
      .split('\n')
      .map(Number);
    assert.equal(output.length, 1000);
    assert.equal(new Set(output).size, 1000);
    assert.ok(output.every((value) => Number.isSafeInteger(value) && value >= min && value <= max));
  }
});
test('Random Number 32-bit and 64-bit draws reject the biased tail', () => {
  const original = webcrypto.getRandomValues;
  try {
    for (const [range, draws, expected] of [
      [3, [[4294967295], [4294967294]], 2],
      [
        4294967297,
        [
          [4294967295, 4294967295],
          [4294967295, 4294967294],
        ],
        4294967296,
      ],
      [
        9007199254740991,
        [
          [4294967295, 4294965248],
          [4294967295, 4294967295],
          [4294967295, 4294965247],
        ],
        9007199254740990,
      ],
    ]) {
      let calls = 0;
      webcrypto.getRandomValues = (buffer) => {
        assert.ok(calls < draws.length);
        buffer.set(draws[calls++]);
        return buffer;
      };
      assert.equal(randomNumber.randomBelow(range), expected);
      assert.equal(calls, draws.length);
    }
  } finally {
    webcrypto.getRandomValues = original;
  }
});

const cron = loadHelper('cronExpression');
const { dockerRunToCompose, buildGitignore } = loadHelper('utilityDefinitions');
const yaml = createRequire(import.meta.url)('js-yaml');
const parsedCron = (expression) => {
  const result = cron.parseCronExpression(expression, 'en');
  assert.equal(result.ok, true, expression);
  return result;
};

test('Docker escapes literal and container-shell dollars from Compose interpolation', () => {
  const service = yaml.load(
    dockerRunToCompose(
      "docker run --name web -e 'TOKEN=${QA_CURATED_HOST}' -v '/tmp/$QA_CURATED_HOST:/data' alpine sh -c 'echo $QA_CURATED_HOST $$ ${VALUE}' ''"
    )
  ).services.web;
  assert.deepEqual(service.environment, ['TOKEN=$${QA_CURATED_HOST}']);
  assert.deepEqual(service.volumes, ['/tmp/$$QA_CURATED_HOST:/data']);
  assert.deepEqual(service.command, ['sh', '-c', 'echo $$QA_CURATED_HOST $$$$ $${VALUE}', '']);
});
for (const option of ['--publish', '--env', '--volume', '--name', '--restart']) {
  test(`Docker rejects an empty inline ${option} value`, () =>
    assert.throws(() => dockerRunToCompose(`docker run ${option}= nginx`), hasCode('dockerValue')));
  test(`Docker rejects a following unsupported flag as ${option} value`, () =>
    assert.throws(
      () => dockerRunToCompose(`docker run ${option} --unsupported nginx`),
      hasCode('dockerValue')
    ));
}
test('Docker accepts an empty environment value while retaining its name', () =>
  assert.deepEqual(
    yaml.load(dockerRunToCompose('docker run -e KEY= alpine')).services.alpine.environment,
    ['KEY=']
  ));

test('Gitignore preserves leading and escaped trailing pattern spaces', () => {
  for (const extra of [' file.txt', String.raw`file.txt\ `, '  file.txt\\  ']) {
    const result = buildGitignore({ stacks: 'node', extra });
    assert(result.endsWith('# custom\n' + extra + '\n'));
  }
});
test('Gitignore omits a custom section containing only whitespace', () =>
  assert(!buildGitignore({ stacks: 'node', extra: ' \n\t ' }).includes('# custom')));

test('Cron wildcard-step day of month intersects with weekday', () => {
  const everyDay = parsedCron('0 0 */1 * 1');
  assert.equal(everyDay.dayMatch, 'and');
  assert.equal(everyDay.summary, 'Runs at 00:00 on Monday.');
  const oddDays = parsedCron('0 0 */2 * 1');
  assert.equal(oddDays.dayMatch, 'and');
  assert.deepEqual(
    oddDays.values.dayOfMonth,
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31]
  );
  assert.match(oddDays.summary, /and Monday/);
});
test('Cron wildcard-step weekday intersects with day of month', () => {
  const result = parsedCron('0 0 1 * */1');
  assert.equal(result.dayMatch, 'and');
  assert.equal(result.summary, 'Runs at 00:00 on day 1 of the month.');
});
test('Cron date and weekday without an initial wildcard retain OR semantics', () => {
  assert.equal(parsedCron('0 0 1 * 1').dayMatch, 'or');
  assert.equal(parsedCron('0 0 1,* * 1').summary, 'Runs at 00:00 every day.');
  assert.equal(parsedCron('0 0 *,1 * 1').summary, 'Runs at 00:00 on Monday.');
});
test('Cron steps select actual values rather than a fixed elapsed interval', () => {
  assert.deepEqual(parsedCron('*/40 * * * *').values.minute, [0, 40]);
  assert.deepEqual(parsedCron('1-59/40 * * * *').values.minute, [1, 41]);
  assert.deepEqual(parsedCron('*/60 * * * *').values.minute, [0]);
  assert.deepEqual(parsedCron('*/9007199254740991 * * * *').values.minute, [0]);
});
test('Cron normalizes the two Sunday spellings without duplicate values', () =>
  assert.deepEqual(parsedCron('0 0 * * 0,7').values.dayOfWeek, [0]));
test('Cron rejects scalar steps, zero and unsafe or overflowing step values', () => {
  for (const expression of [
    '5/2 * * * *',
    '*/0 * * * *',
    '*/9007199254740992 * * * *',
    '*/' + '9'.repeat(400) + ' * * * *',
  ]) {
    assert.equal(cron.parseCronExpression(expression, 'en').ok, false, expression);
  }
});

const retained = loadHelper('retainedCrypto');
const jwtToken = (header, payload, signature = 'AA') =>
  Buffer.from(header).toString('base64url') +
  '.' +
  Buffer.from(payload).toString('base64url') +
  '.' +
  signature;

test('JWT keeps valid numeric claims and requires canonical Base64URL JSON objects', () => {
  const payload =
    '{"sub":"用户","exp":1700000000.5,"iat":0,"nbf":-1,"size":9007199254740991,"scale":1e3}';
  const value = retained.inspectJwt(jwtToken('{"alg":"HS256"}', payload));
  assert.deepEqual(JSON.parse(value.payload), {
    sub: '用户',
    exp: 1700000000.5,
    iat: 0,
    nbf: -1,
    size: 9007199254740991,
    scale: 1000,
  });
  assert.equal(retained.inspectJwt(jwtToken('{"alg":"none"}', '{}', '')).signature, '');
  for (const input of [
    jwtToken('[]', '{}'),
    jwtToken('{"alg":"HS256"}', 'null'),
    jwtToken('{"alg":"HS256"}', '[]'),
    jwtToken('{"alg":1}', '{}'),
    jwtToken('{"alg":"HS256"}', '{}', ''),
    jwtToken('{"alg":"none"}', '{}', 'AA'),
    jwtToken('{"alg":"HS256"}', '{}', '%%%'),
    jwtToken('{"alg":"HS256"}', '{}', 'AB'),
    jwtToken('{"alg":"HS256"}', '{}', 'AA='),
    'eyJhbGciOiJIUzI1NiJ9.e31.AA',
  ])
    assert.throws(() => retained.inspectJwt(input));
  assert.throws(
    () =>
      retained.inspectJwt(
        Buffer.from('{"alg":"HS256"}').toString('base64url') +
          '.' +
          Buffer.from([123, 34, 115, 117, 98, 34, 58, 34, 255, 34, 125]).toString('base64url') +
          '.AA'
      ),
    hasCode('utf8')
  );
  assert.throws(
    () =>
      retained.inspectJwt(
        Buffer.from('{"alg":"HS256"}').toString('base64url') +
          '.' +
          Buffer.from('{"sub":"࿿"}').toString('base64') +
          '.AA'
      ),
    hasCode('base64url')
  );
});
test('JWT rejects unsafe, nonfinite and precision-losing numbers before copied output changes', () => {
  for (const numeric of [
    '9007199254740993',
    '-9007199254740993',
    '1e400',
    '1e-400',
    '1.0000000000000001',
    '9007199254740991.1',
    '0.10000000000000001',
  ]) {
    assert.throws(
      () =>
        retained.inspectJwt(jwtToken('{"alg":"HS256"}', '{"nested":{"value":' + numeric + '}}')),
      hasCode('number')
    );
  }
  const value = retained.inspectJwt(
    jwtToken(
      '{"alg":"HS256"}',
      '{"quoted":"9007199254740993 and \\\"1e400\\\"","zero":0e999999,"fraction":0.125}'
    )
  );
  assert.equal(JSON.parse(value.payload).quoted, '9007199254740993 and "1e400"');
  for (const field of ['exp', 'iat', 'nbf'])
    for (const value of ['null', 'true', '"1700000000"', '{}', '[]']) {
      assert.throws(
        () => retained.inspectJwt(jwtToken('{"alg":"HS256"}', '{"' + field + '":' + value + '}')),
        hasCode('claim')
      );
    }
});
test('TOTP Base32 accepts canonical RFC4648 vectors and rejects discarded bits or bad padding', () => {
  for (const [encoded, plain] of [
    ['MY======', 'f'],
    ['MZXQ====', 'fo'],
    ['MZXW6===', 'foo'],
    ['MZXW6YQ=', 'foob'],
    ['MZXW6YTB', 'fooba'],
    ['MZXW6YTBOI======', 'foobar'],
  ]) {
    assert.equal(Buffer.from(retained.decodeBase32Secret(encoded)).toString(), plain);
    assert.equal(
      Buffer.from(retained.decodeBase32Secret(encoded.replace(/=+$/, ''))).toString(),
      plain
    );
  }
  assert.equal(Buffer.from(retained.decodeBase32Secret(' m y = = = = = = ')).toString(), 'f');
  for (const input of [
    '',
    'MZ',
    'MZX',
    'MZXW6=',
    'MZXW6====',
    'MZXW6YTBOJ',
    'MY=======',
    'MY0',
    'MY=AAAAA',
    'A',
  ])
    assert.throws(() => retained.decodeBase32Secret(input), hasCode('base32'));
});
test('TOTP URI uses exact decimal options and rejects ambiguous or unsupported URI forms', () => {
  const base = 'otpauth://totp/example?secret=JBSWY3DPEHPK3PXP';
  assert.equal(retained.parseTotpConfig(base).period, 30);
  const value = retained.parseTotpConfig(base + '&algorithm=sha-256&digits=8&period=15');
  assert.equal(value.algorithm, 'SHA-256');
  assert.equal(value.digits, 8);
  assert.equal(value.period, 15);
  assert.equal(
    retained.parseTotpConfig(base + '&period=9007199254740991').period,
    9007199254740991
  );
  for (const suffix of [
    '&period=9007199254740993',
    '&period=30.0000000000000001',
    '&period=3e1',
    '&period=0x1e',
    '&period=0',
    '&period=-1',
    '&period=',
    '&digits=6.0000000000000001',
    '&digits=7',
    '&digits=',
    '&algorithm=SHA384',
    '&algorithm=',
    '&secret=MY',
    '&digits=6&digits=8',
    '&period=15&period=30',
    '&algorithm=SHA1&algorithm=SHA256',
  ])
    assert.throws(() => retained.parseTotpConfig(base + suffix));
  for (const input of [
    'otpauth://totp?secret=MY',
    'otpauth://hotp/example?secret=MY',
    'otpauth://user:pw@totp/example?secret=MY',
    'otpauth://totp:999/example?secret=MY',
    'otpauth://totp/%?secret=MY',
  ])
    assert.throws(() => retained.parseTotpConfig(input));
});
test('TOTP follows all RFC6238 SHA1 SHA256 SHA512 vectors and exact period boundaries', async () => {
  const timestamps = [59, 1111111109, 1111111111, 1234567890, 2000000000, 20000000000];
  const vectors = [
    [
      'SHA-1',
      '12345678901234567890',
      ['94287082', '07081804', '14050471', '89005924', '69279037', '65353130'],
    ],
    [
      'SHA-256',
      '12345678901234567890123456789012',
      ['46119246', '68084774', '67062674', '91819424', '90698825', '77737706'],
    ],
    [
      'SHA-512',
      '1234567890123456789012345678901234567890123456789012345678901234',
      ['90693936', '25091201', '99943326', '93441116', '38618901', '47863826'],
    ],
  ];
  for (const [algorithm, secret, expected] of vectors)
    for (let index = 0; index < timestamps.length; index++) {
      const config = { algorithm, secret: new TextEncoder().encode(secret), digits: 8, period: 30 };
      assert.equal(
        await retained.generateTotpCode(
          config,
          retained.getTotpTime(timestamps[index] * 1000, 30).counter
        ),
        expected[index]
      );
    }
  assert.deepEqual(retained.getTotpTime(59000, 30), { counter: 1, remaining: 1 });
  assert.deepEqual(retained.getTotpTime(60000, 30), { counter: 2, remaining: 30 });
  assert.deepEqual(retained.getTotpTime(59999, 30), { counter: 1, remaining: 1 });
  for (const period of [0, -1, 1.5, 9007199254740992, NaN, Infinity])
    assert.throws(() => retained.getTotpTime(60000, period));
  assert.throws(() => retained.getTotpTime(-1, 30));
  await assert.rejects(
    retained.generateTotpCode(
      { algorithm: 'SHA-1', secret: new Uint8Array([1]), digits: 6, period: 30 },
      9007199254740992
    ),
    hasCode('counter')
  );
});

test('Docker preserves flags and empty arguments after the image', () => {
  const output = utilityDefinitions.dockerRunToCompose.compute({
    input: 'docker run alpine echo -e "" hello',
  });
  assert.deepEqual(createRequire(import.meta.url)('js-yaml').load(output).services.alpine.command, [
    'echo',
    '-e',
    '',
    'hello',
  ]);
});
test('Docker removes shell line continuations without inserting spaces', () => {
  const output = utilityDefinitions.dockerRunToCompose.compute({
    input: 'docker run al' + '\\\n' + 'pine echo "a' + '\\\n' + 'b"',
  });
  const service = createRequire(import.meta.url)('js-yaml').load(output).services.alpine;
  assert.equal(service.image, 'alpine');
  assert.deepEqual(service.command, ['echo', 'ab']);
});
test('Docker retains literal backslashes inside double quotes', () => {
  const output = utilityDefinitions.dockerRunToCompose.compute({
    input: String.raw`docker run alpine echo "a\qb"`,
  });
  assert.deepEqual(createRequire(import.meta.url)('js-yaml').load(output).services.alpine.command, [
    'echo',
    String.raw`a\qb`,
  ]);
});
test('Docker rejects a trailing escape', () =>
  assert.throws(
    () => utilityDefinitions.dockerRunToCompose.compute({ input: 'docker run alpine ' + '\\' }),
    hasCode('shellQuote')
  ));
test('Gitignore rejects prototype keys as unknown templates', () =>
  assert.throws(
    () => utilityDefinitions.gitignoreGenerator.compute({ stacks: 'constructor', extra: '' }),
    hasCode('template')
  ));

test('CSV rejects an unclosed quoted field', () =>
  assert.throws(() => data.parseDataInput('name\n"unfinished', 'csv'), hasCode('quote')));
test('CSV rejects duplicate column headers', () =>
  assert.throws(() => data.parseDataInput('name,name\na,b', 'csv'), hasCode('duplicateHeader')));
test('CSV rejects extra cells rather than discarding them', () =>
  assert.throws(() => data.parseDataInput('name\na,b', 'csv'), hasCode('rowWidth')));
test('CSV rejects missing cells rather than inventing values', () =>
  assert.throws(() => data.parseDataInput('name,value\na', 'csv'), hasCode('rowWidth')));
test('CSV preserves CR-only record endings', () =>
  assert.deepEqual(data.parseDataInput('name,value\rAlice,1\rBob,2', 'csv').value, [
    { name: 'Alice', value: '1' },
    { name: 'Bob', value: '2' },
  ]));
test('CSV retains quoted commas, embedded newlines and empty fields', () =>
  assert.deepEqual(data.parseDataInput('name,value\n"a,b","first\nsecond"\n"",""', 'csv').value, [
    { name: 'a,b', value: 'first\nsecond' },
    { name: '', value: '' },
  ]));
test('JSON Pointer distinguishes dotted, nested, slash, tilde and empty keys', () =>
  assert.deepEqual(
    data.flattenDataPointers(
      data.parseDataInput('{"a.b":1,"a":{"b":2},"a/b":3,"a~b":4,"":5}', 'json').value
    ),
    { '/a.b': 1, '/a/b': 2, '/a~1b': 3, '/a~0b': 4, '/': 5 }
  ));
test('TypeScript properties escape newlines and backslashes', () =>
  assert.equal(
    data.generateTypeScript(
      data.parseDataInput('{"line\\nbreak":1,"path\\\\name":true}', 'json').value
    ),
    'interface Root {\n  "line\\nbreak": number;\n  "path\\\\name": boolean;\n}'
  ));
test('JSON rejects integer precision loss', () =>
  assert.throws(
    () => data.parseDataInput('{"id":9007199254740993}', 'json'),
    hasCode('unsupportedValue')
  ));

test('Base32 canonical RFC 4648 vector', () =>
  assert.equal(codec.encodeTextCodec('foobar', 'base32'), 'MZXW6YTBOI======'));
test('Base32 rejects nonzero unused bits', () =>
  assert.throws(() => codec.decodeTextCodec('MZ======', 'base32'), hasCode('invalidEncoding')));
test('Base32 rejects incomplete padding', () =>
  assert.throws(() => codec.decodeTextCodec('MY=', 'base32'), hasCode('invalidEncoding')));
test('Base32 rejects incomplete bytes', () =>
  assert.throws(() => codec.decodeTextCodec('A', 'base32'), hasCode('invalidEncoding')));
test('Base32 rejects invalid UTF-8 bytes', () =>
  assert.throws(() => codec.decodeTextCodec('74======', 'base32'), hasCode('invalidUtf8')));
test('Base64 rejects nonzero unused bits', () =>
  assert.throws(() => codec.decodeTextCodec('Zh==', 'base64'), hasCode('invalidEncoding')));
test('Base64 rejects invalid UTF-8 bytes', () =>
  assert.throws(() => codec.decodeTextCodec('/w==', 'base64'), hasCode('invalidUtf8')));
test('UTF-8 emoji survives Base64 roundtrip', () =>
  assert.equal(
    codec.decodeTextCodec(codec.encodeTextCodec('你好👨‍👩‍👧‍👦', 'base64'), 'base64'),
    '你好👨‍👩‍👧‍👦'
  ));
test('UTF-8 emoji survives Base32 roundtrip', () =>
  assert.equal(codec.decodeTextCodec(codec.encodeTextCodec('😀é', 'base32'), 'base32'), '😀é'));
test('Byte codecs preserve a leading BOM', () =>
  assert.equal(
    codec.decodeTextCodec(codec.encodeTextCodec('\uFEFFhello', 'hex'), 'hex'),
    '\uFEFFhello'
  ));
test('Byte codecs reject unpaired Unicode surrogates', () =>
  assert.throws(() => codec.encodeTextCodec('\uD800', 'base64'), hasCode('invalidUnicode')));
test('Binary requires full eight-bit bytes', () =>
  assert.throws(() => codec.decodeTextCodec('1111111', 'binary'), hasCode('invalidEncoding')));
test('Wrapping keeps ZWJ emoji intact', () =>
  assert.equal(text.wrapTextGraphemes('a👨‍👩‍👧‍👦b', 1), 'a\n👨‍👩‍👧‍👦\nb'));
test('Wrapping keeps combining sequences intact', () =>
  assert.equal(text.wrapTextGraphemes('e\u0301a', 1), 'e\u0301\na'));
test('Uppercase conversion preserves punctuation and whitespace', () =>
  assert.equal(text.convertTextCase('Hi, friend!\n  ok?', 'upper'), 'HI, FRIEND!\n  OK?'));
test('Literal replacement preserves dollar signs', () =>
  assert.equal(
    text.transformText('a.a a.a', 'replace', {
      ...text.DEFAULT_TEXT_OPTIONS,
      find: 'a.a',
      replacement: '$&$1',
    }),
    '$&$1 $&$1'
  ));

test('SHA-256 accepts and hashes an empty message', async () =>
  assert.equal(
    await crypto.digestText('', 'SHA-256'),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  ));
test('MD5 empty-message vector', async () =>
  assert.equal(await crypto.digestText('', 'MD5'), 'd41d8cd98f00b204e9800998ecf8427e'));
test('CRC32 empty-message vector', async () =>
  assert.equal(await crypto.digestText('', 'CRC32'), '00000000'));
test('CRC32 standard check value', async () =>
  assert.equal(await crypto.digestText('123456789', 'CRC32'), 'cbf43926'));
test('HMAC-SHA-256 RFC 4231 test case 2', async () =>
  assert.equal(
    await crypto.hmacText('what do ya want for nothing?', 'Jefe', 'SHA-256'),
    '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843'
  ));
test('HMAC rejects an empty secret', () =>
  assert.rejects(() => crypto.hmacText('message', '', 'SHA-256'), /secret/));
test('UUID identifies version and RFC variant', () => {
  const result = crypto.inspectUuid('urn:uuid:F47AC10B-58CC-4372-A567-0E02B2C3D479');
  assert.deepEqual(result, {
    canonical: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    version: 4,
    variant: 'RFC 4122',
  });
});
test('UUID preserves non-RFC variant classification', () =>
  assert.equal(crypto.inspectUuid('f47ac10b-58cc-4372-c567-0e02b2c3d479').variant, 'Microsoft'));
test('UUIDv7 extracts the RFC 9562 example timestamp', () =>
  assert.equal(
    crypto.inspectUuid('017f22e2-79b0-7cc3-98c4-dc0c0c07398f').timestamp,
    '2022-02-22T19:22:22.000Z'
  ));
test('UUIDv1 extracts the Unix epoch', () =>
  assert.equal(
    crypto.inspectUuid('13814000-1dd2-11b2-8000-000000000000').timestamp,
    '1970-01-01T00:00:00.000Z'
  ));
test('Generated UUIDv4 always includes version and variant bits', () =>
  assert.match(
    crypto.generateIdentifiers({ format: 'uuid-v4', count: 1 })[0],
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  ));
test('Identifier generation rejects fractional counts', () =>
  assert.throws(() => crypto.generateIdentifiers({ format: 'uuid-v4', count: 1.5 }), /count/));
test('Passwords guarantee every selected category at minimum length', () => {
  const [password] = crypto.generateSecrets({
    purpose: 'password',
    length: 4,
    count: 1,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
  }).values;
  assert(
    password.length === 4 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
  );
});
test('Passwords reject an empty category selection', () =>
  assert.throws(
    () =>
      crypto.generateSecrets({
        purpose: 'password',
        length: 8,
        count: 1,
        uppercase: false,
        lowercase: false,
        digits: false,
        symbols: false,
      }),
    /classes/
  ));
test('Secret generation rejects zero counts', () =>
  assert.throws(
    () => crypto.generateSecrets({ purpose: 'password', length: 8, count: 0 }),
    /count/
  ));

test('Query parsing preserves duplicate values', () =>
  assert.deepEqual({ ...web.parseQuery('tag=a&tag=b&empty=') }, { tag: ['a', 'b'], empty: '' }));
test('Query conversion emits every array entry', () =>
  assert.equal(web.jsonToQuery('{"tag":["a","b"],"q":"a b"}'), 'tag=a&tag=b&q=a+b'));
test('URL query updates preserve interleaved duplicates', () =>
  assert.equal(
    web.updateUrlQuery('https://example.com/path#anchor', 'a=1&b=2&a=3'),
    'https://example.com/path?a=1&b=2&a=3#anchor'
  ));
test('Query parsing rejects malformed percent escapes', () =>
  assert.throws(() => web.parseQuery('q=%FF'), hasCode('encoding')));
test('Cookie parsing preserves duplicate names and equals in values', () =>
  assert.deepEqual(
    { ...web.parseCookies('Cookie: id=a; id=b; token=x=y') },
    { id: ['a', 'b'], token: 'x=y' }
  ));
test('Header parsing preserves duplicate values and normalizes names', () =>
  assert.deepEqual(
    { ...web.parseHttpHeaders('X-Test: a\r\nx-test: b\r\nSet-Cookie: id=1\r\nSet-Cookie: id=2') },
    { 'x-test': ['a', 'b'], 'set-cookie': ['id=1', 'id=2'] }
  ));
test('Basic Auth encodes Unicode credentials', () =>
  assert.equal(
    web.encodeBasicAuth('用户', 'päss:😀'),
    'Authorization: Basic 55So5oi3OnDDpHNzOvCfmIA='
  ));
test('Basic Auth decodes Unicode and retains password colons', () =>
  assert.deepEqual(web.decodeBasicAuth('Authorization: Basic 55So5oi3OnDDpHNzOvCfmIA='), {
    username: '用户',
    password: 'päss:😀',
  }));
test('Basic Auth rejects a colon in the username', () =>
  assert.throws(() => web.encodeBasicAuth('user:name', 'secret'), hasCode('username')));
test('IPv4 /31 includes both endpoint hosts without broadcast', () => {
  const result = web.inspectIpv4('192.0.2.1', '31');
  assert.deepEqual(
    [result.network, result.broadcast, result.usable, result.firstHost, result.lastHost],
    ['192.0.2.0', null, 2, '192.0.2.0', '192.0.2.1']
  );
});
test('IPv4 /32 has exactly its one host', () => {
  const result = web.inspectIpv4('192.0.2.5', '32');
  assert.deepEqual(
    [result.network, result.broadcast, result.usable, result.firstHost, result.lastHost],
    ['192.0.2.5', null, 1, '192.0.2.5', '192.0.2.5']
  );
});
test('IPv4 handles the full unsigned address range', () =>
  assert.equal(web.inspectIpv4('4294967295', '32', 'decimal').address, '255.255.255.255'));

test('Date parsing accepts omitted seconds', () =>
  assert.deepEqual(time.dateToMilliseconds('2026-10-06 12:30', 'utc'), {
    state: 'valid',
    ms: 1791289800000,
  }));
test('Date parsing respects explicit offsets', () =>
  assert.deepEqual(time.dateToMilliseconds('2026-10-06T20:30+08:00', 'utc'), {
    state: 'valid',
    ms: 1791289800000,
  }));
test('Timestamp seconds are explicit rather than guessed by length', () =>
  assert.deepEqual(time.timestampToMilliseconds('9999999999', 'seconds'), {
    state: 'valid',
    ms: 9999999999000,
  }));
test('Timestamp milliseconds are explicit rather than guessed by length', () =>
  assert.deepEqual(time.timestampToMilliseconds('9999999999', 'milliseconds'), {
    state: 'valid',
    ms: 9999999999,
  }));
test('Negative fractional seconds retain millisecond precision', () =>
  assert.deepEqual(time.timestampToMilliseconds('-0.001', 'seconds'), { state: 'valid', ms: -1 }));
test('Formatting negative fractional seconds does not floor away precision', () =>
  assert.equal(time.formatTimestamp(-1, 'seconds'), '-0.001'));
test('Non-leap years reject February 29', () =>
  assert.deepEqual(time.dateToMilliseconds('2025-02-29', 'utc'), { state: 'invalid' }));
test('Century years follow the Gregorian leap rule', () =>
  assert.deepEqual(time.dateToMilliseconds('1900-02-29', 'utc'), { state: 'invalid' }));
test('Years divisible by 400 accept February 29', () =>
  assert.deepEqual(time.dateToMilliseconds('2000-02-29', 'utc'), {
    state: 'valid',
    ms: 951782400000,
  }));

function converted(input, dimension, source, target) {
  const result = time.convertUnits(input, dimension, source);
  assert.equal(result.state, 'valid');
  const row = result.rows.find(({ unit }) => unit.id === target);
  assert(row, `Missing conversion target ${target}`);
  return row.text;
}
test('Celsius zero uses an affine Fahrenheit conversion', () =>
  assert.equal(converted('0', 'temperature', 'celsius', 'fahrenheit'), '32'));
test('Celsius zero converts to kelvin', () =>
  assert.equal(converted('0', 'temperature', 'celsius', 'kelvin'), '273.15'));
test('Fahrenheit zero remains valid', () =>
  assert.equal(converted('0', 'temperature', 'fahrenheit', 'celsius'), '-17.7777777778'));
test('Kelvin zero remains a valid absolute-zero value', () =>
  assert.equal(converted('0', 'temperature', 'kelvin', 'celsius'), '-273.15'));
test('Fahrenheit absolute zero converts to exact zero Kelvin', () =>
  assert.equal(converted('-459.67', 'temperature', 'fahrenheit', 'kelvin'), '0'));
test('Fahrenheit below absolute zero remains invalid', () =>
  assert.deepEqual(time.convertUnits('-459.6701', 'temperature', 'fahrenheit'), {
    state: 'invalid',
    reason: 'absoluteZero',
  }));
test('Temperatures below absolute zero are rejected', () =>
  assert.deepEqual(time.convertUnits('-0.1', 'temperature', 'kelvin'), {
    state: 'invalid',
    reason: 'absoluteZero',
  }));
test('Decimal megabytes use SI factors', () =>
  assert.equal(converted('1', 'data', 'MB', 'B'), '1000000'));
test('Binary mebibytes use IEC factors', () =>
  assert.equal(converted('1', 'data', 'MiB', 'B'), '1048576'));
test('Length conversion uses the exact international foot factor', () =>
  assert.equal(converted('1', 'length', 'foot', 'meter'), '0.3048'));

for (const { name, run } of cases) {
  try {
    await run();
  } catch (error) {
    console.error(`Workbench regression failed: ${name}`);
    throw error;
  }
}
console.log(
  `Verified ${cases.length} workbench regressions across data, text, crypto, web, dates and units.`
);
