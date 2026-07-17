# lailai's Tools

Handy tools for developers — [tools.lailai.one](https://tools.lailai.one)

A small, fast, privacy-respecting collection of developer utilities. Everything runs
in the browser: no accounts, no tracking, no data leaves your machine.

## Tools

| Category | Tools |
| --- | --- |
| Converter | JSON Formatter, Base Converter, Base64, Color Converter, Timestamp |
| Crypto | Text Hash (SHA-1/256/384/512) |
| Web | URL Encoder |
| Text | Case Converter, Regex Tester, Text Diff |
| Generator | QR Code, UUID |

## Stack

- **Vite 7** + **React 18** + **TypeScript** (strict)
- **react-router** — one real route per tool, deep-linkable
- CSS Modules; design tokens are a hand-synced snapshot of [lailai.one](https://lailai.one)
- Lightweight self-built i18n (English default, Simplified Chinese)
- Almost every tool uses native browser APIs; only `qrcode` and `diff` are added deps

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build + prerender one .html per route
npm run check      # format + lint + typecheck
```

## Adding a tool

The registry is the single source of truth — the home grid, routes, and search all
derive from it.

1. Create `src/tools/<id>/index.tsx` (+ `styles.module.css`), following any existing
   tool as a template. Use `ToolLayout`, the shared components, and `useI18n`.
2. Add its entry to `src/tools/registry.ts`.
3. Add its message keys to `src/i18n/en.ts` and `src/i18n/zh-Hans.ts`.

## Deploy

Pushing to `main` builds and rsyncs `dist/` to the origin server, served statically
by Caddy. Each route is prerendered to a real `.html` so unknown paths return a true
404 rather than a soft 200.
