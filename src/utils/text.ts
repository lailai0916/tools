export function splitGraphemes(input: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(input), ({ segment }) => segment);
  }
  return Array.from(input);
}
