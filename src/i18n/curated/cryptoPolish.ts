export const cryptoPolishEn = {
  'tools.jwtDecoder.invalid': 'Not a valid three-part JWT.',
  'tools.jwtDecoder.invalidEncoding':
    'JWT segments must use canonical unpadded Base64URL and valid UTF-8.',
  'tools.jwtDecoder.invalidObject': 'The JWT header and payload must be JSON objects.',
  'tools.jwtDecoder.invalidNumber':
    'A JSON number cannot be represented safely without changing its value.',
  'tools.jwtDecoder.invalidClaim':
    'exp, iat and nbf must be finite numbers of seconds when present.',
  'tools.jwtDecoder.inputNote':
    'Checks token structure and numeric claim types. Signature validity, expiry and claim trust are not verified.',
  'tools.totp.invalid': 'Enter a canonical Base32 secret or a valid TOTP otpauth URI.',
  'tools.totp.processing': 'Calculating the current code…',
  'tools.totp.retry': 'Retry',
  'tools.totp.inputNote':
    'URI digits must be 6 or 8; period must be a positive decimal integer. Invalid settings and pending calculations cannot be copied.',
} as const;

export const cryptoPolishZhHans = {
  'tools.jwtDecoder.invalid': '不是有效的三段式 JWT。',
  'tools.jwtDecoder.invalidEncoding': 'JWT 各段须使用规范的无补齐 Base64URL 与有效 UTF-8。',
  'tools.jwtDecoder.invalidObject': 'JWT 头部与载荷必须是 JSON 对象。',
  'tools.jwtDecoder.invalidNumber': 'JSON 数字无法在不改变数值的前提下安全表示。',
  'tools.jwtDecoder.invalidClaim': 'exp、iat 与 nbf 若存在，必须是表示秒数的有限数字。',
  'tools.jwtDecoder.inputNote': '检查令牌结构与数字声明类型，不验证签名、有效期或声明是否可信。',
  'tools.totp.invalid': '请输入规范的 Base32 密钥或有效的 TOTP otpauth URI。',
  'tools.totp.processing': '正在计算当前验证码…',
  'tools.totp.retry': '重试',
  'tools.totp.inputNote':
    'URI 的 digits 必须是 6 或 8，period 必须是正十进制整数；无效配置与计算中的结果不能复制。',
} as const;
