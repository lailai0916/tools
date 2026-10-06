import type { LocalizedToolGuide, ToolGuideKey } from './types';
export const textGuides = {
  regexTester: {
    en: {
      summary: 'Inspect matches and capture groups produced by a JavaScript regular expression.',
      steps: [
        'Enter the pattern without surrounding / delimiters, then the test text.',
        'Adjust g (all matches), i (ignore case), m (multiline anchors) and s (dot matches line breaks); inspect matches, positions and capture groups.',
      ],
      example: {
        input: 'Pattern: \\d+\nText: item 12, item 34',
        output: 'Matches: 12, 34',
      },
      notes: [
        'Uses JavaScript RegExp syntax. Without g, only the first match is shown; with g, up to 2000 matches are displayed. Match offsets use UTF-16 indexes; complex patterns can take time on long input.',
        'Patterns run in a separate worker and stop after one second. A match limit of 2,000 keeps large result sets manageable.',
      ],
    },
    'zh-Hans': {
      summary: '查看 JavaScript 正则表达式的匹配结果与捕获组。',
      steps: [
        '输入不带两侧 / 分隔符的表达式，再填写测试文本。',
        '按需调整 g（全部匹配）、i（忽略大小写）、m（多行起止）与 s（点号匹配换行），查看结果、位置与捕获组。',
      ],
      example: {
        input: '表达式：\\d+\n文本：item 12, item 34',
        output: '匹配：12、34',
      },
      notes: [
        '采用 JavaScript RegExp 语法；关闭 g 时只显示首个匹配，开启时最多显示 2000 个匹配。位置以 UTF-16 下标计数，复杂表达式处理长文本时可能耗时较长。',
        '表达式在独立线程运行，超过一秒会停止；结果上限为 2,000 条。',
      ],
    },
  },
  textDiff: {
    en: {
      summary: 'Compare two text versions and locate added or removed lines.',
      steps: [
        'Paste the original and modified versions into their respective inputs.',
        'Review the line-based diff and copy it if needed.',
      ],
      example: {
        input: 'Original: hello\nModified: hello world',
        output: '- hello\n+ hello world',
      },
      notes: [
        'Comparison is by line, not by individual word or character. A changed line is shown as a removal and an addition.',
        'Comparison runs in a worker and stops after one second. Both inputs together support up to 500,000 UTF-16 code units and 20,000 lines; results support up to 20,000 rows. An error clears the result and disables copying.',
      ],
    },
    'zh-Hans': {
      summary: '比较两个版本的文本，定位新增与删除的行。',
      steps: [
        '将原始文本与修改后的文本分别粘贴到对应输入区。',
        '查看按行展示的差异，必要时复制差异结果。',
      ],
      example: {
        input: '原始：hello\n修改后：hello world',
        output: '- hello\n+ hello world',
      },
      notes: [
        '按行比较，而不是逐词或逐字符比较；修改一行会显示为删除旧行并新增新行。',
        '比较在独立线程运行，超过一秒会停止。两份输入合计最多支持 500,000 个 UTF-16 码元和 20,000 行，结果最多 20,000 行；出错时清空结果并禁用复制。',
      ],
    },
  },
  unicodeInspector: {
    en: {
      summary: 'Inspect Unicode code points and their UTF-8 byte sequences.',
      steps: [
        'Paste the characters you want to inspect.',
        'Read each row’s glyph, U+ code point, decimal value and hexadecimal UTF-8 bytes.',
      ],
      example: {
        input: 'A',
        output: 'U+0041\nDecimal: 65\nUTF-8: 41',
      },
      notes: [
        'Shows up to 500 code points. One visible symbol, including some emoji, can occupy multiple rows because it contains several code points.',
        'Unpaired UTF-16 surrogates are shown as code units with a warning. They have no valid UTF-8 encoding; replacement-character bytes are not substituted.',
      ],
    },
    'zh-Hans': {
      summary: '查看字符的 Unicode 码点及 UTF-8 字节序列。',
      steps: ['粘贴需要检查的字符。', '逐行查看字形、U+ 码点、十进制值与十六进制 UTF-8 字节。'],
      example: {
        input: 'A',
        output: 'U+0041\n十进制：65\nUTF-8：41',
      },
      notes: [
        '最多展示 500 个码点。部分 emoji 等可见符号由多个码点构成，因此可能占用多行。',
        '未配对的 UTF-16 代理项会按码元展示并提示警告。它们没有合法的 UTF-8 编码，不会用替换字符的字节代替。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
