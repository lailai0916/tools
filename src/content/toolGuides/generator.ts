import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const generatorGuides = {
  uuid: {
    en: {
      summary: 'Generate UUIDs using random v4 or time-based v7 format.',
      steps: [
        'Choose v4 or v7 and the number of UUIDs.',
        'Regenerate if needed and copy a UUID or the whole list.',
      ],
      example: {
        input: 'Version: v4; count: 1',
        output:
          'Example format:\n550e8400-e29b-41d4-a716-446655440000\nYour generated value will differ.',
      },
      notes: [
        'v4 uses random bytes; v7 embeds a millisecond timestamp. These identifiers are not proof of identity, and uniqueness is probabilistic rather than centrally registered.',
      ],
    },
    'zh-Hans': {
      summary: '生成随机 v4 或基于时间的 v7 UUID。',
      steps: ['选择 v4 或 v7 及生成数量。', '按需重新生成，复制单个 UUID 或完整列表。'],
      example: {
        input: '版本：v4；数量：1',
        output: '格式示例：\n550e8400-e29b-41d4-a716-446655440000\n实际生成值会不同。',
      },
      notes: [
        'v4 使用随机字节，v7 包含毫秒时间戳；标识符不能证明身份，唯一性基于概率而非中心注册。',
      ],
    },
  },
  ulid: {
    en: {
      summary: 'Generate 26-character ULIDs with a timestamp prefix and random suffix.',
      steps: ['Choose the number of identifiers to generate.', 'Regenerate or copy the list.'],
      example: {
        input: 'Count: 1',
        output: 'Example format:\n01ARZ3NDEKTSV4RRFFQ69G5FAV\nYour generated value will differ.',
      },
      notes: [
        'Uses Crockford Base32. IDs from different milliseconds sort by timestamp, but this generator does not guarantee monotonic order within the same millisecond.',
      ],
    },
    'zh-Hans': {
      summary: '生成包含时间前缀与随机后缀的 26 字符 ULID。',
      steps: ['选择需要生成的标识符数量。', '按需重新生成或复制列表。'],
      example: {
        input: '数量：1',
        output: '格式示例：\n01ARZ3NDEKTSV4RRFFQ69G5FAV\n实际生成值会不同。',
      },
      notes: [
        '采用 Crockford Base32；不同毫秒生成的 ID 按时间排序，但此生成器不保证同一毫秒内单调递增。',
      ],
    },
  },
  nanoid: {
    en: {
      summary: 'Generate compact random identifiers with URL-safe characters.',
      steps: [
        'Set a length from 1 to 512 and choose the count.',
        'Regenerate and copy the identifiers.',
      ],
      example: {
        input: 'Length: 21; count: 1',
        output: 'Example format:\nV1StGXR8_Z5jdHi6B-myT\nYour generated value will differ.',
      },
      notes: [
        'The alphabet contains letters, digits, _ and -. Shorter IDs have a greater collision risk; choose length based on how many identifiers you expect to create.',
      ],
    },
    'zh-Hans': {
      summary: '使用 URL 安全字符生成紧凑的随机标识符。',
      steps: ['设置 1–512 的长度，并选择数量。', '重新生成并复制标识符。'],
      example: {
        input: '长度：21；数量：1',
        output: '格式示例：\nV1StGXR8_Z5jdHi6B-myT\n实际生成值会不同。',
      },
      notes: ['字母表包含字母、数字、_ 与 -；越短越容易碰撞，请结合预计生成数量选择长度。'],
    },
  },
  passwordGenerator: {
    en: {
      summary: 'Generate a random password using selected character classes.',
      steps: [
        'Set a length from 4 to 64 and enable the desired letters, digits and symbols.',
        'Optionally exclude ambiguous characters, then regenerate and copy the password.',
      ],
      example: {
        input: 'Length: 16\nUppercase, lowercase and digits enabled',
        output: 'A random 16-character password containing each enabled character class.',
      },
      notes: [
        'At least one character from each selected class is included. Keep generated passwords private and use a password manager to store distinct passwords.',
      ],
    },
    'zh-Hans': {
      summary: '根据所选字符类别生成随机口令。',
      steps: [
        '设置 4–64 的长度，勾选所需大小写字母、数字与符号。',
        '按需排除易混淆字符，重新生成并复制口令。',
      ],
      example: {
        input: '长度：16\n启用大写、小写与数字',
        output: '随机生成的 16 字符口令，包含每个已启用字符类别。',
      },
      notes: [
        '每个选中的类别至少包含一个字符；请妥善保管生成结果，并使用密码管理器保存互不重复的口令。',
      ],
    },
  },
  keyGenerator: {
    en: {
      summary: 'Generate random key bytes and view the same bytes as HEX and Base64.',
      steps: [
        'Choose 128, 256 or 512 bits.',
        'Regenerate if needed and copy the encoding required by your application.',
      ],
      example: {
        input: 'Key size: 256 bits',
        output: '32 random bytes\nHEX: 64 characters\nBase64: 44 characters including padding',
      },
      notes: [
        'These are raw random bytes, not an RSA key pair or a PEM file. The HEX and Base64 outputs encode the same key.',
      ],
    },
    'zh-Hans': {
      summary: '生成随机密钥字节，并以 HEX 与 Base64 表示同一内容。',
      steps: ['选择 128、256 或 512 位。', '按需重新生成，复制应用所需的编码。'],
      example: {
        input: '密钥长度：256 位',
        output: '32 个随机字节\nHEX：64 字符\nBase64：含补齐符共 44 字符',
      },
      notes: [
        '生成的是原始随机字节，不是 RSA 密钥对或 PEM 文件；HEX 与 Base64 表示的是同一把密钥。',
      ],
    },
  },
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
      ],
    },
  },
  randomString: {
    en: {
      summary: 'Generate a random string from a preset or custom alphabet.',
      steps: [
        'Choose a character set and a length from 1 to 4096.',
        'For a custom set, enter the allowed characters; then generate and copy the result.',
      ],
      example: {
        input: 'Character set: hex; length: 8',
        output: 'One possible result:\na7c09e3f',
      },
      notes: [
        'The URL-safe Base64 character set creates random characters; it does not Base64-encode an input value. Custom alphabets support Unicode code points, including emoji; duplicate code points are removed.',
      ],
    },
    'zh-Hans': {
      summary: '从预设或自定义字符集中生成随机字符串。',
      steps: [
        '选择字符集，设置 1–4096 的长度。',
        '使用自定义字符集时填写允许字符，再生成并复制结果。',
      ],
      example: {
        input: '字符集：hex；长度：8',
        output: '一种可能的结果：\na7c09e3f',
      },
      notes: [
        'URL 安全 Base64 字符集只用于抽取随机字符，并不是对某个输入值进行 Base64 编码；自定义字符集支持 emoji 等 Unicode 码点，并去除重复码点。',
      ],
    },
  },
  randomColor: {
    en: {
      summary: 'Generate random opaque HEX colors and preview their swatches.',
      steps: [
        'Choose 1, 5 or 10 colors.',
        'Regenerate the palette and copy individual HEX values.',
      ],
      example: {
        input: 'Count: 1',
        output: 'One possible result:\n#4f46e5',
      },
      notes: [
        'Each color is sampled independently from RGB values. The output does not guarantee harmonious combinations or accessible foreground/background contrast.',
      ],
    },
    'zh-Hans': {
      summary: '生成随机不透明 HEX 颜色，并预览色块。',
      steps: ['选择 1、5 或 10 个颜色。', '重新生成色板，复制单个 HEX 值。'],
      example: {
        input: '数量：1',
        output: '一种可能的结果：\n#4f46e5',
      },
      notes: ['每种颜色独立随机抽取 RGB 值；不保证配色协调或前景与背景达到无障碍对比度。'],
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
      ],
    },
    'zh-Hans': {
      summary: '将文本或 URL 生成可下载的二维码。',
      steps: ['输入内容，选择图片尺寸与纠错级别。', '调整边距，检查预览并下载 PNG 或 SVG。'],
      example: {
        input: 'https://example.com/',
        output: '编码内容为 https://example.com/ 的二维码。',
      },
      notes: ['更高纠错级别会占用更多容量；请保留足够留白，缩放或打印后尤其需要实际扫描测试。'],
    },
  },
  macAddress: {
    en: {
      summary: 'Generate sample locally administered, unicast MAC addresses.',
      steps: [
        'Choose count, separator and letter case.',
        'Regenerate the addresses and copy the list.',
      ],
      example: {
        input: 'Count: 1; separator: colon',
        output: 'One possible result:\n02:ab:cd:12:34:56',
      },
      notes: [
        'Sets the local-administration bit and clears the multicast bit. These are sample addresses, not vendor-assigned hardware identities or proof of uniqueness on a network.',
      ],
    },
    'zh-Hans': {
      summary: '生成本地管理、单播类型的 MAC 地址样本。',
      steps: ['选择数量、分隔符与字母大小写。', '重新生成地址并复制列表。'],
      example: {
        input: '数量：1；分隔符：冒号',
        output: '一种可能的结果：\n02:ab:cd:12:34:56',
      },
      notes: [
        '会设置本地管理位并清除组播位；这些是样本地址，不是厂商分配的硬件身份，也不保证在实际网络中唯一。',
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
      ],
    },
  },
  loremIpsum: {
    en: {
      summary: 'Generate Latin-style placeholder paragraphs for testing layouts.',
      steps: [
        'Choose 1, 3 or 5 paragraphs.',
        'Regenerate until the text suits your layout, then copy it.',
      ],
      example: {
        input: 'Paragraphs: 3',
        output: 'Three randomly assembled placeholder paragraphs.',
      },
      notes: [
        'The text is assembled from a word pool rather than meaningful prose. Use it to test spacing and line wrapping, and replace it before publishing real content.',
      ],
    },
    'zh-Hans': {
      summary: '生成用于测试排版的拉丁风格占位段落。',
      steps: ['选择 1、3 或 5 个段落。', '按需重新生成，复制适合布局的文本。'],
      example: {
        input: '段落数：3',
        output: '随机组合的三个占位段落。',
      },
      notes: ['由词库随机组合，不是有实际含义的文章；适合测试间距与折行，发布真实内容前请替换。'],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
