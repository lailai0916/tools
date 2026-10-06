import type { LocalizedToolGuide } from './types';

export const curatedTimeUnitsGuides = {
  unitConverter: {
    en: {
      summary:
        'Convert a single measurement to every supported unit. Data sizes show decimal SI and binary IEC units together.',
      steps: [
        'Choose Length, Temperature, Data size, Duration or Angle, then select the source unit.',
        'Enter a decimal number or scientific notation. All equivalent values update together; copy any result.',
      ],
      example: {
        input: 'Measurement: Data size; source unit: MiB; value: 1',
        output: 'B: 1048576\nkB: 1048.576\nMB: 1.048576\nKiB: 1024\nMiB: 1',
      },
      notes: [
        'Switching the measurement keeps the input number and selects that measurement’s default unit. Changing the source unit reinterprets the same number in the new unit.',
        'SI prefixes use powers of 1000; IEC prefixes use powers of 1024. A byte is eight bits. Negative data sizes and temperatures below absolute zero are rejected.',
        'A day is 24 hours and a week is seven days. Months and years are calendar intervals; use Date & Time for them. Angles are not wrapped to a single turn.',
        'Calculations use JavaScript floating-point numbers. Results show up to 12 significant digits; ≈ marks display rounding or integers beyond exact floating-point precision. Values that overflow or underflow any conversion are rejected.',
        'The URL stores the measurement and source unit, while the entered value remains in this browser.',
      ],
    },
    'zh-Hans': {
      summary:
        '用一个数值同步换算当前量纲支持的全部单位；数据大小同时展示十进制 SI 与二进制 IEC 单位。',
      steps: [
        '选择长度、温度、数据大小、时长或角度，再选择输入单位。',
        '输入十进制数值或科学计数法，所有换算结果会同步更新，可分别复制。',
      ],
      example: {
        input: '量纲：数据大小；输入单位：MiB；数值：1',
        output: 'B：1048576\nkB：1048.576\nMB：1.048576\nKiB：1024\nMiB：1',
      },
      notes: [
        '切换量纲会保留输入数值，并选择新量纲的默认单位；切换输入单位会以新单位重新解释相同数值。',
        'SI 前缀按 1000 的幂换算，IEC 按 1024 的幂换算；一字节等于八比特。不接受负的数据大小或低于绝对零度的温度。',
        '一天为 24 小时，一周为七天；月与年是日历间隔，请使用“日期与时间”计算。角度不会自动归一化到一圈以内。',
        '计算使用 JavaScript 浮点数，结果最多显示 12 位有效数字；≈ 表示显示舍入或超出浮点精确范围的整数。任何换算发生上溢或下溢时均拒绝该数值。',
        'URL 只记录量纲与输入单位，输入数值留在当前浏览器。',
      ],
    },
  },
  dateTime: {
    en: {
      summary:
        'Convert an instant between dates and timestamps, or use one date range to calculate calendar intervals, ages and working days.',
      steps: [
        'For an instant, select Timestamp & date, choose the input format and seconds or milliseconds, and explicitly select UTC or Local time. Enter a timestamp or a date such as 2024-01-01 00:00.',
        'For an interval, select Date interval & working days and enter a start and end date. Choose weekend days, optionally include the end date, and enter holidays to exclude. Use a birth date and today to calculate an age.',
        'Read the synchronized results and copy the values you need. Use current time or Use today to fill a field.',
      ],
      example: {
        input:
          'Timestamp & date: date input, UTC, 2024-01-01 00:00\nInterval: 2024-01-01 → 2024-01-08; end excluded; Saturday/Sunday weekends; holiday 2024-01-01',
        output:
          'Seconds: 1704067200\nMilliseconds: 1704067200000\nCalendar interval: 0 years, 0 months, 7 days\nDays in selected range: 7; working days: 4; weekend days: 2; additional holidays excluded: 1',
      },
      notes: [
        'Timestamp units are explicit and never inferred from digit count. Milliseconds must be integers; seconds accept up to three decimal places. Both are limited to the JavaScript Date range, ±8640000000000000 milliseconds.',
        'Date input accepts YYYY-MM-DD or YYYY-MM-DD HH:mm, with optional seconds and up to three millisecond digits. T may replace the space. Explicit Z or ±HH:mm offsets override the selected zone; offset hours must be below 24. Offset seconds are also supported for historical local time zones. Invalid dates, leap seconds and local times skipped by daylight saving are rejected. Repeated local times use the browser’s earlier occurrence.',
        'Date ranges use calendar dates in UTC so daylight-saving changes do not affect day counts. The end date must not precede the start. Calendar months are anchored to the start date, with anniversaries clamped to the last valid day of shorter months; full months are split into years and remaining months.',
        'The calendar interval always measures the two entered dates. Range and working-day counts include the start and follow the end-date checkbox. Holidays may be separated by whitespace, commas or semicolons; duplicates, holidays on weekends and holidays outside the range are not subtracted twice.',
        'Working days exclude only the selected weekends and the holidays you enter; there is no automatic regional holiday calendar. Inputs stay in this browser and are not written into the URL.',
      ],
    },
    'zh-Hans': {
      summary: '在日期与时间戳之间转换同一时刻，或用同一日期范围计算日历间隔、年龄和工作日。',
      steps: [
        '转换时刻时，选择“时间戳与日期”，设置输入格式以及秒或毫秒，并明确选择 UTC 或本地时间；输入时间戳或 2024-01-01 00:00 等日期。',
        '计算间隔时，选择“日期间隔与工作日”，填写开始与结束日期，设置周末、是否包含结束日，并按需填写节假日；使用出生日期与今天即可计算年龄。',
        '查看同步结果并复制所需数值，也可用“使用当前时间”或“使用今天”快速填写。',
      ],
      example: {
        input:
          '时间戳与日期：日期输入，UTC，2024-01-01 00:00\n日期间隔：2024-01-01 → 2024-01-08；不含结束日；周六/周日休息；节假日 2024-01-01',
        output:
          '秒：1704067200\n毫秒：1704067200000\n日历间隔：0 年 0 月 7 天\n范围天数：7；工作日：4；周末天数：2；额外排除的节假日：1',
      },
      notes: [
        '严格使用所选时间戳单位，不按位数推测。毫秒须为整数，秒最多支持三位小数；范围为 JavaScript Date 支持的 ±8640000000000000 毫秒。',
        '日期接受 YYYY-MM-DD 或 YYYY-MM-DD HH:mm，可附带秒与最多三位毫秒，空格可改为 T。明确的 Z 或 ±HH:mm 优先于所选时区，偏移小时须小于 24；也支持历史本地时区的秒级偏移。不接受无效日期、闰秒或因夏令时而跳过的本地时刻；重复的本地时刻采用浏览器较早的一次。',
        '日期范围以 UTC 日历日期计算，夏令时不会改变天数；结束日期不能早于开始日期。完整月数以开始日期为锚点，较短月份的周年或月纪念日调整为该月最后一天，再将完整月数拆为年与剩余月数。',
        '日历间隔始终表示两个输入日期之间的差。范围与工作日计数包含开始日期，并按复选框决定是否包含结束日。节假日支持空白、逗号或分号分隔；重复、位于周末或范围外的假期不会重复扣除。',
        '工作日仅排除所选周末与手动输入的节假日，不自动加载地区节假日日历。输入留在当前浏览器，不写入 URL。',
      ],
    },
  },
} satisfies Record<string, LocalizedToolGuide>;
