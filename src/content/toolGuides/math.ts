import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const mathGuides = {
  mathEvaluator: {
    en: {
      summary: 'Evaluate arithmetic expressions with a small set of mathematical functions.',
      steps: [
        'Enter an expression using +, -, *, /, %, ^, parentheses or functions such as sqrt and sin.',
        'Select radians or degrees for trigonometry and read the result.',
      ],
      example: {
        input: 'sqrt(16) + 2^3',
        output: '12',
      },
      notes: [
        'Write multiplication explicitly, for example 2*pi. pi and e are constants; log is base 10, ln is natural logarithm. Results use floating-point arithmetic.',
      ],
    },
    'zh-Hans': {
      summary: '计算算术表达式及一组常用数学函数。',
      steps: [
        '输入包含 +、-、*、/、%、^、括号或 sqrt、sin 等函数的表达式。',
        '三角函数可选择弧度或角度，随后查看结果。',
      ],
      example: {
        input: 'sqrt(16) + 2^3',
        output: '12',
      },
      notes: [
        '乘法须明确写出，例如 2*pi；pi 与 e 是常量，log 为常用对数，ln 为自然对数。结果采用浮点运算。',
      ],
    },
  },
  percentageCalculator: {
    en: {
      summary:
        'Calculate a percentage of a value, a ratio as a percentage, or a percentage change.',
      steps: [
        'Choose the calculation block matching your question.',
        'Fill in both numbers and read the result in that block.',
      ],
      example: {
        input: '20% of 150\n30 is what percent of 150?\nChange from 100 to 120',
        output: '30\n20%\n20%',
      },
      notes: [
        'Percentage change uses the original value as the denominator. A zero denominator or original value cannot produce a valid percentage.',
      ],
    },
    'zh-Hans': {
      summary: '计算某数的百分比、比例百分数或百分比变化。',
      steps: ['找到与问题对应的计算版块。', '填入两个数值，查看该版块的结果。'],
      example: {
        input: '150 的 20%\n30 是 150 的百分之几？\n从 100 变为 120',
        output: '30\n20%\n20%',
      },
      notes: ['百分比变化以原始值为分母；分母或原始值为零时无法计算有效百分数。'],
    },
  },
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
      ],
    },
    'zh-Hans': {
      summary: '使用基础描述性统计汇总一组数值。',
      steps: ['输入有限数值，以空格、逗号或换行分隔。', '选择总体或样本方差，查看统计结果。'],
      example: {
        input: '总体模式\n1, 2, 3',
        output: '数量：3\n平均数：2\n中位数：2\n方差：≈ 0.6666666667',
      },
      notes: ['总体方差除以 n，样本方差除以 n−1 且至少需要两个值；频率并列时可能出现多个众数。'],
    },
  },
  gcdLcm: {
    en: {
      summary: 'Find the greatest common divisor and least common multiple of integers.',
      steps: [
        'Enter integers separated by spaces, commas or line breaks.',
        'Read the exact GCD and LCM results.',
      ],
      example: {
        input: '12, 18',
        output: 'GCD: 6\nLCM: 36',
      },
      notes: [
        'Calculations use arbitrary-precision integers and absolute values. Fractions are not accepted; any zero makes the LCM zero.',
      ],
    },
    'zh-Hans': {
      summary: '计算一组整数的最大公约数与最小公倍数。',
      steps: ['输入整数，以空格、逗号或换行分隔。', '查看精确的 GCD 与 LCM 结果。'],
      example: {
        input: '12, 18',
        output: '最大公约数：6\n最小公倍数：36',
      },
      notes: ['采用任意精度整数并使用绝对值，不接受小数；存在零时最小公倍数为零。'],
    },
  },
  primeFactor: {
    en: {
      summary: 'Factor a positive integer into primes and count its positive divisors.',
      steps: [
        'Enter an integer from 1 to 10^15.',
        'Read the prime factorization, primality result and divisor count.',
      ],
      example: {
        input: '60',
        output: '2^2 × 3 × 5\nPositive divisors: 12',
      },
      notes: [
        'Trial division can take longer for large primes. The number 1 is not prime and has one positive divisor.',
      ],
    },
    'zh-Hans': {
      summary: '将正整数分解为质因数，并计算正约数数量。',
      steps: ['输入 1–10^15 范围内的整数。', '查看质因数分解、质数判断与约数数量。'],
      example: {
        input: '60',
        output: '2^2 × 3 × 5\n正约数数量：12',
      },
      notes: ['试除法处理较大质数时可能较慢；1 不是质数，只有一个正约数。'],
    },
  },
  primeSieve: {
    en: {
      summary: 'List every prime number up to an inclusive limit.',
      steps: [
        'Enter an integer limit from 2 to 1,000,000.',
        'Read the prime count and copy the generated list.',
      ],
      example: {
        input: '10',
        output: '2, 3, 5, 7\nCount: 4',
      },
      notes: [
        'The upper limit is included when it is prime. The size limit keeps the browser’s sieve workload bounded.',
      ],
    },
    'zh-Hans': {
      summary: '列出不超过指定上限的所有质数。',
      steps: ['输入 2–1,000,000 范围内的整数上限。', '查看质数数量并复制列表。'],
      example: {
        input: '10',
        output: '2, 3, 5, 7\n数量：4',
      },
      notes: ['上限本身为质数时也会包含在结果中；范围限制用于控制浏览器筛法计算的开销。'],
    },
  },
  combinatorics: {
    en: {
      summary: 'Compute factorials, permutations and combinations as exact integers.',
      steps: ['Enter integers n and r with 0 ≤ r ≤ n ≤ 1000.', 'Read n!, P(n,r) and C(n,r).'],
      example: {
        input: 'n = 5; r = 2',
        output: '5! = 120\nP(5,2) = 20\nC(5,2) = 10',
      },
      notes: [
        'Permutations distinguish order; combinations do not. Both formulas select without replacement, and 0! = 1.',
      ],
    },
    'zh-Hans': {
      summary: '精确计算阶乘、排列数与组合数。',
      steps: ['填写整数 n 与 r，满足 0 ≤ r ≤ n ≤ 1000。', '查看 n!、P(n,r) 与 C(n,r)。'],
      example: {
        input: 'n = 5；r = 2',
        output: '5! = 120\nP(5,2) = 20\nC(5,2) = 10',
      },
      notes: ['排列区分顺序，组合不区分顺序；两种公式均为不放回选择，且 0! = 1。'],
    },
  },
  modPower: {
    en: {
      summary: 'Calculate a large integer power modulo a positive integer.',
      steps: [
        'Enter an integer base, a nonnegative exponent and a positive modulus.',
        'Read the exact modular exponentiation result.',
      ],
      example: {
        input: 'Base: 2; exponent: 10; modulus: 1000',
        output: '24',
      },
      notes: [
        'Uses fast exponentiation with arbitrary-precision integers. Negative exponents and a zero or negative modulus are not supported.',
      ],
    },
    'zh-Hans': {
      summary: '计算大整数幂对正整数取模的结果。',
      steps: ['填写整数底数、非负整数指数与正整数模数。', '查看精确的模幂结果。'],
      example: {
        input: '底数：2；指数：10；模数：1000',
        output: '24',
      },
      notes: ['采用任意精度整数的快速幂算法；不支持负指数及零或负模数。'],
    },
  },
  fractionCalculator: {
    en: {
      summary: 'Add, subtract, multiply or divide exact integer fractions.',
      steps: [
        'Enter both fractions as numerator/denominator, or enter integers.',
        'Select the operation and read the reduced result.',
      ],
      example: {
        input: '1/2 + 1/3',
        output: '5/6',
      },
      notes: [
        'Denominators cannot be zero, and division by a zero fraction is invalid. Decimal inputs are not accepted; convert them to fractions first.',
      ],
    },
    'zh-Hans': {
      summary: '对整数分数进行精确的加、减、乘、除运算。',
      steps: ['以分子/分母格式填写两个分数，也可填写整数。', '选择运算，查看约分后的结果。'],
      example: {
        input: '1/2 + 1/3',
        output: '5/6',
      },
      notes: ['分母不能为零，也不能除以零分数；不接受小数输入，请先改写为分数。'],
    },
  },
  quadraticSolver: {
    en: {
      summary: 'Solve ax² + bx + c = 0 and inspect its discriminant.',
      steps: [
        'Enter the three coefficients a, b and c.',
        'Read the discriminant and real or complex roots.',
      ],
      example: {
        input: 'a = 1; b = -3; c = 2',
        output: 'Discriminant: 1\nRoots: 2 and 1',
      },
      notes: [
        'When a = 0 and b ≠ 0, the tool solves the remaining linear equation. If a and b are both zero, no unique equation solution is reported.',
      ],
    },
    'zh-Hans': {
      summary: '求解 ax² + bx + c = 0，并查看判别式。',
      steps: ['输入 a、b、c 三个系数。', '查看判别式以及实数或复数根。'],
      example: {
        input: 'a = 1；b = -3；c = 2',
        output: '判别式：1\n根：2 与 1',
      },
      notes: ['a = 0 且 b ≠ 0 时会求解一次方程；a 与 b 同时为零时，不提供唯一方程解。'],
    },
  },
  dateDifference: {
    en: {
      summary: 'Compare two calendar dates as both a calendar duration and a total day count.',
      steps: [
        'Choose the start and end dates.',
        'Read years, months, remaining days and total days.',
      ],
      example: {
        input: '2026-01-01 → 2026-01-08',
        output: '0 years, 0 months, 7 days\nTotal days: 7',
      },
      notes: [
        'Uses UTC calendar dates, not elapsed local hours. The same date has a zero-day difference; reversing the dates makes the duration negative.',
      ],
    },
    'zh-Hans': {
      summary: '以日历时长与总天数两种方式比较日期。',
      steps: ['选择起始与结束日期。', '查看年、月、剩余天数及总天数。'],
      example: {
        input: '2026-01-01 → 2026-01-08',
        output: '0 年 0 月 7 天\n总天数：7',
      },
      notes: ['使用 UTC 日历日期，不是本地经过的小时数；相同日期相差零天，颠倒日期会得到负时长。'],
    },
  },
  ageCalculator: {
    en: {
      summary: 'Calculate calendar age on a chosen reference date.',
      steps: [
        'Enter the birth date and the date on which to calculate age.',
        'Read the age in years, months and days.',
      ],
      example: {
        input: 'Birth: 2000-01-01\nAs of: 2026-01-01',
        output: '26 years, 0 months, 0 days',
      },
      notes: [
        'The birth date must not be later than the reference date. Month-end and leap-day calculations use clamped UTC calendar dates.',
      ],
    },
    'zh-Hans': {
      summary: '计算指定参考日期时的日历年龄。',
      steps: ['填写出生日期与计算年龄所用的参考日期。', '查看以年、月、天表示的年龄。'],
      example: {
        input: '出生日期：2000-01-01\n参考日期：2026-01-01',
        output: '26 年 0 月 0 天',
      },
      notes: ['出生日期不能晚于参考日期；月末与闰日按 UTC 日历日期并采用月末截取规则处理。'],
    },
  },
  businessDays: {
    en: {
      summary: 'Count weekdays in a date range, excluding any holidays you supply.',
      steps: [
        'Choose the two dates and optionally list holiday dates.',
        'Read business days, weekend days and excluded weekday holidays.',
      ],
      example: {
        input: '2026-01-05 → 2026-01-09\nHoliday: 2026-01-07',
        output: 'Business days: 4',
      },
      notes: [
        'Both endpoints are included and Saturday/Sunday are weekends. Regional holidays and compensatory working weekends are not added automatically.',
      ],
    },
    'zh-Hans': {
      summary: '统计日期范围内的工作日，并排除自行填写的节假日。',
      steps: [
        '选择两个日期，按需填写节假日日期列表。',
        '查看工作日、周末及排除的工作日节假日数量。',
      ],
      example: {
        input: '2026-01-05 → 2026-01-09\n节假日：2026-01-07',
        output: '工作日：4',
      },
      notes: ['包含起止两天，以周六、周日为周末；不会自动导入地区节假日或调休上班日。'],
    },
  },
  bmiCalculator: {
    en: {
      summary: 'Calculate BMI from body weight and height.',
      steps: [
        'Enter weight in kilograms and height in centimeters.',
        'Read the BMI and the category based on the displayed thresholds.',
      ],
      example: {
        input: 'Weight: 70 kg\nHeight: 175 cm',
        output: 'BMI: 22.86',
      },
      notes: [
        'BMI is a broad adult screening measure, not a diagnosis. It does not account for age, body composition, pregnancy or population-specific thresholds.',
      ],
    },
    'zh-Hans': {
      summary: '根据体重与身高计算 BMI。',
      steps: ['以千克填写体重，以厘米填写身高。', '查看 BMI 及按页面阈值划分的类别。'],
      example: {
        input: '体重：70 kg\n身高：175 cm',
        output: 'BMI：22.86',
      },
      notes: ['BMI 是成人的粗略筛查指标，不是诊断；未考虑年龄、体成分、孕期或不同人群的专用阈值。'],
    },
  },
  loanCalculator: {
    en: {
      summary: 'Estimate equal monthly loan payments and total interest.',
      steps: [
        'Enter the principal, annual interest rate as a percentage and loan term in years.',
        'Read the monthly payment, total payment and total interest.',
      ],
      example: {
        input: 'Principal: 12000\nAnnual rate: 0%\nTerm: 1 year',
        output: 'Monthly payment: 1000.00\nTotal payment: 12000.00\nInterest: 0.00',
      },
      notes: [
        'Uses a fixed rate, monthly compounding and equal monthly payments. Fees, prepayments and variable rates are excluded; fractional years are rounded to whole months.',
      ],
    },
    'zh-Hans': {
      summary: '估算等额月供、总还款额与利息。',
      steps: ['填写本金、以百分数表示的年利率及以年表示的期限。', '查看月供、总还款额与总利息。'],
      example: {
        input: '本金：12000\n年利率：0%\n期限：1 年',
        output: '月供：1000.00\n总还款额：12000.00\n利息：0.00',
      },
      notes: [
        '按固定利率、按月计息、等额月供计算，不包含手续费、提前还款或浮动利率；非整数年会换算并舍入为整月。',
      ],
    },
  },
  compoundInterest: {
    en: {
      summary: 'Project compound growth with an optional contribution each period.',
      steps: [
        'Enter principal, annual rate, years and compounding frequency.',
        'Set the contribution per period and read the final balance, contributions and interest.',
      ],
      example: {
        input:
          'Principal: 1000; annual rate: 10%\nTerm: 1 year; frequency: annually\nContribution per period: 100',
        output: 'Final balance: 1200.00',
      },
      notes: [
        'Contributions are added at the end of each period. A monthly contribution is paid every month, not once per year; returns are assumed constant and exclude fees or taxes.',
      ],
    },
    'zh-Hans': {
      summary: '估算复利增长，并可加入每期追加投入。',
      steps: ['填写本金、年利率、年数与复利频率。', '设置每期投入，查看最终余额、累计投入与利息。'],
      example: {
        input: '本金：1000；年利率：10%\n期限：1 年；频率：每年\n每期投入：100',
        output: '最终余额：1200.00',
      },
      notes: [
        '每期投入在该期末加入；按月复利时是每月投入，不是每年一次。假设收益率恒定，不含费用或税款。',
      ],
    },
  },
  aspectRatio: {
    en: {
      summary: 'Reduce image dimensions to an aspect ratio and calculate a proportional height.',
      steps: [
        'Enter the original width and height.',
        'Enter a target width and read the aspect ratio and target height.',
      ],
      example: {
        input: 'Original: 1920 × 1080\nTarget width: 1280',
        output: 'Aspect ratio: 16:9\nTarget height: 720.00',
      },
      notes: [
        'Original dimensions are rounded to integers for the ratio. A calculated fractional height may need rounding when used as a pixel dimension.',
      ],
    },
    'zh-Hans': {
      summary: '将图片尺寸化为最简宽高比，并计算等比缩放后的高度。',
      steps: ['填写原始宽度与高度。', '填写目标宽度，查看宽高比与目标高度。'],
      example: {
        input: '原始尺寸：1920 × 1080\n目标宽度：1280',
        output: '宽高比：16:9\n目标高度：720.00',
      },
      notes: ['计算比例前会将原始尺寸舍入为整数；算出的非整数高度用于像素尺寸时可能需要再次舍入。'],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
