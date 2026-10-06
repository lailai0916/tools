import type { LocalizedToolGuide } from './types';

export const curatedDataGuides = {
  dataWorkbench: {
    en: {
      summary:
        'Use one source to convert JSON, YAML, CSV and TSV, format or flatten data, and infer TypeScript types or a JSON Schema.',
      steps: [
        'Choose the input and output formats, then paste your data or load the example.',
        'Choose indentation, recursive key sorting or JSON Pointer flattening. The result updates immediately.',
        'Copy the result, use a supported output as the next input, or swap the two data formats to convert back. Continuing clears flattening so paths are not flattened a second time.',
        'For TypeScript or JSON Schema, set the root name and review the inferred structure.',
      ],
      example: {
        input: 'JSON → JSON, recursive key sorting:\n{"z":2,"a":{"b":true,"a":"hello"}}',
        output: '{\n  "a": {\n    "a": "hello",\n    "b": true\n  },\n  "z": 2\n}',
      },
      notes: [
        'CSV and TSV use their first record as unique column headers. CRLF, LF and CR line endings, doubled quotes and quoted multiline cells are supported. Unclosed or misplaced quotes and inconsistent record widths are rejected.',
        'Table output requires an array of objects with at least one column; non-object rows are rejected. Column names are the union of all row keys. Cells are text: null and missing fields become empty cells, and nested arrays or objects become JSON text. Reading a table keeps every cell as a string, so table conversions do not preserve JSON value types.',
        'JSON Pointer flattening escapes ~ as ~0 and / as ~1. It preserves empty arrays and objects; a root scalar uses the empty path. Flattening produces a single object, so it cannot directly be exported as a table.',
        'YAML is read with a JSON-compatible schema: dates stay strings, mapping keys must be strings, and custom tags are rejected. Circular references, non-finite numbers, unsafe integers and negative zero are rejected rather than changed silently. JSON comments and trailing commas are unsupported.',
        'TypeScript and JSON Schema are inferred from the sample, preserving nested arrays and merging object samples with optional missing properties. Empty arrays have unknown item types. The schema uses draft 2020-12 and does not forbid unobserved properties. Generated contracts need review.',
        'All processing runs in your browser. Only format and option choices appear in the URL; your input is never added to it.',
      ],
    },
    'zh-Hans': {
      summary:
        '在同一个输入中转换 JSON、YAML、CSV 和 TSV，格式化、排序或扁平化数据，并推断 TypeScript 类型或 JSON Schema。',
      steps: [
        '选择输入与输出格式，粘贴数据或载入示例。',
        '选择缩进、递归排序键名或 JSON Pointer 扁平化，结果会立即更新。',
        '复制结果，将支持的输出格式用作下一次输入，或交换两种数据格式转回。继续处理会关闭扁平化，避免再次扁平化路径。',
        '生成 TypeScript 或 JSON Schema 时，填写根名称并检查推断的结构。',
      ],
      example: {
        input: 'JSON → JSON，递归排序键名：\n{"z":2,"a":{"b":true,"a":"hello"}}',
        output: '{\n  "a": {\n    "a": "hello",\n    "b": true\n  },\n  "z": 2\n}',
      },
      notes: [
        'CSV 和 TSV 将第一条记录作为表头，名称不能重复。支持 CRLF、LF、CR 换行、两个引号表示内部引号，以及引号内的多行单元格；未闭合或位置错误的引号、列数不一致的记录会报错。',
        '表格输出需要至少包含一列的对象数组，非对象行会报错。表头汇总所有行的键名。单元格均为文本：null 和缺失属性留空，嵌套数组和对象保存为 JSON 文本。读取表格时所有值仍为字符串，因此表格转换不会保留 JSON 值的类型。',
        'JSON Pointer 扁平化将 ~ 转义为 ~0、/ 转义为 ~1；保留空数组和空对象，根标量使用空路径。扁平化生成一个对象，因此无法直接输出为表格。',
        'YAML 使用兼容 JSON 的解析规则：日期保留为字符串，键名必须是字符串，自定义标签会报错。循环引用、非有限数值、不安全整数和负零会被拒绝，不会静默修改。JSON 不支持注释和尾部逗号。',
        'TypeScript 和 JSON Schema 根据样本推断，保留嵌套数组；多个对象样本会合并，缺失的属性设为可选。空数组的元素类型未知。Schema 使用 draft 2020-12，不禁止样本外的属性。生成的数据契约需要人工检查。',
        '数据处理全部在浏览器本地进行。URL 只记录格式与选项，输入内容不会加入 URL。',
      ],
    },
  },
} satisfies Record<'dataWorkbench', LocalizedToolGuide>;
