import type { LocalizedToolGuide, ToolGuideKey } from './types';
export const mathGuides = {
  statistics: {
    en: {
      summary: 'Summarize a numeric dataset with basic descriptive statistics.',
      steps: [
        'Enter decimal numbers or scientific notation separated by spaces, commas or line breaks.',
        'Choose population or sample variance and read the summary.',
      ],
      example: {
        input: 'Population mode\n1, 2, 3',
        output: 'Count: 3\nMean: 2\nMedian: 2\nVariance: ≈ 0.6666666667',
      },
      notes: [
        'Population variance divides by n; sample variance divides by n−1 and needs at least two values. Frequency ties can produce multiple modes.',
        'Uses JavaScript floating-point numbers and compensated summation. Safe integers retain all digits, and small values use scientific notation. Hexadecimal, binary and octal literals are not accepted.',
        'Inputs or results outside the representable numeric range are rejected, including nonzero values that underflow to zero. A nonconstant dataset whose variance underflows is reported as a range error rather than zero standard deviation.',
      ],
    },
    'zh-Hans': {
      summary: '使用基础描述性统计汇总一组数值。',
      steps: [
        '输入十进制数或科学计数法，以空格、逗号或换行分隔。',
        '选择总体或样本方差，查看统计结果。',
      ],
      example: {
        input: '总体模式\n1, 2, 3',
        output: '数量：3\n平均数：2\n中位数：2\n方差：≈ 0.6666666667',
      },
      notes: [
        '总体方差除以 n，样本方差除以 n−1 且至少需要两个值；频率并列时可能出现多个众数。',
        '使用 JavaScript 浮点数与补偿求和；安全整数完整保留，极小数使用科学计数法。不接受十六进制、二进制或八进制字面量。',
        '输入或结果超出可表示范围时会报错，包括非零值下溢为零的情况。非恒定数据的方差下溢时会报告范围错误，避免显示为标准差等于零。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
