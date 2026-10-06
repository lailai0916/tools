const MAX_ROWS = 500;

export type CodePointRow = {
  glyph: string;
  codePoint: string;
  decimal: string;
  utf8: string | null;
};

export function inspectUnicode(input: string): {
  rows: CodePointRow[];
  truncated: boolean;
  hasUnpairedSurrogate: boolean;
} {
  const rows: CodePointRow[] = [];
  const encoder = new TextEncoder();
  let truncated = false;
  let hasUnpairedSurrogate = false;

  for (const glyph of input) {
    if (rows.length === MAX_ROWS) {
      truncated = true;
      break;
    }

    const codePoint = glyph.codePointAt(0)!;
    // String iteration combines valid pairs, so only lone surrogates remain in this range.
    const unpairedSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;
    hasUnpairedSurrogate ||= unpairedSurrogate;
    rows.push({
      glyph,
      codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      decimal: String(codePoint),
      utf8: unpairedSurrogate
        ? null
        : Array.from(encoder.encode(glyph))
            .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
            .join(' '),
    });
  }

  return { rows, truncated, hasUnpairedSurrogate };
}
