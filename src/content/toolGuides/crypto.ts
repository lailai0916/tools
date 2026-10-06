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
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
