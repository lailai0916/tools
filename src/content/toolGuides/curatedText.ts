import type { LocalizedToolGuide } from './types';

export const curatedTextGuides = {
  textWorkbench: {
    en: {
      summary:
        'Use a single input to clean lists, change naming styles, normalize Unicode or inspect text. Apply the result as input to continue with another operation.',
      steps: [
        'Paste text and choose an operation. Only the options for that operation are shown.',
        'Review the output, then copy it or choose Use result as input and select another operation.',
      ],
      example: {
        input: 'Operation: remove duplicate lines; trim enabled\n apple \nbanana\napple',
        output: 'apple\nbanana',
      },
      notes: [
        'Changing the operation keeps your input. Text stays in this browser; the URL stores only the operation.',
        'Sorting and cleanup accept LF, CRLF and CR. Most line operations output LF; the line ending operation can output CRLF or CR.',
        'Upper/lower/title case keep punctuation. Identifier styles remove punctuation; URL slugs accept ASCII letters and digits and do not transliterate other scripts.',
        'Wrapping counts Unicode grapheme clusters, preserves complete emoji and combining characters, and normalizes whitespace. It does not measure display columns. Word and sentence counts use Intl.Segmenter and require a current browser.',
        'List conversion accepts JSON arrays of strings or quoted CSV fields. CSV cells from all rows become list items; this is a list workflow without table headers or column types.',
        'Email and URL extraction finds common patterns, not all valid addresses. Whitespace visualization adds visible markers to the output. Compatibility normalization and diacritic removal can change meaning.',
      ],
    },
    'zh-Hans': {
      summary:
        '使用同一输入清理列表、转换命名格式、规范化 Unicode 或检查文本；将结果作为下一次输入继续处理。',
      steps: [
        '粘贴文本并选择处理操作，页面只显示该操作所需的选项。',
        '检查输出，直接复制，或点击“用结果继续处理”后选择下一项操作。',
      ],
      example: {
        input: '操作：删除重复行；开启两端空白清理\n apple \nbanana\napple',
        output: 'apple\nbanana',
      },
      notes: [
        '切换操作保留输入；文本仅在当前浏览器处理，URL 只记录所选操作。',
        '排序与清理接受 LF、CRLF 和 CR；多数按行操作输出 LF，换行符操作可输出 CRLF 或 CR。',
        '大小写和词首大写保留标点；标识符命名格式移除标点。URL 别名只接受 ASCII 字母与数字，不会音译其他文字。',
        '折行按 Unicode 字素簇计数，保留完整 emoji 与组合字符，并统一空白；不计算显示列宽。词语和句子采用 Intl.Segmenter，需要新版浏览器支持。',
        '列表转换接受 JSON 字符串数组或带引号的 CSV 字段；各行单元格均视为列表项，不处理表头或列类型。',
        '邮箱与 URL 提取识别常见模式，不能覆盖所有合法地址；空白可视化会向输出添加可见标记。兼容规范化与变音符号移除可能改变含义。',
      ],
    },
  },
  textCodec: {
    en: {
      summary:
        'Encode or decode the same text as Base64, Base32, Base58, hexadecimal, binary, URL components, HTML entities, JSON string escapes or SVG data URIs.',
      steps: [
        'Choose a format and Encode or Decode, then paste the source text.',
        'Inspect the result or validation error. Copy the result, or swap input and output to perform the reverse conversion.',
      ],
      example: { input: 'Format: Base64; Encode\nhello', output: 'aGVsbG8=' },
      notes: [
        'Changing formats preserves input. All processing stays in your browser; only format and direction preferences are included in the URL.',
        'Byte formats encode UTF-8. Decoders reject malformed UTF-8, incomplete bytes, invalid padding and nonzero unused bits. Binary requires exactly eight bits per byte. Base58 uses the Bitcoin alphabet without a checksum.',
        'URL conversion uses percent encoding for a component, with no plus-to-space form decoding. JSON conversion works on string content without outer quotation marks. HTML decoding replaces entities while preserving other input text.',
        'SVG conversion validates the XML root, keeps original whitespace, and produces or decodes image/svg+xml data URIs. Decoding accepts percent-encoded or Base64 payloads. The tool does not render the SVG or remove scripts from its source.',
      ],
    },
    'zh-Hans': {
      summary:
        '将同一文本编码或解码为 Base64、Base32、Base58、十六进制、二进制、URL 组件、HTML 实体、JSON 字符串转义或 SVG Data URI。',
      steps: [
        '选择格式与编码或解码方向，再粘贴原始内容。',
        '检查结果或验证错误，复制结果，或交换输入与输出执行反向转换。',
      ],
      example: { input: '格式：Base64；编码\nhello', output: 'aGVsbG8=' },
      notes: [
        '切换格式保留输入，全部处理在浏览器进行；URL 只记录格式和方向偏好。',
        '字节格式采用 UTF-8，解码拒绝无效 UTF-8、不完整字节、无效填充和非零未使用位。二进制要求每字节恰好八位；Base58 使用 Bitcoin 字母表，不含校验和。',
        'URL 转换对组件进行百分比编码，不采用表单中加号转空格的规则；JSON 转换只处理不带两侧引号的字符串内容。HTML 解码替换实体，同时保留其他输入文本。',
        'SVG 转换验证 XML 根元素并保留原始空白，生成或解码 image/svg+xml Data URI；解码接受百分比编码或 Base64 载荷。工具不渲染 SVG，也不会移除源码中的脚本。',
      ],
    },
  },
} satisfies Record<string, LocalizedToolGuide>;
