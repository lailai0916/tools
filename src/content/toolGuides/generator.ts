import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const generatorGuides = {
  randomNumber: {
    en: {
      summary: 'Generate random integers within an inclusive range.',
      steps: [
        'Enter integer minimum and maximum values and choose a count.',
        'Enable unique values if needed, then generate and copy the list.',
      ],
      example: {
        input: 'Minimum: 1; maximum: 6; count: 3',
        output: 'One possible result:\n2, 6, 1',
      },
      notes: [
        'Both bounds are included. Count must be 1–1000; unique output cannot exceed the number of distinct integers in the range. Invalid settings show an error instead of silently reducing the count.',
        'Enter decimal integers, without fractions or exponent notation. Bounds must stay within ±9,007,199,254,740,991, and the inclusive range can contain at most 9,007,199,254,740,991 integers.',
      ],
    },
    'zh-Hans': {
      summary: '在包含边界的范围内生成随机整数。',
      steps: ['填写整数最小值、最大值与数量。', '按需启用不重复，生成并复制列表。'],
      example: {
        input: '最小值：1；最大值：6；数量：3',
        output: '一种可能的结果：\n2, 6, 1',
      },
      notes: [
        '结果包含两个边界；数量为 1–1000，不重复结果不能超过范围内不同整数的数量。无效参数会提示错误，不会悄悄减少生成数量。',
        '仅接受十进制整数，不接受小数或指数写法；边界须在 ±9,007,199,254,740,991 内，范围内的整数总数也不能超过 9,007,199,254,740,991。',
      ],
    },
  },

  qrcode: {
    en: {
      summary: 'Turn text or a URL into a downloadable QR code.',
      steps: [
        'Enter the content, then choose image size and error-correction level.',
        'Adjust the margin, inspect the preview and download PNG or SVG.',
      ],
      example: {
        input: 'https://example.com/',
        output: 'A QR code that encodes https://example.com/',
      },
      notes: [
        'Higher error correction uses more capacity. Keep enough quiet margin and test the final image with a scanner, especially after resizing or printing.',
        'Text is encoded exactly, including leading, trailing and all-whitespace content. An empty input produces no image. PNG dimensions match the selected size; margins are measured in QR modules, with a default of 4.',
      ],
    },
    'zh-Hans': {
      summary: '将文本或 URL 生成可下载的二维码。',
      steps: ['输入内容，选择图片尺寸与纠错级别。', '调整边距，检查预览并下载 PNG 或 SVG。'],
      example: {
        input: 'https://example.com/',
        output: '编码内容为 https://example.com/ 的二维码。',
      },
      notes: [
        '更高纠错级别会占用更多容量；请保留足够留白，缩放或打印后尤其需要实际扫描测试。',
        '按原文编码，保留首尾空格与纯空白内容；空字符串不生成图片。PNG 尺寸与所选尺寸一致，边距以二维码模块为单位，默认留白为 4 个模块。',
      ],
    },
  },

  placeholderImage: {
    en: {
      summary: 'Create a local PNG placeholder with custom dimensions, colors and text.',
      steps: [
        'Set width and height from 1 to 4096 pixels, then choose background and text colors.',
        'Enter an optional label and download the PNG or copy its data URI.',
      ],
      example: {
        input: 'Width: 600; height: 400\nLabel: empty',
        output: 'A 600 × 400 PNG labeled 600 × 400.',
      },
      notes: [
        'Generated with browser canvas, without an external image service. A data URI embeds the image bytes directly and may be much longer than a file URL.',
        'Width and height must be integers from 1 to 4096. Invalid dimensions clear the preview and disable copying and downloading, rather than generating a fallback size.',
      ],
    },
    'zh-Hans': {
      summary: '创建可自定义尺寸、颜色与文字的本地 PNG 占位图。',
      steps: [
        '设置 1–4096 像素的宽高，再选择背景与文字颜色。',
        '按需填写标签，下载 PNG 或复制 data URI。',
      ],
      example: {
        input: '宽度：600；高度：400\n标签：留空',
        output: '标注 600 × 400 的 600 × 400 PNG 图片。',
      },
      notes: [
        '使用浏览器 canvas 生成，不依赖外部图片服务；data URI 直接包含图片字节，通常远长于文件 URL。',
        '宽高必须是 1–4096 的整数；无效尺寸会清空预览，并禁用复制与下载，不会改用默认尺寸生成图片。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
