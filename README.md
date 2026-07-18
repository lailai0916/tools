<div align="center">
  <h1>lailai's Tools</h1>
  <p>English | <a href="README.zh-Hans.md">简体中文</a></p>
  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/lailai0916/tools/deploy.yml?style=flat-square" alt="deployment" />
    <img src="https://img.shields.io/github/last-commit/lailai0916/tools?style=flat-square" alt="last commit" />
    <img src="https://img.shields.io/github/languages/top/lailai0916/tools?style=flat-square" alt="top language" />
    <img src="https://img.shields.io/github/repo-size/lailai0916/tools?style=flat-square" alt="repo size" />
    <img src="https://img.shields.io/github/license/lailai0916/tools?style=flat-square" alt="license" />
  </p>
</div>

Handy browser-based tools for developers at [tools.lailai.one](https://tools.lailai.one).

A small, fast, privacy-respecting collection of developer utilities. Every tool runs
entirely in your browser — no accounts, and the text you paste in never leaves your
machine. Page views are counted with self-hosted, cookieless Umami analytics.

## Tools

76 tools across seven categories. The registry (`src/tools/registry.ts`) is the single
source of truth; the home grid, routes and search all derive from it.

| Category        | Tools                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Converter (16)  | JSON Formatter, Base Converter, Base64, Base32, Color Converter, Timestamp, JSON ⇄ YAML, JSON ⇄ CSV, HTML Entities, Roman Numerals, Text ⇄ Binary, Temperature, Data Size, chmod Calculator, Duration, Angle                             |
| Text (16)       | Case Converter, Regex Tester, Text Diff, Text Statistics, Sort Lines, Find & Replace, Slugify, Text Reverse, String Escape, Unicode Inspector, Remove Whitespace, Remove Accents, Line Endings, Caesar Cipher, Morse Code, NATO Alphabet |
| Crypto (7)      | Text Hash (SHA-1/256/384/512), HMAC Generator, Text Encryption (AES-GCM), JWT Decoder, TOTP Generator, Password Strength, CRC-32                                                                                                         |
| Web (9)         | URL Encoder, URL Parser, Query ⇄ JSON, Basic Auth Header, User-Agent Parser, IP Converter, MIME Lookup, HTTP Status Codes, Punycode                                                                                                      |
| Development (8) | JSON to TypeScript, CSS Gradient, Box Shadow, Color Shades, CSS Unit Converter, Crontab Parser, SVG to Data URI, Meta Tags                                                                                                               |
| Math (8)        | Math Evaluator, Percentage Calculator, Statistics, GCD & LCM, Prime Factorization, Prime Sieve, Combinatorics, Modular Exponentiation                                                                                                    |
| Generator (12)  | UUID, ULID, Nano ID, Password Generator, Key Generator, Random Number, Random String, Random Color, QR Code, MAC Address, Placeholder Image, Lorem Ipsum                                                                                 |

## Stack

- **Vite 7** + **React 18** + **TypeScript** (strict)
- **react-router** — one real route per tool, deep-linkable
- CSS Modules; design tokens are a hand-synced snapshot of [lailai.one](https://lailai.one)
- Lightweight self-built i18n (English default, Simplified Chinese)
- Almost every tool uses native browser APIs (`crypto.subtle`, `TextEncoder`, `URL`,
  canvas, `Intl`…); the only added deps are `qrcode`, `diff` and `js-yaml`

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

## License

Licensed under the [MIT License](LICENSE).
