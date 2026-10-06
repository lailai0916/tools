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
const cases = [];
const test = (name, run) => cases.push({ name, run });
const hasCode = (code) => (error) => error?.code === code;

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
