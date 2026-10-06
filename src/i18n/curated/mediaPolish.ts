export const mediaPolishEn = {
  'tools.qrcode.contentHint':
    'Your text is encoded exactly, including spaces and line breaks. The quiet zone is measured in QR modules; four modules is the recommended default.',
  'tools.qrcode.errorCapacity':
    'This content exceeds QR capacity at the selected error-correction level. Shorten the text or choose a lower level.',
  'tools.qrcode.errorGeneration':
    'The QR code could not be generated. Try shorter text or another setting.',
  'tools.placeholderImage.dimensionError':
    'Width and height must be whole numbers from 1 to 4096 pixels.',
  'tools.placeholderImage.empty': 'Enter valid dimensions to preview, copy or download an image.',
} as const;

export const mediaPolishZhHans = {
  'tools.qrcode.contentHint':
    '文本按原样编码，包括空格与换行。留白宽度以二维码模块为单位，建议默认保留四个模块。',
  'tools.qrcode.errorCapacity': '内容超过当前纠错级别的二维码容量，请缩短文本或降低纠错级别。',
  'tools.qrcode.errorGeneration': '无法生成二维码，请缩短文本或调整设置后重试。',
  'tools.placeholderImage.dimensionError': '宽度与高度须为 1–4096 像素的整数。',
  'tools.placeholderImage.empty': '输入合法宽高后，即可预览、复制或下载图片。',
} as const;
