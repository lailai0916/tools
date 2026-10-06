import type { LocalizedToolGuide, ToolGuideKey } from './types';
export const converterGuides = {
  baseConverter: {
    en: {
      summary: 'Convert exact integers between binary, octal, decimal and hexadecimal.',
      steps: [
        'Enter an integer in any of the four base fields.',
        'Read or copy the equivalent values from the other fields.',
      ],
      example: {
        input: 'Decimal: 255',
        output: 'Binary: 11111111\nOctal: 377\nHexadecimal: ff',
      },
      notes: [
        'Supports large and negative integers, but not fractions. Enter digits without 0x, 0b or 0o prefixes.',
      ],
    },
    'zh-Hans': {
      summary: '在二进制、八进制、十进制与十六进制之间进行精确的整数转换。',
      steps: ['在任意进制的输入框中填写整数。', '查看或复制其余输入框中同步换算的值。'],
      example: {
        input: '十进制：255',
        output: '二进制：11111111\n八进制：377\n十六进制：ff',
      },
      notes: ['支持大整数和负整数，不支持小数；无需添加 0x、0b 或 0o 前缀。'],
    },
  },
  colorConverter: {
    en: {
      summary:
        'Convert and adjust one color, generate matching shades, or choose a random starting color.',
      steps: [
        'Enter a HEX, RGB or HSL color, or choose it with the picker.',
        'Adjust RGB channels, use a shade as the new base color, or copy a color value.',
      ],
      example: {
        input: '#ff0000',
        output: 'rgb(255, 0, 0)\nhsl(0, 100%, 50%)',
      },
      notes: [
        'HEX supports three or six digits. RGB channels must be between 0 and 255; HSL saturation and lightness are percentages. Alpha and named CSS colors are not supported.',
        'RGB and HSL use comma-separated values, such as rgb(255, 0, 0) and hsl(0, 100%, 50%). HSL hue must be between 0 and 360; space-separated CSS syntax and other hue units are not supported.',
        'Shades keep hue and saturation while changing HSL lightness; this is a palette aid and does not guarantee contrast accessibility.',
      ],
    },
    'zh-Hans': {
      summary: '围绕同一个颜色进行格式转换、通道调整与色阶生成，也可以随机选色。',
      steps: [
        '输入 HEX、RGB 或 HSL 颜色，或使用取色器选择颜色。',
        '调整 RGB 通道，将色阶设为新的基础色，或复制所需颜色值。',
      ],
      example: {
        input: '#ff0000',
        output: 'rgb(255, 0, 0)\nhsl(0, 100%, 50%)',
      },
      notes: [
        'HEX 支持三位或六位；RGB 通道为 0–255，HSL 的饱和度与亮度使用百分比。暂不支持透明度或 CSS 颜色名称。',
        'RGB 与 HSL 使用逗号分隔，例如 rgb(255, 0, 0) 和 hsl(0, 100%, 50%)；HSL 色相为 0–360，暂不支持空格分隔的 CSS 写法或其他色相单位。',
        '色阶保持色相与饱和度，仅改变 HSL 亮度；它用于辅助配色，不保证无障碍对比度。',
      ],
    },
  },
  unixPermission: {
    en: {
      summary:
        'Translate Unix read, write and execute permissions into octal and symbolic notation.',
      steps: [
        'Toggle permissions for owner, group and others, or edit the octal value.',
        'Read the synchronized octal and symbolic results.',
      ],
      example: {
        input: 'Octal: 644',
        output: 'rw-r--r--',
      },
      notes: [
        'Models the nine basic permission bits. setuid, setgid and sticky bits are not included.',
      ],
    },
    'zh-Hans': {
      summary: '将 Unix 的读、写、执行权限转换为八进制与符号表示。',
      steps: [
        '勾选所有者、用户组和其他用户的权限，或编辑八进制值。',
        '查看同步更新的八进制与符号结果。',
      ],
      example: {
        input: '八进制：644',
        output: 'rw-r--r--',
      },
      notes: ['仅处理九个基本权限位，不包含 setuid、setgid 和 sticky 特殊权限。'],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
