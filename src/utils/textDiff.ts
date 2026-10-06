import { diffLines } from 'diff';

export type DiffLineType = 'add' | 'del' | 'same';
export type DiffLine = { type: DiffLineType; text: string };
export type TextDiffErrorCode = 'size' | 'timeout' | 'failed';
export type TextDiffResult =
  { ok: true; lines: DiffLine[] } | { ok: false; error: TextDiffErrorCode };

export const TEXT_DIFF_MAX_CODE_UNITS = 500_000;
export const TEXT_DIFF_MAX_INPUT_LINES = 20_000;
export const TEXT_DIFF_MAX_OUTPUT_LINES = 20_000;
export const TEXT_DIFF_TIMEOUT_MS = 1_000;

export const DIFF_SIGN: Record<DiffLineType, string> = { add: '+', del: '-', same: ' ' };

export function toDiffLines(value: string): string[] {
  const lines = value.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function countLines(value: string): number {
  if (!value) return 0;
  let lines = value.endsWith('\n') ? 0 : 1;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\n') lines++;
  }
  return lines;
}

export function textDiffInputError(original: string, modified: string): 'size' | null {
  if (original.length + modified.length > TEXT_DIFF_MAX_CODE_UNITS) return 'size';
  if (countLines(original) + countLines(modified) > TEXT_DIFF_MAX_INPUT_LINES) return 'size';
  return null;
}

export function computeTextDiff(original: string, modified: string): TextDiffResult {
  const error = textDiffInputError(original, modified);
  if (error) return { ok: false, error };
  try {
    const changes = diffLines(original, modified, { timeout: TEXT_DIFF_TIMEOUT_MS });
    // An aborted diff is not an empty diff and cannot be labeled identical.
    if (!changes) return { ok: false, error: 'timeout' };
    const lines: DiffLine[] = [];
    for (const change of changes) {
      const type: DiffLineType = change.added ? 'add' : change.removed ? 'del' : 'same';
      for (const text of toDiffLines(change.value)) {
        if (lines.length >= TEXT_DIFF_MAX_OUTPUT_LINES) return { ok: false, error: 'size' };
        lines.push({ type, text });
      }
    }
    return { ok: true, lines };
  } catch {
    return { ok: false, error: 'failed' };
  }
}

export function textDiffCopyText(lines: readonly DiffLine[]): string {
  return lines.map((line) => DIFF_SIGN[line.type] + (line.text ? ' ' + line.text : '')).join('\n');
}
