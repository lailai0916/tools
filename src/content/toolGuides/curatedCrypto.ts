import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const curatedCryptoGuides = {
  hashText: {
    en: {
      summary: 'Calculate UTF-8 text digests, CRC32 checksums or an HMAC with a shared key.',
      steps: [
        'Choose Digest / checksum or HMAC, select an algorithm and enter the message. An empty message is valid.',
        'For HMAC, enter a non-empty UTF-8 secret key, then click Calculate and copy the result.',
      ],
      example: {
        input: 'Digest: SHA-256\nMessage: hello',
        output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      },
      notes: [
        'Message and HMAC key are exact UTF-8 text, not HEX or Base64 bytes. Spaces and line breaks affect the result.',
        'MD5 and SHA-1 digests are provided for compatibility. CRC32 detects accidental changes and is not a cryptographic hash or message authentication code.',
        'HMAC supports SHA-1, SHA-256, SHA-384 and SHA-512. Editing any input or option clears the previous result; calculation is explicit.',
      ],
    },
    'zh-Hans': {
      summary: '计算 UTF-8 文本摘要、CRC32 校验值或使用共享密钥的 HMAC。',
      steps: [
        '选择摘要 / 校验或 HMAC，选择算法并输入消息，空消息也有效。',
        '使用 HMAC 时填写非空 UTF-8 秘密密钥，点击计算并复制结果。',
      ],
      example: {
        input: '摘要：SHA-256\n消息：hello',
        output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      },
      notes: [
        '消息与 HMAC 密钥按原始 UTF-8 文本处理，不按 HEX 或 Base64 解码，空格与换行会影响结果。',
        'MD5 与 SHA-1 摘要用于兼容旧系统；CRC32 用于检测意外修改，不是密码学哈希或消息认证码。',
        'HMAC 支持 SHA-1、SHA-256、SHA-384 与 SHA-512；修改输入或选项会清除原结果，需要手动点击计算。',
      ],
    },
  },
  identifiers: {
    en: {
      summary: 'Generate random or time-based identifiers in batches, then inspect UUID metadata.',
      steps: [
        'Choose UUID v4, UUID v7, ULID or NanoID, set a count from 1 to 1,000, and click Generate identifiers.',
        'Copy the batch or an individual value. Use Inspect on a UUID, or switch to Inspect UUID and paste an existing value.',
      ],
      example: {
        input: 'Inspect UUID: 550e8400-e29b-41d4-a716-446655440000',
        output: 'Version: 4\nVariant: RFC 4122\nNo timestamp in a v4 UUID',
      },
      notes: [
        'All generators use browser cryptographic randomness. UUID v7 and ULID include millisecond timestamps; monotonic order within the same millisecond is not guaranteed.',
        'NanoID length is 1–512. Its alphabet is URL-safe letters, digits, _ and -. Shorter IDs have a greater collision risk.',
        'UUID inspection accepts canonical hyphenated values, a urn:uuid: prefix and braces around the whole UUID. It extracts timestamps from RFC-variant v1 and v7 values; other formats cannot be inspected here.',
        'Invalid counts or lengths clear generated results. An identifier is not proof of identity, and uniqueness is probabilistic.',
      ],
    },
    'zh-Hans': {
      summary: '批量生成随机或包含时间的标识符，再检查 UUID 元数据。',
      steps: [
        '选择 UUID v4、UUID v7、ULID 或 NanoID，设置 1–1,000 的数量，点击生成标识符。',
        '复制整组或单个结果；点击 UUID 旁的检查按钮，或切换到检查 UUID 并粘贴已有值。',
      ],
      example: {
        input: '检查 UUID：550e8400-e29b-41d4-a716-446655440000',
        output: '版本：4\n变体：RFC 4122\nv4 UUID 不含时间戳',
      },
      notes: [
        '所有生成器使用浏览器安全随机源；UUID v7 与 ULID 包含毫秒时间戳，不保证同一毫秒内单调递增。',
        'NanoID 长度为 1–512，使用 URL 安全的字母、数字、_ 与 -，长度越短，碰撞风险越高。',
        'UUID 检查支持带连字符的规范格式、urn:uuid: 前缀与包围整个 UUID 的花括号；支持提取 RFC 变体 v1 与 v7 的时间戳，不能在此检查其他格式。',
        '数量或长度无效时会清除生成结果；标识符不能证明身份，唯一性基于概率。',
      ],
    },
  },
  secretGenerator: {
    en: {
      summary:
        'Generate passwords, random key bytes or custom strings using browser cryptographic randomness.',
      steps: [
        'Choose a purpose, set length and count, then choose password character classes or a custom alphabet if needed.',
        'Click Generate and copy the result. In Key / token bytes mode, HEX and Base64 encode the same bytes in matching row order.',
      ],
      example: {
        input: 'Purpose: Key / token bytes\nByte count: 32\nCount: 1',
        output: '32 random bytes\nHEX: 64 characters\nBase64: 44 characters including padding',
      },
      notes: [
        'Count must be 1–100. Password length is 4–128 characters, key length is 1–512 bytes, and custom string length is 1–4,096 Unicode code points.',
        'Passwords include at least one character from every enabled class, then shuffle the result. Character selection uses rejection sampling to avoid modulo bias.',
        'Custom alphabets support Unicode code points, including emoji; duplicate code points are removed. A small or predictable alphabet can produce weak secrets even when sampling is random.',
        'Key / token mode generates raw bytes, not an RSA key pair or PEM file. Keep results private and use a password manager for passwords.',
        'Changing settings clears previous results. Invalid values show an error and cannot generate partial output; no password strength or crack-time estimate is made.',
      ],
    },
    'zh-Hans': {
      summary: '使用浏览器安全随机源生成密码、密钥字节或自定义字符串。',
      steps: [
        '选择用途、长度与数量，再按需选择密码字符类别或填写自定义字符集。',
        '点击生成并复制结果；密钥 / 令牌字节模式中的 HEX 与 Base64 按相同行序表示同一组字节。',
      ],
      example: {
        input: '用途：密钥 / 令牌字节\n字节数：32\n数量：1',
        output: '32 个随机字节\nHEX：64 字符\nBase64：含补齐符共 44 字符',
      },
      notes: [
        '数量为 1–100；密码长度为 4–128 字符，密钥长度为 1–512 字节，自定义字符串长度为 1–4,096 个 Unicode 码点。',
        '密码保证每个启用的字符类别至少出现一次，再打乱顺序；字符抽样使用拒绝采样避免取模偏差。',
        '自定义字符集支持 emoji 等 Unicode 码点并去除重复码点；即使抽样随机，过小或可预测的字符集也可能生成弱秘密。',
        '密钥 / 令牌模式生成原始随机字节，不是 RSA 密钥对或 PEM 文件；请妥善保管结果，密码建议保存在密码管理器中。',
        '修改参数会清除原结果；无效参数会提示错误，不能生成部分结果；不进行口令强度或破解时间估算。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
