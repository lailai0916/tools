# Tools performance results

Tools now loads the active tool's guide category and preloads that route's code and styles. Repeated HTML entities and Unicode words reuse work within one operation. The logo is losslessly compressed. The existing appearance, tool outputs and privacy behavior are preserved.

Method: [huashu-flash](https://github.com/alchaincyf/huashu-flash), with the scope in [BRIEF.md](BRIEF.md), the initial baseline in [baseline.md](baseline.md), and intermediate paired experiments in [experiments.md](experiments.md). Baseline commit: `2c10afcaf6b411cda5bbacd43f939e820865f93a`.

## Cold navigation and actual use

The final run alternated old/new production builds, AB then BA, for 20 observations per variant and operation. All 160 observations passed. Chromium 151.0.7922.173; Node 24.19.0; viewport 1440 × 900; English/light; fresh contexts and disabled HTTP cache; Fast 4G (20 ms configured latency, 524,288 bytes/s down, 393,216 bytes/s up); no CPU slowdown. Both builds used the same gzip level 9 server.

| Operation                            |  Old p75 |  New p75 | Time reduction |
| ------------------------------------ | -------: | -------: | -------------: |
| Open codec and encode `Hello`        | 774.7 ms | 655.4 ms |          15.4% |
| Open data workspace and format JSON  | 834.6 ms | 720.2 ms |          13.7% |
| Open QR tool and generate its PNG    | 807.9 ms | 691.7 ms |          14.4% |
| Open catalogue and search for Base64 | 651.2 ms | 672.5 ms |          −3.3% |

Catalogue loading did not demonstrate a stable improvement. The earlier 10-pair run was 667.5 → 661.2 ms. Those builds serve byte-identical catalogue HTML, JavaScript, CSS and logo; pooling their 30 pairs gives 666.2 → 664.9 ms, effectively unchanged. Both sessions are retained. The PNG's uncompressed filtered scanlines, RGBA pixels and color/EXIF chunks are also identical, so compression did not change the image or filtering algorithm.

The usable endpoint completes a real operation and includes the same browser-automation input/wait overhead on both arms. The independent first-visible-target measurements were:

| Tool input visible |  Old p75 |  New p75 | Time reduction |
| ------------------ | -------: | -------: | -------------: |
| Codec              | 713.6 ms | 603.6 ms |          15.4% |
| Data workspace     | 771.4 ms | 655.4 ms |          15.0% |
| QR tool            | 694.4 ms | 574.4 ms |          17.3% |

The navigation goal of halving usable p75 was not met. The initial shared application script remains about 145 KB gzip; React, routing, shared UI and both translation dictionaries still account for much of startup. No static-input shell or asynchronous output behavior was introduced to obtain a better number.

## Large-input computation

Actual TypeScript utilities were transpiled and executed in isolated Chromium. Each old/new fixture had 25 alternating observations and two warmups. Counters and correctness checks run outside timing. These are computation times, separate from navigation and complete UI interaction.

| Fixture                               |  Old p75 | New p75 | Time reduction |
| ------------------------------------- | -------: | ------: | -------------: |
| 250 KB HTML, 35,000 entity references | 683.1 ms |  4.5 ms |          99.3% |
| Unicode wrapping, 10,000 words        | 131.1 ms | 42.4 ms |          67.7% |
| Word frequency, 16,000 words          | 323.9 ms |  7.7 ms |          97.6% |

HTML document parsing fell from 35,000 to 4 calls. Wrapping segmenter construction fell from 10,000 to 1. Frequency segmenter construction fell from 16,001 to 2. Outputs match exactly; input-scoped caches are released after each operation. Full source and output hashes are recorded in [experiments.md](experiments.md).

## Payload and regression prevention

The codec's JavaScript through the usable endpoint fell from 197,935 to 176,851 gzip bytes (10.7%); data workspace from 213,489 to 191,914 (10.1%); QR generation from 185,620 to 163,740 (11.8%). Individual guides load synchronously with their route, preserving their initial layout. QR totals include its operation-only generator library, which is still lazy.

Logo SVG size fell from 71,362 to 33,259 bytes. Under the benchmark's gzip level 9 it fell from 39,428 to 22,395 bytes (43.2%). Dimensions remain 1024 × 1024 and every decoded pixel is unchanged.

`npm run check:performance` verifies initial compressed JS/CSS ceilings for the catalogue and all 32 tools. CI runs it on the exact production build before deployment. Shared static dependencies count once; dynamic operation-only libraries are excluded. [The budget ratchet](bench/budgets.README.md) only tightens automatically and fails on growth; it does not claim to prevent every future CPU or interaction regression.

## Validation and limits

- Required repository checks: 121 workbench regressions, bilingual guide coverage, lint, typecheck and production build passed.
- Final browser guard: 93 baseline and 172 candidate checks passed, including all 32 tools in both languages, exact guide text/title comparisons, search, favorites, history, theme, downloads, workers, SEO, legacy URLs and true HTTP 404 behavior.
- Fourteen desktop/mobile, light/dark screenshot PNG files are byte-identical. QR PNG/SVG exports and the decoded logo match the baseline exactly.
- Preloads contain only the active route's dependencies; homepage/404 preload no tool. Browser checks found no duplicate JS/CSS downloads, private-input requests or runtime errors.
- Timing measurements exclude external analytics and icon APIs, blocked identically for both versions. Resource Timing request counts describe observed resource entries, rather than proving server HTTP request counts. LCP/CLS/long-task samples end 200 ms after the operation and do not describe an entire session.
- Live Tools, the control site and PageSpeed/CrUX requests were all rejected by this environment's proxy with HTTP 403. Real-user performance and live timing gains remain unverified; deployment's exact-build HTTP checks verify delivery rather than real-user speed.

The checked-in [measurement archive](bench/measurements.json) retains every navigation observation and CPU fixture result. Temporary images and test outputs are excluded from Git. Reproduction commands and browser prerequisites are in [bench/README.md](bench/README.md).

## Release and rollback

Deploy through the existing workflow after checks and paired measurements pass. Its public verification compares the homepage, entry assets and route HTML with the exact CI build and checks retired paths return 404. This pass changes no hosting, CDN or DNS configuration. Rollback reverts this pass's commits and uses the same deployment workflow; performance ceilings must be restored alongside the corresponding code.
