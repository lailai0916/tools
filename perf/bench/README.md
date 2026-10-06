# Tools benchmarks

The measurement method follows [huashu-flash](https://github.com/alchaincyf/huashu-flash): define usable operations, preserve a baseline, establish functional guards, then alternate old and new production builds under the same conditions.

The runtime needs Node 24, Playwright and Chromium. Set up Playwright outside production dependencies, for example `npm install --prefix /tmp/tools-perf playwright`, and pass its directory through `NODE_PATH`. The scripts use `/usr/bin/chromium` in this execution environment.

## Cold navigation and actual use

```bash
node perf/bench/server.mjs /path/to/baseline/dist 5190
node perf/bench/server.mjs /path/to/candidate/dist 5191
node perf/bench/measure.mjs --a http://127.0.0.1:5190 --b http://127.0.0.1:5191 --runs 20 --output perf/bench/results/paired.json
```

Both servers gzip identical content using the same level and serve registered route HTML with real 404 responses for unknown paths. Each observation uses a new browser context, disables HTTP cache, and throttles all local HTTP requests through CDP. Nothing is fulfilled from an unthrottled local request interception.

External analytics and icon APIs are unavailable from this execution environment and are blocked equally for both builds. Their requests are excluded from same-origin byte totals. Therefore these figures measure application loading and actual tool operation, rather than a complete real-user visit with third-party network latency. Functional/visual guards use the same complete icon fixture for both versions.

`mounted` records the first visible functional target; `usable` also performs the real operation and verifies its result. The catalogue opens search and finds the codec, the codec encodes `Hello`, the data workspace formats a fixed JSON vector, and the QR tool generates an actual PNG. Report both timings separately. Automation overhead affects the absolute usable endpoint and is held constant across alternating variants.

Use `--cpu 4` for an additional constrained-CPU profile, `--width 390` for mobile, and `--cases codec,data` for a subset. These remain separate from the main profile. Each failed observation is retained; any failure makes the command fail.

## Guards and interaction benchmarks

See `guard.mjs --help` for functional, visual and SEO comparisons. See `text-hotpaths.mjs --help` for isolated Unicode and entity-decoding measurements using the actual source from the baseline Git commit and current tree. These are CPU/algorithm measurements, not navigation timings.

Timing results are environment-specific. Initial asset byte budgets are deterministic and suitable for CI; timing ceilings require repeating the documented browser, network and CPU profile.
