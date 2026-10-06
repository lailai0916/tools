import type { QRCode, QRCodeSegment } from 'qrcode';

export type QrLevel = 'L' | 'M' | 'Q' | 'H';
export type QrSize = 256 | 512 | 1024;
export type QrMediaOptions = { level: QrLevel; size: QrSize; margin: number };
export type QrMedia = { png: string; svg: string };

export class QrCapacityError extends Error {
  constructor() {
    super('QR content exceeds capacity');
    this.name = 'QrCapacityError';
  }
}

export function qrPixelBoundaries(moduleCount: number, size: number): number[] {
  if (
    !Number.isInteger(moduleCount) ||
    moduleCount < 1 ||
    !Number.isInteger(size) ||
    size < moduleCount ||
    size > 1024
  ) {
    throw new RangeError('Invalid QR raster dimensions');
  }
  return Array.from({ length: moduleCount + 1 }, (_, index) =>
    Math.round((index * size) / moduleCount)
  );
}

export async function generateQrMedia(input: string, options: QrMediaOptions): Promise<QrMedia> {
  if (input.length === 0) throw new TypeError('QR content is empty');
  const { level, size, margin } = options;
  if (
    !['L', 'M', 'Q', 'H'].includes(level) ||
    ![256, 512, 1024].includes(size) ||
    !Number.isInteger(margin) ||
    margin < 0 ||
    margin > 8
  ) {
    throw new RangeError('Invalid QR settings');
  }
  const { default: QR } = await import('qrcode');
  let qr: QRCode;
  try {
    qr = QR.create(input, { errorCorrectionLevel: level });
  } catch (error) {
    if (error instanceof Error && /amount of data is too big/i.test(error.message))
      throw new QrCapacityError();
    throw error;
  }
  const moduleSize = qr.modules.size;
  const boundaries = qrPixelBoundaries(moduleSize + margin * 2, size);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  context.imageSmoothingEnabled = false;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#000000';
  // Each module occupies a whole pixel rectangle. Never resize a rendered bitmap:
  // interpolation would introduce grey edges and make dense codes harder to scan.
  for (let row = 0; row < moduleSize; row += 1) {
    const top = boundaries[row + margin];
    const height = boundaries[row + margin + 1] - top;
    for (let column = 0; column < moduleSize; column += 1) {
      if (!qr.modules.get(row, column)) continue;
      const left = boundaries[column + margin];
      context.fillRect(left, top, boundaries[column + margin + 1] - left, height);
    }
  }
  // Preserve the chosen data segments as well as version/mask; rerunning automatic
  // segmentation with a fixed version can select a different encoding near a version boundary.
  const segments: QRCodeSegment[] = qr.segments.map((segment) => {
    if (typeof segment.data !== 'string') return { mode: 'byte', data: segment.data };
    if (segment.mode.id === 'Numeric') return { mode: 'numeric', data: segment.data };
    if (segment.mode.id === 'Kanji') return { mode: 'kanji', data: segment.data };
    return { mode: 'alphanumeric', data: segment.data };
  });
  const svg = await QR.toString(segments, {
    type: 'svg',
    width: size,
    margin,
    errorCorrectionLevel: level,
    version: qr.version,
    maskPattern: qr.maskPattern,
  });
  return {
    png: canvas.toDataURL('image/png'),
    svg: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}

export const MAX_IMAGE_DIMENSION = 4096;

export function parseImageDimension(input: string): number | null {
  const value = input.trim();
  if (!/^\d+(?:\.0+)?$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_IMAGE_DIMENSION ? parsed : null;
}
