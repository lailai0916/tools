type Match = { text: string; index: number; groups: string[] };
export type RegexResult =
  { ok: true; matches: Match[]; truncated: boolean } | { ok: false; error: string } | { ok: null };

const MAX_MATCHES = 2000;

function run(pattern: string, flags: string, text: string): RegexResult {
  if (!pattern) {
    return { ok: null };
  }
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  const matches: Match[] = [];
  const scan = flags.includes('g')
    ? text.matchAll(regex)
    : [regex.exec(text)].filter((m) => m !== null);
  for (const m of scan) {
    if (matches.length === MAX_MATCHES) return { ok: true, matches, truncated: true };
    matches.push({ text: m[0], index: m.index ?? 0, groups: m.slice(1) });
  }
  return { ok: true, matches, truncated: false };
}

self.onmessage = (event: MessageEvent<{ pattern: string; flags: string; text: string }>) => {
  const { pattern, flags, text } = event.data;
  self.postMessage(run(pattern, flags, text));
};
