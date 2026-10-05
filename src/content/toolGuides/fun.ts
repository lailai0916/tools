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
  spacebarTest: {
    en: {
      summary: 'Measure repeated spacebar presses over a chosen duration.',
      steps: [
        'Select the duration and focus the test area.',
        'Press and release Space repeatedly, then inspect average and peak press rates.',
      ],
      example: {
        input: 'Duration: 5 seconds\nValid presses: 20',
        output: 'Average: 4 presses per second',
      },
      notes: [
        'Holding Space does not count browser auto-repeat events. Keep focus in the test area and use the same keyboard when comparing runs.',
      ],
    },
    'zh-Hans': {
      summary: '测量指定时长内反复按空格键的速度。',
      steps: ['选择时长并使测试区域获得焦点。', '反复按下、松开空格键，结束后查看平均与峰值速度。'],
      example: {
        input: '时长：5 秒\n有效按键：20 次',
        output: '平均：每秒 4 次',
      },
      notes: ['长按空格产生的浏览器自动重复不会计入；请保持测试区域焦点，比较成绩时使用同一键盘。'],
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
  aimTrainer: {
    en: {
      summary: 'Practice acquiring targets while balancing speed and accuracy.',
      steps: [
        'Choose the target count and start training.',
        'Click each target as it appears, then inspect acquisition time and misses.',
      ],
      example: {
        input: 'Hits: 20\nMisses: 5',
        output: 'Accuracy: 80%',
      },
      notes: [
        'Accuracy uses hits divided by all attempts. Keep pointer sensitivity and viewport size consistent when comparing target-acquisition times.',
      ],
    },
    'zh-Hans': {
      summary: '练习寻找并点击目标，兼顾速度与准确率。',
      steps: ['选择目标数量并开始训练。', '点击依次出现的目标，结束后查看目标获取时间与失误。'],
      example: {
        input: '命中：20\n未命中：5',
        output: '准确率：80%',
      },
      notes: ['准确率以命中数除以总尝试数计算；比较目标获取时间时请保持指针灵敏度与视口大小一致。'],
    },
  },
  mouseAccuracy: {
    en: {
      summary: 'Measure how close pointer clicks land to each target center.',
      steps: [
        'Choose the round count and start the test.',
        'Click the center of each crosshair and review average and 90th-percentile error.',
      ],
      example: {
        input: 'Target center: (100, 100)\nClick: (103, 104)',
        output: 'Center error: 5 CSS pixels',
      },
      notes: [
        'Error is the straight-line pointer distance from the target center. Use a pointer device; zoom and input method influence how scores should be compared.',
      ],
    },
    'zh-Hans': {
      summary: '测量指针点击位置与目标中心的距离。',
      steps: ['选择回合数并开始测试。', '点击每个准星的中心，查看平均误差与第 90 百分位误差。'],
      example: {
        input: '目标中心：(100, 100)\n点击位置：(103, 104)',
        output: '中心误差：5 个 CSS 像素',
      },
      notes: [
        '误差为点击点与中心的直线距离；建议使用指针设备，页面缩放与输入方式会影响成绩的可比性。',
      ],
    },
  },
  scrollSpeed: {
    en: {
      summary: 'Record vertical wheel or trackpad movement during a timed session.',
      steps: [
        'Choose a duration and start the test.',
        'Keep the pointer over the panel and scroll vertically until the timer ends.',
      ],
      example: {
        input: 'Duration: 5 seconds\nRecorded distance: 5000 px',
        output: 'Average: 1000 px/s',
      },
      notes: [
        'Measures normalized wheel-event deltas, not a physical travel distance. Device settings and trackpad inertia can produce very different values.',
      ],
    },
    'zh-Hans': {
      summary: '记录限时测试中的鼠标滚轮或触控板纵向滚动量。',
      steps: ['选择时长并开始测试。', '保持指针位于面板上，持续纵向滚动直到计时结束。'],
      example: {
        input: '时长：5 秒\n记录距离：5000 px',
        output: '平均：1000 px/s',
      },
      notes: [
        '测量的是规范化后的 wheel 事件增量，不是实际物理移动距离；设备设置与触控板惯性会显著影响数值。',
      ],
    },
  },
  schulteTable: {
    en: {
      summary: 'Practice scanning a shuffled number grid in ascending order.',
      steps: [
        'Choose a grid size; select 1 to start the timer.',
        'Continue with 2, 3 and so on until every number has been selected.',
      ],
      example: {
        input: 'Grid: 3 × 3',
        output: 'Select 1 → 2 → 3 → … → 9, regardless of their positions.',
      },
      notes: [
        'Incorrect selections add mistakes rather than advancing the sequence. Compare elapsed time only across matching grid sizes.',
      ],
    },
    'zh-Hans': {
      summary: '练习按升序扫描随机排列的数字网格。',
      steps: ['选择网格大小，选中 1 后开始计时。', '依次选择 2、3 等数字，直到选完全部数字。'],
      example: {
        input: '网格：3 × 3',
        output: '按 1 → 2 → 3 → … → 9 的顺序选择，不受位置影响。',
      },
      notes: ['选错会增加失误次数，不会推进顺序；耗时应在相同网格大小下比较。'],
    },
  },
  timePerception: {
    en: {
      summary: 'Estimate a chosen interval without seeing the running timer.',
      steps: [
        'Select a target duration and start timing.',
        'Stop when you think the target has elapsed; complete three rounds to review the average error.',
      ],
      example: {
        input: 'Target: 10 seconds\nStopped at: 9.5 seconds',
        output: 'This round’s absolute error: 0.5 seconds\nBias: 0.5 seconds early',
      },
      notes: [
        'The report separates absolute error from early/late bias. Avoid looking at another clock if you want to measure your unaided estimate.',
      ],
    },
    'zh-Hans': {
      summary: '在看不到运行计时器的情况下估计指定时长。',
      steps: ['选择目标时长并开始计时。', '觉得时间已到时停止，完成三回合后查看平均误差。'],
      example: {
        input: '目标：10 秒\n实际停止：9.5 秒',
        output: '本回合绝对误差：0.5 秒\n偏差：提前 0.5 秒',
      },
      notes: ['报告区分绝对误差与提前或延后的偏差；测量自身时间感时请避免参考其他时钟。'],
    },
  },
  stroopTest: {
    en: {
      summary: 'Practice identifying ink color while ignoring the word’s meaning.',
      steps: [
        'Start the test and look at the color of each displayed word.',
        'Select the matching color button, completing all 20 trials.',
      ],
      example: {
        input: 'The word “RED” is drawn in blue.',
        output: 'Choose Blue.',
      },
      notes: [
        'Answer according to ink color rather than the written color name. The report includes accuracy and response time; this is a practice task, not a clinical assessment.',
      ],
    },
    'zh-Hans': {
      summary: '练习忽略词义，识别文字的实际颜色。',
      steps: ['开始测试，观察每个词的显示颜色。', '选择对应颜色按钮，完成 20 个回合。'],
      example: {
        input: '“红色”二字显示为蓝色。',
        output: '选择「蓝色」。',
      },
      notes: [
        '按字体颜色回答，而不是按文字含义；报告包含准确率与响应时间，属于练习任务而非临床评估。',
      ],
    },
  },
  colorHueTest: {
    en: {
      summary: 'Find the tile whose hue differs slightly from the others.',
      steps: [
        'Start the test and compare the color tiles.',
        'Choose the different tile in each of eight rounds, then review accuracy and response time.',
      ],
      example: {
        input: 'One tile has a subtly different hue from the surrounding tiles.',
        output: 'Select that tile; subsequent hue differences become smaller.',
      },
      notes: [
        'Screen calibration, brightness and ambient light affect visibility. This exercise cannot diagnose color-vision conditions.',
      ],
    },
    'zh-Hans': {
      summary: '找出与其他色块色相略有不同的一块。',
      steps: ['开始测试并比较色块。', '每回合选择不同色块，完成八回合后查看准确率与响应时间。'],
      example: {
        input: '其中一块与周围色块的色相略有不同。',
        output: '选中这一块；后续回合的色相差异会更小。',
      },
      notes: ['屏幕校准、亮度与环境光会影响辨识；此练习不能诊断色觉问题。'],
    },
  },
  oddOneOut: {
    en: {
      summary: 'Spot a single different symbol in a grid of similar symbols.',
      steps: [
        'Start the test and scan the grid.',
        'Select the odd symbol across ten rounds and inspect accuracy and timing.',
      ],
      example: {
        input: 'Most cells contain O; one contains Q.',
        output: 'Choose Q.',
      },
      notes: [
        'Symbol rendering and font shape affect difficulty. Look for the actual visual difference rather than selecting randomly.',
      ],
    },
    'zh-Hans': {
      summary: '在相似符号组成的网格中找到唯一不同的符号。',
      steps: ['开始测试并扫描网格。', '完成十回合的不同符号选择，再查看准确率与耗时。'],
      example: {
        input: '多数格子是 O，只有一个是 Q。',
        output: '选择 Q。',
      },
      notes: ['字体与符号渲染会影响难度；请观察实际差异，而不是随机点击。'],
    },
  },
  rhythmTest: {
    en: {
      summary: 'Reproduce a steady beat and inspect timing consistency.',
      steps: [
        'Watch four visual beats spaced 600 ms apart.',
        'When prompted, tap nine times at the same tempo and review the interval errors.',
      ],
      example: {
        input: 'Target interval: 600 ms\nMeasured interval: 650 ms',
        output: 'Absolute interval error: 50 ms',
      },
      notes: [
        'Nine taps produce eight measured intervals. Average error measures distance from 600 ms; consistency reflects variation between your intervals.',
      ],
    },
    'zh-Hans': {
      summary: '复现稳定节拍，并检查节奏一致性。',
      steps: ['观察四个间隔 600 ms 的示范节拍。', '提示后以同样速度点击九次，查看间隔误差。'],
      example: {
        input: '目标间隔：600 ms\n实际间隔：650 ms',
        output: '该间隔绝对误差：50 ms',
      },
      notes: [
        '九次点击产生八个可测间隔；平均误差表示与 600 ms 的距离，一致性反映各间隔之间的波动。',
      ],
    },
  },
  sequenceMemory: {
    en: {
      summary: 'Remember an increasingly long ordered sequence of grid cells.',
      steps: [
        'Start and watch the highlighted cells without selecting them.',
        'When the input phase begins, repeat the exact order; each success adds another step.',
      ],
      example: {
        input: 'Shown sequence: top-left → center → top-left',
        output: 'Select top-left, center, then top-left again.',
      },
      notes: [
        'Repeated cells are part of the sequence. An incorrect step ends the run; order matters, not just the set of cells.',
      ],
    },
    'zh-Hans': {
      summary: '记住并复现逐渐加长的网格顺序。',
      steps: [
        '开始后观察高亮顺序，不要在展示阶段选择。',
        '进入输入阶段后按原顺序复现，成功后会增加一步。',
      ],
      example: {
        input: '展示顺序：左上 → 中间 → 左上',
        output: '依次选择左上、中间，再选择左上。',
      },
      notes: ['重复出现的格子也是顺序的一部分；选错一步会结束本次测试，不能只记有哪些格子。'],
    },
  },
  numberMemory: {
    en: {
      summary: 'Remember a number briefly shown on screen and recall it after it disappears.',
      steps: [
        'Start and memorize the displayed digits.',
        'Enter the exact number after it disappears and submit; successful rounds increase the digit count.',
      ],
      example: {
        input: 'Shown number: 739',
        output: 'Enter 739 after the number disappears.',
      },
      notes: [
        'Keep the digits in their original order. One incorrect answer ends the run; avoid writing the number down if measuring unaided recall.',
      ],
    },
    'zh-Hans': {
      summary: '记住短暂展示的数字，并在消失后回忆。',
      steps: ['开始测试并记住显示的数字。', '数字消失后输入原数字并提交，答对后位数会增加。'],
      example: {
        input: '展示数字：739',
        output: '数字消失后输入 739。',
      },
      notes: ['必须保持原来的数字顺序；答错一次会结束本次测试，测量自身记忆时请避免记录数字。'],
    },
  },
  visualMemory: {
    en: {
      summary: 'Recall the positions of highlighted cells in a 5 × 5 grid.',
      steps: [
        'Start and memorize the highlighted cells during the brief display.',
        'After they disappear, select all remembered cells; successful levels show more cells.',
      ],
      example: {
        input: 'Highlighted cells: top-left, center, bottom-right',
        output: 'Select those three cells in any order.',
      },
      notes: [
        'Order does not matter, but one incorrect cell ends the run. The number of highlighted cells is capped at 12 as levels continue.',
      ],
    },
    'zh-Hans': {
      summary: '回忆 5 × 5 网格中曾被高亮的格子位置。',
      steps: [
        '开始后在短暂展示期间记住高亮格子。',
        '高亮消失后选出全部对应位置，成功后会增加格子数量。',
      ],
      example: {
        input: '高亮位置：左上、中间、右下',
        output: '以任意顺序选中这三个格子。',
      },
      notes: ['顺序不影响结果，但选错一个格子会结束本次测试；继续升级时高亮数量最多为 12。'],
    },
  },
  verbalMemory: {
    en: {
      summary: 'Decide whether each word has already appeared in the current run.',
      steps: [
        'Start the test and read each word.',
        'Choose New on its first appearance and Seen when it reappears.',
      ],
      example: {
        input: 'Words: apple → pear → apple',
        output: 'Answers: New → New → Seen',
      },
      notes: [
        'Only earlier words in the current run count as seen. A word appearing for the first time is New even if you know it from everyday life.',
      ],
    },
    'zh-Hans': {
      summary: '判断当前词语是否已在本次测试中出现。',
      steps: ['开始测试并阅读每个词。', '首次出现选择「新词」，再次出现选择「见过」。'],
      example: {
        input: '词语：苹果 → 梨 → 苹果',
        output: '回答：新词 → 新词 → 见过',
      },
      notes: [
        '只计算本次测试中此前出现的词；即使生活中认识这个词，首次在本轮出现仍应选择「新词」。',
      ],
    },
  },
  memoryMatch: {
    en: {
      summary: 'Match hidden card pairs while minimizing two-card turns.',
      steps: [
        'Choose the number of pairs and flip two cards at a time.',
        'Remember unmatched cards and continue until all pairs are found.',
      ],
      example: {
        input: 'Pair count: 8\nEvery turn finds a pair.',
        output: '8 moves to complete the board.',
      },
      notes: [
        'One move means opening two cards. Unmatched cards turn face down after a short delay; the report compares moves with the minimum possible for that board size.',
      ],
    },
    'zh-Hans': {
      summary: '翻开隐藏卡片配对，尽量减少双卡回合数。',
      steps: ['选择配对数量，每次翻开两张卡。', '记住未配对卡片的位置，直到找到全部配对。'],
      example: {
        input: '配对数量：8\n每回合都成功配对。',
        output: '完成棋盘需要 8 次移动。',
      },
      notes: [
        '一次移动指翻开两张卡；未匹配卡片会短暂展示后翻回，报告会对照该棋盘的理论最少移动次数。',
      ],
    },
  },
  arithmeticSprint: {
    en: {
      summary: 'Practice mixed mental arithmetic with a fixed number of questions.',
      steps: [
        'Choose 10, 15 or 25 questions and start the sprint.',
        'Enter each answer and submit with the button or Enter; review accuracy and pace at the end.',
      ],
      example: {
        input: 'Question: 7 × 8',
        output: 'Answer: 56',
      },
      notes: [
        'Includes addition, subtraction and multiplication. A wrong answer advances to the next question and reduces accuracy; pace counts correct answers per minute.',
      ],
    },
    'zh-Hans': {
      summary: '通过固定题数练习混合心算。',
      steps: [
        '选择 10、15 或 25 题，开始挑战。',
        '输入每题答案，点击提交或按 Enter，结束后查看准确率与速度。',
      ],
      example: {
        input: '题目：7 × 8',
        output: '答案：56',
      },
      notes: ['包含加法、减法与乘法；答错也会进入下一题并降低准确率，速度以每分钟正确题数计算。'],
    },
  },
  goNoGo: {
    en: {
      summary: 'Practice responding to green signals and withholding responses to red ones.',
      steps: [
        'Choose the trial count and start.',
        'Tap or press Space for green; make no response for red, then inspect hits, misses and false alarms.',
      ],
      example: {
        input: 'Signals: green → red → green',
        output: 'Responses: tap → wait → tap',
      },
      notes: [
        'Each signal is visible briefly, and at most one response is recorded per trial. Accuracy includes both successful green responses and correctly withheld red responses.',
      ],
    },
    'zh-Hans': {
      summary: '练习对绿色信号响应，对红色信号抑制响应。',
      steps: [
        '选择回合数并开始。',
        '绿色时点击或按空格，红色时不操作，结束后查看命中、漏按与误报。',
      ],
      example: {
        input: '信号：绿色 → 红色 → 绿色',
        output: '操作：点击 → 等待 → 点击',
      },
      notes: [
        '每个信号仅短暂显示，每回合最多记录一次响应；准确率同时包含正确响应绿色与正确抑制红色的回合。',
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
