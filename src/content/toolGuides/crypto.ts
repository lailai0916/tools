import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const cryptoGuides = {
  jwtDecoder: {
    en: {
      summary: 'Inspect the JSON header and payload of a three-part JWT.',
      steps: [
        'Paste a token consisting of header.payload.signature.',
        'Read the decoded header, payload and original signature segment.',
      ],
      example: {
        input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.AA',
        output: 'Header: {"alg":"HS256"}\nPayload: {"sub":"123"}',
      },
      notes: [
        'Each segment must use canonical unpadded Base64URL; header and payload must decode as valid UTF-8 JSON objects. Invalid encoding, unsafe integers, nonfinite or precision-losing numbers are rejected instead of changing the copied output.',
        'When present, exp, iat and nbf must be finite numeric seconds; fractional seconds are supported. This validates their type, not whether the token is expired or active.',
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
        input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.AA',
        output: '头部：{"alg":"HS256"}\n载荷：{"sub":"123"}',
      },
      notes: [
        '各段须使用规范的无补齐 Base64URL，头部与载荷须解码为有效 UTF-8 JSON 对象；无效编码、不安全整数、非有限数或会丢失精度的数字会被拒绝，不会修改后再供复制。',
        'exp、iat 与 nbf 若存在，必须是表示秒数的有限数字，支持小数秒；只检查类型，不判断令牌是否已过期或已生效。',
        '解码不验证签名、有效期或声明是否可信。示例签名仅为占位内容，不能用于有效认证。',
      ],
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
        'Base32 is case-insensitive and accepts spaces or correct padding. Invalid encoded lengths, nonzero unused bits and incorrect padding are rejected. URI algorithms may be SHA1, SHA256 or SHA512; digits must be 6 or 8, and period must be a positive decimal integer no greater than 9,007,199,254,740,991.',
        'A TOTP URI needs a nonempty label and one secret. Duplicate secret, algorithm, digits or period parameters are rejected. Credentials and ports are not supported.',
        'Changing the secret or entering a new time period clears the previous code while calculation is pending. Copy is disabled until the current code is ready; a code past its period cannot be copied.',
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
        'Base32 不区分大小写，允许空白或正确补齐；无效长度、非零残余位与错误补齐会被拒绝。URI 算法支持 SHA1、SHA256、SHA512；digits 为 6 或 8，period 为不超过 9,007,199,254,740,991 的正十进制整数。',
        'TOTP URI 须有非空标签与一个密钥；重复的 secret、algorithm、digits 或 period 参数会被拒绝，不支持用户名、口令与端口。',
        '修改密钥或进入新时间段时，计算期间会清除原验证码，当前结果就绪后才能复制；超过所属时间段的验证码无法复制。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
