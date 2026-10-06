import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const funGuides = {
  cpsTest: {
    en: {
      summary:
        'Measure click rate over a fixed duration and inspect how it changes during the run.',
      steps: [
        'Choose a duration, then click the test area to begin.',
        'Keep clicking until the timer ends and review CPS, peak rate and the speed curve.',
      ],
      example: {
        input: 'Duration: 5 seconds\nTotal clicks: 25',
        output: 'Average: 5 CPS',
      },
      notes: [
        'CPS is total clicks divided by duration. Compare runs with the same duration and input device; short bursts and long endurance tests measure different behavior.',
      ],
    },
    'zh-Hans': {
      summary: '在固定时长内测量点击速度，并观察过程中速度的变化。',
      steps: ['选择时长，点击测试区域开始。', '持续点击直到计时结束，查看 CPS、峰值与速度曲线。'],
      example: {
        input: '时长：5 秒\n总点击数：25',
        output: '平均：5 CPS',
      },
      notes: [
        'CPS 等于总点击数除以时长；比较成绩时请保持时长与输入设备一致，短时爆发与长时耐力反映不同表现。',
      ],
    },
  },

  reactionTime: {
    en: {
      summary: 'Measure response time to a visual signal across five valid rounds.',
      steps: [
        'Start a round and wait for the panel to turn green.',
        'Respond immediately, then begin the next round until the report appears.',
      ],
      example: {
        input: 'Five valid rounds:\n200, 220, 210, 230, 240 ms',
        output: 'Average: 220 ms\nMedian: 220 ms\nBest round: 200 ms',
      },
      notes: [
        'Clicking before the signal is a false start and does not complete a valid round. Display refresh, device latency and browser scheduling affect measured time.',
      ],
    },
    'zh-Hans': {
      summary: '通过五个有效回合测量对视觉信号的反应时间。',
      steps: ['开始一回合，等待面板变绿。', '变绿后立即响应，再开始下一回合，直到出现报告。'],
      example: {
        input: '五个有效回合：\n200、220、210、230、240 ms',
        output: '平均：220 ms\n中位数：220 ms\n最快回合：200 ms',
      },
      notes: [
        '信号出现前点击属于抢跑，不会完成有效回合；屏幕刷新、设备延迟与浏览器调度都会影响测量。',
      ],
    },
  },

  typingSpeed: {
    en: {
      summary: 'Measure typing speed and positional character accuracy against a short passage.',
      steps: [
        'Read the passage and begin typing; the first character starts timing.',
        'Type until the passage length is reached, correcting with Backspace if needed, then read the report.',
      ],
      example: {
        input: 'English: 150 correct characters in 30 seconds',
        output: '60 WPM\n(150 ÷ 5 ÷ 0.5 minutes)',
      },
      notes: [
        'English WPM uses five correct characters per word; Chinese uses correct characters per minute. Pasting is blocked, and reaching the passage length ends the run even if some characters are wrong.',
      ],
    },
    'zh-Hans': {
      summary: '对照短文测量输入速度与逐位置字符准确率。',
      steps: [
        '阅读短文并开始输入，第一个字符触发计时。',
        '输入至短文长度，可用退格修正，结束后查看报告。',
      ],
      example: {
        input: '中文：30 秒输入 30 个正确字符',
        output: '60 CPM\n（30 ÷ 0.5 分钟）',
      },
      notes: [
        '中文以每分钟正确字符数计速，英文以五个正确字符折算一词；禁止粘贴，输入达到短文长度即结束，即使仍有错误字符。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
