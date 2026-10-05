import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const converterGuides = {
  jsonFormat: {
    en: {
      summary: 'Make JSON readable for inspection, or compact it for storage.',
      steps: [
        'Paste a JSON value into the input.',
        'Choose 2 spaces, 4 spaces or Minify; the output updates automatically.',
      ],
      example: {
        input: '{"name":"lailai","active":true}',
        output: '{\n  "name": "lailai",\n  "active": true\n}',
      },
      notes: [
        'JSON requires double-quoted keys and strings. Comments and trailing commas are rejected.',
      ],
    },
    'zh-Hans': {
      summary: '将 JSON 排版为便于阅读的格式，或压缩为紧凑的单行文本。',
      steps: ['在输入区粘贴 JSON 数据。', '选择 2 空格、4 空格或压缩，结果会自动更新。'],
      example: {
        input: '{"name":"lailai","active":true}',
        output: '{\n  "name": "lailai",\n  "active": true\n}',
      },
      notes: ['JSON 的键名与字符串须使用双引号，不支持注释和末尾多余的逗号。'],
    },
  },
  baseConverter: {
    en: {
      summary: 'Convert exact integers between binary, octal, decimal and hexadecimal.',
      steps: [
        'Enter an integer in any of the four base fields.',
        'Read or copy the equivalent values from the other fields.',
      ],
      example: {
        input: 'Decimal: 255',
        output: 'Binary: 11111111\nOctal: 377\nHexadecimal: ff',
      },
      notes: [
        'Supports large and negative integers, but not fractions. Enter digits without 0x, 0b or 0o prefixes.',
      ],
    },
    'zh-Hans': {
      summary: '在二进制、八进制、十进制与十六进制之间进行精确的整数转换。',
      steps: ['在任意进制的输入框中填写整数。', '查看或复制其余输入框中同步换算的值。'],
      example: {
        input: '十进制：255',
        output: '二进制：11111111\n八进制：377\n十六进制：ff',
      },
      notes: ['支持大整数和负整数，不支持小数；无需添加 0x、0b 或 0o 前缀。'],
    },
  },
  base64: {
    en: {
      summary: 'Encode UTF-8 text as Base64, or recover text from a Base64 string.',
      steps: [
        'Select Encode or Decode.',
        'Paste the source text and copy the automatically updated output.',
      ],
      example: {
        input: 'Encode: hello',
        output: 'aGVsbG8=',
      },
      notes: [
        'Base64 is an encoding, not encryption. This tool uses the standard + / alphabet rather than Base64url.',
      ],
    },
    'zh-Hans': {
      summary: '将 UTF-8 文本编码为 Base64，或将 Base64 还原为文本。',
      steps: ['选择编码或解码模式。', '粘贴原始文本，查看并复制自动更新的结果。'],
      example: {
        input: '编码：hello',
        output: 'aGVsbG8=',
      },
      notes: ['Base64 是编码而非加密；这里使用包含 + 和 / 的标准字母表，不是 Base64url。'],
    },
  },
  base32: {
    en: {
      summary: 'Convert UTF-8 text to and from RFC 4648 Base32.',
      steps: [
        'Choose the encoding direction.',
        'Enter text or a Base32 string; the result appears automatically.',
      ],
      example: {
        input: 'Encode: hello',
        output: 'NBSWY3DP',
      },
      notes: [
        'Uses A–Z and 2–7, with = padding when needed. Decoding ignores whitespace and letter case.',
      ],
    },
    'zh-Hans': {
      summary: '使用 RFC 4648 Base32 在 UTF-8 文本与编码字符串之间转换。',
      steps: ['选择编码或解码方向。', '输入文本或 Base32 字符串，结果会自动显示。'],
      example: {
        input: '编码：hello',
        output: 'NBSWY3DP',
      },
      notes: ['字母表为 A–Z 和 2–7，必要时以 = 补齐；解码时忽略空白和字母大小写。'],
    },
  },
  colorConverter: {
    en: {
      summary: 'Translate an opaque color between HEX, RGB and HSL representations.',
      steps: [
        'Edit a HEX, RGB or HSL value, or use the color picker.',
        'Adjust the RGB sliders and copy the representation you need.',
      ],
      example: {
        input: 'HEX: #ff0000',
        output: 'rgb(255, 0, 0)\nhsl(0, 100%, 50%)',
      },
      notes: [
        'HEX accepts 3 or 6 digits. Alpha channels are not supported; RGB channels range from 0 to 255.',
      ],
    },
    'zh-Hans': {
      summary: '在 HEX、RGB 与 HSL 之间换算不透明颜色。',
      steps: [
        '编辑任意颜色值，或使用取色器选择颜色。',
        '通过 RGB 滑块调整颜色，再复制需要的表示方式。',
      ],
      example: {
        input: 'HEX：#ff0000',
        output: 'rgb(255, 0, 0)\nhsl(0, 100%, 50%)',
      },
      notes: ['HEX 支持 3 位或 6 位，不支持透明度通道；RGB 各通道范围为 0–255。'],
    },
  },
  timestamp: {
    en: {
      summary: 'Translate Unix timestamps and calendar times while comparing time zones.',
      steps: [
        'Enter a Unix timestamp or a date/time in the corresponding field.',
        'Choose the time zone and seconds or milliseconds, then read the conversion.',
      ],
      example: {
        input: 'Timestamp: 0\nTime zone: UTC',
        output: '1970-01-01 00:00:00',
      },
      notes: [
        'Unix time starts at the UTC epoch. Timestamp input is inferred as seconds up to 10 numeric digits, otherwise milliseconds; a date without an offset uses the selected zone.',
      ],
    },
    'zh-Hans': {
      summary: '转换 Unix 时间戳与日期时间，并对照不同时区。',
      steps: ['在对应输入框填写时间戳或日期时间。', '选择时区及秒或毫秒单位，查看转换结果。'],
      example: {
        input: '时间戳：0\n时区：UTC',
        output: '1970-01-01 00:00:00',
      },
      notes: [
        'Unix 时间以 UTC 纪元为起点。时间戳数值不超过 10 位时按秒解释，否则按毫秒；日期未带时区偏移时使用所选时区。',
      ],
    },
  },
  jsonToYaml: {
    en: {
      summary: 'Convert structured data between JSON and YAML.',
      steps: [
        'Select JSON → YAML or YAML → JSON.',
        'Paste the source document and copy the converted result.',
      ],
      example: {
        input: 'JSON → YAML\n{"name":"lailai","active":true}',
        output: 'name: lailai\nactive: true',
      },
      notes: [
        'YAML comments and formatting are not retained in JSON. Use a single YAML document and review values whose types depend on YAML parsing.',
      ],
    },
    'zh-Hans': {
      summary: '在 JSON 与 YAML 之间转换结构化数据。',
      steps: ['选择 JSON → YAML 或 YAML → JSON。', '粘贴源文档，查看并复制转换结果。'],
      example: {
        input: 'JSON → YAML\n{"name":"lailai","active":true}',
        output: 'name: lailai\nactive: true',
      },
      notes: [
        '转换为 JSON 后不会保留 YAML 注释与排版。请使用单个 YAML 文档，并核对受 YAML 类型解析影响的值。',
      ],
    },
  },
  jsonToCsv: {
    en: {
      summary: 'Move tabular data between an array of JSON objects and CSV.',
      steps: [
        'Choose the direction and paste the JSON array or CSV table.',
        'Read the output; CSV uses the first row as column names.',
      ],
      example: {
        input: 'JSON → CSV\n[{"name":"lailai","age":20}]',
        output: 'name,age\nlailai,20',
      },
      notes: [
        'CSV → JSON produces string values. Nested JSON values are serialized into cells; missing or null values become empty cells.',
      ],
    },
    'zh-Hans': {
      summary: '在 JSON 对象数组与 CSV 表格之间转换。',
      steps: ['选择方向，粘贴 JSON 数组或 CSV 表格。', '查看结果；CSV 的第一行作为列名。'],
      example: {
        input: 'JSON → CSV\n[{"name":"lailai","age":20}]',
        output: 'name,age\nlailai,20',
      },
      notes: [
        'CSV 转 JSON 后单元格值均为字符串。嵌套 JSON 会序列化到单元格中，缺失或 null 值会成为空单元格。',
      ],
    },
  },
  htmlEntities: {
    en: {
      summary: 'Escape HTML-sensitive characters or decode HTML entities into text.',
      steps: ['Choose Encode or Decode.', 'Enter the text or entity string and copy the result.'],
      example: {
        input: 'Encode: <b>Hi & bye</b>',
        output: '&lt;b&gt;Hi &amp; bye&lt;/b&gt;',
      },
      notes: [
        'Encoding escapes &, <, >, double quotes and single quotes. It does not sanitize a complete HTML document for every rendering context.',
      ],
    },
    'zh-Hans': {
      summary: '转义 HTML 特殊字符，或将 HTML 实体还原为文本。',
      steps: ['选择编码或解码模式。', '输入文本或实体字符串，再复制结果。'],
      example: {
        input: '编码：<b>Hi & bye</b>',
        output: '&lt;b&gt;Hi &amp; bye&lt;/b&gt;',
      },
      notes: [
        '编码会转义 &、<、>、双引号和单引号；它不能替代针对完整 HTML 文档与具体渲染场景的安全处理。',
      ],
    },
  },
  romanNumeral: {
    en: {
      summary: 'Convert whole numbers from 1 to 3999 to canonical Roman numerals and back.',
      steps: [
        'Enter an Arabic integer or a Roman numeral in its field.',
        'Read the corresponding value in the other field.',
      ],
      example: {
        input: '2026',
        output: 'MMXXVI',
      },
      notes: [
        'Use standard subtractive notation such as IV and IX. Zero, negative numbers and extended overbar notation are outside the supported range.',
      ],
    },
    'zh-Hans': {
      summary: '将 1–3999 的整数与标准罗马数字相互转换。',
      steps: ['在对应输入框填写阿拉伯整数或罗马数字。', '查看另一输入框中的换算结果。'],
      example: {
        input: '2026',
        output: 'MMXXVI',
      },
      notes: ['使用 IV、IX 等标准减法写法；不支持零、负数或带上划线的扩展记法。'],
    },
  },
  textToBinary: {
    en: {
      summary: 'Inspect text as 8-bit binary UTF-8 bytes, or turn those bytes back into text.',
      steps: [
        'Select Text → Binary or Binary → Text.',
        'Paste the source; separate binary bytes with whitespace when decoding.',
      ],
      example: {
        input: 'Text → Binary: A',
        output: '01000001',
      },
      notes: [
        'Each group is one byte, not one character. A Chinese character or emoji usually occupies several UTF-8 bytes.',
      ],
    },
    'zh-Hans': {
      summary: '将文本表示为 8 位二进制 UTF-8 字节，或从字节还原文本。',
      steps: ['选择文本转二进制或二进制转文本。', '粘贴源内容；解码时用空白分隔各组二进制字节。'],
      example: {
        input: '文本转二进制：A',
        output: '01000001',
      },
      notes: ['每组表示一个字节而非一个字符；汉字和 emoji 通常占用多个 UTF-8 字节。'],
    },
  },
  temperatureConverter: {
    en: {
      summary: 'Convert temperatures between Celsius, Fahrenheit and Kelvin.',
      steps: [
        'Enter a number in any temperature field.',
        'Read the other two values, which update immediately.',
      ],
      example: {
        input: 'Celsius: 0',
        output: 'Fahrenheit: 32\nKelvin: 273.15',
      },
      notes: ['Values below absolute zero (−273.15 °C, −459.67 °F or 0 K) are rejected.'],
    },
    'zh-Hans': {
      summary: '在摄氏度、华氏度与开尔文之间换算温度。',
      steps: ['在任意温度输入框填写数值。', '查看另外两个自动更新的温度值。'],
      example: {
        input: '摄氏度：0',
        output: '华氏度：32\n开尔文：273.15',
      },
      notes: ['低于绝对零度（−273.15 °C、−459.67 °F 或 0 K）的值会被拒绝。'],
    },
  },
  dataSizeConverter: {
    en: {
      summary: 'Compare data sizes using decimal SI or binary IEC units.',
      steps: [
        'Choose SI (1000) or IEC (1024), then the source unit.',
        'Enter the size and read its equivalents in the other units.',
      ],
      example: {
        input: 'IEC\n1 KiB',
        output: '1024 B',
      },
      notes: [
        'KB uses powers of 1000; KiB uses powers of 1024. These are byte units, not network bit-rate units.',
      ],
    },
    'zh-Hans': {
      summary: '使用十进制 SI 或二进制 IEC 单位换算数据大小。',
      steps: ['选择 SI（1000）或 IEC（1024），再选择源单位。', '输入大小，查看各单位的对应数值。'],
      example: {
        input: 'IEC\n1 KiB',
        output: '1024 B',
      },
      notes: ['KB 按 1000 的幂换算，KiB 按 1024 的幂换算；这里计算字节，不是网络速率中的比特。'],
    },
  },
  unixPermission: {
    en: {
      summary:
        'Translate Unix read, write and execute permissions into octal and symbolic notation.',
      steps: [
        'Toggle permissions for owner, group and others, or edit the octal value.',
        'Read the synchronized octal and symbolic results.',
      ],
      example: {
        input: 'Octal: 644',
        output: 'rw-r--r--',
      },
      notes: [
        'Models the nine basic permission bits. setuid, setgid and sticky bits are not included.',
      ],
    },
    'zh-Hans': {
      summary: '将 Unix 的读、写、执行权限转换为八进制与符号表示。',
      steps: [
        '勾选所有者、用户组和其他用户的权限，或编辑八进制值。',
        '查看同步更新的八进制与符号结果。',
      ],
      example: {
        input: '八进制：644',
        output: 'rw-r--r--',
      },
      notes: ['仅处理九个基本权限位，不包含 setuid、setgid 和 sticky 特殊权限。'],
    },
  },
  durationConverter: {
    en: {
      summary: 'Express a fixed duration in milliseconds, seconds, minutes, hours, days and weeks.',
      steps: [
        'Choose the input unit and enter a duration.',
        'Read or copy the equivalent durations.',
      ],
      example: {
        input: '1 hour',
        output: '60 minutes\n3600 seconds\n3600000 milliseconds',
      },
      notes: [
        'A day is exactly 24 hours and a week is 7 days. Calendar months, years and daylight-saving changes are not part of this conversion.',
      ],
    },
    'zh-Hans': {
      summary: '将固定时长换算为毫秒、秒、分钟、小时、天和周。',
      steps: ['选择输入单位并填写时长。', '查看或复制其他单位的对应结果。'],
      example: {
        input: '1 小时',
        output: '60 分钟\n3600 秒\n3600000 毫秒',
      },
      notes: ['一天固定为 24 小时，一周为 7 天；不处理自然月、年份或夏令时变化。'],
    },
  },
  angleConverter: {
    en: {
      summary: 'Compare angles measured in degrees, radians, gradians and turns.',
      steps: [
        'Enter a value in any of the four angle fields.',
        'Read the corresponding values in the other units.',
      ],
      example: {
        input: '90 degrees',
        output: '≈ 1.57079632679 radians\n100 gradians\n0.25 turns',
      },
      notes: [
        'One full turn is 360 degrees, 2π radians or 400 gradians. Floating-point results may be rounded.',
      ],
    },
    'zh-Hans': {
      summary: '在角度、弧度、百分度与圈之间换算角度。',
      steps: ['在任意角度单位的输入框填写数值。', '查看其他单位的对应结果。'],
      example: {
        input: '90 度',
        output: '≈ 1.57079632679 弧度\n100 百分度\n0.25 圈',
      },
      notes: ['一整圈等于 360 度、2π 弧度或 400 百分度；浮点换算结果可能经过舍入。'],
    },
  },
  csvToTsv: {
    en: {
      summary: 'Convert comma-separated CSV into a tab-separated table.',
      steps: [
        'Paste CSV with a header row if your table has one.',
        'Copy the TSV output into a spreadsheet or text file.',
      ],
      example: {
        input: 'name,age\nlailai,20',
        output: 'name\tage\nlailai\t20',
      },
      notes: [
        'Quoted CSV cells can contain commas, escaped quotes and line breaks. Conversion goes from CSV to TSV only.',
      ],
    },
    'zh-Hans': {
      summary: '将逗号分隔的 CSV 转换为制表符分隔的表格。',
      steps: ['粘贴 CSV；如有表头，请一并保留。', '将 TSV 结果复制到电子表格或文本文件中。'],
      example: {
        input: 'name,age\nlailai,20',
        output: 'name\tage\nlailai\t20',
      },
      notes: ['支持带引号的单元格、转义引号及单元格内换行；此工具只提供 CSV → TSV。'],
    },
  },
  xmlFormatter: {
    en: {
      summary: 'Indent a well-formed XML document for easier reading.',
      steps: [
        'Paste the XML document into the input.',
        'Review the indented result or fix the reported XML parsing error.',
      ],
      example: {
        input: '<root><name>lailai</name></root>',
        output: '<root>\n  <name>lailai</name>\n</root>',
      },
      notes: [
        'Checks XML syntax through the browser parser, but does not validate the document against a schema or DTD.',
      ],
    },
    'zh-Hans': {
      summary: '为结构正确的 XML 文档添加缩进，便于阅读。',
      steps: ['在输入区粘贴 XML 文档。', '查看排版结果；若解析失败，请根据错误检查 XML 语法。'],
      example: {
        input: '<root><name>lailai</name></root>',
        output: '<root>\n  <name>lailai</name>\n</root>',
      },
      notes: ['通过浏览器解析器检查 XML 语法，但不会依据 Schema 或 DTD 验证文档。'],
    },
  },
  jsonFlatten: {
    en: {
      summary: 'Turn nested JSON into a flat map of paths and values.',
      steps: [
        'Paste a valid JSON value.',
        'Read the generated paths: dots represent object keys and brackets represent array indexes.',
      ],
      example: {
        input: '{"user":{"name":"lailai"},"tags":["ui"]}',
        output: '{\n  "user.name": "lailai",\n  "tags[0]": "ui"\n}',
      },
      notes: [
        'Original keys containing dots or brackets can make paths ambiguous. This tool does not reconstruct nested JSON from the flat result.',
      ],
    },
    'zh-Hans': {
      summary: '将嵌套 JSON 展开为路径与值组成的扁平映射。',
      steps: ['粘贴有效的 JSON 数据。', '查看生成的路径：点表示对象层级，方括号表示数组下标。'],
      example: {
        input: '{"user":{"name":"lailai"},"tags":["ui"]}',
        output: '{\n  "user.name": "lailai",\n  "tags[0]": "ui"\n}',
      },
      notes: ['原始键名若含点或方括号，生成路径可能存在歧义；此工具不提供反向还原。'],
    },
  },
  jsonSortKeys: {
    en: {
      summary: 'Recursively reorder JSON object keys to make comparisons easier.',
      steps: ['Paste the JSON document.', 'Copy the formatted result with sorted object keys.'],
      example: {
        input: '{"b":2,"a":1}',
        output: '{\n  "a": 1,\n  "b": 2\n}',
      },
      notes: [
        'Array order is preserved. JavaScript serializes integer-like keys in numeric order even when other keys are sorted alphabetically.',
      ],
    },
    'zh-Hans': {
      summary: '递归整理 JSON 对象键的顺序，便于比较文档。',
      steps: ['粘贴 JSON 文档。', '复制键名已排序的格式化结果。'],
      example: {
        input: '{"b":2,"a":1}',
        output: '{\n  "a": 1,\n  "b": 2\n}',
      },
      notes: ['不会改变数组元素顺序；类似整数的键仍遵循 JavaScript 序列化时的数字顺序。'],
    },
  },
  hexText: {
    en: {
      summary: 'Convert UTF-8 text into hexadecimal bytes and back.',
      steps: [
        'Choose Encode or Decode.',
        'Enter text, or hexadecimal byte pairs separated by spaces if desired.',
      ],
      example: {
        input: 'Encode: Hi',
        output: '48 69',
      },
      notes: [
        'Decoding accepts spaces, colons, hyphens and 0x prefixes, but requires complete byte pairs and valid UTF-8.',
      ],
    },
    'zh-Hans': {
      summary: '在 UTF-8 文本与十六进制字节之间转换。',
      steps: ['选择编码或解码方向。', '输入文本，或输入可用空格分隔的十六进制字节对。'],
      example: {
        input: '编码：Hi',
        output: '48 69',
      },
      notes: ['解码允许空格、冒号、连字符和 0x 前缀，但必须是完整的字节对且构成有效 UTF-8。'],
    },
  },
  listConverter: {
    en: {
      summary: 'Change the separator used by a simple list of values.',
      steps: [
        'Select the original separator and the desired separator.',
        'Paste the list and copy the reformatted output.',
      ],
      example: {
        input: 'From: comma → To: newline\napple, banana, pear',
        output: 'apple\nbanana\npear',
      },
      notes: [
        'Items are trimmed and empty items removed. Quoted CSV cells are not parsed; use CSV → TSV for a CSV table.',
      ],
    },
    'zh-Hans': {
      summary: '更换简单列表中各项之间的分隔符。',
      steps: ['选择原始分隔符与目标分隔符。', '粘贴列表，复制重新分隔后的结果。'],
      example: {
        input: '逗号 → 换行\napple, banana, pear',
        output: 'apple\nbanana\npear',
      },
      notes: [
        '各项首尾空白会被清除，空项会被移除；不解析带引号的 CSV 单元格，表格转换可使用 CSV → TSV。',
      ],
    },
  },
  markdownToHtml: {
    en: {
      summary: 'Convert a small subset of Markdown into escaped HTML markup.',
      steps: [
        'Paste Markdown containing headings, lists, quotes or inline formatting.',
        'Copy the generated HTML source.',
      ],
      example: {
        input: '# Hello\n\n**Welcome**',
        output: '<h1>Hello</h1>\n<p><strong>Welcome</strong></p>',
      },
      notes: [
        'Supports basic headings, unordered lists, blockquotes, inline code, emphasis and HTTP(S) links. It is not a full CommonMark parser; raw HTML is escaped.',
      ],
    },
    'zh-Hans': {
      summary: '将基础 Markdown 语法转换为 HTML 源码。',
      steps: ['粘贴包含标题、列表、引用或行内格式的 Markdown。', '复制生成的 HTML 源码。'],
      example: {
        input: '# Hello\n\n**Welcome**',
        output: '<h1>Hello</h1>\n<p><strong>Welcome</strong></p>',
      },
      notes: [
        '支持基础标题、无序列表、引用、行内代码、强调及 HTTP(S) 链接；不是完整 CommonMark 解析器，原始 HTML 会被转义。',
      ],
    },
  },
  base58: {
    en: {
      summary: 'Encode UTF-8 text with the Bitcoin Base58 alphabet or decode it back.',
      steps: ['Choose Encode or Decode.', 'Paste text or a Base58 string and read the conversion.'],
      example: {
        input: 'Encode: hello',
        output: 'Cn8eVZg',
      },
      notes: [
        'The alphabet omits 0, O, I and l. This is plain Base58, without a Base58Check checksum; decoding expects UTF-8 text.',
      ],
    },
    'zh-Hans': {
      summary: '使用 Bitcoin Base58 字母表编码 UTF-8 文本，或反向解码。',
      steps: ['选择编码或解码模式。', '粘贴文本或 Base58 字符串，查看转换结果。'],
      example: {
        input: '编码：hello',
        output: 'Cn8eVZg',
      },
      notes: [
        '字母表不包含 0、O、I 和 l；这是普通 Base58，不含 Base58Check 校验和，解码结果须为 UTF-8 文本。',
      ],
    },
  },
  lengthConverter: {
    en: {
      summary: 'Convert lengths between common metric and imperial units.',
      steps: [
        'Enter the length and select its source unit.',
        'Select a target unit and read the converted value.',
      ],
      example: {
        input: '1 meter → centimeter',
        output: '100',
      },
      notes: [
        'Uses fixed definitions such as 1 inch = 0.0254 meters and 1 foot = 0.3048 meters. Floating-point results can contain rounding.',
      ],
    },
    'zh-Hans': {
      summary: '在常见公制与英制长度单位之间换算。',
      steps: ['输入长度并选择源单位。', '选择目标单位，查看换算数值。'],
      example: {
        input: '1 米 → 厘米',
        output: '100',
      },
      notes: ['使用固定定义，例如 1 英寸 = 0.0254 米、1 英尺 = 0.3048 米；浮点结果可能存在舍入。'],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
