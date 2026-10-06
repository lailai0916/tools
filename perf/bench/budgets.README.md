# Initial asset budgets

`scripts/check-performance.mjs` checks the production build's initial JavaScript and CSS against `budgets.json`. It reads `dist/.vite/manifest.json`, follows static `imports`, and includes the homepage entry plus the selected registered tool's route entry. It excludes `dynamicImports`: another tool and an operation-only dependency are not part of the current route's initial payload. Each JavaScript or CSS file counts once per route, including shared chunks and imported CSS.

Vite can combine pure reexport route wrappers into one chunk and omit their individual source keys. The build's `.vite/tool-routes.json` supplies those source-to-file associations from Rollup module metadata. The checker validates the complete registered route mapping and resolves each emitted filename to exactly one manifest chunk; it never guesses from a minified filename or silently skips a missing route.

The metric is the sum of each file's gzip size at compression level 9. It describes a reproducible compressed asset payload, rather than the site's actual transfer encoding or a browser timing. Checks have zero byte tolerance. Use the repository's Node version and locked dependencies to produce comparable builds.

Run this after `npm run build`:

```sh
node scripts/check-performance.mjs
```

Create the first budgets only after the final candidate has passed functional and visual checks:

```sh
node scripts/check-performance.mjs --init
```

Initialization refuses to overwrite an existing file. After a verified improvement, tighten the ceilings:

```sh
node scripts/check-performance.mjs --update
```

`--update` lowers ceilings and fails without writing when any measured asset total exceeds its existing ceiling. It never grants extra allowance automatically. A feature that requires more bytes needs an explicit, justified change to the affected JSON ceilings. Likewise, adding or removing a tool requires reviewing the corresponding route budget. Missing route entries, missing built files and malformed manifests fail the check.

For a saved production build or temporary comparison budget, use `--dist PATH` and `--budgets PATH`. Functional and visual checks remain separate; passing a byte budget does not prove that users can complete a task or that noisy timing measurements improved.

Export current asset measurements for an optimization report without initializing or changing any ceilings:

```sh
node scripts/check-performance.mjs --report /tmp/tools-initial-assets.json
```

`--report PATH` can also accompany `--init` or `--update`. Its output path cannot be the budget ceilings file.
