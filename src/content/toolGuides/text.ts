import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const textGuides = {
  caseConverter: {
    en: {
      summary: 'Generate common naming conventions from the same words.',
      steps: [
        'Enter a phrase or an existing identifier such as helloWorld.',
        'Compare camelCase, PascalCase, snake_case, kebab-case and the other outputs; copy the one you need.',
      ],
      example: {
        input: 'hello world',
        output:
          'camelCase: helloWorld\nPascalCase: HelloWorld\nsnake_case: hello_world\nkebab-case: hello-world',
      },
      notes: [
        'Punctuation separates words and is removed. This formats identifiers; it does not perform language-aware title capitalization.',
      ],
    },
    'zh-Hans': {
      summary: '将同一组词语转换为常见的命名格式。',
      steps: [
        '输入短语或 helloWorld 这样的已有标识符。',
        '对照驼峰、帕斯卡、蛇形、短横线等结果，复制需要的格式。',
      ],
      example: {
        input: 'hello world',
        output: '驼峰：helloWorld\n帕斯卡：HelloWorld\n蛇形：hello_world\n短横线：hello-world',
      },
      notes: [
        '标点会作为分词边界并被移除；这是命名格式转换，不是按自然语言规则进行标题大小写校对。',
      ],
    },
  },
  regexTester: {
    en: {
      summary: 'Inspect matches and capture groups produced by a JavaScript regular expression.',
      steps: [
        'Enter the pattern without surrounding / delimiters, then the test text.',
        'Adjust the available flags and inspect the highlighted matches and match details.',
      ],
      example: {
        input: 'Pattern: \\d+\nText: item 12, item 34',
        output: 'Matches: 12, 34',
      },
      notes: [
        'Uses JavaScript RegExp syntax and scans all matches. Match offsets use UTF-16 indexes; complex patterns can take time on long input.',
      ],
    },
    'zh-Hans': {
      summary: '查看 JavaScript 正则表达式的匹配结果与捕获组。',
      steps: [
        '输入不带两侧 / 分隔符的表达式，再填写测试文本。',
        '调整可用标志，查看高亮匹配与详细信息。',
      ],
      example: {
        input: '表达式：\\d+\n文本：item 12, item 34',
        output: '匹配：12、34',
      },
      notes: [
        '采用 JavaScript RegExp 语法并扫描全部匹配。位置以 UTF-16 下标计数，复杂表达式处理长文本时可能耗时较长。',
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
      notes: ['按行比较，而不是逐词或逐字符比较；修改一行会显示为删除旧行并新增新行。'],
    },
  },
  textStats: {
    en: {
      summary: 'Measure text length, UTF-8 size and simple word and paragraph statistics.',
      steps: [
        'Paste or type the text to analyze.',
        'Read the character, word, line, byte and estimated reading-time metrics.',
      ],
      example: {
        input: 'Hello world',
        output: 'Characters: 11\nWords: 2\nUTF-8 bytes: 11',
      },
      notes: [
        'Characters are counted as graphemes when supported. Words are separated by whitespace; Chinese text is not segmented into words. Reading time assumes 200 words per minute.',
      ],
    },
    'zh-Hans': {
      summary: '统计文本长度、UTF-8 大小以及基础词数、段落数等指标。',
      steps: ['粘贴或输入需要分析的文本。', '查看字符、词、行、字节与预估阅读时间等指标。'],
      example: {
        input: 'Hello world',
        output: '字符数：11\n词数：2\nUTF-8 字节数：11',
      },
      notes: [
        '浏览器支持时按字素统计字符。词数按空白分隔，不进行中文分词；阅读时间按每分钟 200 词估算。',
      ],
    },
  },
  sortLines: {
    en: {
      summary: 'Sort a list of lines with optional numeric comparison and cleanup.',
      steps: [
        'Enter one item per line.',
        'Choose ascending or descending order and the trimming, deduplication or numeric options you need.',
      ],
      example: {
        input: 'Ascending, numeric comparison\nitem 10\nitem 2\nitem 1',
        output: 'item 1\nitem 2\nitem 10',
      },
      notes: [
        'Numeric comparison sorts digit sequences naturally. Text comparison follows locale ordering; cleanup options may remove empty or repeated lines.',
      ],
    },
    'zh-Hans': {
      summary: '按行排序文本，并可启用数字比较与清理选项。',
      steps: ['每行输入一个列表项。', '选择升序或降序，再按需启用去空白、去重或数字比较。'],
      example: {
        input: '升序，开启数字比较\nitem 10\nitem 2\nitem 1',
        output: 'item 1\nitem 2\nitem 10',
      },
      notes: [
        '数字比较会按数字片段的大小排序；文字比较遵循本地化排序规则，清理选项可能移除空行或重复行。',
      ],
    },
  },
  findReplace: {
    en: {
      summary:
        'Replace all matching occurrences in a text using literal text or a regular expression.',
      steps: [
        'Enter the source text, search pattern and replacement.',
        'Choose literal or regex mode and case sensitivity; inspect the updated output.',
      ],
      example: {
        input: 'Text: red blue red\nFind: red\nReplace: green',
        output: 'green blue green',
      },
      notes: [
        'Regex replacement supports capture references such as $1. In literal mode, special replacement characters are treated as ordinary text.',
      ],
    },
    'zh-Hans': {
      summary: '使用普通文本或正则表达式替换文本中的全部匹配项。',
      steps: [
        '填写原文、查找内容与替换内容。',
        '选择普通或正则模式及大小写选项，查看更新后的结果。',
      ],
      example: {
        input: '原文：red blue red\n查找：red\n替换：green',
        output: 'green blue green',
      },
      notes: ['正则替换支持 $1 等捕获组引用；普通模式会将替换内容中的特殊字符作为普通文本处理。'],
    },
  },
  slugify: {
    en: {
      summary: 'Create an ASCII slug suitable for a URL path or identifier.',
      steps: [
        'Enter the title or phrase and choose a hyphen or underscore separator.',
        'Set lowercase and accent-removal options, then copy the slug.',
      ],
      example: {
        input: 'Hello, World!',
        output: 'hello-world',
      },
      notes: [
        'Only ASCII letters and digits are retained. Chinese and other non-ASCII characters are removed rather than transliterated.',
      ],
    },
    'zh-Hans': {
      summary: '生成适合 URL 路径或标识符的 ASCII 短名。',
      steps: [
        '输入标题或短语，选择连字符或下划线分隔。',
        '设置小写和移除重音选项，再复制生成的短名。',
      ],
      example: {
        input: 'Hello, World!',
        output: 'hello-world',
      },
      notes: ['只保留 ASCII 字母与数字；中文等非 ASCII 字符会被移除，不会自动转为拼音或其他转写。'],
    },
  },
  textReverse: {
    en: {
      summary: 'Reverse text by characters, words or lines.',
      steps: [
        'Paste text and select the reversal unit.',
        'Read the result and copy the reversed text.',
      ],
      example: {
        input: 'Character mode: hello',
        output: 'olleh',
      },
      notes: [
        'Character mode keeps grapheme clusters together when supported. Word mode normalizes separating whitespace; line mode outputs LF line endings.',
      ],
    },
    'zh-Hans': {
      summary: '按字符、词或行反转文本顺序。',
      steps: ['粘贴文本并选择反转单位。', '查看结果，复制反转后的文本。'],
      example: {
        input: '字符模式：hello',
        output: 'olleh',
      },
      notes: [
        '浏览器支持时，字符模式会保持字素簇完整。词模式会统一分隔空白，行模式会使用 LF 换行。',
      ],
    },
  },
  stringEscape: {
    en: {
      summary: 'Escape or unescape the contents of a JSON string literal.',
      steps: [
        'Choose Escape or Unescape.',
        'Enter text or JSON escape sequences without the outer double quotes.',
      ],
      example: {
        input: 'Escape: a line break between A and B',
        output: 'A\\nB',
      },
      notes: [
        'Uses JSON string rules such as \\n, \\t and \\". This is not HTML, URL or SQL escaping; invalid JSON escape sequences cannot be decoded.',
      ],
    },
    'zh-Hans': {
      summary: '按 JSON 字符串规则转义或还原文本内容。',
      steps: ['选择转义或反转义。', '输入文本或 JSON 转义序列，不需要最外层双引号。'],
      example: {
        input: '转义：A 与 B 之间有一个换行',
        output: 'A\\nB',
      },
      notes: [
        '使用 \\n、\\t、\\" 等 JSON 字符串规则，不适用于 HTML、URL 或 SQL；无效 JSON 转义序列无法还原。',
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
      ],
    },
    'zh-Hans': {
      summary: '查看字符的 Unicode 码点及 UTF-8 字节序列。',
      steps: ['粘贴需要检查的字符。', '逐行查看字形、U+ 码点、十进制值与十六进制 UTF-8 字节。'],
      example: {
        input: 'A',
        output: 'U+0041\n十进制：65\nUTF-8：41',
      },
      notes: ['最多展示 500 个码点。部分 emoji 等可见符号由多个码点构成，因此可能占用多行。'],
    },
  },
  removeWhitespace: {
    en: {
      summary: 'Clean up spacing, blank lines and indentation with explicit options.',
      steps: [
        'Paste the text and enable the cleanup options you need.',
        'Set the tab width if replacing tabs, then inspect the output.',
      ],
      example: {
        input: 'Trim lines and collapse spaces\n  hello   world  ',
        output: 'hello world',
      },
      notes: [
        'Remove all whitespace takes priority over the other options. Whitespace may be meaningful in code or Markdown, so review the result before replacing the source.',
      ],
    },
    'zh-Hans': {
      summary: '按明确选项清理空格、空行与缩进。',
      steps: ['粘贴文本并启用需要的清理选项。', '替换制表符时设置空格宽度，再检查输出结果。'],
      example: {
        input: '去除行首尾空白，并合并空格\n  hello   world  ',
        output: 'hello world',
      },
      notes: [
        '移除全部空白会优先于其他选项生效。代码或 Markdown 中的空白可能有实际含义，替换原文前请核对结果。',
      ],
    },
  },
  removeAccents: {
    en: {
      summary: 'Remove combining accent marks after Unicode decomposition.',
      steps: ['Enter text containing accented characters.', 'Copy the simplified result.'],
      example: {
        input: 'Crème brûlée',
        output: 'Creme brulee',
      },
      notes: [
        'This is accent removal, not general transliteration. Letters that do not decompose into a base letter and a combining mark may remain unchanged.',
      ],
    },
    'zh-Hans': {
      summary: '对 Unicode 文本分解后移除组合重音标记。',
      steps: ['输入含重音符号的文本。', '复制移除重音后的结果。'],
      example: {
        input: 'Crème brûlée',
        output: 'Creme brulee',
      },
      notes: ['这是移除重音，不是通用转写；无法分解为基础字母与组合标记的字符可能保持不变。'],
    },
  },
  lineEndings: {
    en: {
      summary: 'Normalize mixed line endings to LF, CRLF or CR.',
      steps: [
        'Paste the text and choose the desired line-ending format.',
        'Read the detected line-ending format and copy the normalized output.',
      ],
      example: {
        input: 'Target: LF\nInput bytes: A\\r\\nB',
        output: 'Output bytes: A\\nB',
      },
      notes: [
        'Line endings are invisible in the text area; the example uses escape notation. A destination editor may normalize pasted line endings again.',
      ],
    },
    'zh-Hans': {
      summary: '将混合换行符统一为 LF、CRLF 或 CR。',
      steps: ['粘贴文本并选择目标换行格式。', '查看检测到的换行格式，再复制统一后的输出。'],
      example: {
        input: '目标：LF\n输入字节：A\\r\\nB',
        output: '输出字节：A\\nB',
      },
      notes: ['文本框中换行符不可见，示例使用转义记法表示；目标编辑器粘贴时可能再次规范化换行。'],
    },
  },
  caesarCipher: {
    en: {
      summary: 'Shift Latin letters through the alphabet to demonstrate a Caesar cipher.',
      steps: [
        'Enter the text and set the integer shift.',
        'Read the shifted result; undo a shift of s with a shift of 26−s (or 0 when s is 0).',
      ],
      example: {
        input: 'Shift: 13\nHello',
        output: 'Uryyb',
      },
      notes: [
        'Only A–Z and a–z are shifted; other characters remain unchanged. This simple cipher is for learning and puzzles, not protecting secrets.',
      ],
    },
    'zh-Hans': {
      summary: '对拉丁字母进行循环移位，演示凯撒密码。',
      steps: [
        '输入文本并设置整数位移量。',
        '查看移位结果；位移量 s 可用 26−s 还原，s 为 0 时仍使用 0。',
      ],
      example: {
        input: '位移：13\nHello',
        output: 'Uryyb',
      },
      notes: ['只移动 A–Z 与 a–z，其他字符保持不变；适合学习与解谜，不适合保护秘密。'],
    },
  },
  morseCode: {
    en: {
      summary:
        'Translate supported Latin letters, digits and punctuation into Morse code and back.',
      steps: [
        'Choose text-to-Morse or Morse-to-text.',
        'Use spaces between Morse characters and / between words when decoding.',
      ],
      example: {
        input: 'Text → Morse: SOS',
        output: '... --- ...',
      },
      notes: [
        'Text is converted to uppercase. Unsupported characters or unknown Morse groups are skipped, so not every input round-trips losslessly.',
      ],
    },
    'zh-Hans': {
      summary: '在支持的拉丁字母、数字、标点与摩尔斯电码之间转换。',
      steps: ['选择文本转电码或电码转文本。', '解码时用空格分隔字符，用 / 分隔单词。'],
      example: {
        input: '文本转电码：SOS',
        output: '... --- ...',
      },
      notes: ['文本会转为大写；不支持的字符与未知电码组会被跳过，因此并非所有输入都能无损往返。'],
    },
  },
  natoAlphabet: {
    en: {
      summary: 'Spell Latin letters and digits using NATO phonetic words.',
      steps: [
        'Enter the identifier or message you need to spell aloud.',
        'Read or copy the phonetic words; / marks spaces between words.',
      ],
      example: {
        input: 'AB9',
        output: 'Alfa Bravo Niner',
      },
      notes: [
        'Letter case is ignored. Unsupported characters are retained as themselves; this tool does not decode phonetic words back into text.',
      ],
    },
    'zh-Hans': {
      summary: '使用 NATO 拼读词逐个表达拉丁字母与数字。',
      steps: ['输入需要口头拼读的标识符或消息。', '查看或复制拼读词，/ 表示原文中的词间空白。'],
      example: {
        input: 'AB9',
        output: 'Alfa Bravo Niner',
      },
      notes: ['忽略字母大小写；不支持的字符原样保留，不提供拼读词反向还原功能。'],
    },
  },
  duplicateLines: {
    en: {
      summary: 'Remove repeated lines while keeping the first occurrence and original order.',
      steps: [
        'Enter one item per line.',
        'Choose exact, trimmed or case-insensitive matching and copy the unique lines.',
      ],
      example: {
        input: 'Exact matching\napple\nbanana\napple',
        output: 'apple\nbanana',
      },
      notes: [
        'Trimmed and case-insensitive modes change comparison rules only. The retained first line keeps its original text.',
      ],
    },
    'zh-Hans': {
      summary: '移除重复行，保留首次出现的内容与原始顺序。',
      steps: ['每行输入一个列表项。', '选择完全匹配、忽略首尾空白或忽略大小写，再复制去重结果。'],
      example: {
        input: '完全匹配\napple\nbanana\napple',
        output: 'apple\nbanana',
      },
      notes: ['忽略空白或大小写只影响比较规则；保留下来的第一行仍使用原始文本。'],
    },
  },
  wordFrequency: {
    en: {
      summary: 'Count repeated words and rank them by frequency.',
      steps: [
        'Paste the text and set the minimum word length.',
        'Read the word counts, ordered from most frequent to least frequent.',
      ],
      example: {
        input: 'hello hello world',
        output: 'hello: 2\nworld: 1',
      },
      notes: [
        'Matching ignores case and recognizes Unicode letters and numbers. It does not segment Chinese text into individual words.',
      ],
    },
    'zh-Hans': {
      summary: '统计词语出现次数，并按频率排序。',
      steps: ['粘贴文本并设置最小词长。', '查看从高到低排列的词频结果。'],
      example: {
        input: 'hello hello world',
        output: 'hello：2\nworld：1',
      },
      notes: ['忽略大小写，识别 Unicode 字母与数字；不进行中文分词。'],
    },
  },
  lineNumberer: {
    en: {
      summary: 'Add configurable line numbers to a text block.',
      steps: [
        'Paste the text, choose the first number and set a separator.',
        'Copy the numbered output.',
      ],
      example: {
        input: 'Start: 1; separator: . \napple\nbanana',
        output: '1. apple\n2. banana',
      },
      notes: [
        'Blank lines are numbered too. Numbers are padded for alignment when the last line number has more digits.',
      ],
    },
    'zh-Hans': {
      summary: '为文本逐行添加可配置的行号。',
      steps: ['粘贴文本，设置起始编号与分隔符。', '复制带行号的输出。'],
      example: {
        input: '起始：1；分隔符：. \napple\nbanana',
        output: '1. apple\n2. banana',
      },
      notes: ['空行也会编号；最后一行编号位数较多时，会补齐前面的数字以便对齐。'],
    },
  },
  textWrap: {
    en: {
      summary: 'Reflow text to a chosen line width.',
      steps: [
        'Paste the text and enter a positive integer width.',
        'Read the wrapped lines and adjust the width as needed.',
      ],
      example: {
        input: 'Width: 10\nhello world again',
        output: 'hello\nworld\nagain',
      },
      notes: [
        'Whitespace within a line is normalized and long words can be split. Width uses JavaScript string length, not rendered pixels or terminal display columns.',
      ],
    },
    'zh-Hans': {
      summary: '将文本重新折行为指定宽度。',
      steps: ['粘贴文本并输入正整数行宽。', '查看折行结果，按需调整宽度。'],
      example: {
        input: '行宽：10\nhello world again',
        output: 'hello\nworld\nagain',
      },
      notes: [
        '行内空白会被统一，过长单词也可能被切开；宽度按 JavaScript 字符串长度计算，不是像素或终端显示列宽。',
      ],
    },
  },
  extractEmails: {
    en: {
      summary: 'Find email-shaped addresses in a block of text.',
      steps: [
        'Paste the source text.',
        'Copy the distinct addresses, listed in their first-seen order.',
      ],
      example: {
        input: 'Contact a@example.com or a@example.com',
        output: 'a@example.com',
      },
      notes: [
        'Pattern matching identifies likely addresses; it does not verify mailboxes or cover every valid RFC email format.',
      ],
    },
    'zh-Hans': {
      summary: '从文本中提取形似电子邮箱的地址。',
      steps: ['粘贴原始文本。', '复制按首次出现顺序排列的去重地址。'],
      example: {
        input: '联系 a@example.com 或 a@example.com',
        output: 'a@example.com',
      },
      notes: ['模式匹配只识别可能的邮箱，不验证邮箱是否存在，也不覆盖 RFC 允许的所有地址形式。'],
    },
  },
  extractUrls: {
    en: {
      summary: 'Extract distinct HTTP and HTTPS links from text.',
      steps: ['Paste the text containing links.', 'Copy the links in their first-seen order.'],
      example: {
        input: 'Visit https://example.com and https://example.com',
        output: 'https://example.com',
      },
      notes: [
        'Only HTTP(S) links are extracted and none are fetched. Check trailing punctuation when extracting links from prose.',
      ],
    },
    'zh-Hans': {
      summary: '从文本中提取并去重 HTTP 与 HTTPS 链接。',
      steps: ['粘贴包含链接的文本。', '复制按首次出现顺序排列的链接。'],
      example: {
        input: '访问 https://example.com 和 https://example.com',
        output: 'https://example.com',
      },
      notes: ['只提取 HTTP(S) 链接，不会访问它们；从自然语言中提取时请检查末尾标点。'],
    },
  },
  unicodeNormalizer: {
    en: {
      summary: 'Normalize equivalent Unicode sequences using a selected normalization form.',
      steps: ['Select NFC, NFD, NFKC or NFKD.', 'Paste text and copy the normalized result.'],
      example: {
        input: 'NFC\ne + U+0301 (combining acute accent)',
        output: 'é (U+00E9)',
      },
      notes: [
        'NFKC and NFKD also apply compatibility mappings, which can change full-width characters and presentation forms. Choose the form for your use case.',
      ],
    },
    'zh-Hans': {
      summary: '使用指定规范化形式整理等价的 Unicode 序列。',
      steps: ['选择 NFC、NFD、NFKC 或 NFKD。', '粘贴文本并复制规范化结果。'],
      example: {
        input: 'NFC\ne + U+0301（组合尖音符）',
        output: 'é（U+00E9）',
      },
      notes: ['NFKC 与 NFKD 还会执行兼容性映射，可能改变全角字符和表现形式；请按用途选择。'],
    },
  },
  whitespaceVisualizer: {
    en: {
      summary: 'Make spaces, tabs and line breaks visible for inspection.',
      steps: [
        'Paste text containing invisible whitespace.',
        'Read the markers: · for a space, → for a tab and ↵ for a line break.',
      ],
      example: {
        input: 'A B',
        output: 'A·B',
      },
      notes: [
        'Adds visible markers rather than cleaning whitespace. Tabs and line breaks remain alongside their markers, so copying the result is for inspection.',
      ],
    },
    'zh-Hans': {
      summary: '将空格、制表符与换行标记为可见符号。',
      steps: ['粘贴含不可见空白的文本。', '查看标记：· 表示空格，→ 表示制表符，↵ 表示换行。'],
      example: {
        input: 'A B',
        output: 'A·B',
      },
      notes: ['这是添加可见标记，不是清理空白；制表符与换行仍保留在标记旁，复制结果适合用于检查。'],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
