import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const cryptoGuides = {
  hashText: {
    en: {
      summary: 'Compute SHA digests of the exact UTF-8 text you enter.',
      steps: [
        'Paste the text to hash.',
        'Compare SHA-1, SHA-256, SHA-384 and SHA-512 results and copy the required digest.',
      ],
      example: {
        input: 'Text: hello\nAlgorithm: SHA-256',
        output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      },
      notes: [
        'Spaces and line breaks change the digest. SHA-1 is shown for compatibility; use a modern algorithm when collision resistance matters.',
      ],
    },
    'zh-Hans': {
      summary: '计算原始 UTF-8 文本的 SHA 摘要。',
      steps: [
        '粘贴需要计算摘要的文本。',
        '对照 SHA-1、SHA-256、SHA-384 与 SHA-512，复制所需结果。',
      ],
      example: {
        input: '文本：hello\n算法：SHA-256',
        output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      },
      notes: ['空格与换行会改变摘要。SHA-1 用于兼容旧系统，需要抗碰撞能力时应选择现代算法。'],
    },
  },
  hmacGenerator: {
    en: {
      summary: 'Create a keyed message authentication code from text and a shared secret.',
      steps: [
        'Choose the hash algorithm, then enter the message and secret.',
        'Copy the hexadecimal HMAC result.',
      ],
      example: {
        input: 'SHA-256\nMessage: The quick brown fox jumps over the lazy dog\nSecret: key',
        output: 'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
      },
      notes: [
        'The secret is interpreted as UTF-8 text, not hexadecimal or Base64 bytes. Both parties must agree on the algorithm, key bytes and exact message bytes.',
      ],
    },
    'zh-Hans': {
      summary: '使用文本与共享密钥生成消息认证码。',
      steps: ['选择哈希算法，再填写消息与密钥。', '复制十六进制 HMAC 结果。'],
      example: {
        input: 'SHA-256\n消息：The quick brown fox jumps over the lazy dog\n密钥：key',
        output: 'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
      },
      notes: [
        '密钥按 UTF-8 文本解释，不按十六进制或 Base64 解码。双方须使用相同算法、密钥字节与消息字节。',
      ],
    },
  },
  textEncrypt: {
    en: {
      summary: 'Encrypt text with a password using AES-GCM, or decrypt this tool’s output.',
      steps: [
        'Choose Encrypt or Decrypt and enter the text and password.',
        'Copy the encrypted Base64 payload, or read the recovered plaintext.',
      ],
      example: {
        input: 'Encrypt: hello\nPassword: an example passphrase',
        output:
          'A randomized Base64 payload.\nDecrypting it with the same password recovers: hello',
      },
      notes: [
        'Uses PBKDF2-SHA-256 (100,000 iterations), AES-256-GCM, a random salt and IV. Ciphertext varies on each encryption; decryption requires this payload format and the correct password.',
      ],
    },
    'zh-Hans': {
      summary: '通过口令使用 AES-GCM 加密文本，或解密本工具生成的结果。',
      steps: ['选择加密或解密，填写文本与口令。', '复制 Base64 密文，或查看还原的明文。'],
      example: {
        input: '加密：hello\n口令：an example passphrase',
        output: '随机生成的 Base64 密文。\n使用相同口令解密后得到：hello',
      },
      notes: [
        '采用 PBKDF2-SHA-256（100,000 次迭代）、AES-256-GCM、随机盐和 IV。每次加密结果不同，解密须使用本工具的密文格式及正确口令。',
      ],
    },
  },
  jwtDecoder: {
    en: {
      summary: 'Inspect the JSON header and payload of a three-part JWT.',
      steps: [
        'Paste a token consisting of header.payload.signature.',
        'Read the decoded header, payload and original signature segment.',
      ],
      example: {
        input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.example',
        output: 'Header: {"alg":"HS256"}\nPayload: {"sub":"123"}',
      },
      notes: [
        'Decoding does not verify the signature, expiry or trustworthiness of claims. The example signature is a placeholder and is not valid authentication.',
      ],
    },
    'zh-Hans': {
      summary: '查看三段式 JWT 的 JSON 头部与载荷。',
      steps: [
        '粘贴由 header.payload.signature 构成的令牌。',
        '查看解码后的头部、载荷与原始签名段。',
      ],
      example: {
        input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.example',
        output: '头部：{"alg":"HS256"}\n载荷：{"sub":"123"}',
      },
      notes: ['解码不验证签名、有效期或声明是否可信。示例签名仅为占位内容，不能用于有效认证。'],
    },
  },
  totp: {
    en: {
      summary: 'Generate a time-based one-time password from a Base32 secret or otpauth URI.',
      steps: [
        'Enter the Base32 secret or an otpauth://totp URI.',
        'Read the current code and countdown; the code refreshes when the period changes.',
      ],
      example: {
        input: 'Secret: JBSWY3DPEHPK3PXP',
        output:
          'A 6-digit code that changes every 30 seconds; its value depends on the current time.',
      },
      notes: [
        'A bare secret uses SHA-1, 6 digits and a 30-second period. URI parameters can specify supported alternatives; synchronize the device clock and keep the secret private.',
      ],
    },
    'zh-Hans': {
      summary: '根据 Base32 密钥或 otpauth URI 生成基于时间的一次性密码。',
      steps: [
        '输入 Base32 密钥或 otpauth://totp URI。',
        '查看当前验证码与倒计时；进入下一周期时会自动刷新。',
      ],
      example: {
        input: '密钥：JBSWY3DPEHPK3PXP',
        output: '每 30 秒更新的 6 位验证码，具体值取决于当前时间。',
      },
      notes: [
        '单独输入密钥时默认使用 SHA-1、6 位数字、30 秒周期；URI 参数可指定支持的其他配置。请同步设备时间并妥善保管密钥。',
      ],
    },
  },
  passwordStrength: {
    en: {
      summary:
        'Explore how password length and character classes affect a simple strength estimate.',
      steps: [
        'Enter a sample password.',
        'Read its length, character classes, estimated entropy and brute-force time.',
      ],
      example: {
        input: 'abc',
        output: 'Length: 3\nEstimated entropy: ≈ 14.1 bits\nVery weak',
      },
      notes: [
        'The model assumes uniformly random characters and 10 billion guesses per second. It does not detect dictionary words, reuse or breaches, so a high score is not a security guarantee.',
      ],
    },
    'zh-Hans': {
      summary: '观察口令长度与字符类别如何影响简化的强度估算。',
      steps: ['输入一个示例口令。', '查看长度、字符类别、估算熵与暴力破解时间。'],
      example: {
        input: 'abc',
        output: '长度：3\n估算熵：≈ 14.1 bits\n非常弱',
      },
      notes: [
        '模型假设字符均匀随机、每秒尝试 100 亿次；不识别字典词、重复使用或泄露记录，因此高分不等于安全保证。',
      ],
    },
  },
  crc32: {
    en: {
      summary: 'Compute the standard CRC-32 checksum of UTF-8 text.',
      steps: [
        'Enter the text to checksum.',
        'Copy the hexadecimal or unsigned decimal representation.',
      ],
      example: {
        input: '123456789',
        output: 'Hexadecimal: CBF43926\nDecimal: 3421780262',
      },
      notes: [
        'CRC-32 detects accidental data changes; it is not a cryptographic hash or authentication code. Encoding and line endings affect the checksum.',
      ],
    },
    'zh-Hans': {
      summary: '计算 UTF-8 文本的标准 CRC-32 校验值。',
      steps: ['输入需要校验的文本。', '复制十六进制或无符号十进制结果。'],
      example: {
        input: '123456789',
        output: '十六进制：CBF43926\n十进制：3421780262',
      },
      notes: ['CRC-32 用于检测意外的数据变化，不是密码学哈希或认证码；编码与换行会影响校验值。'],
    },
  },
  md5Hash: {
    en: {
      summary: 'Compute the MD5 digest of UTF-8 text for compatibility checks.',
      steps: [
        'Paste the text exactly as it should be hashed.',
        'Copy the lowercase hexadecimal digest.',
      ],
      example: {
        input: 'hello',
        output: '5d41402abc4b2a76b9719d911017c592',
      },
      notes: [
        'MD5 is vulnerable to collisions. Use it only where compatibility requires it, not for password storage or security-sensitive integrity checks.',
      ],
    },
    'zh-Hans': {
      summary: '计算 UTF-8 文本的 MD5 摘要，用于兼容性校验。',
      steps: ['按原样粘贴需要计算摘要的文本。', '复制小写十六进制摘要。'],
      example: {
        input: 'hello',
        output: '5d41402abc4b2a76b9719d911017c592',
      },
      notes: ['MD5 存在碰撞漏洞；只用于兼容需求，不适合存储口令或进行安全敏感的完整性校验。'],
    },
  },
  uuidInspector: {
    en: {
      summary: 'Inspect a UUID’s canonical form, version, variant and available timestamp.',
      steps: [
        'Paste a UUID, optionally with braces or a urn:uuid: prefix.',
        'Read the normalized value and metadata.',
      ],
      example: {
        input: '550e8400-e29b-41d4-a716-446655440000',
        output: 'Version: 4\nVariant: RFC 4122',
      },
      notes: [
        'Timestamps can be extracted from supported time-based versions such as v1 and v7. A v4 UUID does not reveal a creation time or the identity of its owner.',
      ],
    },
    'zh-Hans': {
      summary: '检查 UUID 的规范形式、版本、变体及可提取的时间信息。',
      steps: ['粘贴 UUID，可带花括号或 urn:uuid: 前缀。', '查看规范化结果与元数据。'],
      example: {
        input: '550e8400-e29b-41d4-a716-446655440000',
        output: '版本：4\n变体：RFC 4122',
      },
      notes: ['支持从 v1、v7 等时间相关版本提取时间戳；v4 UUID 无法透露创建时间或所属者身份。'],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
