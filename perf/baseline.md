# Performance baseline

Baseline commit: `2c10afcaf6b411cda5bbacd43f939e820865f93a`. Preserve its production build and compare it with each candidate using the same server, browser and fixtures. This pass follows [huashu-flash](https://github.com/alchaincyf/huashu-flash); scope and usable endpoints are defined in [BRIEF.md](BRIEF.md).

## Initial production navigation

Artifact: `navigation-baseline.json`, recorded from `2026-10-06T08:04:44.940Z` to `2026-10-06T08:05:36.873Z`. All 40 observations passed: 10 fresh-context visits each to the catalogue, codec, data workspace and QR generator.

Profile: Chromium, 1440 × 900, English/light, no CPU slowdown, HTTP cache disabled, identical gzip server behavior and CDP Fast 4G throttling (20 ms latency; 524,288 bytes/s download; 393,216 bytes/s upload). Analytics and external icon APIs were blocked equally; these are local laboratory measurements.

| Route             | Initial usable p75 (ms) |
| ----------------- | ----------------------: |
| `/`               |                  1002.9 |
| `/text-codec`     |                   915.5 |
| `/data-workbench` |                   928.6 |
| `/qrcode`         |                   987.0 |

This initial run waited on locator polling before checking the target observer. Subsequent paired runs wait on the observer first, then issue the same real input actions, avoiding an extra locator polling delay. The observer is registered before navigation in both protocols. Do not compare the initial times above directly with candidate times from the refined protocol. Use the baseline arm of each paired run instead.

## Initial source computation

Artifact: `text-hotpaths/baseline.json`, measured at `2026-10-06T08:03:17.309Z`. The harness transpiles the actual baseline TypeScript modules and executes them in Chromium 151.0.7922.173, with Node 24.19.0 orchestrating. It uses no CPU slowdown or network timing, two warmups and 25 observations per fixture. DOM parsing and segmenter construction counts are measured separately from timing.

| Fixture                                       | Input UTF-16 units | Initial p75 (ms) | Deterministic work                                   |
| --------------------------------------------- | -----------------: | ---------------: | ---------------------------------------------------- |
| HTML entity decoding: 5,000 escaped fragments |            250,000 |            622.9 | 35,000 DOM documents for four distinct entity tokens |
| Grapheme wrapping: 10,000 words, width 80     |             78,000 |            157.6 | 10,000 grapheme segmenter constructions              |
| Word frequency: 16,000 word tokens            |             80,000 |            385.7 | 16,001 word/grapheme segmenter constructions         |

These fixtures contain repeated real operations, combining accents, CJK and ZWJ emoji. Twelve independent browser golden cases passed before changing the utilities. The later paired CPU experiment in [experiments.md](experiments.md) supersedes these standalone timing numbers; it measures both revisions under the same alternating schedule and preserves exact output checks.

## Reproduce

See [bench/README.md](bench/README.md) for browser dependencies and production navigation commands. Re-run the untouched source baseline with:

```sh
node perf/bench/text-hotpaths.mjs --baseline-ref 2c10afcaf6b411cda5bbacd43f939e820865f93a --baseline-only --samples 25 --output /tmp/tools-text-baseline.json
```

The harness records raw observations, browser/runtime versions and output hashes. Actual-input computation and navigation are separate metrics; neither is a live-user or CrUX result.
