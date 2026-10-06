import { dump, JSON_SCHEMA, load } from 'js-yaml';

export type DataValue = null | boolean | number | string | DataValue[] | DataObject;
export type DataObject = { [key: string]: DataValue };
export type DataInputFormat = 'json' | 'yaml' | 'csv' | 'tsv';
export type DataOutputFormat = DataInputFormat | 'typescript' | 'json-schema';
export type DataWorkbenchOptions = {
  from: DataInputFormat;
  to: DataOutputFormat;
  indent: 0 | 2 | 4;
  sort: boolean;
  flatten: boolean;
  root: string;
};
export type ParsedData = { value: DataValue; columns?: string[] };
export type DataWorkbenchErrorCode =
  | 'parse'
  | 'quote'
  | 'duplicateHeader'
  | 'rowWidth'
  | 'tableRequired'
  | 'columnsRequired'
  | 'unsupportedValue';

export class DataWorkbenchError extends Error {
  readonly code: DataWorkbenchErrorCode;

  constructor(code: DataWorkbenchErrorCode, message: string) {
    super(message);
    this.name = 'DataWorkbenchError';
    this.code = code;
  }
}

export const dataInputFormats: readonly DataInputFormat[] = ['json', 'yaml', 'csv', 'tsv'];
export const dataOutputFormats: readonly DataOutputFormat[] = [
  ...dataInputFormats,
  'typescript',
  'json-schema',
];

export const defaultDataWorkbenchOptions: DataWorkbenchOptions = {
  from: 'json',
  to: 'json',
  indent: 2,
  sort: false,
  flatten: false,
  root: 'Root',
};

export function isDataInputFormat(value: string): value is DataInputFormat {
  return dataInputFormats.some((format) => format === value);
}

function isDataObject(value: DataValue): value is DataObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Reject values that JSON serialization would silently change or omit. */
export function assertDataValue(
  value: unknown,
  ancestors = new Set<object>()
): asserts value is DataValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (
      !Number.isFinite(value) ||
      Object.is(value, -0) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value))
    ) {
      throw new DataWorkbenchError('unsupportedValue', 'A number cannot be represented safely.');
    }
    return;
  }
  if (typeof value !== 'object' || value === null) {
    throw new DataWorkbenchError(
      'unsupportedValue',
      'Only JSON-compatible data values are supported.'
    );
  }
  if (ancestors.has(value)) {
    throw new DataWorkbenchError('unsupportedValue', 'Circular references cannot be represented.');
  }
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    throw new DataWorkbenchError('unsupportedValue', 'This object type cannot be represented.');
  }
  ancestors.add(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    assertDataValue(child, ancestors);
  }
  ancestors.delete(value);
}

/** RFC 4180-style quoting, with CRLF, LF and CR record endings. */
export function parseDelimitedRows(text: string, delimiter: ',' | '\t' = ','): string[][] {
  if (!text) return [];
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let state: 'start' | 'plain' | 'quoted' | 'closed' = 'start';
  let endedRecord = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    endedRecord = false;
    if (state === 'quoted') {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          state = 'closed';
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = '';
      state = 'start';
    } else if (char === '\r' || char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      state = 'start';
      endedRecord = true;
      if (char === '\r' && text[index + 1] === '\n') index++;
    } else if (char === '"' && state === 'start') {
      state = 'quoted';
    } else if (state === 'closed' || char === '"') {
      throw new DataWorkbenchError('quote', 'Invalid text outside a quoted field.');
    } else {
      field += char;
      state = 'plain';
    }
  }
  if (state === 'quoted') {
    throw new DataWorkbenchError('quote', 'A quoted field is not closed.');
  }
  if (!endedRecord) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseDelimitedData(text: string, delimiter: ',' | '\t' = ','): ParsedData {
  const rows = parseDelimitedRows(text.replace(/^\uFEFF/, ''), delimiter);
  if (!rows.length) {
    throw new DataWorkbenchError('columnsRequired', 'A header row is required.');
  }
  const columns = rows[0];
  if (new Set(columns).size !== columns.length) {
    throw new DataWorkbenchError('duplicateHeader', 'Column headers must be unique.');
  }
  const records = rows.slice(1).map((row, index) => {
    if (row.length !== columns.length) {
      throw new DataWorkbenchError('rowWidth', `Record ${index + 2} has a different column count.`);
    }
    return Object.fromEntries(columns.map((column, cell) => [column, row[cell]]));
  });
  return { value: records, columns };
}

export function parseDataInput(input: string, format: DataInputFormat): ParsedData {
  if (format === 'csv' || format === 'tsv') {
    return parseDelimitedData(input, format === 'csv' ? ',' : '\t');
  }
  let value: unknown;
  try {
    value =
      format === 'json'
        ? JSON.parse(input)
        : load(input, {
            schema: JSON_SCHEMA,
            listener(event, state) {
              if (
                event === 'close' &&
                typeof state.result !== 'string' &&
                /^(?:[ \t\r\n]|#[^\r\n]*(?:\r\n|\r|\n))*:/.test(state.input.slice(state.position))
              ) {
                throw new DataWorkbenchError(
                  'unsupportedValue',
                  'YAML mapping keys must be strings.'
                );
              }
            },
          });
  } catch (error) {
    if (error instanceof DataWorkbenchError) throw error;
    throw new DataWorkbenchError('parse', error instanceof Error ? error.message : String(error));
  }
  assertDataValue(value);
  return { value };
}

export function sortDataKeys(value: DataValue): DataValue {
  if (Array.isArray(value)) return value.map(sortDataKeys);
  if (!isDataObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortDataKeys(value[key])])
  );
}

/** Empty containers are leaves; RFC 6901 escaping prevents path collisions. */
export function flattenDataPointers(value: DataValue): DataObject {
  const entries: [string, DataValue][] = [];
  function visit(child: DataValue, pointer: string) {
    if (child !== null && typeof child === 'object' && Object.keys(child).length) {
      for (const [key, nested] of Object.entries(child)) {
        visit(nested, `${pointer}/${key.replaceAll('~', '~0').replaceAll('/', '~1')}`);
      }
    } else {
      entries.push([pointer, child]);
    }
  }
  visit(value, '');
  return Object.fromEntries(entries);
}

function quoteCell(value: string, delimiter: ',' | '\t'): string {
  return value === '' || value.includes(delimiter) || /["\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;
}

export function serializeDelimitedData(
  value: DataValue,
  delimiter: ',' | '\t' = ',',
  originalColumns?: readonly string[],
  sortColumns = false
): string {
  assertDataValue(value);
  if (!Array.isArray(value) || !value.every(isDataObject)) {
    throw new DataWorkbenchError('tableRequired', 'Table output requires an array of objects.');
  }
  const columns = [...new Set([...(originalColumns ?? []), ...value.flatMap(Object.keys)])];
  if (sortColumns) columns.sort();
  if (!columns.length) {
    throw new DataWorkbenchError('columnsRequired', 'The object array has no columns to export.');
  }
  const lines = [columns.map((column) => quoteCell(column, delimiter)).join(delimiter)];
  for (const row of value) {
    lines.push(
      columns
        .map((column) => {
          const cell = Object.hasOwn(row, column) ? row[column] : undefined;
          const text =
            cell === null || cell === undefined
              ? ''
              : typeof cell === 'object'
                ? JSON.stringify(cell)
                : String(cell);
          return quoteCell(text, delimiter);
        })
        .join(delimiter)
    );
  }
  return lines.join('\n');
}

type TypeContext = { blocks: string[]; used: Set<string>; indent: 0 | 2 | 4; sort: boolean };

function typeName(hint: string): string {
  const name = hint
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
    .replace(/^[^A-Za-z]+/, '');
  return name || 'Root';
}

function uniqueTypeName(hint: string, context: TypeContext): string {
  const base = typeName(hint);
  let name = base;
  let suffix = 2;
  while (context.used.has(name)) name = `${base}${suffix++}`;
  context.used.add(name);
  return name;
}

function emitInterface(samples: DataObject[], hint: string, context: TypeContext): string {
  const name = uniqueTypeName(hint, context);
  const slot = context.blocks.length;
  context.blocks.push('');
  const properties = new Map<string, DataValue[]>();
  for (const sample of samples) {
    for (const [key, value] of Object.entries(sample)) {
      const values = properties.get(key) ?? [];
      values.push(value);
      properties.set(key, values);
    }
  }
  const entries = [...properties];
  if (context.sort) entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const members = entries.map(([key, values]) => {
    const property = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
    const optional = values.length < samples.length ? '?' : '';
    return `${property}${optional}: ${inferTypeUnion(values, key, context)};`;
  });
  context.blocks[slot] =
    context.indent === 0 || !members.length
      ? `interface ${name} {${members.length ? ` ${members.join(' ')} ` : ''}}`
      : `interface ${name} {\n${members.map((member) => ' '.repeat(context.indent) + member).join('\n')}\n}`;
  return name;
}

function inferTypeUnion(values: DataValue[], hint: string, context: TypeContext): string {
  const types = new Set<string>();
  const objects: DataObject[] = [];
  const arrays: DataValue[][] = [];
  for (const value of values) {
    if (value === null) types.add('null');
    else if (Array.isArray(value)) arrays.push(value);
    else if (isDataObject(value)) objects.push(value);
    else types.add(typeof value);
  }
  if (objects.length) types.add(emitInterface(objects, hint, context));
  if (arrays.length) {
    const inner = inferTypeUnion(arrays.flat(), hint, context);
    types.add(inner.includes(' | ') ? `(${inner})[]` : `${inner}[]`);
  }
  return [...types].join(' | ') || 'unknown';
}

export function generateTypeScript(
  value: DataValue,
  rootName = 'Root',
  indent: 0 | 2 | 4 = 2,
  sort = false
): string {
  assertDataValue(value);
  const context: TypeContext = { blocks: [], used: new Set(), indent, sort };
  if (isDataObject(value)) {
    emitInterface([value], rootName, context);
  } else {
    const root = uniqueTypeName(rootName, context);
    const type = inferTypeUnion([value], root, context);
    context.blocks.unshift(`type ${root} = ${type};`);
  }
  return context.blocks.join(indent === 0 ? '\n' : '\n\n');
}

function inferSchemaUnion(values: DataValue[]): DataObject {
  const types = new Set<string>();
  const objects: DataObject[] = [];
  const arrays: DataValue[][] = [];
  for (const value of values) {
    if (value === null) types.add('null');
    else if (Array.isArray(value)) arrays.push(value);
    else if (isDataObject(value)) objects.push(value);
    else if (typeof value === 'number') types.add(Number.isInteger(value) ? 'integer' : 'number');
    else types.add(typeof value);
  }
  if (types.has('number')) types.delete('integer');
  const alternatives: DataObject[] = [...types].map((type) => ({ type }));
  if (objects.length) {
    const columns = [...new Set(objects.flatMap(Object.keys))];
    const properties = Object.fromEntries(
      columns.map((key) => [
        key,
        inferSchemaUnion(
          objects.filter((object) => Object.hasOwn(object, key)).map((object) => object[key])
        ),
      ])
    );
    const required = columns.filter((key) => objects.every((object) => Object.hasOwn(object, key)));
    alternatives.push({ type: 'object', properties, ...(required.length ? { required } : {}) });
  }
  if (arrays.length) {
    alternatives.push({ type: 'array', items: inferSchemaUnion(arrays.flat()) });
  }
  return alternatives.length === 0
    ? {}
    : alternatives.length === 1
      ? alternatives[0]
      : { anyOf: alternatives };
}

export function generateJsonSchema(value: DataValue, rootName = 'Root'): DataObject {
  assertDataValue(value);
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: rootName.trim() || 'Root',
    ...inferSchemaUnion([value]),
  };
}

/** Sort numeric-looking keys too, which ordinary object enumeration cannot do. */
export function serializeDataJson(value: DataValue, indent: 0 | 2 | 4 = 2, sort = false): string {
  assertDataValue(value);
  if (!sort) return JSON.stringify(value, null, indent);
  function write(child: DataValue, depth: number): string {
    if (child === null || typeof child !== 'object') return JSON.stringify(child);
    const array = Array.isArray(child);
    const entries: [string, DataValue][] = array
      ? child.map((nested, index) => [String(index), nested])
      : Object.keys(child)
          .sort()
          .map((key) => [key, child[key]]);
    const open = array ? '[' : '{';
    const close = array ? ']' : '}';
    if (!entries.length) return open + close;
    const fields = entries.map(([key, nested]) =>
      array
        ? write(nested, depth + 1)
        : `${JSON.stringify(key)}:${indent ? ' ' : ''}${write(nested, depth + 1)}`
    );
    if (!indent) return open + fields.join(',') + close;
    const padding = ' '.repeat((depth + 1) * indent);
    return `${open}\n${padding}${fields.join(`,\n${padding}`)}\n${' '.repeat(depth * indent)}${close}`;
  }
  return write(value, 0);
}

export function serializeDataOutput(data: ParsedData, options: DataWorkbenchOptions): string {
  let value = options.sort ? sortDataKeys(data.value) : data.value;
  if (options.flatten) value = flattenDataPointers(value);
  assertDataValue(value);
  if (options.to === 'json') return serializeDataJson(value, options.indent, options.sort);
  if (options.to === 'yaml') {
    return dump(value, {
      schema: JSON_SCHEMA,
      indent: options.indent || 2,
      flowLevel: options.indent === 0 ? 0 : -1,
      noRefs: true,
      lineWidth: -1,
      noCompatMode: true,
      sortKeys: options.sort,
    }).trimEnd();
  }
  if (options.to === 'typescript') {
    return generateTypeScript(value, options.root, options.indent, options.sort);
  }
  if (options.to === 'json-schema') {
    return serializeDataJson(generateJsonSchema(value, options.root), options.indent, options.sort);
  }
  return serializeDelimitedData(
    value,
    options.to === 'csv' ? ',' : '\t',
    options.flatten ? undefined : data.columns,
    options.sort
  );
}

export type DataWorkbenchResult =
  | { ok: null }
  | { ok: true; output: string }
  | { ok: false; code: DataWorkbenchErrorCode; detail: string };

export function processDataWorkbench(
  input: string,
  options: DataWorkbenchOptions = defaultDataWorkbenchOptions
): DataWorkbenchResult {
  if (!input.trim()) return { ok: null };
  try {
    return { ok: true, output: serializeDataOutput(parseDataInput(input, options.from), options) };
  } catch (error) {
    return {
      ok: false,
      code: error instanceof DataWorkbenchError ? error.code : 'parse',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export function parseDataWorkbenchParams(params: URLSearchParams): DataWorkbenchOptions {
  const from = params.get('from') ?? '';
  const rawTo = params.get('to') ?? '';
  const to = rawTo === 'ts' ? 'typescript' : rawTo === 'schema' ? 'json-schema' : rawTo;
  const indent = Number(params.get('indent') ?? 2);
  return {
    from: isDataInputFormat(from) ? from : 'json',
    to: dataOutputFormats.some((format) => format === to) ? (to as DataOutputFormat) : 'json',
    indent: indent === 0 || indent === 4 ? indent : 2,
    sort: params.get('sort') === '1' || params.get('sort') === 'true',
    flatten: params.get('flatten') === '1' || params.get('flatten') === 'true',
    root: params.get('root') ?? 'Root',
  };
}

/** Persist only processing choices, never source text. */
export function updateDataWorkbenchParams(
  params: URLSearchParams,
  options: DataWorkbenchOptions
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set('from', options.from);
  next.set('to', options.to);
  const choices: [string, string | undefined][] = [
    ['indent', options.indent === 2 ? undefined : String(options.indent)],
    ['sort', options.sort ? '1' : undefined],
    ['flatten', options.flatten ? '1' : undefined],
    ['root', options.root === 'Root' ? undefined : options.root],
  ];
  for (const [key, value] of choices) {
    if (value !== undefined) next.set(key, value);
    else next.delete(key);
  }
  return next;
}
