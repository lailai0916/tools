# Tools performance results

The active route preloads its code, styles and guide category; HTML entities and Unicode words reuse work within each operation. The logo is losslessly compressed. Appearance, outputs and client-only privacy behavior are preserved.

Baseline: `2c10afcaf6b411cda5bbacd43f939e820865f93a`. Navigation measurements used alternating old/new production builds, 20 observations per variant and operation (160 passed), Chromium 151, Node 24, 1440 × 900, fresh caches, Fast 4G and gzip level 9. These are laboratory results, not measured real-user gains.

| Open page and complete an operation |  Old p75 |  New p75 | Time reduction |
| ----------------------------------- | -------: | -------: | -------------: |
| Codec: encode `Hello`               | 774.7 ms | 655.4 ms |          15.4% |
| Data workspace: format JSON         | 834.6 ms | 720.2 ms |          13.7% |
| QR: generate PNG                    | 807.9 ms | 691.7 ms |          14.4% |
| Catalogue: search Base64            | 651.2 ms | 672.5 ms |          −3.3% |

Catalogue loading showed no stable improvement; pooling two sessions gives 666.2 → 664.9 ms. The target of halving navigation time was not met. Codec, data and QR JavaScript through actual use shrank by 10.7%, 10.1% and 11.8%. The logo shrank from 71,362 to 33,259 bytes, with identical decoded pixels.

Large-input computation was measured separately in Chromium with 25 alternating observations per variant and two warmups; outputs matched exactly:

| Fixture                        |  Old p75 | New p75 | Time reduction |
| ------------------------------ | -------: | ------: | -------------: |
| 250 KB HTML, 35,000 entities   | 683.1 ms |  4.5 ms |          99.3% |
| Unicode wrapping, 10,000 words | 131.1 ms | 42.4 ms |          67.7% |
| Word frequency, 16,000 words   | 323.9 ms |  7.7 ms |          97.6% |

The optimization passed 121 permanent workbench regressions, guide coverage, lint, typecheck and build. Its browser checks covered all 32 tools in both languages, downloads, favorites, history, theme, SEO and true 404s; 14 responsive light/dark screenshots and QR exports matched the baseline. Live timing was blocked by the environment proxy; deployment checks verify exact-build delivery, not real-user speed.

CI runs `npm run check:performance` after building. [Budgets](../scripts/performance-budgets.json) cover initial JS/CSS for the catalogue and every tool, deduplicate static dependencies and exclude operation-only dynamic imports. Sizes use gzip level 9; `node scripts/check-performance.mjs --update` only tightens ceilings. Added routes or increased ceilings require explicit review; byte budgets do not check CPU or interaction regressions.

Temporary benchmark scripts, fixtures and raw records were removed after archiving outside the repository. Their original versions remain in [Git history](https://github.com/lailai0916/tools/tree/60e4108abe22c35bd4a3b5a4e503cbae3ae144ee/perf). Rollback should restore performance budgets together with the corresponding runtime changes.
