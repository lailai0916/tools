import type { LocalizedToolGuide, ToolGuideKey } from './types';
export const mathGuides = {
  statistics: {
    en: {
      summary: 'Summarize a numeric dataset with basic descriptive statistics.',
      steps: [
        'Enter finite numbers separated by spaces, commas or line breaks.',
        'Choose population or sample variance and read the summary.',
      ],
      example: {
        input: 'Population mode\n1, 2, 3',
        output: 'Count: 3\nMean: 2\nMedian: 2\nVariance: ≈ 0.6666666667',
      },
      notes: [
        'Population variance divides by n; sample variance divides by n−1 and needs at least two values. Frequency ties can produce multiple modes.',
        'Floating-point precision applies. Small values retain scientific notation, and inputs whose aggregate calculations exceed the finite numeric range are rejected.',
      ],
    },
    'zh-Hans': {
      summary: '使用基础描述性统计汇总一组数值。',
      steps: ['输入有限数值，以空格、逗号或换行分隔。', '选择总体或样本方差，查看统计结果。'],
      example: {
        input: '总体模式\n1, 2, 3',
        output: '数量：3\n平均数：2\n中位数：2\n方差：≈ 0.6666666667',
      },
      notes: [
        '总体方差除以 n，样本方差除以 n−1 且至少需要两个值；频率并列时可能出现多个众数。',
        '计算遵循浮点精度；极小数保留科学计数法，汇总结果超过有限数值范围的输入会被拒绝。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
