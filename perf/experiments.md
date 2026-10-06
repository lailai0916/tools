# Performance experiments

This log applies the measure, fix, verify and regression-budget workflow from [huashu-flash](https://github.com/alchaincyf/huashu-flash). The preserved baseline is `2c10afcaf6b411cda5bbacd43f939e820865f93a`; see [baseline.md](baseline.md) for the initial measurements and protocol refinement. Displayed timings are rounded to 0.1 ms; raw JSON retains full precision.

## Repeated text computation

Artifact: `text-hotpaths/paired.json`, measured at `2026-10-06T08:06:47.497Z`. Actual old and new source modules ran in one isolated Chromium 151 page, without network or CPU throttling. Each fixture had two warmups and 25 observations per revision, alternating old/new order. Count instrumentation and output checks are outside the timed interval.

| Fixture                                                 | Baseline p75 (ms) | Candidate p75 (ms) | Reduction | Deterministic work, old → new       |
| ------------------------------------------------------- | ----------------: | -----------------: | --------: | ----------------------------------- |
| HTML decoding, 250,000 UTF-16 units / 35,000 references |             683.1 |                4.5 |    99.34% | DOM documents: 35,000 → 4           |
| Unicode wrapping, 78,000 units / 10,000 words           |             131.1 |               42.4 |    67.66% | Segmenter constructions: 10,000 → 1 |
| Word frequency, 80,000 units / 16,000 tokens            |             323.9 |                7.7 |    97.62% | Segmenter constructions: 16,001 → 2 |

HTML decoding caches each exact entity token within one operation while retaining browser parsing rules and one-pass decoding. Wrapping reuses one lazily created grapheme segmenter per operation. Frequency counts lowercased words first, then applies the grapheme-length threshold once per distinct word, retaining count and locale tie ordering. No cache persists across user inputs.

These are computation improvements for the stated fixtures, not overall page-speed percentages. The paired baseline arm supersedes the initial standalone CPU times; subtracting results from different sessions would overstate precision.

Validation passed 121 workbench regression cases and 32 browser golden cases across both source revisions. Cases cover literal markup, CRLF, unknown and semicolon-less entities, invalid character references, nonrecursive decoding, combining accents, ZWJ emoji, Arabic/CJK wrapping, Unicode lowercase expansions, final sigma, minimum lengths, tie ordering and unavailable segmentation support. All three large outputs also passed exact string comparison and matching UTF-8 SHA-256:

| Output            | SHA-256, identical in both revisions                               |
| ----------------- | ------------------------------------------------------------------ |
| HTML decoding     | `4357d1ee3a2b7c4ca79e01094a2c4e18a670c399f504a4bb55405ace49379f56` |
| Grapheme wrapping | `b5d86f5be7e8742766e071b751e29c2151f52bfb8cf5a629d266a6e9490dd1e7` |
| Word frequency    | `a690f704b99dbc1c60ae87875ca552bbf2830ee42c6c504d7d4c739734093945` |

Source-file provenance (SHA-256 of the UTF-8 TypeScript files):

| File                         | Revision  | SHA-256                                                            |
| ---------------------------- | --------- | ------------------------------------------------------------------ |
| `src/utils/textCodec.ts`     | Baseline  | `1bdaabca8413280bab6d5ce08323c2300e6758a66f007e5043dcc7f1434cb42e` |
| `src/utils/textCodec.ts`     | Candidate | `ea211d5a7f454b6bb8299849dbc2e26fdc4a363c80d145d0d5810d16ec37e4ca` |
| `src/utils/textWorkbench.ts` | Baseline  | `1f183d6174d3bfe41e53f12a5e499749bcb2e4d7a19f3ffc0dc8a05bef38a5e6` |
| `src/utils/textWorkbench.ts` | Candidate | `4fad0235f326112711efd9f99420a32d7676962dc88d476cdd7ff400695919be` |

The raw paired report also records hashes of the transpiled JavaScript modules actually executed by the browser. Those module hashes differ from the TypeScript file hashes above.

```sh
node perf/bench/text-hotpaths.mjs --baseline-ref 2c10afcaf6b411cda5bbacd43f939e820865f93a --candidate-ref WORKTREE --samples 25 --output /tmp/tools-text-paired.json
```

## Guide-loading candidate

Artifact: `guide-paired.json`, recorded from `2026-10-06T08:09:16.360Z` to `2026-10-06T08:10:41.389Z`. Ten observations per revision and route used the refined observer-first navigation protocol, alternating order, fresh browser contexts, disabled cache and the same Fast 4G profile as the baseline. All 80 observations passed real-operation checks.

| Route          | Baseline usable p75 (ms) | Candidate usable p75 (ms) |
| -------------- | -----------------------: | ------------------------: |
| Catalogue      |                    667.5 |                     661.2 |
| Text codec     |                    785.0 |                     703.1 |
| Data workspace |                    822.9 |                     747.2 |
| QR generator   |                    802.2 |                     688.1 |

The candidate removes the global guide catalogue from shared tool rendering; individual route modules supply their applicable guides. Catalogue timing is effectively unchanged within measurement noise. This experiment evaluates the candidate as a whole and does not isolate each included change.

## Route-preload candidate

Artifact: `preload-paired.json`, recorded from `2026-10-06T08:16:51.061Z` to `2026-10-06T08:17:31.736Z`. The guide-loading build was the control; the candidate added prerendered hints for the requested tool's static JavaScript/CSS dependency graph. Ten observations per revision used the same refined paired navigation protocol; all 40 observations passed.

| Route          | Control usable p75 (ms) | Candidate usable p75 (ms) |
| -------------- | ----------------------: | ------------------------: |
| Text codec     |                   709.5 |                     664.5 |
| Data workspace |                   741.3 |                     692.8 |

The hints bring the current route's requests forward without preloading other tools. Do not subtract p75 values between this session and the guide-loading session to assign exact contributions. Use the final combined paired run for the overall benefit; intermediate runs explain why the changes were retained.

Functional/visual checks and initial compressed-asset budgets are separate from noisy timing measurements. See [bench/budgets.README.md](bench/budgets.README.md) for the production asset ratchet.
