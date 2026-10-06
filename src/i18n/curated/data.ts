export const curatedDataEn = {
  'tools.dataWorkbench.name': 'Data workbench',
  'tools.dataWorkbench.description':
    'Convert, format and inspect structured data in one shared workspace.',
  'tools.dataWorkbench.from': 'Input format',
  'tools.dataWorkbench.to': 'Output format',
  'tools.dataWorkbench.json': 'JSON',
  'tools.dataWorkbench.yaml': 'YAML',
  'tools.dataWorkbench.csv': 'CSV',
  'tools.dataWorkbench.tsv': 'TSV',
  'tools.dataWorkbench.typescript': 'TypeScript',
  'tools.dataWorkbench.json-schema': 'JSON Schema',
  'tools.dataWorkbench.indent': 'Indentation',
  'tools.dataWorkbench.twoSpaces': '2 spaces',
  'tools.dataWorkbench.fourSpaces': '4 spaces',
  'tools.dataWorkbench.compact': 'Compact',
  'tools.dataWorkbench.sort': 'Sort keys recursively',
  'tools.dataWorkbench.flatten': 'Flatten with JSON Pointer paths',
  'tools.dataWorkbench.root': 'Root type / schema name',
  'tools.dataWorkbench.swap': 'Swap formats',
  'tools.dataWorkbench.continue': 'Use output as input',
  'tools.dataWorkbench.sample': 'Load example',
  'tools.dataWorkbench.tableNote':
    'Tables require an array of objects. Cells become text; null and missing values become empty cells, and nested values become JSON text. CSV / TSV input keeps every cell as a string.',
  'tools.dataWorkbench.flattenNote':
    'Flattening produces one object of JSON Pointer paths. Slashes and tildes in keys are escaped; empty arrays and objects are preserved.',
  'tools.dataWorkbench.inferenceNote':
    'Types and schemas are inferred from this sample. Missing properties are optional; array nesting is preserved. Review the result before using it as a contract.',
  'tools.dataWorkbench.generatedNote':
    'Generated TypeScript and JSON Schema are outputs. Continue and swap are available for JSON, YAML, CSV and TSV.',
  'tools.dataWorkbench.error.parse': 'The input does not match the selected format.',
  'tools.dataWorkbench.error.quote':
    'A quoted cell is malformed. Close every quote, double embedded quotes, and keep quotes at cell boundaries.',
  'tools.dataWorkbench.error.duplicateHeader': 'Column headers must be unique.',
  'tools.dataWorkbench.error.rowWidth':
    'Every record must have the same number of cells as the header.',
  'tools.dataWorkbench.error.tableRequired':
    'CSV and TSV output require an array of objects. Every array item must be an object.',
  'tools.dataWorkbench.error.columnsRequired':
    'Table data needs a header row or at least one object property to export.',
  'tools.dataWorkbench.error.unsupportedValue':
    'Use JSON-compatible values and string mapping keys: finite numbers, safe integers, strings, booleans, null, arrays and objects. Negative zero, custom YAML types and circular references are unsupported.',
} as const;

export const curatedDataZhHans = {
  'tools.dataWorkbench.name': '数据工作台',
  'tools.dataWorkbench.description': '在同一输入中转换、格式化和检查结构化数据。',
  'tools.dataWorkbench.from': '输入格式',
  'tools.dataWorkbench.to': '输出格式',
  'tools.dataWorkbench.json': 'JSON',
  'tools.dataWorkbench.yaml': 'YAML',
  'tools.dataWorkbench.csv': 'CSV',
  'tools.dataWorkbench.tsv': 'TSV',
  'tools.dataWorkbench.typescript': 'TypeScript',
  'tools.dataWorkbench.json-schema': 'JSON Schema',
  'tools.dataWorkbench.indent': '缩进',
  'tools.dataWorkbench.twoSpaces': '2 空格',
  'tools.dataWorkbench.fourSpaces': '4 空格',
  'tools.dataWorkbench.compact': '紧凑格式',
  'tools.dataWorkbench.sort': '递归排序键名',
  'tools.dataWorkbench.flatten': '按 JSON Pointer 路径扁平化',
  'tools.dataWorkbench.root': '根类型 / Schema 名称',
  'tools.dataWorkbench.swap': '交换格式',
  'tools.dataWorkbench.continue': '将输出用作输入',
  'tools.dataWorkbench.sample': '载入示例',
  'tools.dataWorkbench.tableNote':
    '表格输出需要对象数组。单元格转换为文本；null 和缺失值留空，嵌套值保存为 JSON 文本。CSV / TSV 输入的所有单元格均保留为字符串。',
  'tools.dataWorkbench.flattenNote':
    '扁平化将结果变为 JSON Pointer 路径对象。键名中的斜杠和波浪号会转义，空数组和空对象会保留。',
  'tools.dataWorkbench.inferenceNote':
    '类型和 Schema 仅根据当前样本推断。缺失的属性设为可选，保留数组嵌套层级。用于数据契约前请检查结果。',
  'tools.dataWorkbench.generatedNote':
    'TypeScript 和 JSON Schema 为生成结果。JSON、YAML、CSV、TSV 之间可以继续处理或交换格式。',
  'tools.dataWorkbench.error.parse': '输入内容与所选格式不匹配。',
  'tools.dataWorkbench.error.quote':
    '单元格引号格式不正确。请闭合引号，将内部引号写为两个引号，并只在单元格边界使用引号。',
  'tools.dataWorkbench.error.duplicateHeader': '表头名称不能重复。',
  'tools.dataWorkbench.error.rowWidth': '每条记录的单元格数量必须与表头一致。',
  'tools.dataWorkbench.error.tableRequired':
    'CSV 和 TSV 输出需要对象数组，每个数组元素都必须是对象。',
  'tools.dataWorkbench.error.columnsRequired': '表格数据需要表头，或至少一个可以导出的对象属性。',
  'tools.dataWorkbench.error.unsupportedValue':
    '请使用字符串键名和兼容 JSON 的值：有限数值、安全整数、字符串、布尔值、null、数组和对象。不支持负零、自定义 YAML 类型或循环引用。',
} as const;
