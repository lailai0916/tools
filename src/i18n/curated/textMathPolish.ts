export const textMathPolishEn = {
  'tools.statistics.invalid':
    'Use decimal numbers or scientific notation separated by spaces, commas or line breaks.',
  'tools.statistics.rangeError':
    'An input or calculated result exceeds the representable numeric range, or a nonzero value would underflow to zero.',
  'tools.unicodeInspector.invalidUtf8': 'Unavailable',
  'tools.unicodeInspector.unpairedSurrogate':
    'An unpaired UTF-16 surrogate is not a Unicode scalar value and has no valid UTF-8 encoding. Its code unit is shown without replacement-character bytes.',
  'tools.textDiff.processing': 'Comparing…',
  'tools.textDiff.limitError':
    'Comparison supports up to 500,000 UTF-16 code units and 20,000 lines across both inputs, and up to 20,000 result rows. Reduce the text and try again.',
  'tools.textDiff.timeoutError':
    'Comparison exceeded one second. Reduce the text or compare smaller sections.',
  'tools.textDiff.failedError': 'Comparison could not be completed. Edit the text and try again.',
} as const;

export const textMathPolishZhHans = {
  'tools.statistics.invalid': '请输入十进制数或科学计数法，以空格、逗号或换行分隔。',
  'tools.statistics.rangeError': '输入或计算结果超出可表示的数值范围，或非零值会下溢为零。',
  'tools.unicodeInspector.invalidUtf8': '不可编码',
  'tools.unicodeInspector.unpairedSurrogate':
    '未配对的 UTF-16 代理项不是 Unicode 标量值，没有合法的 UTF-8 编码。表格保留其码元，不显示替换字符的字节。',
  'tools.textDiff.processing': '正在比较…',
  'tools.textDiff.limitError':
    '两份输入合计最多支持 500,000 个 UTF-16 码元和 20,000 行，结果最多 20,000 行。请缩短文本后重试。',
  'tools.textDiff.timeoutError': '比较超过一秒，已停止。请缩短文本，或分段比较。',
  'tools.textDiff.failedError': '未能完成比较。请修改文本后重试。',
} as const satisfies Record<keyof typeof textMathPolishEn, string>;
